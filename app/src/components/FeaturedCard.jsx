import React from 'react';

export default function FeaturedCard({ report, imageIndex, onClick }) {
  return (
    <article 
      className={`featured-card card-${imageIndex}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-image" style={{ 
        backgroundImage: `url(${import.meta.env.BASE_URL}resources/home${imageIndex}.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}></div>
      <div className="card-content">
        <div className="card-meta">
          <span className="badge">{report.category}</span>
          <span className="case-id">#{report.incident_case}</span>
        </div>
        <h3>{report.location}</h3>
        <p className="card-summary">{report.summary}</p>
        <div className="card-footer">
          <div className="footer-left">
            <span className="time-label">Reported</span>
            <span className="time-value">{report.date_occurred}</span>
          </div>
          <span className={`status status-${report.disposition.toLowerCase().replace(/\s+/g, '-')}`}>
            {report.disposition}
          </span>
        </div>
      </div>
    </article>
  );
}