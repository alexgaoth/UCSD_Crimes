import React from 'react';
import { Link } from 'react-router-dom';

export default function WidgetCard({ to, title, description, icon: Icon }) {
  return (
    <Link to={to} className="widget">
      <div className="widget-icon-area">
        <span className="widget-icon" aria-hidden="true">
          {Icon && <Icon size={32} />}
        </span>
      </div>
      <div className="widget-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="widget-arrow">→</span>
    </Link>
  );
}
