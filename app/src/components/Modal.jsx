import React from 'react';

export default function Modal({ isOpen, onClose, report }) {
  if (!isOpen || !report) return null;

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
        </div>
      </div>
    </div>
  );
}