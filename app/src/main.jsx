import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';  
import { ReportsProvider } from './context/ReportsContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <HashRouter>
      <ReportsProvider>
        <App />
      </ReportsProvider>
    </HashRouter>
  </StrictMode>,
);
