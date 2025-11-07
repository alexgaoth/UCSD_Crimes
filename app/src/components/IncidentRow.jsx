import React from 'react';

// Helper function to check if a report is user-submitted
const isUserSubmitted = (caseNumber) => {
  return caseNumber && caseNumber.startsWith('USER-');
};

export default function IncidentRow({ report, onClick }) {
  const userSubmitted = isUserSubmitted(report.incident_case);

  return (
    <div
      className={`incident-row ${userSubmitted ? 'incident-row-user-submitted' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="incident-info">
        <h4>{report.location}</h4>
        <p>{report.category}</p>
        {userSubmitted && <span className="badge-user-report">User Report</span>}
      </div>
      <div className="incident-stats">
        <div className="incident-stats-row">
          <span className="incident-date">{report.date_occurred}</span>
          <span className={`status-pill status-${report.disposition.toLowerCase().replace(/\s+/g, '-')}`}>
            {report.disposition}
          </span>
        </div>
        {/*<p className="incident-summary">{report.summary}</p>*/}
      </div>
    </div>
  );
}