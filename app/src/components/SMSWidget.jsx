import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { sendVerificationCode } from '../lib/smsService.js';
import '../App.css';

export default function SMSWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  // Check if user is already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      const storedPhone = localStorage.getItem('sms_phone_number');
      if (storedPhone) {
        try {
          const { data, error } = await supabase
            .from('sms_subscribers')
            .select('verified')
            .eq('phone_number', storedPhone)
            .eq('verified', true)
            .single();

          if (data && !error) {
            setIsSubscribed(true);
          } else {
            localStorage.removeItem('sms_phone_number');
          }
        } catch (err) {
          console.error('Error checking subscription:', err);
        }
      }
    };

    checkSubscription();
  }, []);

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Limit to 10 digits (US phone number)
    const limitedDigits = digits.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };

  const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      // Extract digits only and add +1 prefix
      const digits = phoneNumber.replace(/\D/g, '');
      const e164Phone = `+1${digits}`;

      // Send verification code
      const result = await sendVerificationCode(e164Phone);

      if (result.success) {
        // Store phone number in localStorage for verification page
        localStorage.setItem('sms_phone_number', e164Phone);

        // Navigate to verification page
        navigate('/sms-verification', { state: { phoneNumber: e164Phone } });
      } else {
        setError(result.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      console.error('Error sending verification:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    const storedPhone = localStorage.getItem('sms_phone_number');
    if (storedPhone && window.confirm('Are you sure you want to unsubscribe from SMS alerts?')) {
      try {
        const { error } = await supabase
          .from('sms_subscribers')
          .delete()
          .eq('phone_number', storedPhone);

        if (!error) {
          localStorage.removeItem('sms_phone_number');
          setIsSubscribed(false);
          setIsOpen(false);
          alert('You have been unsubscribed from SMS alerts.');
        }
      } catch (err) {
        console.error('Error unsubscribing:', err);
        alert('Failed to unsubscribe. Please try again.');
      }
    }
  };

  // Don't show widget if already subscribed
  if (isSubscribed) {
    return (
      <>
        <button
          className="sms-widget-button sms-widget-subscribed"
          onClick={() => setIsOpen(true)}
          aria-label="SMS Subscription Settings"
        >
          <span className="sms-widget-icon">✓</span>
        </button>

        {isOpen && (
          <div className="modal-overlay" onClick={() => setIsOpen(false)}>
            <div className="modal-content sms-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>

              <div className="sms-modal-header">
                <h2>SMS Alerts Subscribed</h2>
                <p className="sms-modal-subtext">
                  You're receiving notifications for new crime reports
                </p>
              </div>

              <div className="sms-modal-body">
                <div className="sms-subscribed-info">
                  <div className="sms-check-icon">✓</div>
                  <p>You'll receive SMS alerts when new reports are added to the system.</p>
                </div>

                <button
                  type="button"
                  className="sms-unsubscribe-button"
                  onClick={handleUnsubscribe}
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        className="sms-widget-button"
        onClick={() => setIsOpen(true)}
        aria-label="Subscribe to SMS Alerts"
      >
        <span className="sms-widget-icon">🔔</span>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content sms-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>

            <div className="sms-modal-header">
              <h2>Get Crime Alerts via SMS</h2>
              <p className="sms-modal-subtext">
                Receive instant notifications when new reports are added
              </p>
            </div>

            <div className="sms-modal-body">
              {error && (
                <div className="sms-error">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="sms-phone">Phone Number</label>
                  <div className="sms-phone-input-wrapper">
                    <span className="sms-country-code">+1</span>
                    <input
                      type="tel"
                      id="sms-phone"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="(555) 123-4567"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-button sms-submit-button"
                  disabled={loading}
                >
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </button>

                <p className="sms-privacy-note">
                  By subscribing, you agree to receive SMS notifications. Standard message and data rates may apply.
                  You can unsubscribe at any time.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
