import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

export default function Timeline() {
  const [reports, setReports] = useState([]);
  const [timeData, setTimeData] = useState({ reported: [], occurred: [] });

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
      }
    ];

    setReports(mockData);

    // Process time data
    const reportedByHour = Array(24).fill(0);
    const occurredByHour = Array(24).fill(0);

    mockData.forEach(report => {
      const time = report.time_occurred;
      const hour = parseInt(time.split(':')[0]);
      const isPM = time.includes('PM');
      const adjustedHour = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;
      
      occurredByHour[adjustedHour]++;
      reportedByHour[adjustedHour]++;
    });

    setTimeData({
      reported: reportedByHour,
      occurred: occurredByHour
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