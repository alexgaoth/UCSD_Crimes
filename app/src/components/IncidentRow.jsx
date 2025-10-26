import React from 'react';

export default function IncidentRow({ report, onClick }) {
  return (
    <div 
      className="incident-row"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="incident-info">
        <h4>{report.location}</h4>
        <p>{report.category}</p>
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