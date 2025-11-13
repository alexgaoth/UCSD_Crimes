import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { getUpvoteCount, incrementUpvote } from '../lib/supabaseClient';

// Helper function to check if a report is user-submitted
const isUserSubmitted = (caseNumber) => {
  return caseNumber && caseNumber.startsWith('USER-');
};

// Helper functions for localStorage management
const UPVOTED_CASES_KEY = 'upvoted_cases';

const getUpvotedCases = () => {
  try {
    const stored = localStorage.getItem(UPVOTED_CASES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading upvoted cases from localStorage:', error);
    return [];
  }
};

const addUpvotedCase = (incidentCase) => {
  try {
    const upvoted = getUpvotedCases();
    if (!upvoted.includes(incidentCase)) {
      upvoted.push(incidentCase);
      localStorage.setItem(UPVOTED_CASES_KEY, JSON.stringify(upvoted));
    }
  } catch (error) {
    console.error('Error saving upvoted case to localStorage:', error);
  }
};

const hasUserUpvoted = (incidentCase) => {
  const upvoted = getUpvotedCases();
  return upvoted.includes(incidentCase);
};

export default function Modal({ isOpen, onClose, report }) {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isLoadingUpvotes, setIsLoadingUpvotes] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [upvoteError, setUpvoteError] = useState(null);

  // Fetch upvote count when modal opens or report changes
  useEffect(() => {
    if (!isOpen || !report) {
      return;
    }

    const fetchUpvoteCount = async () => {
      setIsLoadingUpvotes(true);
      setUpvoteError(null);

      const result = await getUpvoteCount(report.incident_case);

      if (result.success) {
        setUpvoteCount(result.count);
      } else {
        setUpvoteError('Failed to load upvote count');
      }

      setIsLoadingUpvotes(false);
    };

    // Check if user has already upvoted this case
    setHasUpvoted(hasUserUpvoted(report.incident_case));

    fetchUpvoteCount();
  }, [isOpen, report]);

  const handleUpvote = async () => {
    if (hasUpvoted || isUpvoting || !report) {
      return;
    }

    setIsUpvoting(true);
    setUpvoteError(null);

    const result = await incrementUpvote(report.incident_case);

    if (result.success) {
      setUpvoteCount(result.count);
      setHasUpvoted(true);
      addUpvotedCase(report.incident_case);
    } else {
      setUpvoteError('Failed to upvote. Please try again.');
    }

    setIsUpvoting(false);
  };

  if (!isOpen || !report) return null;

  const userSubmitted = isUserSubmitted(report.incident_case);
  const websiteUrl = window.location.href.split('#')[0] + '#/';

  const handleShare = async (platform) => {
    const shareText = `UCSD Security Alert - ${report.category}\n` +
                      `Location: ${report.location}\n` +
                      `Date: ${report.date_occurred}\n` +
                      `Case #${report.incident_case}\n` +
                      `Summary: ${report.summary}\n\n` +
                      `View more incidents: ${websiteUrl}`;
    
    if (platform === 'sms') {
      const smsUrl = `sms:?body=${encodeURIComponent(shareText)}`;
      window.location.href = smsUrl;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Incident details copied to clipboard! You can now paste this in Instagram DMs or any other app.');
      }).catch(() => {
        alert('Unable to copy. Please select and copy the text manually.');
      });
    } else if (platform === 'screenshot') {
      await handleScreenshot();
    }
  };

  const handleScreenshot = async () => {
    try {
      const modalElement = document.querySelector('.modal-content');
      if (!modalElement) return;

      // Temporarily hide the share buttons and close button for cleaner screenshot
      const shareSection = modalElement.querySelector('.modal-share-section');
      const closeButton = modalElement.querySelector('.modal-close');
      
      if (shareSection) shareSection.style.display = 'none';
      if (closeButton) closeButton.style.display = 'none';

      // Create canvas from modal
      const canvas = await html2canvas(modalElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
      });

      // Restore hidden elements
      if (shareSection) shareSection.style.display = '';
      if (closeButton) closeButton.style.display = '';

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to create screenshot. Please try again.');
          return;
        }

        // Try using Web Share API if available (works on mobile)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'incident.png', { type: 'image/png' })] })) {
          try {
            const file = new File([blob], 'ucsd-incident.png', { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: `UCSD Security Alert - ${report.category}`,
              text: `Location: ${report.location}\nDate: ${report.date_occurred}\nView more: ${websiteUrl}`
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              fallbackDownload(canvas);
            }
          }
        } else {
          // Fallback: Download the image
          fallbackDownload(canvas);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to create screenshot. Please try again or use the copy/SMS options.');
    }
  };

  const fallbackDownload = (canvas) => {
    const link = document.createElement('a');
    link.download = `ucsd-incident-${report.incident_case}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    alert('Screenshot saved! You can now share it via Instagram, SMS, or any other app.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${userSubmitted ? 'modal-content-user-submitted' : 'modal-content-official'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>{report.location}</h2>
          <div className="modal-meta">
            <span className="modal-badge">{report.category}</span>
            <span className="modal-case-id">#{report.incident_case}</span>
            {userSubmitted ? (
              <span className="badge-source badge-user-submitted">User-Submitted Report</span>
            ) : (
              <span className="badge-source badge-official">Official Police Report</span>
            )}
            <button
              className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
              onClick={handleUpvote}
              disabled={hasUpvoted || isUpvoting || isLoadingUpvotes}
              title={hasUpvoted ? 'You have already upvoted this report' : 'Upvote this report'}
            >
              <span className="upvote-icon">{hasUpvoted ? '\u2713' : '\u2191'}</span>
              <span className="upvote-count">
                {isLoadingUpvotes ? '...' : upvoteCount}
              </span>
              <span className="upvote-label">
                {upvoteCount === 1 ? 'upvote' : 'upvotes'}
              </span>
            </button>
          </div>
          {upvoteError && (
            <div className="upvote-error">{upvoteError}</div>
          )}
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3>Summary</h3>
            <p>{report.summary}</p>
          </div>

          <div className="modal-details">
            <div className="modal-detail-item">
              <span className="detail-label">Date Occurred</span>
              <span className="detail-value">{report.date_occurred}</span>
            </div>
            <div className="modal-detail-item">
              <span className="detail-label">Time Occurred</span>
              <span className="detail-value">{report.time_occurred || 'N/A'}</span>
            </div>
            <div className="modal-detail-item">
              <span className="detail-label">Date Reported</span>
              <span className="detail-value">{report.date_reported}</span>
            </div>
            <div className="modal-detail-item">
              <span className="detail-label">Status</span>
              <span className={`status status-${report.disposition.toLowerCase().replace(/\s+/g, '-')}`}>
                {report.disposition}
              </span>
            </div>
          </div>

          <div className="modal-share-section">
            <h3>Share This Report</h3>
            <div className="share-buttons">
              <button className="share-button screenshot-button" onClick={() => handleShare('screenshot')}>
                <span className="share-icon"></span>
                Share Screenshot
              </button>
              <button className="share-button sms-button" onClick={() => handleShare('sms')}>
                <span className="share-icon"></span>
                Share via SMS
              </button>
              <button className="share-button copy-button" onClick={() => handleShare('copy')}>
                <span className="share-icon"></span>
                Copy Details
              </button>
            </div>
            <p className="share-note">Screenshot option works best on mobile devices for sharing to Instagram Stories or DMs</p>
          </div>
        </div>
      </div>
    </div>
  );
}