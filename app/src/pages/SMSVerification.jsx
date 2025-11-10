import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { verifyCode, resendVerificationCode } from '../lib/smsService.js';
import '../pages/Pages.css';

export default function SMSVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Get phone number from route state or localStorage
  const phoneNumber = location.state?.phoneNumber || localStorage.getItem('sms_phone_number');

  useEffect(() => {
    // Redirect if no phone number
    if (!phoneNumber) {
      navigate('/');
      return;
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    // Cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError(null);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyCode(phoneNumber, verificationCode);

      if (result.success) {
        setSuccess(true);
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(result.error || 'Invalid or expired code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('An unexpected error occurred. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setError(null);
    setLoading(true);

    try {
      const result = await resendVerificationCode(phoneNumber);

      if (result.success) {
        setResendCooldown(60);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      console.error('Error resending code:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhone = () => {
    localStorage.removeItem('sms_phone_number');
    navigate('/');
  };

  const maskPhoneNumber = (phone) => {
    if (!phone) return '';
    // Show last 4 digits: +1 (***) ***-1234
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `+1 (***) ***-${digits.slice(-4)}`;
    }
    return phone;
  };

  if (!phoneNumber) {
    return null;
  }

  if (success) {
    return (
      <>
        <SEO
          title="SMS Verification Success"
          description="Successfully subscribed to UCSD crime alert SMS notifications"
          path="/sms-verification"
        />
        <Breadcrumbs items={[{ name: 'SMS Verification', path: '/sms-verification' }]} />
        <PageLayout
          title="Verification Successful"
          subtitle="You're All Set!"
        >
          <section className="sms-verification-section">
            <div className="sms-success-container">
              <div className="sms-success-icon">✓</div>
              <h2>You're Subscribed!</h2>
              <p>You'll receive SMS alerts when new crime reports are added.</p>
              <p className="sms-redirect-note">Redirecting to home page...</p>
            </div>
          </section>
        </PageLayout>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Verify SMS Number"
        description="Verify your phone number to receive UCSD crime alert notifications"
        path="/sms-verification"
      />
      <Breadcrumbs items={[{ name: 'SMS Verification', path: '/sms-verification' }]} />
      <PageLayout
        title="Verify Your Number"
        subtitle="SMS Notification Setup"
      >
        <section className="sms-verification-section">
          <SectionTitle>Enter Verification Code</SectionTitle>

          <div className="sms-verification-container">
            <p className="sms-verification-message">
              We sent a 6-digit code to <strong>{maskPhoneNumber(phoneNumber)}</strong>
            </p>

            {error && (
              <div className="sms-error-box">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleVerify} className="sms-verification-form">
              <div className="sms-code-inputs" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="sms-code-input"
                    disabled={loading}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="submit-button sms-verify-button"
                disabled={loading || code.join('').length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className="sms-verification-actions">
              <button
                type="button"
                className="sms-link-button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
              >
                {resendCooldown > 0
                  ? `Resend Code (${resendCooldown}s)`
                  : 'Resend Code'}
              </button>

              <button
                type="button"
                className="sms-link-button"
                onClick={handleEditPhone}
                disabled={loading}
              >
                Edit Phone Number
              </button>
            </div>

            <p className="sms-help-note">
              Didn't receive the code? Check your SMS messages or try resending after the cooldown period.
            </p>
          </div>
        </section>
      </PageLayout>
    </>
  );
}
