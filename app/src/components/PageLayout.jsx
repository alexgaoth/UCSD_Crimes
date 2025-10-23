import React from 'react';
import { Link } from 'react-router-dom';

export default function PageLayout({ title, subtitle, showBackLink = true, children }) {
  return (
    <div className="app">
      <header className="header">
        <div className="header-wrapper">
          <div className="header-illustration" 
              style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}header-logo1.png)`,
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
          <div className="header-credit">
            <p>made by a ucsd student for ucsd students</p>
            <a href="https://alexgaoth.github.io/main-section/" target="_blank" rel="noopener noreferrer">
              check out more about me here
            </a>
          </div>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  );
}