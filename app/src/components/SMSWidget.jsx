import React, { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  isSubscribed,
  subscribe,
  unsubscribe,
  getEnableInstructions,
  initializeNotifications
} from '../lib/notificationService.js';
import '../App.css';

export default function SMSWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Initialize notifications and check subscription status on mount
  useEffect(() => {
    const initialize = async () => {
      // Check if notifications are supported
      if (!isNotificationSupported()) {
        setNotificationSupported(false);
        return;
      }

      // Initialize notification system
      await initializeNotifications();

      // Check if already subscribed
      const currentlySubscribed = isSubscribed();
      setSubscribed(currentlySubscribed);
    };

    initialize();
  }, []);

  // Handle subscribe button click
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Request notification permission
      const permission = await requestNotificationPermission();

      if (permission === 'granted') {
        // Store subscription
        subscribe();
        setSubscribed(true);
        setSuccess("✓ Notifications enabled! You'll be alerted of new reports.");

        // Send test notification
        setTimeout(() => {
          sendTestNotification();
        }, 500);

        // Close modal after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(null);
        }, 2000);
      } else if (permission === 'denied') {
        setError(
          '⚠ Notifications blocked. To receive alerts, please enable notifications in your browser settings.'
        );
      } else {
        // Permission prompt dismissed (default state)
        setError('Please allow notifications to receive crime alerts.');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = () => {
    if (window.confirm('Are you sure you want to unsubscribe from notifications?')) {
      unsubscribe();
      setSubscribed(false);
      setIsOpen(false);
      setSuccess(null);
      setError(null);
    }
  };

  // Handle "Try Again" after permission denied
  const handleTryAgain = () => {
    setError(null);
    // Show browser-specific instructions
    const instructions = getEnableInstructions();
    setError(`To enable notifications: ${instructions}`);
  };

  // If notifications are not supported
  if (!notificationSupported) {
    return (
      <>
        <button
          className="sms-widget-button sms-widget-disabled"
          onClick={() => setIsOpen(true)}
          aria-label="Notifications Not Available"
          disabled
        >
          <span className="sms-widget-icon">🔔</span>
        </button>

        {isOpen && (
          <div className="modal-overlay" onClick={() => setIsOpen(false)}>
            <div className="modal-content sms-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>

              <div className="sms-modal-header">
                <h2>Notifications Unavailable</h2>
                <p className="sms-modal-subtext">
                  Your browser doesn't support notifications
                </p>
              </div>

              <div className="sms-modal-body">
                <p className="sms-privacy-note">
                  Please use a modern browser like Chrome, Firefox, Safari, or Edge to enable notifications.
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Already subscribed state
  if (subscribed) {
    return (
      <>
        <button
          className="sms-widget-button sms-widget-subscribed"
          onClick={() => setIsOpen(true)}
          aria-label="Notification Settings"
        >
          <span className="sms-widget-icon">✓</span>
        </button>

        {isOpen && (
          <div className="modal-overlay" onClick={() => setIsOpen(false)}>
            <div className="modal-content sms-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>

              <div className="sms-modal-header">
                <h2>You're Subscribed</h2>
                <p className="sms-modal-subtext">
                  Receiving notifications for new crime reports
                </p>
              </div>

              <div className="sms-modal-body">
                <div className="sms-subscribed-info">
                  <div className="sms-check-icon">✓</div>
                  <p>You'll receive browser notifications when new reports are added to the system.</p>
                </div>

                <button
                  type="button"
                  className="sms-unsubscribe-button"
                  onClick={handleUnsubscribe}
                >
                  Unsubscribe
                </button>

                <p className="sms-privacy-note">
                  You can also manage notifications in your browser settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Not subscribed - show subscription form
  return (
    <>
      <button
        className="sms-widget-button"
        onClick={() => setIsOpen(true)}
        aria-label="Subscribe to Crime Alerts"
      >
        <span className="sms-widget-icon">🔔</span>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content sms-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>

            <div className="sms-modal-header">
              <h2>Get Crime Alerts</h2>
              <p className="sms-modal-subtext">
                Receive instant browser notifications when new reports are added
              </p>
            </div>

            <div className="sms-modal-body">
              {success && (
                <div className="sms-success">
                  <p>{success}</p>
                </div>
              )}

              {error && (
                <div className="sms-error">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubscribe}>
                <div className="form-group notification-checkbox-group">
                  <label className="notification-checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="notification-checkbox-text">
                      Enable notifications for new crime reports
                    </span>
                  </label>
                  <p className="notification-info-text">
                    Stay informed about campus safety
                  </p>
                </div>

                {getNotificationPermission() === 'denied' ? (
                  <button
                    type="button"
                    className="submit-button sms-submit-button"
                    onClick={handleTryAgain}
                  >
                    Show Instructions
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit-button sms-submit-button"
                    disabled={loading || !agreedToTerms}
                  >
                    {loading ? 'Requesting Permission...' : 'Enable Notifications'}
                  </button>
                )}

                <p className="sms-privacy-note">
                  You can unsubscribe anytime from your browser settings or by clicking the notification icon.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
