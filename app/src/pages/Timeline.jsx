import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportsContext.jsx';
import './Pages.css';

export default function Timeline() {
  

  const { reports, loading } = useReports();
  const [timeData, setTimeData] = useState({ reported: [], occurred: [] });

  useEffect(() => {
    fetch('/police_reports.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load police_reports.json');
        return res.json();
      })
      .then((data) => {
        const allIncidents = data.reports.flatMap((reportFile) => reportFile.incidents);
        const sorted = allIncidents.sort((a, b) => b.summary.length - a.summary.length);
        setReports(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    }, []);
  

  const maxValue = Math.max(...timeData.occurred, ...timeData.reported);

  return (
    <div className="app">
      <header className="header">
        <div className="header-wrapper">
          <div className="header-illustration"></div>
          <div className="header-text">
            <Link to="/" className="back-link">← Back to Home</Link>
            <h1>Report Timeline</h1>
            <p>Incidents by Time of Day</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="chart-section">
          <h2 className="section-title">When Incidents Occurred</h2>
          <div className="chart-container">
            <div className="chart-bars">
              {timeData.occurred.map((count, hour) => (
                <div key={hour} className="bar-group">
                  <div 
                    className="bar occurred-bar"
                    style={{ height: `${maxValue > 0 ? (count / maxValue) * 200 : 0}px` }}
                  >
                    {count > 0 && <span className="bar-value">{count}</span>}
                  </div>
                  <span className="bar-label">
                    {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour-12}PM`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="chart-section">
          <h2 className="section-title">When Incidents Were Reported</h2>
          <div className="chart-container">
            <div className="chart-bars">
              {timeData.reported.map((count, hour) => (
                <div key={hour} className="bar-group">
                  <div 
                    className="bar reported-bar"
                    style={{ height: `${maxValue > 0 ? (count / maxValue) * 200 : 0}px` }}
                  >
                    {count > 0 && <span className="bar-value">{count}</span>}
                  </div>
                  <span className="bar-label">
                    {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour-12}PM`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="timeline-list">
          <h2 className="section-title">Recent Reports</h2>
          <div className="timeline-items">
            {reports.map(report => (
              <div key={report.incident_case} className="timeline-item">
                <div className="timeline-time">
                  <span className="time-display">{report.time_occurred}</span>
                  <span className="date-display">{report.date_occurred}</span>
                </div>
                <div className="timeline-content">
                  <h3>{report.location}</h3>
                  <p className="timeline-category">{report.category}</p>
                  <p className="timeline-summary">{report.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}