import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import TravelerDashboard from './pages/traveler-dashboard';
import ProviderPartnershipPortal from './pages/provider-partnership-portal';
import ServicesOverview from './pages/services-overview';
import Homepage from './pages/homepage';
import JourneyPlanner from './pages/JourneyPlannerEnhanced';
import DestinationDiscovery from './pages/destination-discovery';
import ServiceBooking from './pages/service-booking';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import ForgotPassword from './pages/auth/forgot-password';
import Profile from './pages/profile';
import About from './pages/about';
import Dashboard from './pages/dashboard';
import CartPage from './pages/cart';
import ProviderProfile from './pages/provider-profile';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Homepage />} />
        <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
        <Route path="/provider-partnership-portal" element={<ProviderPartnershipPortal />} />
        <Route path="/service-provider-dashboard" element={<Dashboard />} />
        <Route path="/services-overview" element={<ServicesOverview />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/journey-planner" element={<JourneyPlanner />} />
        <Route path="/destination-discovery" element={<DestinationDiscovery />} />
        <Route path="/service-booking" element={<ServiceBooking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/provider/:providerId" element={<ProviderProfile />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
