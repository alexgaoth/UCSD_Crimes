import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportsContext.jsx';
import './Pages.css';

export default function Statistics() {
  const [stats, setStats] = useState({
    byCategory: [],
    byLocation: [],
    byDisposition: [],
    total: 0,
    byDay: []
  });

  const { reports, loading } = useReports();

  const maxCategory = Math.max(...stats.byCategory.map(s => s.count), 1);
  const maxDisposition = Math.max(...stats.byDisposition.map(s => s.count), 1);

  return (
    <div className="app">
      <header className="header">
        <div className="header-wrapper">
          <div className="header-illustration"></div>
          <div className="header-text">
            <Link to="/" className="back-link">← Back to Home</Link>
            <h1>Statistics</h1>
            <p>Crime Report Analytics</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="stats-overview">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Reports</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.byCategory.length}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.byLocation.length}</span>
            <span className="stat-label">Locations</span>
          </div>
        </section>

        <section className="stats-section">
          <h2 className="section-title">Reports by Category</h2>
          <div className="stat-bars">
            {stats.byCategory.map(item => (
              <div key={item.name} className="stat-bar-item">
                <div className="stat-bar-label">
                  <span>{item.name}</span>
                  <span className="stat-bar-count">{item.count}</span>
                </div>
                <div className="stat-bar-track">
                  <div 
                    className="stat-bar-fill category-fill"
                    style={{ width: `${(item.count / maxCategory) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <h2 className="section-title">Reports by Disposition</h2>
          <div className="stat-bars">
            {stats.byDisposition.map(item => (
              <div key={item.name} className="stat-bar-item">
                <div className="stat-bar-label">
                  <span>{item.name}</span>
                  <span className="stat-bar-count">{item.count}</span>
                </div>
                <div className="stat-bar-track">
                  <div 
                    className={`stat-bar-fill disposition-fill-${item.name.toLowerCase()}`}
                    style={{ width: `${(item.count / maxDisposition) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <h2 className="section-title">Most Active Locations</h2>
          <div className="location-stats">
            {stats.byLocation.map((item, idx) => (
              <div key={item.name} className="location-stat-item">
                <span className="location-rank">#{idx + 1}</span>
                <div className="location-info">
                  <h3>{item.name}</h3>
                  <p>{item.count} {item.count === 1 ? 'report' : 'reports'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <h2 className="section-title">Daily Report Count</h2>
          <div className="day-stats">
            {stats.byDay.map(item => (
              <div key={item.name} className="day-stat-item">
                <span className="day-date">{item.name}</span>
                <span className="day-count">{item.count} {item.count === 1 ? 'report' : 'reports'}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}