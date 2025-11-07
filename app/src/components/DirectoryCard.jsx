import React from 'react';

/**
 * DirectoryCard component displays a crime incident card for the Full Directory page
 * Similar to ResultCard but with enhanced styling for grouped date views
 */
export default function DirectoryCard({ report, onClick }) {
  return (
    <article
      className="directory-card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="directory-card-header">
        <div className="directory-card-left">
          <h3>{report.location}</h3>
          <span className="directory-category">{report.category}</span>
        </div>
        <span className="directory-case">#{report.incident_case}</span>
      </div>

      <p className="directory-summary">{report.summary}</p>

      <div className="directory-card-footer">
        <div className="directory-footer-left">
          {report.time_occurred && (
            <span className="directory-time">
              {report.time_occurred}
            </span>
          )}
        </div>
        <span className={`status-pill status-${report.disposition.toLowerCase().replace(/\s+/g, '-')}`}>
          {report.disposition}
        </span>
      </div>
    </article>
  );
}
