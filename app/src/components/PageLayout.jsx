import React from 'react';

export default function PageLayout({ title, subtitle, children }) {
  return (
    <div className="app">
      <header className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h1 className="page-header-title">{title}</h1>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
          </div>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  );
}
