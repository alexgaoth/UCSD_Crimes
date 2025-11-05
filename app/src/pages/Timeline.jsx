import React, { useMemo } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import { useReportsUtils } from '../hooks/useReportsUtils.jsx';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import TimelineChart from '../components/TimelineChart.jsx';
import TimelineItem from '../components/TimelineItem.jsx';
import LoadingState from '../components/LoadingState.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import './Pages.css';

export default function Timeline() {
  const { reports, loading } = useReports();
  const { occurredDistribution, reportedDistribution } = useReportsUtils(reports);

  const maxValue = useMemo(() => {
    return Math.max(...occurredDistribution, ...reportedDistribution, 1);
  }, [occurredDistribution, reportedDistribution]);

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
        <SectionTitle>Literally most recent Reports released</SectionTitle>
        <div className="timeline-items">
          {reports.slice(0, 20).map(report => (
            <TimelineItem key={report.incident_case} report={report} />
          ))}
        </div>
      </section>
    </PageLayout>
    </>
  );
}