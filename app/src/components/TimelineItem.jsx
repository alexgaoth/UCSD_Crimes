import React from 'react';

export default function TimelineItem({ report }) {
  return (
    <div className="timeline-item">
      <div className="timeline-time">
        <span className="time-display">{report.time_occurred || 'N/A'}</span>
        <span className="date-display">{report.date_occurred}</span>
      </div>
      <div className="timeline-content">
        <h3>{report.location}</h3>
        <p className="timeline-category">{report.category}</p>
        <p className="timeline-summary">{report.summary}</p>
      </div>
    </div>
  );
}