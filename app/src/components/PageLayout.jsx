import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const QUICK_NAV = [
  { to: '/', label: 'Home' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/search', label: 'Search' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/campus-map', label: 'Map' },
  { to: '/full-directory', label: 'Directory' },
  { to: '/report-case', label: '+ Report' },
];

export default function PageLayout({ title, subtitle, children }) {
  const location = useLocation();

  return (
    <div className="app">
      <header className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h1 className="page-header-title">{title}</h1>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
          </div>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
      <footer className="page-footer">
        <div className="page-footer-inner">
          <span className="page-footer-label">Navigate</span>
          <nav className="page-footer-nav">
            {QUICK_NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`page-footer-link ${location.pathname === to ? 'active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
