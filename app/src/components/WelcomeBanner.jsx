import React, { useState, useEffect } from 'react';

export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('ucsd-crimes-welcome-seen');
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('ucsd-crimes-welcome-seen', 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-banner">
        <div className="welcome-banner-header">
          <span className="welcome-banner-tag">UCSD CRIME LOG</span>
          <span className="welcome-banner-badge">Public Data</span>
        </div>
        <div className="welcome-content">
          <h2>Know What's Happening<br />On Campus.</h2>
          <p>
            This site aggregates <strong>real, publicly available police crime logs</strong> from
            the UCSD Police Department and displays them in one place.
          </p>
          <p>
            Click any report for details and share options. Explore the map, search by category,
            or report an incident of your own.
          </p>
          <p className="welcome-disclaimer">
            ⚠ Data is sourced from official UCSD PD reports. User-submitted reports are clearly labeled.
          </p>

          <div className="welcome-checkbox-container">
            <label className="welcome-checkbox-label">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="welcome-checkbox"
              />
              <span>Don't show this again</span>
            </label>
          </div>

          <button className="welcome-button" onClick={handleDismiss}>
            Got it — Take me in →
          </button>
        </div>
      </div>
    </div>
  );
}
