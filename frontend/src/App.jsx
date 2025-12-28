import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BackgroundWrapper from './BackgroundWrapper';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <BackgroundWrapper>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BackgroundWrapper>
    </Router>
  );
}

export default App;
