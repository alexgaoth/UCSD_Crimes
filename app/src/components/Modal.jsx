import React from 'react';
import html2canvas from 'html2canvas';

export default function Modal({ isOpen, onClose, report }) {
  if (!isOpen || !report) return null;

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{report.location}</h2>
          <div className="modal-meta">
            <span className="modal-badge">{report.category}</span>
            <span className="modal-case-id">#{report.incident_case}</span>
          </div>
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