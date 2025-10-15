import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

export default function Search() {
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

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
        summary: "Student reported missing laptop from study area. Item was black MacBook Pro with distinctive stickers.",
        disposition: "Reported"
      },
      {
        category: "Suspicious Activity",
        location: "Geisel Library",
        date_reported: "10/5/2025",
        incident_case: "2510050018",
        date_occurred: "10/5/2025",
        time_occurred: "11:15 PM",
        summary: "Campus safety observed individuals loitering near restricted research area without valid credentials",
        disposition: "Investigated"
      },
      {
        category: "Vandalism",
        location: "Warren Quad",
        date_reported: "10/4/2025",
        incident_case: "2510040055",
        date_occurred: "10/4/2025",
        time_occurred: "8:00 AM",
        summary: "Graffiti discovered on exterior wall of residential college building",
        disposition: "Reported"
      },
      {
        category: "Traffic Incident",
        location: "North Torrey Pines Road",
        date_reported: "10/3/2025",
        incident_case: "2510030091",
        date_occurred: "10/3/2025",
        time_occurred: "5:45 PM",
        summary: "Minor vehicle collision in parking lot with no injuries reported",
        disposition: "Resolved"
      }
    ];

    setAllReports(mockData);
    setFilteredReports(mockData);

    const uniqueCategories = [...new Set(mockData.map(r => r.category))];
    const uniqueLocations = [...new Set(mockData.map(r => r.location))];
    setCategories(uniqueCategories);
    setLocations(uniqueLocations);
  }, []);

  useEffect(() => {
    let filtered = allReports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(report => report.category === selectedCategory);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(report => report.location === selectedLocation);
    }

    setFilteredReports(filtered);
  }, [searchTerm, selectedCategory, selectedLocation, allReports]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-wrapper">
          <div className="header-illustration"></div>
          <div className="header-text">
            <Link to="/" className="back-link">← Back to Home</Link>
            <h1>Search Reports</h1>
            <p>Find Specific Incidents</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="search-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by summary, location, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="search-results">
          <div className="results-header">
            <h2 className="section-title">Search Results</h2>
            <span className="results-count">{filteredReports.length} reports found</span>
          </div>

          <div className="results-list">
            {filteredReports.length === 0 ? (
              <div className="no-results">
                <p>No reports match your search criteria</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <article key={report.incident_case} className="result-card">
                  <div className="result-header">
                    <div>
                      <h3>{report.location}</h3>
                      <span className="result-category">{report.category}</span>
                    </div>
                    <span className="result-case">#{report.incident_case}</span>
                  </div>
                  <p className="result-summary">{report.summary}</p>
                  <div className="result-footer">
                    <span className="result-date">{report.date_occurred} at {report.time_occurred}</span>
                    <span className={`status-pill status-${report.disposition.toLowerCase()}`}>
                      {report.disposition}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}