import React, { useMemo } from 'react';

export default function HomeMasthead({ reports }) {
  const stats = useMemo(() => {
    if (!reports || reports.length === 0) return { total: 0, last30: 0, topCat: '—', openCases: 0 };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30 = reports.filter(r => {
      const d = new Date(r.date_occurred || r.date_reported);
      return d >= thirtyDaysAgo;
    }).length;

    const catCount = {};
    reports.forEach(r => {
      if (r.category) catCount[r.category] = (catCount[r.category] || 0) + 1;
    });
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    const openCases = reports.filter(r =>
      r.disposition && r.disposition.toLowerCase().includes('open')
    ).length;

    return { total: reports.length, last30, topCat, openCases };
  }, [reports]);

  const isActive = stats.last30 > 0;

  return (
    <header className="home-masthead">
      <div className="home-masthead-inner">
        <div className="home-masthead-left">
          <p className="home-masthead-eyebrow">
            <span className={`status-dot ${isActive ? 'status-dot-active' : ''}`}></span>
            UC SAN DIEGO · OFFICIAL POLICE REPORTS
          </p>
          <h1 className="home-masthead-title">
            UCSD<br />
            <span className="home-masthead-title-accent">CRIME LOG</span>
          </h1>
          <p className="home-masthead-sub">
            Real crime reports from the UCSD Police Department — publicly available, community-organized.
            Click any report for full details, share, or upvote to raise awareness.
          </p>
        </div>
        <div className="home-masthead-credit">
          <p>made by a ucsd student</p>
          <a href="https://alexgaoth.com" target="_blank" rel="noopener noreferrer">
            alexgaoth.com →
          </a>
        </div>
      </div>

      <div className="stats-strip">
        <div className="stats-strip-inner">
          <div className="stats-strip-item">
            <span className="stats-strip-number">{stats.total.toLocaleString()}</span>
            <span className="stats-strip-label">Total Reports</span>
          </div>
          <div className="stats-strip-divider"></div>
          <div className="stats-strip-item">
            <span className="stats-strip-number">{stats.last30}</span>
            <span className="stats-strip-label">Last 30 Days</span>
          </div>
          <div className="stats-strip-divider"></div>
          <div className="stats-strip-item stats-strip-item-wide">
            <span className="stats-strip-number stats-strip-number-sm">{stats.topCat}</span>
            <span className="stats-strip-label">Top Crime Type</span>
          </div>
          <div className="stats-strip-divider"></div>
          <div className="stats-strip-item">
            <span className="stats-strip-number">{stats.openCases}</span>
            <span className="stats-strip-label">Open Cases</span>
          </div>
        </div>
      </div>
    </header>
  );
}
