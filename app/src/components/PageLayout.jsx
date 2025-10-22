import React from 'react';
import { Link } from 'react-router-dom';

export default function PageLayout({ title, subtitle, showBackLink = true, children }) {
  return (
    <div className="app">
      <header className="header">
        <div className="header-wrapper">
          <div className="header-illustration" 
              style={{
                backgroundImage: 'url(/header-logo1.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}></div>
          <div className="header-text">
            {showBackLink && (
              <Link to="/" className="back-link">← Back to Home</Link>
            )}
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  );
}