import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import RankingItem from '../components/RankingItem.jsx';
import InsightCard from '../components/InsightCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import './Pages.css';

export default function CampusMap() {
  const { reports, loading } = useReports();
  const [locationData, setLocationData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (!loading && reports.length > 0) {
      const locationMap = {};
      
      reports.forEach(report => {
        if (!locationMap[report.location]) {
          locationMap[report.location] = {
            name: report.location,
            count: 0,
            reports: []
          };
        }
        locationMap[report.location].count++;
        locationMap[report.location].reports.push(report);
      });

      const sorted = Object.values(locationMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
      
      setLocationData(sorted);
    }
  }, [reports, loading]);

  const maxCount = locationData.length > 0 ? locationData[0].count : 1;
  const avgPerLocation = locationData.length > 0 
    ? (locationData.reduce((sum, loc) => sum + loc.count, 0) / locationData.length).toFixed(1)
    : 0;

  if (loading) {
    return <LoadingState message="Loading campus map..." />;
  }

  return (
    <PageLayout
      title="Campus Map"
      subtitle="Incident Locations Overview"
    >
      <section className="map-placeholder">
        <div className="map-visual">
          <span className="map-text">Campus Map Visualization</span>
        </div>
      </section>

      <section className="location-ranking">
        <SectionTitle>Top 20 Locations by Report Frequency</SectionTitle>
        <div className="ranking-list">
          {locationData.map((location, idx) => (
            <RankingItem
              key={location.name}
              location={location}
              rank={idx + 1}
              maxCount={maxCount}
              isSelected={selectedLocation === location.name}
              onClick={() => setSelectedLocation(
                selectedLocation === location.name ? null : location.name
              )}
            />
          ))}
        </div>
      </section>

      <section className="location-insights">
        <SectionTitle>Key Insights</SectionTitle>
        <div className="insights-grid">
          <InsightCard
            title="Highest Activity"
            mainContent={locationData[0]?.name || 'N/A'}
            detail={`${locationData[0]?.count || 0} incidents reported`}
            isNumber={false}
          />
          <InsightCard
            title="Top 20 Locations"
            mainContent={locationData.length}
            detail="Areas with most incidents"
            isNumber={true}
          />
          <InsightCard
            title="Average per Location"
            mainContent={avgPerLocation}
            detail="Reports per location"
            isNumber={true}
          />
        </div>
      </section>
    </PageLayout>
  );
}