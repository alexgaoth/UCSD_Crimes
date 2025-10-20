import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportsContext.jsx';
import './Pages.css';

export default function Search() {
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  
  const { reports, loading } = useReports();

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