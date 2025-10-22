import React from 'react';

export default function RankingItem({ location, rank, maxCount, isSelected, onClick }) {
  return (
    <div 
      className={`ranking-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="ranking-header">
        <div className="ranking-left">
          <span className="ranking-number">#{rank}</span>
          <h3>{location.name}</h3>
        </div>
        <div className="ranking-right">
          <span className="ranking-count">{location.count}</span>
          <span className="ranking-label">
            {location.count === 1 ? 'report' : 'reports'}
          </span>
        </div>
      </div>
      <div className="ranking-bar">
        <div 
          className="ranking-fill"
          style={{ width: `${(location.count / maxCount) * 100}%` }}
        ></div>
      </div>
      
      {isSelected && (
        <div className="location-details">
          <h4>Recent Incidents (showing up to 10)</h4>
          {location.reports.slice(0, 10).map(report => (
            <div key={report.incident_case} className="detail-incident">
              <div className="detail-header">
                <span className="detail-category">{report.category}</span>
                <span className="detail-date">{report.date_occurred}</span>
              </div>
              <p className="detail-summary">{report.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}