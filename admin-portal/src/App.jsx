import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Travelers from './pages/Travelers';
import Providers from './pages/Providers';
import Verification from './pages/Verification';
import Badges from './pages/Badges';
import Payments from './pages/Payments';
import Financial from './pages/Financial';
import Settings from './pages/Settings';
import Services from './pages/Services';
import StoryManagement from './pages/StoryManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="travelers" element={<Travelers />} />
        <Route path="providers" element={<Providers />} />
        <Route path="services" element={<Services />} />
        <Route path="stories" element={<StoryManagement />} />
        <Route path="verification" element={<Verification />} />
        <Route path="badges" element={<Badges />} />
        <Route path="payments" element={<Payments />} />
        <Route path="financial" element={<Financial />} />
        <Route path="reports" element={<Payments />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
