import React from 'react';

export default function ResultCard({ report }) {
  return (
    <article className="result-card">
      <div className="result-header">
        <div>
          <h3>{report.location}</h3>
          <span className="result-category">{report.category}</span>
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