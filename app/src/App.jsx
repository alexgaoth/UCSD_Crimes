import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Search from './pages/Search';
import Statistics from './pages/Statistics';
import CampusMap from './pages/CampusMap';
import ReportCase from './pages/ReportCase';
import FullDirectory from './pages/FullDirectory';
import SMSVerification from './pages/SMSVerification';
import SMSWidget from './components/SMSWidget';
import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/search" element={<Search />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/campus-map" element={<CampusMap />} />
        <Route path="/report-case" element={<ReportCase />} />
        <Route path="/full-directory" element={<FullDirectory />} />
        <Route path="/sms-verification" element={<SMSVerification />} />
      </Routes>
      <SMSWidget />
    </>
  );
}

export default App;