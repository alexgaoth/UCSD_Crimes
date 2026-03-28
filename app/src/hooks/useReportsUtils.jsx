import { useMemo } from 'react';

export function useReportsUtils(reports, upvoteCounts = {}) {
  // Get top reports from last 10 days with descriptions, sorted by upvote count
  const topRecentReports = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recentDefinition = new Date(today);
    recentDefinition.setDate(today.getDate() - 10);

    const recentReports = reports.filter(report => {
      // Filter out empty/missing descriptions
      const summary = report.summary || '';
      if (summary.trim().length <= 10) return false;

      try {
        if (!report.date_occurred || typeof report.date_occurred !== 'string') return false;

        const parts = report.date_occurred.split('/');
        if (parts.length !== 3) return false;

        const [month, day, year] = parts.map(Number);
        if (isNaN(month) || isNaN(day) || isNaN(year)) return false;
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) return false;

        const reportDate = new Date(year, month - 1, day);
        reportDate.setHours(0, 0, 0, 0);
        if (isNaN(reportDate.getTime())) return false;

        return reportDate >= recentDefinition && reportDate <= today;
      } catch (error) {
        console.warn('Error parsing date for report:', report.incident_case, error);
        return false;
      }
    });

    return recentReports
      .sort((a, b) => {
        const aVotes = upvoteCounts[a.incident_case] || 0;
        const bVotes = upvoteCounts[b.incident_case] || 0;
        return bVotes - aVotes;
      })
      .slice(0, 15);
  }, [reports, upvoteCounts]);

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    return [...new Set(reports.map(r => r.location).filter(loc => /[a-zA-Z]/.test(loc)))];
  }, [reports]);

  // Get unique locations
  const uniqueLocations = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    return [...new Set(reports.map(r => r.location).filter(loc => /[a-zA-Z]/.test(loc)))];
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