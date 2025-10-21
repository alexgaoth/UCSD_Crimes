import React from 'react';

export default function LocationStatItem({ name, count, rank }) {
  return (
    <div className="location-stat-item">
      <span className="location-rank">#{rank}</span>
      <div className="location-info">
        <h3>{name}</h3>
        <p>{count} {count === 1 ? 'report' : 'reports'}</p>
      </div>
    </div>
  );
}