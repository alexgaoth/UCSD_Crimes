import React from 'react';
import { Link } from 'react-router-dom';

export default function WidgetCard({ to, title, description, className }) {
  return (
    <Link to={to} className={`widget ${className}`}>
      <div className="widget-image"></div>
      <div className="widget-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}