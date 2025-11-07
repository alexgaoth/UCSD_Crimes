import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useReports } from '../context/ReportsContext.jsx';
import PageLayout from '../components/PageLayout.jsx';
import DirectoryCard from '../components/DirectoryCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Calendar from '../components/Calendar.jsx';
import './Pages.css';

/**
 * FullDirectory page - Browse all crime reports organized by date
 * Features:
 * - Interactive calendar with date selection
 * - Filter out future dates
 * - Checkbox to hide dates with empty summaries
 * - Smart default date selection (nearest date to today with reports)
 * - Smooth scrolling to selected dates
 */
export default function FullDirectory() {
  const { reports, loading } = useReports();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hideEmptySummaries, setHideEmptySummaries] = useState(false);

  // Refs for scrolling to date sections
  const dateRefs = useRef({});

  // Get today's date (normalized to midnight)
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Filter out future dates and group reports by date_occurred
  const groupedReports = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    // Create a map of date -> reports
    const dateMap = new Map();

    reports.forEach(report => {
      const date = report.date_occurred;
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      // FILTER OUT FUTURE DATES
      if (dateObj > today) return;

      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date).push(report);
    });

    // Convert to array and sort by date (newest first)
    const sortedGroups = Array.from(dateMap.entries())
      .map(([date, reportsForDate]) => ({
        date,
        dateObj: new Date(date),
        reports: reportsForDate
      }))
      .sort((a, b) => b.dateObj - a.dateObj);

    return sortedGroups;
  }, [reports, today]);

  // Get reports for the selected date only
  const selectedDateReports = useMemo(() => {
    if (!selectedDate) return [];

    // Find the date group for the selected date
    const dateGroup = groupedReports.find(({ date }) => date === selectedDate);
    if (!dateGroup) return [];

    // Sort reports within the selected date by most recent first (date + time for accurate sorting)
    const sortedReports = [...dateGroup.reports].sort((a, b) => {
      // Create datetime by combining date and time for accurate sorting
      const dateStrA = a.date_reported || a.date_occurred;
      const timeStrA = a.time_occurred || '00:00';
      const dateTimeA = new Date(`${dateStrA} ${timeStrA}`);

      const dateStrB = b.date_reported || b.date_occurred;
      const timeStrB = b.time_occurred || '00:00';
      const dateTimeB = new Date(`${dateStrB} ${timeStrB}`);

      return dateTimeB - dateTimeA; // Most recent first
    });

    // Apply empty summary filter if enabled
    if (hideEmptySummaries) {
      return sortedReports.filter(report => {
        const summary = report.incident_summary || '';
        return summary.trim().length > 10;
      });
    }

    return sortedReports;
  }, [groupedReports, selectedDate, hideEmptySummaries]);

  // Get array of available dates for calendar (dates that have at least one valid report)
  const availableDates = useMemo(() => {
    if (!hideEmptySummaries) {
      return groupedReports.map(({ date }) => date);
    }

    // When filter is active, only show dates that have at least one report with a meaningful summary
    return groupedReports
      .filter(({ reports: dateReports }) => {
        return dateReports.some(report => {
          const summary = report.incident_summary || '';
          return summary.trim().length > 10;
        });
      })
      .map(({ date }) => date);
  }, [groupedReports, hideEmptySummaries]);

  // Smart default date selection - find nearest date to today with reports
  useEffect(() => {
    if (!selectedDate && groupedReports.length > 0 && availableDates.length > 0) {
      // Find the date closest to today from available dates
      let nearestDate = null;
      let minDiff = Infinity;

      groupedReports.forEach(({ date, dateObj }) => {
        // Only consider dates that are in availableDates (i.e., pass the filter)
        if (availableDates.includes(date)) {
          const diff = Math.abs(today - dateObj);
          if (diff < minDiff) {
            minDiff = diff;
            nearestDate = date;
          }
        }
      });

      if (nearestDate) {
        setSelectedDate(nearestDate);
      }
    }
  }, [groupedReports, availableDates, selectedDate, today]);

  // Format date nicely (e.g., "Monday, November 5, 2025")
  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Handle clicking on an incident card
  const handleCardClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    scrollToDate(date);
  };

  // Scroll to a specific date section
  const scrollToDate = (date) => {
    const element = dateRefs.current[date];
    if (element) {
      const yOffset = -20; // Offset from top
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (e) => {
    setHideEmptySummaries(e.target.checked);
    // Keep the current selected date - let the UI show filtered results or "no reports" message
    // Don't reset to null as that would cause no reports to show until a new date is selected
  };

  if (loading) {
    return <LoadingState message="Loading crime reports..." />;
  }

  // Check if we have any reports for the selected date
  const hasReports = selectedDateReports.length > 0;
  const hasSelectedDate = selectedDate !== null;

  return (
    <>
      <SEO
        title="Full Directory"
        description="Browse the complete archive of UCSD campus crime reports organized by date. View all incidents, search by location, category, and date to stay informed about campus safety."
        path="/full-directory"
      />

      <PageLayout
        title="Full Directory"
        subtitle="Complete Crime Report Archive"
        showBackLink={true}
      >
        <Breadcrumbs items={[{ name: 'Full Directory', path: '/full-directory' }]} />

        {!hasReports && groupedReports.length === 0 ? (
          <div className="no-reports">
            <p>No reports available at this time.</p>
          </div>
        ) : (
          <>
            {/* Calendar and Filter Controls */}
            <div className="directory-controls">
              {/* Calendar Widget */}
              <div className="directory-calendar-container">
                <Calendar
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>

              {/* Filter Checkbox */}
              <div className="directory-filters">
                <label className="directory-filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={hideEmptySummaries}
                    onChange={handleCheckboxToggle}
                    className="directory-filter-checkbox"
                  />
                  <span>Hide dates with no detailed summaries</span>
                </label>
              </div>

              {/* Summary Stats */}
              <div className="directory-summary">
                <p className="directory-total-count">
                  {hasSelectedDate ? (
                    hasReports ? (
                      <>
                        Showing <strong>{selectedDateReports.length}</strong> incident{selectedDateReports.length !== 1 ? 's' : ''} for <strong>{formatDate(selectedDate)}</strong>
                        {hideEmptySummaries && <span className="filter-active-note"> (filtered to show only detailed summaries)</span>}
                      </>
                    ) : (
                      <>
                        No reports for <strong>{formatDate(selectedDate)}</strong>
                        {hideEmptySummaries && <span> matching your filter criteria. Try unchecking the filter above.</span>}
                      </>
                    )
                  ) : (
                    'Select a date from the calendar to view reports'
                  )}
                </p>
              </div>
            </div>

            {/* Selected Date Reports */}
            {hasSelectedDate ? (
              hasReports ? (
                <div className="directory-content">
                  <section
                    className="date-group date-group-selected"
                    id={`date-${selectedDate.replace(/\//g, '-')}`}
                  >
                    <div className="date-group-header">
                      <h2 className="date-heading">
                        {formatDate(selectedDate)}
                        <span className="date-selected-indicator"> ✓</span>
                      </h2>
                      <span className="incident-count">
                        {selectedDateReports.length} {selectedDateReports.length === 1 ? 'incident' : 'incidents'}
                      </span>
                    </div>

                    <div className="date-group-cards">
                      {selectedDateReports.map((report) => (
                        <DirectoryCard
                          key={report.incident_case}
                          report={report}
                          onClick={() => handleCardClick(report)}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="no-reports">
                  <p>
                    No reports for {formatDate(selectedDate)}
                    {hideEmptySummaries && ' matching your filter criteria. Try unchecking the filter above.'}
                  </p>
                </div>
              )
            ) : (
              <div className="no-reports">
                <p>Select a date from the calendar above to view reports.</p>
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          report={selectedReport}
        />
      </PageLayout>
    </>
  );
}
