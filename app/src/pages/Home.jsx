import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../context/ReportsContext.jsx';
import { useReportsUtils } from '../hooks/useReportsUtils.jsx';
import HomeMasthead from '../components/HomeMasthead.jsx';
import FeaturedCard from '../components/FeaturedCard.jsx';
import IncidentRow from '../components/IncidentRow.jsx';
import WidgetCard from '../components/WidgetCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import WelcomeBanner from '../components/WelcomeBanner.jsx';
import SEO from '../components/SEO.jsx';
import {
  CalendarIcon, SearchIcon, BarChartIcon, MapPinIcon,
  FolderOpenIcon, AlertTriangleIcon,
} from '../components/Icons.jsx';
import '../App.css';

export default function Home() {
  const { reports, upvoteCounts, loading } = useReports();
  const { topRecentReports } = useReportsUtils(reports, upvoteCounts);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedReports = useMemo(() => {
    return [...reports]
      .filter(r => (r.summary || '').trim().length > 10)
      .sort((a, b) => {
        const dateA = new Date(a.date_reported || a.date_occurred);
        const dateB = new Date(b.date_reported || b.date_occurred);
        return dateB - dateA;
      });
  }, [reports]);

  const featuredReports = topRecentReports.length > 0
    ? topRecentReports.slice(0, 3)
    : sortedReports.slice(0, 3);

  // Bottom list: all reports newest-first, no empty descriptions, skip the featured 3
  const featuredCases = new Set(featuredReports.map(r => r.incident_case));
  const otherReports = sortedReports
    .filter(r => !featuredCases.has(r.incident_case))
    .slice(0, 15);

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

      <div className="app">
        <HomeMasthead reports={reports} />

        <main className="main">
          <section className="featured">
            <SectionTitle>Recent Reports</SectionTitle>
            <div className="featured-grid">
              {featuredReports.map((report) => (
                <FeaturedCard
                  key={report.incident_case}
                  report={report}
                  onClick={() => handleCardClick(report)}
                />
              ))}
            </div>
          </section>

          <section className="quick-access">
            <SectionTitle>Explore the Data</SectionTitle>
            <div className="widgets">
              <WidgetCard
                to="/timeline"
                title="Timeline"
                description="Browse incidents chronologically"
                icon={CalendarIcon}
              />
              <WidgetCard
                to="/search"
                title="Search"
                description="Find specific incidents"
                icon={SearchIcon}
              />
              <WidgetCard
                to="/statistics"
                title="Statistics"
                description="Crime breakdowns & trends"
                icon={BarChartIcon}
              />
              <WidgetCard
                to="/campus-map"
                title="Campus Map"
                description="Visualize incident locations"
                icon={MapPinIcon}
              />
            </div>
          </section>

          <section className="home-ctas">
            <Link to="/report-case" className="cta-report">
              <div className="cta-content">
                <span className="cta-icon"><AlertTriangleIcon size={28} /></span>
                <div>
                  <h3>Report an Incident</h3>
                  <p>Saw something? Help keep campus informed.</p>
                </div>
              </div>
              <span className="cta-arrow">→</span>
            </Link>

            <Link to="/full-directory" className="cta-directory">
              <div className="cta-content">
                <span className="cta-icon"><FolderOpenIcon size={28} /></span>
                <div>
                  <h3>Browse Full Directory</h3>
                  <p>All reports organized by date</p>
                </div>
              </div>
              <span className="cta-arrow">→</span>
            </Link>
          </section>

          {otherReports.length > 0 && (
            <section className="other-incidents">
              <SectionTitle>More Recent Reports</SectionTitle>
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
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        report={selectedReport}
      />
    </>
  );
}
