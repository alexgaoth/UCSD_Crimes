import React from 'react';

export default function StatBar({ name, count, maxValue, fillClass = 'category-fill' }) {
  return (
    <div className="stat-bar-item">
      <div className="stat-bar-label">
        <span>{name}</span>
        <span className="stat-bar-count">{count}</span>
      </div>
      <div className="stat-bar-track">
        <div 
          className={`stat-bar-fill ${fillClass}`}
          style={{ width: `${(count / maxValue) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}