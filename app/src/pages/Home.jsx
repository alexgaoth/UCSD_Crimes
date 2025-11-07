import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportsContext.jsx';
import { useReportsUtils } from '../hooks/useReportsUtils.jsx';
import PageLayout from '../components/PageLayout.jsx';
import FeaturedCard from '../components/FeaturedCard.jsx';
import IncidentRow from '../components/IncidentRow.jsx';
import WidgetCard from '../components/WidgetCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import WelcomeBanner from '../components/WelcomeBanner.jsx';
import SEO from '../components/SEO.jsx';
import '../App.css';

export default function Home() {
  const { reports, loading } = useReports();
  const { topRecentReports } = useReportsUtils(reports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort all reports by most recent first (for fallback when topRecentReports is empty)
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const dateA = new Date(a.date_reported || a.date_occurred);
      const dateB = new Date(b.date_reported || b.date_occurred);
      return dateB - dateA; // Most recent first
    });
  }, [reports]);

  const featuredReports = topRecentReports.length > 0
    ? topRecentReports.slice(0, 3)
    : sortedReports.slice(0, 3);

  const otherReports = topRecentReports.length > 0
    ? topRecentReports.slice(3, 15)
    : sortedReports.slice(3, 15);

  const handleCardClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  };

  if (loading) {
    return <LoadingState message="Loading reports..." />;
  }

  return (
    <>
      <SEO
        title="Campus Safety Incidents"
        description="Access comprehensive UCSD campus crime data and safety reports. Track recent incidents, explore interactive maps, and view detailed statistics to stay informed about campus security at UC San Diego."
        path="/"
      />
      <WelcomeBanner />
      <PageLayout
        title="The Website to be Safe on Campus"
        subtitle="See all the reported Crimes in UCSD"
        showBackLink={false}
      >
        <section className="featured">
          <SectionTitle>Reports of Recent</SectionTitle>
          <div className="featured-grid">
            {featuredReports.map((report, idx) => (
              <FeaturedCard 
                key={report.incident_case} 
                report={report} 
                imageIndex={idx + 1}
                onClick={() => handleCardClick(report)}
              />
            ))}
          </div>
        </section>

        <section className="quick-access">
          <SectionTitle>Check out more</SectionTitle>
          <div className="widgets">
            <WidgetCard
              to="/timeline"
              title="Report Timeline"
              description="View incidents by time of day"
              className="widget-1"
              img="timeline.jpg"
            />
            <WidgetCard
              to="/search"
              title="Search Reports"
              description="Find specific incidents"
              className="widget-2"
              img="campus2.jpg"
            />
            <WidgetCard
              to="/statistics"
              title="Statistics"
              description="Category breakdown"
              className="widget-3"
              img="campus3.jpg"
            />
            <WidgetCard
              to="/campus-map"
              title="Campus Map"
              description="Incident locations"
              className="widget-4"
              img="campus1.jpg"
            />
          </div>
        </section>

        <section className="report-case-cta">
          <Link to="/report-case" className="report-case-button">
            <div className="report-button-content">
              <h3>Report an Incident</h3>
              <p>Help keep campus safe by reporting suspicious activity or safety concerns</p>
            </div>
          </Link>
        </section>

        <section className="full-directory-cta">
          <Link to="/full-directory" className="full-directory-button">
            <div className="directory-button-content">
              <h3>Browse Full Directory</h3>
              <p>View all crime reports organized by date</p>
            </div>
          </Link>
        </section>

        {otherReports.length > 0 && (
          <section className="other-incidents">
            <SectionTitle>Other Recent Reports</SectionTitle>
            <div className="incidents-list">
              {otherReports.map((report) => (
                <IncidentRow 
                  key={report.incident_case} 
                  report={report}
                  onClick={() => handleCardClick(report)}
                />
              ))}
            </div>
          </section>
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