import { useMemo } from 'react';

export function useReportsUtils(reports) {
  // Get top 3 reports with longest summaries from last 5 days
  const topRecentReports = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recentDefinition = new Date(today);
    recentDefinition.setDate(today.getDate() - 10);
    
    const recentReports = reports.filter(report => {
      try {
        // Validate date_occurred exists and is a string
        if (!report.date_occurred || typeof report.date_occurred !== 'string') {
          return false;
        }
        
        // Parse the date (MM/DD/YYYY format)
        const parts = report.date_occurred.split('/');
        if (parts.length !== 3) {
          return false;
        }
        
        const [month, day, year] = parts.map(Number);
        
        // Validate that all parts are valid numbers
        if (isNaN(month) || isNaN(day) || isNaN(year)) {
          return false;
        }
        
        // Validate ranges
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) {
          return false;
        }
        
        // Create date object (month is 0-indexed in JS)
        const reportDate = new Date(year, month - 1, day);
        reportDate.setHours(0, 0, 0, 0);
        
        // Check if date is valid (catches invalid dates like 2/30)
        if (isNaN(reportDate.getTime())) {
          return false;
        }
        
        // Check if date is within the last 5 days
        return reportDate >= recentDefinition && reportDate <= today;
      } catch (error) {
        console.warn('Error parsing date for report:', report.incident_case, error);
        return false;
      }
    });
    
    return recentReports
      .sort((a, b) => b.summary.length - a.summary.length)
      .slice(0, 15);
  }, [reports]);

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