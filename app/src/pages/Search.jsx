import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import { useReportsUtils } from '../hooks/useReportsUtils.jsx';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import SearchControls from '../components/SearchControls.jsx';
import ResultCard from '../components/ResultCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import './Pages.css';

export default function Search() {
  const { reports, loading } = useReports();
  const { uniqueCategories, uniqueLocations } = useReportsUtils(reports);
  
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    if (!loading && reports.length > 0) {
      setAllReports(reports);
      setFilteredReports(reports.slice(0, 10));
    }
  }, [reports, loading]);

  useEffect(() => {
    let filtered = allReports;

    if (activeSearchTerm) {
      const term = activeSearchTerm.toLowerCase();
      filtered = filtered.filter(report =>
        report.summary.toLowerCase().includes(term) ||
        report.location.toLowerCase().includes(term) ||
        report.category.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(report => report.category === selectedCategory);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(report => report.location === selectedLocation);
    }

    setFilteredReports(filtered.slice(0, 10));
  }, [activeSearchTerm, selectedCategory, selectedLocation, allReports]);

  const calculateTotalResults = () => {
    let count = allReports.length;
    const term = activeSearchTerm.toLowerCase();
    
    if (activeSearchTerm || selectedCategory !== 'all' || selectedLocation !== 'all') {
      count = allReports.filter(report => {
        const matchesSearch = !activeSearchTerm || 
          report.summary.toLowerCase().includes(term) ||
          report.location.toLowerCase().includes(term) ||
          report.category.toLowerCase().includes(term);
        const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
        const matchesLocation = selectedLocation === 'all' || report.location === selectedLocation;
        return matchesSearch && matchesCategory && matchesLocation;
      }).length;
    }
    
    return count;
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setActiveSearchTerm(searchTerm);
    }
  };

  if (loading) {
    return <LoadingState message="Loading search..." />;
  }

  return (
    <>
      <SEO
        title="Search Reports"
        description="Search through UCSD crime reports using filters for location, category, and keywords. Find specific incidents that matter to you with our detailed search tool for campus safety data."
        path="/search"
      />
      <Breadcrumbs items={[{ name: 'Search', path: '/search' }]} />
      <PageLayout
        title="Search Reports"
        subtitle="Find Specific Incidents"
      >
      <SearchControls
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        categories={uniqueCategories}
        locations={uniqueLocations}
        selectedCategory={selectedCategory}
        selectedLocation={selectedLocation}
        onCategoryChange={(e) => setSelectedCategory(e.target.value)}
        onLocationChange={(e) => setSelectedLocation(e.target.value)}
      />

      <section className="search-results">
        <div className="results-header">
          <SectionTitle>Search Results</SectionTitle>
          <span className="results-count">
            Showing top {filteredReports.length} of {calculateTotalResults()} reports
          </span>
        </div>

        <div className="results-list">
          {filteredReports.length === 0 ? (
            <div className="no-results">
              <p>No reports match your search criteria</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <ResultCard key={report.incident_case} report={report} />
            ))
          )}
        </div>
      </section>
    </PageLayout>
    </>
  );
}