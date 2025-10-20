import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportsContext.jsx';
import './Pages.css';

export default function Timeline() {
  const { reports, loading } = useReports();
  const [timeData, setTimeData] = useState({ reported: [], occurred: [] });

  useEffect(() => {
    if (!loading && reports.length > 0) {
      const reportedByHour = Array(24).fill(0);
      const occurredByHour = Array(24).fill(0);

      reports.forEach(report => {
        // Parse time_occurred
        if (report.time_occurred) {
          const time = report.time_occurred.trim();
          const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          
          if (match) {
            let hour = parseInt(match[1]);
            const isPM = match[3].toUpperCase() === 'PM';
            
            // Convert to 24-hour format
            if (isPM && hour !== 12) {
              hour += 12;
            } else if (!isPM && hour === 12) {
              hour = 0;
            }
            
            if (hour >= 0 && hour < 24) {
              occurredByHour[hour]++;
            }
          }
        }

        // Parse date_reported time if available, otherwise use same as occurred
        if (report.time_reported) {
          const time = report.time_reported.trim();
          const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          
          if (match) {
            let hour = parseInt(match[1]);
            const isPM = match[3].toUpperCase() === 'PM';
            
            if (isPM && hour !== 12) {
              hour += 12;
            } else if (!isPM && hour === 12) {
              hour = 0;
            }
            
            if (hour >= 0 && hour < 24) {
              reportedByHour[hour]++;
            }
          }
        } else if (report.time_occurred) {
          // If no reported time, use occurred time
          const time = report.time_occurred.trim();
          const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          
          if (match) {
            let hour = parseInt(match[1]);
            const isPM = match[3].toUpperCase() === 'PM';
            
            if (isPM && hour !== 12) {
              hour += 12;
            } else if (!isPM && hour === 12) {
              hour = 0;
            }
            
            if (hour >= 0 && hour < 24) {
              reportedByHour[hour]++;
            }
          }
        }
      });

      setTimeData({
        reported: reportedByHour,
        occurred: occurredByHour
      });
    }
  }, [reports, loading]);

  const maxValue = Math.max(...timeData.occurred, ...timeData.reported, 1);

  if (loading) {
    return <div className="loading">Loading timeline...</div>;
  }

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
                    style={{ height: `${maxValue > 0 ? (count / maxValue) * 200 : 2}px` }}
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
                    style={{ height: `${maxValue > 0 ? (count / maxValue) * 200 : 2}px` }}
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
            {reports.slice(0, 20).map(report => (
              <div key={report.incident_case} className="timeline-item">
                <div className="timeline-time">
                  <span className="time-display">{report.time_occurred || 'N/A'}</span>
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