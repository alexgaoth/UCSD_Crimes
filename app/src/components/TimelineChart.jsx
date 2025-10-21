import React from 'react';

export default function TimelineChart({ data, maxValue, type = 'occurred' }) {
  const barClass = type === 'occurred' ? 'occurred-bar' : 'reported-bar';
  
  return (
    <div className="chart-container">
      <div className="chart-bars">
        {data.map((count, hour) => (
          <div key={hour} className="bar-group">
            <div 
              className={`bar ${barClass}`}
              style={{ height: `${maxValue > 0 ? (count / maxValue) * 200 : 2}px` }}
            >
              {count > 0 && <span className="bar-value">{count}</span>}
            </div>
            <span className="bar-label">
              {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour-12}PM`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}