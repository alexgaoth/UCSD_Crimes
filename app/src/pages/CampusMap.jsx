import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportsContext.jsx';
import './Pages.css';

export default function CampusMap() {
  const [locationData, setLocationData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { reports, loading } = useReports();

  useEffect(() => {
    if (!loading && reports.length > 0) {
      const locationMap = {};
      reports.forEach(report => {
        if (!locationMap[report.location]) {
          locationMap[report.location] = {
            name: report.location,
            count: 0,
            reports: []
          };
        }
        locationMap[report.location].count++;
        locationMap[report.location].reports.push(report);
      });

      const sorted = Object.values(locationMap).sort((a, b) => b.count - a.count);
      setLocationData(sorted.slice(0, 20));
    }
  }, [reports, loading]);

  const maxCount = locationData.length > 0 ? locationData[0].count : 1;

  if (loading) {
    return <div className="loading">Loading campus map...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-wrapper">
          <div className="header-illustration"></div>
          <div className="header-text">
            <Link to="/" className="back-link">← Back to Home</Link>
            <h1>Campus Map</h1>
            <p>Incident Locations Overview</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="map-placeholder">
          <div className="map-visual">
            <span className="map-text">Campus Map Visualization</span>
          </div>
        </section>

        <section className="location-ranking">
          <h2 className="section-title">Top 20 Locations by Report Frequency</h2>
          <div className="ranking-list">
            {locationData.map((location, idx) => (
              <div 
                key={location.name} 
                className={`ranking-item ${selectedLocation === location.name ? 'selected' : ''}`}
                onClick={() => setSelectedLocation(selectedLocation === location.name ? null : location.name)}
              >
                <div className="ranking-header">
                  <div className="ranking-left">
                    <span className="ranking-number">#{idx + 1}</span>
                    <h3>{location.name}</h3>
                  </div>
                  <div className="ranking-right">
                    <span className="ranking-count">{location.count}</span>
                    <span className="ranking-label">{location.count === 1 ? 'report' : 'reports'}</span>
                  </div>
                </div>
                <div className="ranking-bar">
                  <div 
                    className="ranking-fill"
                    style={{ width: `${(location.count / maxCount) * 100}%` }}
                  ></div>
                </div>
                
                {selectedLocation === location.name && (
                  <div className="location-details">
                    <h4>Recent Incidents (showing up to 10)</h4>
                    {location.reports.slice(0, 10).map(report => (
                      <div key={report.incident_case} className="detail-incident">
                        <div className="detail-header">
                          <span className="detail-category">{report.category}</span>
                          <span className="detail-date">{report.date_occurred}</span>
                        </div>
                        <p className="detail-summary">{report.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="location-insights">
          <h2 className="section-title">Key Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Highest Activity</h3>
              <p className="insight-location">{locationData[0]?.name || 'N/A'}</p>
              <p className="insight-detail">{locationData[0]?.count || 0} incidents reported</p>
            </div>
            <div className="insight-card">
              <h3>Top 20 Locations</h3>
              <p className="insight-number">{locationData.length}</p>
              <p className="insight-detail">Areas with most incidents</p>
            </div>
            <div className="insight-card">
              <h3>Average per Location</h3>
              <p className="insight-number">
                {locationData.length > 0 ? 
                  (locationData.reduce((sum, loc) => sum + loc.count, 0) / locationData.length).toFixed(1) 
                  : 0}
              </p>
              <p className="insight-detail">Reports per location</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}