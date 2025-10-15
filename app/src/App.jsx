import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Search from './pages/Search';
import Statistics from './pages/Statistics';
import CampusMap from './pages/CampusMap';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/search" element={<Search />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/campus-map" element={<CampusMap />} />
      </Routes>
    </Router>
  );
}

export default App;