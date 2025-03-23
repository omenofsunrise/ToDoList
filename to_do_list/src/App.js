import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import UsersPage from './pages/UsersPage';
import GoalsPage from './pages/GoalsPage';
import StakesPage from './pages/StakesPage';
import Header from './components/Header';

const App = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/' && <Header />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/stakes" element={<StakesPage />} />
      </Routes>
    </>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;