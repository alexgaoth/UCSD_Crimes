import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/search', label: 'Search' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/campus-map', label: 'Map' },
  { to: '/full-directory', label: 'Directory' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <img
            src={`${import.meta.env.BASE_URL}header-logo1.png`}
            alt="UCSD logo"
            className="navbar-logo"
          />
          <span className="navbar-brand-text">UCSD CRIME LOG</span>
        </Link>

        <button
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`navbar-link ${location.pathname === to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/report-case"
              className={`navbar-cta ${location.pathname === '/report-case' ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              + Report Incident
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
