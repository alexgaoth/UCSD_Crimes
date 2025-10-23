import React from 'react';
import { Link } from 'react-router-dom';

export default function WidgetCard({ to, title, description, className, img}) {
  return (
    <Link to={to} className={`widget ${className}`}>
      <div className="widget-image" style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}resources/${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
      <div className="widget-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}

