import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { MessageProvider } from './contexts/MessageContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { TripsProvider } from './contexts/TripsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import VersionChecker from './components/VersionChecker';
import HomePage from './pages/homepage';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import OAuthCallback from './pages/auth/OAuthCallback';
import GoogleRoleSelection from './pages/auth/GoogleRoleSelection';
import Dashboard from './pages/dashboard';
import TravelerDashboard from './pages/traveler-dashboard';
import ServiceProviderDashboard from './pages/service-provider-dashboard';
// ProviderPartnershipPortal is DEPRECATED - removed to prevent old version from loading
import AboutPage from './pages/about';
import TestDashboard from './pages/TestDashboard';
import DestinationDiscovery from './pages/DestinationDiscovery';
import ServiceBooking from './pages/ServiceBooking';
import JourneyPlannerEnhanced from './pages/JourneyPlannerEnhanced';
import ProviderProfile from './pages/provider-profile';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <MessageProvider>
                <FavoritesProvider>
                  <TripsProvider>
                    <VersionChecker />
                    <div className="App">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route path="/google-role-selection" element={<GoogleRoleSelection />} />
                  <Route path="/test-dashboard" element={<TestDashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
                  <Route path="/service-provider-dashboard" element={<ServiceProviderDashboard />} />
                  {/* OLD PROVIDER PORTAL - DEPRECATED - Redirect to new dashboard */}
                  <Route path="/provider-partnership-portal" element={<Navigate to="/service-provider-dashboard" replace />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/destination-discovery" element={<DestinationDiscovery />} />
                  <Route path="/service-booking" element={<ServiceBooking />} />
                  <Route path="/journey-planner" element={<JourneyPlannerEnhanced />} />
                  <Route path="/provider/:providerId" element={<ProviderProfile />} />
                  </Routes>
                  </div>
                  </TripsProvider>
                </FavoritesProvider>
              </MessageProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
