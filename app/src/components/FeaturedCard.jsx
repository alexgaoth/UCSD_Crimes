import React from 'react';
import UpvoteCount from './UpvoteCount';
import { getCategoryColors, getCategoryIcon } from '../utils/categoryColors';

const isUserSubmitted = (caseNumber) => caseNumber && caseNumber.startsWith('USER-');

export default function FeaturedCard({ report, onClick }) {
  const userSubmitted = isUserSubmitted(report.incident_case);
  const catColors = getCategoryColors(report.category);
  const CatIcon = getCategoryIcon(report.category);

  return (
    <article
      className={`featured-card ${userSubmitted ? 'featured-card-user' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="card-category-block"
        style={{ background: catColors.bg, borderBottom: '3px solid #182B49' }}
      >
        <span className="card-category-name" style={{ color: catColors.text }}>
          {report.category}
        </span>
        <span className="card-category-icon" aria-hidden="true">
          <CatIcon size={28} style={{ color: catColors.text }} />
        </span>
      </div>

      <div className="card-content">
        <div className="card-meta">
          <span className="case-id">#{report.incident_case}</span>
          {userSubmitted && <span className="badge badge-user">USER REPORT</span>}
        </div>
        <h3>{report.location}</h3>
        <p className="card-summary">{report.summary}</p>
        <div className="card-footer">
          <div className="footer-left">
            <span className="time-label">Reported</span>
            <span className="time-value">{report.date_occurred}</span>
          </div>
          <div className="footer-right">
            <UpvoteCount incidentCase={report.incident_case} compact={false} />
            <span className={`status-pill status-${report.disposition?.toLowerCase().replace(/\s+/g, '-')}`}>
              {report.disposition}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
