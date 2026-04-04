import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";
import TravelerDashboard from './pages/traveler-dashboard';
// ProviderPartnershipPortal is deprecated - using Dashboard instead
import Homepage from './pages/homepage';
import JourneyPlanner from './pages/JourneyPlannerEnhanced';
import DestinationDiscovery from './pages/destination-discovery';
import ServiceBooking from './pages/service-booking';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import ForgotPassword from './pages/auth/forgot-password';
import GoogleRoleSelection from './pages/auth/GoogleRoleSelection';
import OAuthCallback from './pages/auth/OAuthCallback';
import Profile from './pages/profile';
import About from './pages/about';
import Dashboard from './pages/dashboard';
import ProviderProfile from './pages/provider-profile';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/journey-planner" element={<JourneyPlanner />} />
        <Route path="/destination-discovery" element={<DestinationDiscovery />} />
        <Route path="/service-booking" element={<ServiceBooking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/google-role-selection" element={<GoogleRoleSelection />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/about" element={<About />} />
        <Route path="/provider/:providerId" element={<ProviderProfile />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/profile" element={
          <ProtectedRoute requireAuth={true}>
            <Profile />
          </ProtectedRoute>
        } />
        {/* Cart redirect - redirect to dashboard cart tab */}
        <Route path="/cart" element={<Navigate to="/traveler-dashboard?tab=cart" replace />} />
        
        {/* Role-specific dashboard routes */}
        <Route path="/traveler-dashboard" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['traveler']}>
            <TravelerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/service-provider-dashboard" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['service_provider']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['service_provider']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        {/* OLD PROVIDER PORTAL - DEPRECATED - Redirect to new dashboard */}
        <Route path="/provider-partnership-portal" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['service_provider']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
