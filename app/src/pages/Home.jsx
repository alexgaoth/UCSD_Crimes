import React, { useState } from 'react';
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
import '../App.css';

export default function Home() {
  const { reports, loading } = useReports();
  const { topRecentReports } = useReportsUtils(reports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuredReports = topRecentReports.length > 0 
    ? topRecentReports.slice(0, 3) 
    : reports.slice(0, 3);
  
  const otherReports = topRecentReports.length > 0 
    ? topRecentReports.slice(3, 15)
    : reports.slice(3, 15);

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