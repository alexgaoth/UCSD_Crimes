import React, { useState, useMemo } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import PageLayout from '../components/PageLayout.jsx';
import DirectoryCard from '../components/DirectoryCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import './Pages.css';

/**
 * FullDirectory page - Browse all crime reports organized by date
 * Groups reports by date_occurred and displays them in chronological order (newest first)
 */
export default function FullDirectory() {
  const { reports, loading } = useReports();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group reports by date_occurred
  const groupedReports = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    // Create a map of date -> reports
    const dateMap = new Map();

    reports.forEach(report => {
      const date = report.date_occurred;
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date).push(report);
    });

    // Convert to array and sort by date (newest first)
    const sortedGroups = Array.from(dateMap.entries())
      .map(([date, reportsForDate]) => ({
        date,
        dateObj: new Date(date),
        reports: reportsForDate
      }))
      .sort((a, b) => b.dateObj - a.dateObj);

    return sortedGroups;
  }, [reports]);

  // Format date nicely (e.g., "November 5, 2025")
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Handle clicking on an incident card
  const handleCardClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  };

  if (loading) {
    return <LoadingState message="Loading crime reports..." />;
  }

  return (
    <>
      <SEO
        title="Full Directory"
        description="Browse the complete archive of UCSD campus crime reports organized by date. View all incidents, search by location, category, and date to stay informed about campus safety."
        path="/full-directory"
      />

      <PageLayout
        title="Full Directory"
        subtitle="Complete Crime Report Archive"
        showBackLink={true}
      >
        <Breadcrumbs items={[{ name: 'Full Directory', path: '/full-directory' }]} />

        {groupedReports.length === 0 ? (
          <div className="no-reports">
            <p>No reports available at this time.</p>
          </div>
        ) : (
          <div className="directory-content">
            <div className="directory-summary">
              <p className="directory-total-count">
                Showing <strong>{reports.length}</strong> total incidents across <strong>{groupedReports.length}</strong> dates
              </p>
            </div>

            {groupedReports.map(({ date, reports: dateReports }) => (
              <section key={date} className="date-group">
                <div className="date-group-header">
                  <h2 className="date-heading">{formatDate(date)}</h2>
                  <span className="incident-count">
                    {dateReports.length} {dateReports.length === 1 ? 'incident' : 'incidents'}
                  </span>
                </div>

                <div className="date-group-cards">
                  {dateReports.map((report) => (
                    <DirectoryCard
                      key={report.incident_case}
                      report={report}
                      onClick={() => handleCardClick(report)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          report={selectedReport}
        />
      </PageLayout>
    </>
  );
}
