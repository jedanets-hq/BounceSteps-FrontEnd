import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { TripsProvider } from './contexts/TripsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import VersionChecker from './components/VersionChecker';
import HomePage from './pages/homepage';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import OAuthCallback from './pages/auth/OAuthCallback';
import Dashboard from './pages/dashboard';
import TravelerDashboard from './pages/traveler-dashboard';
import ServiceProviderDashboard from './pages/service-provider-dashboard';
import ProviderPartnershipPortal from './pages/provider-partnership-portal';
import AboutPage from './pages/about';
import TestDashboard from './pages/TestDashboard';
import DestinationDiscovery from './pages/DestinationDiscovery';
import ServiceBooking from './pages/ServiceBooking';
import JourneyPlanner from './pages/JourneyPlanner';
import JourneyPlannerEnhanced from './pages/JourneyPlannerEnhanced';
import Profile from './pages/profile';
import AdminPortal from './pages/admin-portal';
import ProviderProfile from './pages/provider-profile';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <TripsProvider>
                  <VersionChecker />
                  <div className="App">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route path="/test-dashboard" element={<TestDashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
                  <Route path="/service-provider-dashboard" element={<ServiceProviderDashboard />} />
                  <Route path="/provider-partnership-portal" element={<ProviderPartnershipPortal />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/destination-discovery" element={<DestinationDiscovery />} />
                  <Route path="/service-booking" element={<ServiceBooking />} />
                  <Route path="/services" element={<ServiceBooking />} />
                  <Route path="/journey-planner" element={<JourneyPlannerEnhanced />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin-portal" element={<AdminPortal />} />
                  <Route path="/provider/:providerId" element={<ProviderProfile />} />
                  {/* Redirect /cart to traveler dashboard with cart tab */}
                  <Route path="/cart" element={<Navigate to="/traveler-dashboard" state={{ tab: 'cart' }} replace />} />
                  </Routes>
                  </div>
                </TripsProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
