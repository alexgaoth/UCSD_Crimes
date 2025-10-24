import React, { useState } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import { useReportsUtils } from '../hooks/useReportsUtils.jsx';
import PageLayout from '../components/PageLayout.jsx';
import FeaturedCard from '../components/FeaturedCard.jsx';
import IncidentRow from '../components/IncidentRow.jsx';
import WidgetCard from '../components/WidgetCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import '../App.css';

export default function Home() {
  const { reports, loading } = useReports();
  const { topRecentReports } = useReportsUtils(reports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use top 3 longest summaries from last 5 days, fallback to most recent
  const featuredReports = topRecentReports.length > 0 
    ? topRecentReports 
    : reports.slice(0, 3);
  
  const otherReports = reports.slice(3, 10);

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
    <PageLayout
      title="Campus Safety Reports"
      subtitle="UCSD Security Incidents & Alerts"
      showBackLink={false}
    >
      <section className="featured">
        <SectionTitle>Most Significant Recent Reports</SectionTitle>
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
        <SectionTitle>Explore More</SectionTitle>
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

      {otherReports.length > 0 && (
        <section className="other-incidents">
          <SectionTitle>Other Recent Incidents</SectionTitle>
          <div className="incidents-list">
            {otherReports.map((report) => (
              <IncidentRow key={report.incident_case} report={report} />
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
  );
}