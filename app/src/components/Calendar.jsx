import React, { useState, useMemo } from 'react';

/**
 * Calendar Component
 * - Displays a month view calendar
 * - Highlights dates with crime reports (green)
 * - Highlights the selected date (blue)
 * - Allows navigation between months
 * - Mobile responsive
 */
export default function Calendar({
  availableDates = [], // Array of date strings (MM/DD/YYYY) that have reports
  selectedDate = null, // Currently selected date string (MM/DD/YYYY)
  onDateSelect = () => {}, // Callback when a date is clicked
  minDate = null, // Minimum date (today's date or earlier)
}) {
  // Start with the current month, or the month of the selected date
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  // Convert available dates to a Set for O(1) lookup
  const availableDateSet = useMemo(() => {
    return new Set(availableDates.map(dateStr => {
      // Normalize to YYYY-MM-DD format for consistent comparison
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }));
  }, [availableDates]);

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month (0 = Sunday, 6 = Saturday)
    const firstDay = new Date(year, month, 1).getDay();

    // Last date of the month
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Last date of previous month
    const prevLastDate = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month's days (greyed out)
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: prevLastDate - i,
        type: 'prev',
        fullDate: new Date(year, month - 1, prevLastDate - i),
      });
    }

    // Current month's days
    for (let date = 1; date <= lastDate; date++) {
      days.push({
        date,
        type: 'current',
        fullDate: new Date(year, month, date),
      });
    }

    // Next month's days (greyed out)
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        type: 'next',
        fullDate: new Date(year, month + 1, date),
      });
    }

    return days;
  }, [currentMonth]);

  // Check if a date has reports
  const hasReports = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return availableDateSet.has(dateStr);
  };

  // Check if a date is selected
  const isSelected = (date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return date.getFullYear() === selected.getFullYear() &&
           date.getMonth() === selected.getMonth() &&
           date.getDate() === selected.getDate();
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // Check if a date is in the future
  const isFuture = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Handle date click
  const handleDateClick = (day) => {
    if (day.type !== 'current') return; // Only allow clicking current month dates
    if (isFuture(day.fullDate)) return; // Don't allow clicking future dates
    if (!hasReports(day.fullDate)) return; // Only allow clicking dates with reports

    // Convert to MM/DD/YYYY format
    const dateStr = `${String(day.fullDate.getMonth() + 1).padStart(2, '0')}/${String(day.fullDate.getDate()).padStart(2, '0')}/${day.fullDate.getFullYear()}`;
    onDateSelect(dateStr);
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Format month/year header
  const monthYearText = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="calendar-widget">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button
          className="calendar-nav-button"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="calendar-month-year">{monthYearText}</h3>
        <button
          className="calendar-nav-button"
          onClick={nextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day of week headers */}
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="calendar-days">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.type === 'current';
          const hasReportsFlag = hasReports(day.fullDate);
          const isSelectedFlag = isSelected(day.fullDate);
          const isTodayFlag = isToday(day.fullDate);
          const isFutureFlag = isFuture(day.fullDate);
          const isClickable = isCurrentMonth && hasReportsFlag && !isFutureFlag;

          return (
            <button
              key={index}
              className={`
                calendar-day
                ${!isCurrentMonth ? 'calendar-day-other-month' : ''}
                ${hasReportsFlag && isCurrentMonth ? 'calendar-day-has-reports' : ''}
                ${isSelectedFlag ? 'calendar-day-selected' : ''}
                ${isTodayFlag && isCurrentMonth ? 'calendar-day-today' : ''}
                ${isFutureFlag ? 'calendar-day-future' : ''}
                ${isClickable ? 'calendar-day-clickable' : ''}
              `.trim()}
              onClick={() => handleDateClick(day)}
              disabled={!isClickable}
              aria-label={`${day.fullDate.toLocaleDateString('en-US')}`}
            >
              <span className="calendar-day-number">{day.date}</span>
              {hasReportsFlag && isCurrentMonth && !isFutureFlag && (
                <span className="calendar-day-indicator"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="calendar-legend-item">
          <span className="calendar-legend-indicator calendar-legend-green"></span>
          <span className="calendar-legend-text">Has reports</span>
        </div>
        <div className="calendar-legend-item">
          <span className="calendar-legend-indicator calendar-legend-blue"></span>
          <span className="calendar-legend-text">Selected</span>
        </div>
      </div>
    </div>
  );
}
