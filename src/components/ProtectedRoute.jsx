import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * Implements role-based access control for dashboard routes.
 * Redirects users to their correct dashboard if they try to access
 * a dashboard that doesn't match their role.
 * 
 * Requirements: 5.3 - Dashboard Access Control
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  const location = useLocation();

  /**
   * Get current user from localStorage
   */
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('isafari_user');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return null;
  };

  /**
   * Get the correct dashboard path based on user role
   */
  const getCorrectDashboard = (userType) => {
    switch (userType) {
      case 'service_provider':
        return '/service-provider-dashboard';
      case 'traveler':
        return '/traveler-dashboard';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  const user = getCurrentUser();

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    console.log('🔒 Access denied - user not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required, just check authentication
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  if (user && !allowedRoles.includes(user.userType)) {
    const correctDashboard = getCorrectDashboard(user.userType);
    console.log(`🔄 Redirecting ${user.userType} from ${location.pathname} to ${correctDashboard}`);
    return <Navigate to={correctDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
