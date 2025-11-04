import React, { useState, useEffect } from 'react';

export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner permanently
    const hasSeenBanner = localStorage.getItem('ucsd-crimes-welcome-seen');
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    // Only store in localStorage if checkbox is checked
    if (dontShowAgain) {
      localStorage.setItem('ucsd-crimes-welcome-seen', 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-banner">
        <div className="welcome-content">
            <h2>Welcome to UCSD Crime Logs</h2>
            <p>This website collects all the public REAL UCSD police crime logs and displays them here.</p>
            <p>
                Click on reports to see detailed summaries (and options to share them), explore the data broken down, search for specific incidents, or report a case of your own
            </p>
            <p className="welcome-content-end">We keep the Safe Campus even Safer</p>
          
          <div className="welcome-checkbox-container">
            <label className="welcome-checkbox-label">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="welcome-checkbox"
              />
              <span>Don't show again</span>
            </label>
          </div>

          <button className="welcome-button" onClick={handleDismiss}>
            Cool, I understand
          </button>
        </div>
      </div>
    </div>
  );
}