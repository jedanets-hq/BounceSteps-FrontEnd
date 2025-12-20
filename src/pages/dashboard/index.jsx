import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import TravelerDashboard from '../traveler-dashboard';
import ServiceProviderDashboard from '../service-provider-dashboard';

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on user role
  if (user.userType === 'traveler') {
    return <TravelerDashboard />;
  } else if (user.userType === 'provider') {
    return <ServiceProviderDashboard />;
  }

  // Fallback - shouldn't happen but just in case
  return <Navigate to="/profile" replace />;
};

export default Dashboard;
