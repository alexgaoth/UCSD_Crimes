import React, { createContext, useState, useEffect, useContext } from 'react';

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://alexgaoth.github.io/UCSD_Crimes/police_reports.json')
      .then((res) => res.json())
      .then((data) => {
        const allIncidents = data.reports.flatMap((r) => r.incidents);
        const sorted = allIncidents.sort(
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
