import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import PageLayout from '../components/PageLayout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import RankingItem from '../components/RankingItem.jsx';
import InsightCard from '../components/InsightCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import GoogleMapWidget from '../components/GoogleMapWidget.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import './Pages.css';

export default function CampusMap() {
  const { reports, loading } = useReports();
  const [locationData, setLocationData] = useState([]);
  const [filteredLocationData, setFilteredLocationData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (!loading && reports.length > 0) {
      const locationMap = {};
      
      const validReports = reports.filter(report => 
        report.location && 
        report.location.trim().length > 0
      );

      validReports.forEach(report => {
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
      setFilteredLocationData(sorted);
    }
  }, [reports, loading]);

  const handleValidLocationsUpdate = (validLocationNames) => {
    const filtered = locationData.filter(loc => validLocationNames.has(loc.name));
    setFilteredLocationData(filtered);
  };

  const handleLocationClick = (locationName) => {
    setSelectedLocation(selectedLocation === locationName ? null : locationName);
  };

  const maxCount = filteredLocationData.length > 0 ? filteredLocationData[0].count : 1;
  const avgPerLocation = filteredLocationData.length > 0 
    ? (filteredLocationData.reduce((sum, loc) => sum + loc.count, 0) / filteredLocationData.length).toFixed(1)
    : 0;

  if (loading) {
    return <LoadingState message="Loading campus map..." />;
  }

  return (
    <>
      <SEO
        title="Campus Map"
        description="Interactive map showing crime incident locations across UCSD campus. See which areas have the most reported incidents and explore geographic patterns of campus safety data at UC San Diego."
        path="/campus-map"
      />
      <Breadcrumbs items={[{ name: 'Campus Map', path: '/campus-map' }]} />
      <PageLayout
        title="Campus Map"
        subtitle="Incident Locations Overview"
      >
      <section className="map-placeholder">
        <GoogleMapWidget 
          locationData={locationData}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
          onValidLocationsUpdate={handleValidLocationsUpdate}
        />
      </section>

      <section className="location-ranking">
        <SectionTitle>Top Locations by Report Frequency (On Campus)</SectionTitle>
        <div className="ranking-list">
          {filteredLocationData.map((location, idx) => (
            <RankingItem
              key={location.name}
              location={location}
              rank={idx + 1}
              maxCount={maxCount}
              isSelected={selectedLocation === location.name}
              onClick={() => handleLocationClick(location.name)}
            />
          ))}
        </div>
      </section>

      <section className="location-insights">
        <SectionTitle>Key Insights</SectionTitle>
        <div className="insights-grid">
          <InsightCard
            title="Highest Activity"
            mainContent={filteredLocationData[0]?.name || 'N/A'}
            detail={`${filteredLocationData[0]?.count || 0} incidents reported`}
            isNumber={false}
          />
          <InsightCard
            title="Mapped Locations"
            mainContent={filteredLocationData.length}
            detail="Areas successfully mapped"
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
    </>
  );
}