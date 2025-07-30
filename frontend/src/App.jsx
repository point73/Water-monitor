import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import MapDashboard from './components/MapDashboard';
import About from './components/About';
import PredictTable from './components/PredictTable';
import './App.css';

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

function AppLayout() {
  const location = useLocation();

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="sidebar-logo">PPAP.AI</h1>
        <nav className="sidebar-menu">
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>📍 지도</Link>
          <Link to="/predict" className={`sidebar-link ${location.pathname === '/predict' ? 'active' : ''}`}>📊 예측현황</Link>
          <Link to="/about" className={`sidebar-link ${location.pathname === '/about' ? 'active' : ''}`}>ℹ️ 소개</Link>
        </nav>
      </aside>

      <div className="main-layout">
        <header className="main-header">AI 기반 수질 예측 시스템 플랫폼</header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MapDashboard />} />
            <Route path="/predict" element={<PredictTable />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer className="footer">&copy; 2025 PPAP.AI | 수질오염예측시스템</footer>
      </div>
    </div>
  );
}

export default App;
