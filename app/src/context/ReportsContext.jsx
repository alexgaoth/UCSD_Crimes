import React, { createContext, useState, useEffect, useContext } from 'react';

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}police_reports.json`)
      .then((res) => res.json())
      .then((data) => {
        const allIncidents = data.reports.flatMap((r) => r.incidents);
        
        // Normalize dates to MM/DD/YYYY format
        const normalized = allIncidents.map(incident => {
          // If date is in YYYY-MM-DD format, convert to MM/DD/YYYY
          if (incident.date_occurred && incident.date_occurred.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = incident.date_occurred.split('-');
            incident.date_occurred = `${month}/${day}/${year}`;
          }
          if (incident.date_reported && incident.date_reported.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = incident.date_reported.split('-');
            incident.date_reported = `${month}/${day}/${year}`;
          }
          return incident;
        });
        
        const sorted = normalized.sort(
          (a, b) => new Date(b.date_reported) - new Date(a.date_reported)
        );
        setReports(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load reports:', err);
        setLoading(false);
      });
  }, []);

  return (
    <ReportsContext.Provider value={{ reports, loading }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  return useContext(ReportsContext);
}
