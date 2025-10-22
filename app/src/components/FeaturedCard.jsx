import React from 'react';

export default function IncidentRow({ report }) {
  return (
    <div className="incident-row">
      <div className="incident-info">
        <h4>{report.location}</h4>
        <p>{report.category}</p>
      </div>
      <div className="incident-stats">
        <span className="incident-date">{report.date_occurred}</span>
        <span className={`status-pill status-${report.disposition.toLowerCase()}`}>
          {report.disposition}
        </span>
      </div>
    </div>
  );
}