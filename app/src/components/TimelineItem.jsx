import React from 'react';

// Helper function to check if a report is user-submitted
const isUserSubmitted = (caseNumber) => {
  return caseNumber && caseNumber.startsWith('USER-');
};

export default function TimelineItem({ report, onClick }) {
  const userSubmitted = isUserSubmitted(report.incident_case);

  return (
    <div
      className={`timeline-item ${userSubmitted ? 'timeline-item-user-submitted' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="timeline-time">
        <span className="time-display">{report.time_occurred || 'N/A'}</span>
        <span className="date-display">{report.date_occurred}</span>
      </div>
      <div className="timeline-content">
        <h3>{report.location}</h3>
        <p className="timeline-category">{report.category}</p>
        <p className="timeline-summary">{report.summary}</p>
        {userSubmitted && <span className="badge-user-report">User Report</span>}
      </div>
    </div>
  );
}