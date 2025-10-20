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

  useEffect(() => {
    if (!loading && reports.length > 0) {
      const categoryCount = {};
      const locationCount = {};
      const dispositionCount = {};
      const dayCount = {};

      reports.forEach(report => {
        categoryCount[report.category] = (categoryCount[report.category] || 0) + 1;
        locationCount[report.location] = (locationCount[report.location] || 0) + 1;
        dispositionCount[report.disposition] = (dispositionCount[report.disposition] || 0) + 1;
        dayCount[report.date_occurred] = (dayCount[report.date_occurred] || 0) + 1;
      });

      const byCategory = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .filter(item => item.count > 10)
        .sort((a, b) => b.count - a.count);
      
      const byLocation = Object.entries(locationCount)
        .map(([name, count]) => ({ name, count }))
        .filter(item => item.count > 10)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
      
      const byDisposition = Object.entries(dispositionCount)
        .map(([name, count]) => ({ name, count }))
        .filter(item => item.count > 10)
        .sort((a, b) => b.count - a.count);
      
      const byDay = Object.entries(dayCount)
        .map(([name, count]) => ({ name, count }))
        .filter(item => item.count > 10)
        .sort((a, b) => new Date(b.name) - new Date(a.name))
        .slice(0, 20);

      setStats({
        byCategory,
        byLocation,
        byDisposition,
        byDay,
        total: reports.length
      });
    }
  }, [reports, loading]);

  const maxCategory = Math.max(...stats.byCategory.map(s => s.count), 1);
  const maxDisposition = Math.max(...stats.byDisposition.map(s => s.count), 1);

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

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
            <span className="stat-label">Categories (10+)</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.byLocation.length}</span>
            <span className="stat-label">Locations (10+)</span>
          </div>
        </section>

        <section className="stats-section">
          <h2 className="section-title">Reports by Category (10+ occurrences)</h2>
          {stats.byCategory.length === 0 ? (
            <div className="no-results">
              <p>No categories with more than 10 occurrences</p>
            </div>
          ) : (
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
          )}
        </section>

        <section className="stats-section">
          <h2 className="section-title">Reports by Disposition (10+ occurrences)</h2>
          {stats.byDisposition.length === 0 ? (
            <div className="no-results">
              <p>No dispositions with more than 10 occurrences</p>
            </div>
          ) : (
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
          )}
        </section>

        <section className="stats-section">
          <h2 className="section-title">Most Active Locations (10+ reports)</h2>
          {stats.byLocation.length === 0 ? (
            <div className="no-results">
              <p>No locations with more than 10 reports</p>
            </div>
          ) : (
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
          )}
        </section>

        <section className="stats-section">
          <h2 className="section-title">High Activity Days (10+ reports per day)</h2>
          {stats.byDay.length === 0 ? (
            <div className="no-results">
              <p>No days with more than 10 reports</p>
            </div>
          ) : (
            <div className="day-stats">
              {stats.byDay.map(item => (
                <div key={item.name} className="day-stat-item">
                  <span className="day-date">{item.name}</span>
                  <span className="day-count">{item.count} {item.count === 1 ? 'report' : 'reports'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}