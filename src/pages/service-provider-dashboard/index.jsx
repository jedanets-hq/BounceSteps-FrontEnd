 import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ServiceManagement from './components/ServiceManagement';
import BookingManagement from './components/BookingManagement';
import BusinessAnalytics from './components/BusinessAnalytics';
import BusinessProfile from './components/BusinessProfile';
import ServicePromotion from './components/ServicePromotion';
import ProviderHomeServices from './components/ProviderHomeServices';
import ProviderMessagesTab 
from './components/ProviderMessagesTab';
import MobileDashboardSlider from '../../components/MobileDashboardSlider';
import { API_URL } from '../../utils/api';

const ServiceProviderDashboard = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingServiceId, setEditingServiceId] = useState(null); // NEW: Track service to edit
  const [myServices, setMyServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myFollowers, setMyFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [stats, setStats] = useState({ totalServices: 0, activeBookings: 0, monthlyEarnings: 0, customerRating: 0, followersCount: 0 });
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const { user, logout, isLoading} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Service Provider Dashboard - activeTab:', activeTab);
  console.log('Service Provider Dashboard - user:', user);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;
    
    // If user exists in context, we're good
    if (user && user.userType === 'service_provider') return;
    
    // Check localStorage directly as fallback (handles race conditions after OAuth)
    try {
      const savedUser = localStorage.getItem('isafari_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData && userData.token && userData.userType === 'service_provider') {
          // User exists in localStorage but not in context yet - wait for context to update
          console.log('⏳ [ProviderDashboard] User in localStorage, waiting for context...');
          // Give AuthContext more time to sync
          return;
        }
        // User exists but wrong role - redirect to correct dashboard
        if (userData && userData.token && userData.userType === 'traveler') {
          console.log('🔄 [ProviderDashboard] User is traveler, redirecting...');
          navigate('/traveler-dashboard');
          return;
        }
      }
    } catch (e) {
      console.error('Error checking localStorage:', e);
    }
    
    // Add a small delay before redirecting to login to handle OAuth race conditions
    const redirectTimer = setTimeout(() => {
      // Double-check localStorage one more time
      try {
        const savedUser = localStorage.getItem('isafari_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData && userData.token && userData.userType === 'service_provider') {
            console.log('✅ [ProviderDashboard] User found on delayed check, staying on page');
            // Force a re-render by updating state
            window.location.reload();
            return;
          }
        }
      } catch (e) {
        console.error('Error on delayed localStorage check:', e);
      }
      
      // No user anywhere - redirect to login
      console.log('🔒 [ProviderDashboard] No user found, redirecting to login');
      navigate('/login');
    }, 500);
    
    return () => clearTimeout(redirectTimer);
  }, [user, isLoading, navigate]);

  // We are using horizontal scroll instead of mobile menu now, so no need for click outside listener


  // Fetch real services and bookings
  useEffect(() => {
    console.log('🔍 [Provider Dashboard] useEffect triggered, user:', user);
    if (user?.id) {
      console.log('✅ [Provider Dashboard] User has ID, fetching data...');
      fetchMyServices();
      fetchMyBookings();
      fetchMyFollowers();
    } else {
      console.log('⚠️ [Provider Dashboard] No user ID found');
    }
  }, [user]);

  // Fetch followers from API
  const fetchMyFollowers = async () => {
    try {
      setLoadingFollowers(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) return;

      const response = await fetch(`${API_URL}/providers/my-followers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.followers) {
        setMyFollowers(data.followers);
        setStats(prev => ({ ...prev, followersCount: data.followers.length }));
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Redirect to main home when home tab is selected
  useEffect(() => {
    if (activeTab === 'home') {
      navigate('/');
    }
  }, [activeTab, navigate]);

  // Read URL parameters for tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const fetchMyServices = async () => {
    try {
      setLoadingServices(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        console.error('❌ No token found for fetching services');
        setMyServices([]);
        return;
      }

      console.log('📋 Fetching services for provider...');
      
      // Add cache-busting timestamp
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/services/provider/my-services?_t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Invalid response content type');
        setMyServices([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('❌ Empty response from server');
        setMyServices([]);
        return;
      }

      const data = JSON.parse(text);
      console.log('📦 Services response:', data);
      
      if (data.success && data.services) {
        console.log(`✅ Loaded ${data.services.length} services`);
        setMyServices(data.services);
        
        // Calculate real stats
        const totalServices = data.services.length;
        const activeServices = data.services.filter(s => s.is_active).length;
        const totalBookings = data.services.reduce((sum, s) => sum + (s.total_bookings || 0), 0);
        const avgRating = data.services.reduce((sum, s) => sum + parseFloat(s.average_rating || 0), 0) / (totalServices || 1);
        
        setStats(prev => ({
          ...prev,
          totalServices: activeServices,
          activeBookings: totalBookings,
          customerRating: avgRating.toFixed(1)
        }));
      } else {
        console.warn('⚠️ No services found or error:', data.message);
        setMyServices([]);
      }
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      setMyServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        console.error('❌ No token found for fetching bookings');
        return;
      }

      console.log('📋 Fetching bookings for provider...');
      const response = await fetch(`${API_URL}/bookings/provider`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Invalid response content type for bookings');
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('❌ Empty response from bookings server');
        return;
      }

      const data = JSON.parse(text);
      console.log('📦 Bookings response:', data);
      
      if (data.success && data.bookings) {
        console.log(`✅ Loaded ${data.bookings.length} bookings`);
        setMyBookings(data.bookings);
      } else {
        console.warn('⚠️ No bookings found or error:', data.message);
        setMyBookings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      setMyBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      console.log('📝 Updating booking status:', { bookingId, newStatus });
      
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        console.error('❌ No token found');
        alert('Authentication required. Please login again.');
        return false;
      }

      console.log('🔄 Sending request to:', `${API_URL}/bookings/${bookingId}/status`);
      
      const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        const statusText = newStatus === 'confirmed' ? 'approved' : newStatus === 'cancelled' ? 'rejected' : newStatus;
        alert(`✅ Pre-order ${statusText} successfully!`);
        await fetchMyBookings(); // Refresh bookings list
        return true;
      } else {
        console.error('❌ API returned error:', data.message);
        alert('Error: ' + (data.message || 'Unknown error'));
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      alert(`Error updating booking status: ${error.message}\n\nPlease try again or contact support.`);
      return false;
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Authentication required');
        return false;
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Pre-order deleted successfully!');
        fetchMyBookings(); // Refresh bookings list
        return true;
      } else {
        alert('Error: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking. Please try again.');
      return false;
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Check localStorage directly as fallback (handles race conditions after OAuth)
  if (!user) {
    // Try to get user from localStorage directly
    try {
      const savedUser = localStorage.getItem('isafari_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData && userData.token && userData.userType === 'service_provider') {
          // User exists in localStorage but not in context yet - show loading
          return (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Initializing your dashboard...</p>
              </div>
            </div>
          );
        }
      }
    } catch (e) {
      console.error('Error checking localStorage:', e);
    }
    
    // No user at all - redirect to login
    return null;
  }

  // CLEAN TABS - Single level navigation, no duplicates - REMOVED Traveler Stories and Get Verified
  const tabs = [
    { id: 'home', name: 'Home', icon: 'Home' },
    { id: 'overview', name: 'Overview', icon: 'LayoutDashboard' },
    { id: 'services', name: 'My Services', icon: 'Package' },
    { id: 'bookings', name: 'Bookings', icon: 'Calendar' },
    { id: 'followers', name: 'Followers', icon: 'Users' },
    { id: 'messages', name: 'Messages', icon: 'MessageCircle' },
    { id: 'profile', name: 'My Profile', icon: 'User' },
    { id: 'promotion', name: 'Promote Services', icon: 'TrendingUp' },
    { id: 'analytics', name: 'Analytics', icon: 'BarChart' },
    { id: 'about', name: 'About BounceSteps', icon: 'Info' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <ProviderHomeServices onTabChange={setActiveTab} onEditService={(serviceId) => {
          setEditingServiceId(serviceId);
          setActiveTab('services');
        }} />;
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-display text-2xl font-medium">Welcome, {user?.firstName || 'Service Provider'}!</h2>
                    {/* Display provider badge if available */}
                    {user?.badgeType && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30">
                        {user.badgeType === 'verified' && '✓ Verified'}
                        {user.badgeType === 'premium' && '⭐ Premium'}
                        {user.badgeType === 'top_rated' && '🏆 Top Rated'}
                        {user.badgeType === 'eco_friendly' && '🌿 Eco Friendly'}
                        {user.badgeType === 'local_expert' && '📍 Local Expert'}
                      </span>
                    )}
                  </div>
                  <p className="text-white/90">Manage your services and grow your business with BounceSteps</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Package" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalServices}</p>
                    <p className="text-sm text-muted-foreground">Active Services</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Calendar" size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.activeBookings}</p>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="Package" size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{myServices.length}</p>
                    <p className="text-sm text-muted-foreground">Total Services</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="Star" size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.customerRating || '0.0'}</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Services */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-medium">Your Services</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loadingServices ? (
                  <div className="col-span-2 flex items-center justify-center py-12">
                    <Icon name="Loader2" size={32} className="animate-spin text-primary" />
                  </div>
                ) : myServices.length > 0 ? (
                  myServices.map(service => (
                    <div key={service.id} className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-foreground">{service.title}</h4>
                          <p className="text-sm text-muted-foreground">{service.category || 'Uncategorized'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          service.is_active 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {service.is_active ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-foreground">TZS {parseFloat(service.price || 0).toLocaleString()}</span>
                          <div className="flex items-center space-x-1">
                            <Icon name="Star" size={14} className="text-yellow-500" />
                            <span className="text-sm text-muted-foreground">{parseFloat(service.average_rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{service.total_bookings || 0} bookings</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't added any services yet</p>
                    <Button onClick={() => setActiveTab('services')}>
                      <Icon name="Plus" size={16} />
                      Add Your First Service
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'services':
        return <ServiceManagement editingServiceId={editingServiceId} onEditComplete={() => setEditingServiceId(null)} />;

      case 'bookings':
        return <BookingManagement bookings={myBookings} onUpdateBookingStatus={updateBookingStatus} onDeleteBooking={deleteBooking} loading={loadingBookings} />;

      case 'followers':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">My Followers</h2>
              <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-lg">
                <Icon name="Users" size={20} className="text-primary" />
                <span className="text-lg font-bold text-primary">{myFollowers.length}</span>
                <span className="text-muted-foreground">followers</span>
              </div>
            </div>
            
            {loadingFollowers ? (
              <div className="flex justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
              </div>
            ) : myFollowers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFollowers.map((follower, index) => (
                  <div key={follower.id || index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                        {follower.avatar_url ? (
                          <img src={follower.avatar_url} alt={follower.first_name} className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                          <Icon name="User" size={28} className="text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {follower.first_name} {follower.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{follower.email}</p>
                        {follower.followed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Following since {new Date(follower.followed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No followers yet</p>
                <p className="text-sm text-muted-foreground">When travelers follow you, they will appear here</p>
              </div>
            )}
          </div>
        );

      case 'analytics':
        return <BusinessAnalytics />;

      case 'promotion':
        return <ServicePromotion />;

      case 'messages':
        return <ProviderMessagesTab />;

      case 'profile':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl sm:text-2xl font-medium">My Profile & Settings</h2>
            </div>
            
            {/* Business Profile Component with Integrated Account Actions */}
            <BusinessProfile />
          </div>
        );

      case 'about':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-xl p-8 text-center">
              <h1 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-4">
                About iSafari Global
              </h1>
              <h2 className="text-xl md:text-2xl font-display text-primary mb-3">
                Powered by JEDA NETWORKS
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Developed and owned by JEDA NETWORKS, transforming the travel industry through 
                innovative technology and authentic cultural experiences.
              </p>
            </div>

            {/* JEDA NETWORKS Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <Icon name="Building" size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">About JEDA NETWORKS</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                JEDA NETWORKS is a technology company specializing in innovative solutions 
                for the travel and tourism industry. Our mission is to connect travelers 
                with authentic experiences while empowering local service providers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-start space-x-3">
                  <Icon name="Target" size={20} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Innovation</h4>
                    <p className="text-muted-foreground text-xs">
                      Cutting-edge technology for travel
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon name="Users" size={20} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Community</h4>
                    <p className="text-muted-foreground text-xs">
                      Connecting travelers & locals
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon name="Globe" size={20} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Global Impact</h4>
                    <p className="text-muted-foreground text-xs">
                      Sustainable tourism worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Partners */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                  <Icon name="Users" size={20} className="text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Our Partners</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'JOCTAN MFUNGO', role: 'Chief Executive Officer (CEO)' },
                  { name: 'ELIZABETH ERNEST', role: 'Chief Technology Officer (CTO)' },
                  { name: 'DANFORD MWANKENJA', role: 'Chief Operating Officer (COO)' },
                  { name: 'ASTERIA MOMBO', role: 'Chief Financial Officer (CFO)' }
                ].map((partner, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Icon name="User" size={24} className="text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">{partner.name}</h4>
                    <p className="text-muted-foreground text-xs">{partner.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technology */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                  <Icon name="Code" size={20} className="text-accent" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Technology & Innovation</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name="Code" size={20} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm mb-2">Modern Development</h4>
                  <p className="text-muted-foreground text-xs">
                    Built with React and modern web technologies
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name="Shield" size={20} className="text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm mb-2">Security First</h4>
                  <p className="text-muted-foreground text-xs">
                    Industry-standard security practices
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name="Zap" size={20} className="text-accent" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm mb-2">Performance</h4>
                  <p className="text-muted-foreground text-xs">
                    Optimized for speed and efficiency
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-display font-medium text-foreground mb-3">
                Get in Touch with JEDA NETWORKS
              </h3>
              <p className="text-muted-foreground mb-6">
                We leverage cutting-edge technology and innovation to deliver world-class travel solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button>
                  <Icon name="Mail" size={16} />
                  Contact Us
                </Button>
                <Button variant="outline">
                  <Icon name="Building" size={16} />
                  Partnership Opportunities
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Use consistent Navbar */}
      <Navbar />

      {/* Dashboard Content with Background Image and Glass Morphism */}
      <div className="relative min-h-screen">
        {/* Background Image - with pointer-events-none to prevent interaction issues */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')"
          }}
        />
        
        {/* Gradient Overlay - with pointer-events-none */}
        <div className="fixed inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90 pointer-events-none" />
        <div className="fixed inset-0 bg-background/40 pointer-events-none" />

        {/* Dashboard Navigation Tabs */}
        <div className="relative z-10 pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Dashboard Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Service Provider Dashboard
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Manage your services, bookings, and grow your business with BounceSteps
              </p>
            </div>

            {/* Mobile Navigation - Only visible on mobile */}
            <div className="md:hidden mb-6">
              <MobileDashboardSlider 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={tabs}
                className="bg-background/90 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg"
              />
            </div>

            {/* Tab Navigation with Glass Morphism - Hidden on mobile */}
            <div className="hidden md:block bg-background/90 backdrop-blur-lg rounded-2xl border border-border/50 p-2 mb-8 shadow-lg">
              <div className="flex flex-wrap gap-2 justify-center">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id && tab.id !== 'home'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} className={`${activeTab === tab.id && tab.id !== 'home' ? 'text-primary-foreground' : 'text-primary'}`} />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content with Glass Morphism */}
            <div className="bg-background/90 backdrop-blur-lg rounded-2xl border border-border/50 p-6 shadow-lg">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;
