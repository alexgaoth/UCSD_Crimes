import React, { useState, useMemo } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import { useReportsUtils } from '../hooks/useReportsUtils.jsx';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import TimelineChart from '../components/TimelineChart.jsx';
import TimelineItem from '../components/TimelineItem.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import './Pages.css';

export default function Timeline() {
  const { reports, loading } = useReports();
  const { occurredDistribution, reportedDistribution } = useReportsUtils(reports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const maxValue = useMemo(() => {
    return Math.max(...occurredDistribution, ...reportedDistribution, 1);
  }, [occurredDistribution, reportedDistribution]);

  // Sort reports by most recent first (date_reported)
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const dateA = new Date(a.date_reported || a.date_occurred);
      const dateB = new Date(b.date_reported || b.date_occurred);
      return dateB - dateA; // Most recent first
    });
  }, [reports]);

  const handleCardClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  };

  if (loading) {
    return <LoadingState message="Loading timeline..." />;
  }

  return (
    <>
      <SEO
        title="Report Timeline"
        description="Visualize when campus incidents occur throughout the day at UCSD. Interactive charts show temporal patterns of crime reports, helping you understand peak times for different types of incidents on campus."
        path="/timeline"
      />
      <Breadcrumbs items={[{ name: 'Timeline', path: '/timeline' }]} />
      <PageLayout
        title="Report Timeline"
        subtitle="Incidents by Time of Day"
      >
      <section className="chart-section">
        <SectionTitle>When Incidents Occurred</SectionTitle>
        <TimelineChart 
          data={occurredDistribution} 
          maxValue={maxValue} 
          type="occurred"
        />
      </section>

      <section className="timeline-list">
        <SectionTitle>Most Recent Reports</SectionTitle>
        <div className="timeline-items">
          {sortedReports.slice(0, 20).map(report => (
            <TimelineItem
              key={report.incident_case}
              report={report}
              onClick={() => handleCardClick(report)}
            />
          ))}
        </div>
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