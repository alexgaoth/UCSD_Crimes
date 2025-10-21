import React from 'react';

export default function InsightCard({ title, mainContent, detail, isNumber = false }) {
  return (
    <div className="insight-card">
      <h3>{title}</h3>
      {isNumber ? (
        <p className="insight-number">{mainContent}</p>
      ) : (
        <p className="insight-location">{mainContent}</p>
      )}
      <p className="insight-detail">{detail}</p>
    </div>
  );
}