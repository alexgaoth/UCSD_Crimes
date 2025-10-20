import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportsContext.jsx';
import '../App.css';

export default function Home() {
  const { reports, loading } = useReports();

  const topReports = reports.slice(0, 3);
  const otherReports = reports.slice(3);

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-wrapper">
          <div className="header-illustration"></div>
          <div className="header-text">
            <h1>Campus Safety Reports</h1>
            <p>UCSD Security Incidents & Alerts</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="featured">
          <h2 className="section-title">Most Significant Recent Reports</h2>
          <div className="featured-grid">
            {topReports.map((report, idx) => (
              <article key={report.incident_case} className={`featured-card card-${idx + 1}`}>
                <div className="card-image"></div>
                <div className="card-content">
                  <div className="card-meta">
                    <span className="badge">{report.category}</span>
                    <span className="case-id">#{report.incident_case}</span>
                  </div>
                  <h3>{report.location}</h3>
                  <p className="card-summary">{report.summary}</p>
                  <div className="card-footer">
                    <div className="footer-left">
                      <span className="time-label">Reported</span>
                      <span className="time-value">{report.date_occurred}</span>
                    </div>
                    <span className={`status status-${report.disposition.toLowerCase()}`}>
                      {report.disposition}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="quick-access">
          <h2 className="section-title">Explore More</h2>
          <div className="widgets">
            <Link to="/timeline" className="widget widget-1">
              <div className="widget-image"></div>
              <div className="widget-content">
                <h3>Report Timeline</h3>
                <p>View incidents by time of day</p>
              </div>
            </Link>
            <Link to="/search" className="widget widget-2">
              <div className="widget-image"></div>
              <div className="widget-content">
                <h3>Search Reports</h3>
                <p>Find specific incidents</p>
              </div>
            </Link>
            <Link to="/statistics" className="widget widget-3">
              <div className="widget-image"></div>
              <div className="widget-content">
                <h3>Statistics</h3>
                <p>Category breakdown</p>
              </div>
            </Link>
            <Link to="/campus-map" className="widget widget-4">
              <div className="widget-image"></div>
              <div className="widget-content">
                <h3>Campus Map</h3>
                <p>Incident locations</p>
              </div>
            </Link>
          </div>
        </section>

        {otherReports.length > 0 && (
          <section className="other-incidents">
            <h2 className="section-title">Other Recent Incidents</h2>
            <div className="incidents-list">
              {otherReports.map((report) => (
                <div key={report.incident_case} className="incident-row">
                  <div className="incident-info">
                    <h4>{report.location}</h4>
                    <p>{report.category}</p>
                  </div>
                  <div className="incident-stats">
                    <span className="incident-date">{report.date_occurred}</span>
                    <span className={`status-pill status-${report.disposition.toLowerCase()}`}>
                      {report.disposition}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}