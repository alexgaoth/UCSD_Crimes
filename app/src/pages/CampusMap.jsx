import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

export default function CampusMap() {
  const [locationData, setLocationData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

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
      },
      {
        category: "Theft",
        location: "Price Center",
        date_reported: "10/2/2025",
        incident_case: "2510020032",
        date_occurred: "10/2/2025",
        time_occurred: "3:15 PM",
        summary: "Backpack stolen from unattended table",
        disposition: "Reported"
      }
    ];

    // Group by location and count
    const locationMap = {};
    mockData.forEach(report => {
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
    setLocationData(sorted);
  }, []);

  const maxCount = locationData.length > 0 ? locationData[0].count : 1;

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
          <h2 className="section-title">Locations by Report Frequency</h2>
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
                    <h4>Recent Incidents</h4>
                    {location.reports.map(report => (
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
              <h3>Total Locations</h3>
              <p className="insight-number">{locationData.length}</p>
              <p className="insight-detail">Areas with reported incidents</p>
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