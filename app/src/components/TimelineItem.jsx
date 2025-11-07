import React from 'react';

// Helper function to check if a report is user-submitted
const isUserSubmitted = (caseNumber) => {
  return caseNumber && caseNumber.startsWith('USER-');
};

export default function TimelineItem({ report, onClick }) {
  const userSubmitted = isUserSubmitted(report.incident_case);

  return (
    <article
      className={`result-card ${userSubmitted ? 'result-card-user-submitted' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="result-header">
        <div>
          <h3>{report.location}</h3>
          <span className="result-category">{report.category}</span>
          {userSubmitted && <span className="badge-user-report">User Report</span>}
        </div>
        <span className="result-case">#{report.incident_case}</span>
      </div>
      <p className="result-summary">{report.summary}</p>
      <div className="result-footer">
        <span className="result-date">
          {report.date_occurred} at {report.time_occurred || 'N/A'}
        </span>
        <span className={`status-pill status-${report.disposition.toLowerCase().replace(/\s+/g, '-')}`}>
          {report.disposition}
        </span>
      </div>
    </article>
  );
}