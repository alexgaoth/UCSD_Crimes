import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

export default function Statistics() {
  const [stats, setStats] = useState({
    byCategory: [],
    byLocation: [],
    byDisposition: [],
    total: 0,
    byDay: []
  });

  useEffect(() => {
    const mockData = [
      {
        category: "Attempt to Contact",
        location: "Tioga Hall",
        date_reported: "10/7/2025",
        incident_case: "2510070084",
        date_occurred: "10/7/2025",
        time_occurred: "6:50 PM",
        summary: "Reporting party is student's brother, has not heard from sister for about 20 hours",
        disposition: "Cancelled"
      },
      {
        category: "Theft",
        location: "Price Center",
        date_reported: "10/6/2025",
        incident_case: "2510060042",
        date_occurred: "10/6/2025",
        time_occurred: "2:30 PM",
        summary: "Student reported missing laptop from study area.",
        disposition: "Reported"
      },
      {
        category: "Suspicious Activity",
        location: "Geisel Library",
        date_reported: "10/5/2025",
        incident_case: "2510050018",
        date_occurred: "10/5/2025",
        time_occurred: "11:15 PM",
        summary: "Campus safety observed individuals loitering",
        disposition: "Investigated"
      },
      {
        category: "Vandalism",
        location: "Warren Quad",
        date_reported: "10/4/2025",
        incident_case: "2510040055",
        date_occurred: "10/4/2025",
        time_occurred: "8:00 AM",
        summary: "Graffiti discovered on exterior wall",
        disposition: "Reported"
      },
      {
        category: "Traffic Incident",
        location: "North Torrey Pines Road",
        date_reported: "10/3/2025",
        incident_case: "2510030091",
        date_occurred: "10/3/2025",
        time_occurred: "5:45 PM",
        summary: "Minor vehicle collision",
        disposition: "Resolved"
      },
      {
        category: "Theft",
        location: "Price Center",
        date_reported: "10/3/2025",
        incident_case: "2510030045",
        date_occurred: "10/3/2025",
        time_occurred: "1:20 PM",
        summary: "Bicycle theft reported",
        disposition: "Reported"
      }
    ];

    // Calculate statistics
    const categoryCount = {};
    const locationCount = {};
    const dispositionCount = {};
    const dayCount = {};

    mockData.forEach(report => {
      categoryCount[report.category] = (categoryCount[report.category] || 0) + 1;
      locationCount[report.location] = (locationCount[report.location] || 0) + 1;
      dispositionCount[report.disposition] = (dispositionCount[report.disposition] || 0) + 1;
      dayCount[report.date_occurred] = (dayCount[report.date_occurred] || 0) + 1;
    });

    const byCategory = Object.entries(categoryCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const byLocation = Object.entries(locationCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const byDisposition = Object.entries(dispositionCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const byDay = Object.entries(dayCount).map(([name, count]) => ({ name, count })).sort((a, b) => new Date(b.name) - new Date(a.name));

    setStats({
      byCategory,
      byLocation,
      byDisposition,
      byDay,
      total: mockData.length
    });
  }, []);

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