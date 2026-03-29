import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import { useReportsUtils } from '../hooks/useReportsUtils.jsx';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import SearchControls from '../components/SearchControls.jsx';
import ResultCard from '../components/ResultCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import SEO from '../components/SEO.jsx';
import './Pages.css';

const ITEMS_PER_PAGE = 10;

export default function Search() {
  const { reports, upvoteCounts, loading } = useReports();
  const { uniqueCategories, uniqueLocations } = useReportsUtils(reports);

  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [minUpvotes, setMinUpvotes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && reports.length > 0) {
      const sorted = [...reports].sort((a, b) => {
        const dateTimeA = new Date(`${a.date_occurred} ${a.time_occurred || '00:00'}`);
        const dateTimeB = new Date(`${b.date_occurred} ${b.time_occurred || '00:00'}`);
        return dateTimeB - dateTimeA;
      });
      setAllReports(sorted);
      setFilteredReports(sorted);
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

    if (minUpvotes > 0) {
      filtered = filtered.filter(
        report => (upvoteCounts[report.incident_case] || 0) >= minUpvotes
      );
    }

    filtered = filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date_occurred} ${a.time_occurred || '00:00'}`);
      const dateTimeB = new Date(`${b.date_occurred} ${b.time_occurred || '00:00'}`);
      return dateTimeB - dateTimeA;
    });

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [activeSearchTerm, selectedCategory, selectedLocation, minUpvotes, allReports, upvoteCounts]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(pageStart, pageEnd);

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setActiveSearchTerm(searchTerm);
    }
  };

  const handleCardClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
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
        minUpvotes={minUpvotes}
        onMinUpvotesChange={(e) => setMinUpvotes(Number(e.target.value))}
      />

      <section className="search-results">
        <div className="results-header">
          <SectionTitle>Search Results</SectionTitle>
          <span className="results-count">
            {filteredReports.length === 0
              ? 'No results'
              : `${pageStart + 1}–${Math.min(pageEnd, filteredReports.length)} of ${filteredReports.length} reports`}
          </span>
        </div>

        <div className="results-list">
          {paginatedReports.length === 0 ? (
            <div className="no-results">
              <p>No reports match your search criteria</p>
            </div>
          ) : (
            paginatedReports.map(report => (
              <ResultCard
                key={report.incident_case}
                report={report}
                onClick={() => handleCardClick(report)}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination-nav">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        report={selectedReport}
      />
    </PageLayout>
    </>
  );
}
