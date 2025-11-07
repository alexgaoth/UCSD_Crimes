import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ReportsProvider } from './context/ReportsContext.jsx';
import App from './App.jsx';
import ScrollToTop from './ScrollToTop';

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter basename="/UCSD_Crimes">
        <ScrollToTop />
        <ReportsProvider>
          <App />
        </ReportsProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
