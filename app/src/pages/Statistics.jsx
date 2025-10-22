import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import StatCard from '../components/StatCard.jsx';
import StatBar from '../components/StatBar.jsx';
import LoadingState from '../components/LoadingState.jsx';
import './Pages.css';



export default function Statistics() {

  const { reports, loading } = useReports();
  const [stats, setStats] = useState({
    byCategory: [],
    byDisposition: [],
    total: 0,
    totalCategories: 0,
    totalDispositions: 0
  });

  useEffect(() => {
    if (!loading && reports.length > 0) {
      const categoryCount = {};
      const dispositionCount = {};

      reports.forEach(report => {
        categoryCount[report.category] = (categoryCount[report.category] || 0) + 1;
        dispositionCount[report.disposition] = (dispositionCount[report.disposition] || 0) + 1;
      });

      const byCategory = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .filter(item => item.count > 20);
      
      const byDisposition = Object.entries(dispositionCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .filter(item => item.count > 20);

      setStats({
        byCategory,
        byDisposition,
        total: reports.length,
        totalCategories: byCategory.length,
        totalDispositions: byDisposition.length
      });
    }
  }, [reports, loading]);

  const maxCategory = Math.max(...stats.byCategory.map(s => s.count), 1);
  const maxDisposition = Math.max(...stats.byDisposition.map(s => s.count), 1);

  if (loading) {
    return <LoadingState message="Loading statistics..." />;
  }

  return (
    <PageLayout
      title="Statistics"
      subtitle="Crime Report Analytics"
    >
      <section className="stats-overview">
        <StatCard number={stats.total} label="Total Reports" />
        <StatCard number={stats.totalCategories} label="Categories" />
        <StatCard number={stats.totalDispositions} label="Dispositions" />
      </section>

      <section className="stats-section">
        <SectionTitle>Reports by Category</SectionTitle>
        {stats.byCategory.length === 0 ? (
          <div className="no-results">
            <p>No category data available</p>
          </div>
        ) : (
          <div className="stat-bars">
            {stats.byCategory.map(item => (
              <StatBar
                key={item.name}
                name={item.name}
                count={item.count}
                maxValue={maxCategory}
                fillClass="category-fill"
              />
            ))}
          </div>
        )}
      </section>

      <section className="stats-section">
        <SectionTitle>Reports by Disposition</SectionTitle>
        {stats.byDisposition.length === 0 ? (
          <div className="no-results">
            <p>No disposition data available</p>
          </div>
        ) : (
          <div className="stat-bars">
            {stats.byDisposition.map(item => {
              // Normalize disposition name for CSS class
              const normalizedName = item.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[()]/g, '');
              
              return (
                <StatBar
                  key={item.name}
                  name={item.name}
                  count={item.count}
                  maxValue={maxDisposition}
                  fillClass={`disposition-fill-${normalizedName}`}
                />
              );
            })}
          </div>
        )}
      </section>
    </PageLayout>
  );
}