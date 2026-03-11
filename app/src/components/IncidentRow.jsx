import React from 'react';
import UpvoteCount from './UpvoteCount';
import { getCategoryColors } from '../utils/categoryColors';

const isUserSubmitted = (caseNumber) => caseNumber && caseNumber.startsWith('USER-');

export default function IncidentRow({ report, onClick }) {
  const userSubmitted = isUserSubmitted(report.incident_case);
  const catColors = getCategoryColors(report.category);

  return (
    <div
      className={`incident-row ${userSubmitted ? 'incident-row-user' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="incident-row-category-bar"
        style={{ background: catColors.bg }}
        aria-hidden="true"
      ></div>
      <div className="incident-info">
        <p className="incident-category" style={{ color: '#182B49' }}>{report.category}</p>
        <h4 className="incident-location">{report.location}</h4>
        {userSubmitted && <span className="badge badge-user">USER REPORT</span>}
      </div>
      <div className="incident-stats">
        <span className="incident-date">{report.date_occurred}</span>
        <UpvoteCount incidentCase={report.incident_case} compact={true} />
        <span className={`status-pill status-${report.disposition?.toLowerCase().replace(/\s+/g, '-')}`}>
          {report.disposition}
        </span>
      </div>
    </div>
  );
}
