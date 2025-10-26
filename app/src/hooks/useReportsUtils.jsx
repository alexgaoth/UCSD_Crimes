import { useMemo } from 'react';

export function useReportsUtils(reports) {
  // Get top 3 reports with longest summaries from last 5 days
  const topRecentReports = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    const today = new Date();
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 5);
    
    const recentReports = reports.filter(report => {
      const reportDate = new Date(report.date_occurred);
      return reportDate >= fiveDaysAgo && reportDate <= today;
    });
    
    return recentReports
      .sort((a, b) => b.summary.length - a.summary.length)
      .slice(0, 15);
  }, [reports]);

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    return [...new Set(reports.map(r => r.category))];
  }, [reports]);

  // Get unique locations
  const uniqueLocations = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    return [...new Set(reports.map(r => r.location))];
  }, [reports]);

  // Parse time string to 24-hour format
  const parseTime = (timeString) => {
    if (!timeString) return null;
    
    const time = timeString.trim();
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (match) {
      let hour = parseInt(match[1]);
      const isPM = match[3].toUpperCase() === 'PM';
      
      if (isPM && hour !== 12) {
        hour += 12;
      } else if (!isPM && hour === 12) {
        hour = 0;
      }
      
      if (hour >= 0 && hour < 24) {
        return hour;
      }
    }
    return null;
  };

  // Get hourly distribution for occurred times
  const occurredDistribution = useMemo(() => {
    const hourlyData = Array(24).fill(0);
    
    if (!reports || reports.length === 0) return hourlyData;
    
    reports.forEach(report => {
      const hour = parseTime(report.time_occurred);
      if (hour !== null) {
        hourlyData[hour]++;
      }
    });
    
    return hourlyData;
  }, [reports]);

  // Get hourly distribution for reported times
  const reportedDistribution = useMemo(() => {
    const hourlyData = Array(24).fill(0);
    
    if (!reports || reports.length === 0) return hourlyData;
    
    reports.forEach(report => {
      // Try time_reported first, fallback to time_occurred
      const timeToUse = report.time_reported || report.time_occurred;
      const hour = parseTime(timeToUse);
      if (hour !== null) {
        hourlyData[hour]++;
      }
    });
    
    return hourlyData;
  }, [reports]);

  return {
    topRecentReports,
    uniqueCategories,
    uniqueLocations,
    parseTime,
    occurredDistribution,
    reportedDistribution
  };
}