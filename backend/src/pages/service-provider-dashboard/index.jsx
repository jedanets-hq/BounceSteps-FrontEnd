import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ChatSystem from '../../components/ChatSystem';
import NotificationSystem from '../../components/NotificationSystem';
import ServiceManagement from './components/ServiceManagement';
import BookingManagement from './components/BookingManagement';
import BusinessAnalytics from './components/BusinessAnalytics';
import BusinessProfile from './components/BusinessProfile';
import ServicePromotion from './components/ServicePromotion';
import AccountVerification from './components/AccountVerification';
import TravelerStoriesView from './components/TravelerStoriesView';
import { API_URL } from '../../utils/api';

const ServiceProviderDashboard = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCustomerChat, setShowCustomerChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [myServices, setMyServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myFollowers, setMyFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [stats, setStats] = useState({ totalServices: 0, activeBookings: 0, monthlyEarnings: 0, customerRating: 0, followersCount: 0 });
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const { user, logout, isLoading} = useAuth();
  const navigate = useNavigate();

  console.log('Service Provider Dashboard - activeTab:', activeTab);
  console.log('Service Provider Dashboard - user:', user);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('header')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  // Fetch real services and bookings
  useEffect(() => {
    if (user?.id) {
      fetchMyServices();
      fetchMyBookings();
      fetchMyFollowers();
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

  // Redirect to main home if activeTab is 'home'
  useEffect(() => {
    if (activeTab === 'home') {
      navigate('/');
    }
  }, [activeTab, navigate]);

  const fetchMyServices = async () => {
    try {
      setLoadingServices(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) return;

      const response = await fetch(`${API_URL}/services/provider/my-services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response content type');
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response from server');
        return;
      }

      const data = JSON.parse(text);
      
      if (data.success && data.services) {
        setMyServices(data.services);
        
        // Calculate real stats
        const totalServices = data.services.length;
        const activeServices = data.services.filter(s => s.is_active).length;
        const totalBookings = data.services.reduce((sum, s) => sum + (s.total_bookings || 0), 0);
        const avgRating = data.services.reduce((sum, s) => sum + parseFloat(s.average_rating || 0), 0) / (totalServices || 1);
        
        setStats({
          totalServices: activeServices,
          activeBookings: totalBookings,
          monthlyEarnings: 0, // Will be calculated from bookings
          customerRating: avgRating.toFixed(1)
        });
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) return;

      const response = await fetch(`${API_URL}/bookings/provider/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response content type for bookings');
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response from bookings server');
        return;
      }

      const data = JSON.parse(text);
      
      if (data.success && data.bookings) {
        setMyBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Authentication required');
        return false;
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Pre-order ${newStatus} successfully!`);
        fetchMyBookings(); // Refresh bookings list
        return true;
      } else {
        alert('Error: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating booking status. Please try again.');
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

  // Return null while redirecting
  if (!user) {
    return null;
  }

  // CLEAN TABS - Single level navigation, no duplicates
  const tabs = [
    { id: 'home', name: 'Home', icon: 'Home' },
    { id: 'overview', name: 'Overview', icon: 'LayoutDashboard' },
    { id: 'services', name: 'My Services', icon: 'Package' },
    { id: 'bookings', name: 'Bookings', icon: 'Calendar' },
    { id: 'followers', name: 'Followers', icon: 'Users' },
    { id: 'profile', name: 'My Profile', icon: 'User' },
    { id: 'stories', name: 'Traveler Stories', icon: 'BookOpen' },
    { id: 'promotion', name: 'Promote Services', icon: 'TrendingUp' },
    { id: 'verification', name: 'Get Verified', icon: 'Shield' },
    { id: 'analytics', name: 'Analytics', icon: 'BarChart' }
  ];

  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'John Doe wants to book your Safari Package',
      time: '2 hours ago',
      urgent: true
    },
    {
      id: 2,
      type: 'review',
      title: 'New Review',
      message: 'Sarah left a 5-star review for your service',
      time: '4 hours ago',
      urgent: false
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $250 received for Kilimanjaro Trek',
      time: '1 day ago',
      urgent: false
    }
  ];

  const renderTabContent = () => {
    // If activeTab is 'home', don't render anything as we're redirecting
    if (activeTab === 'home') {
      return (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin text-primary" />
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-medium mb-2">Welcome, {user?.firstName || 'Service Provider'}!</h2>
                  <p className="text-white/90">Manage your services and grow your business with iSafari Global</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <Icon name="DollarSign" size={20} className="text-accent" />
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
                <Button variant="default" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab('services');
                }}>
                  <Icon name="Plus" size={16} />
                  Add New Service
                </Button>
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
        return <ServiceManagement />;

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

      case 'stories':
        return <TravelerStoriesView />;

      case 'analytics':
        return <BusinessAnalytics />;

      case 'promotion':
        return <ServicePromotion />;

      case 'verification':
        return <AccountVerification />;

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


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Header with Integrated Tabs */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/assets/images/isafari-logo.png" 
                alt="iSafari Global" 
                className="h-10 w-auto"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="flex items-center space-x-2" style={{display: 'none'}}>
                <div className="text-2xl font-bold text-blue-500">i</div>
                <div className="text-xl font-light text-gray-400">Safari</div>
                <div className="text-blue-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Tabs - Aligned with Header */}
            <nav className="hidden lg:flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Special handling for Home tab - navigate to main home page
                    if (tab.id === 'home') {
                      navigate('/');
                      return;
                    }
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id && tab.id !== 'home'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span className="whitespace-nowrap">{tab.name}</span>
                </button>
              ))}
            </nav>

            {/* Right Side - Theme Toggle & Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <Icon name={isDark ? 'Sun' : 'Moon'} size={20} />
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Icon name={showMobileMenu ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-border bg-transparent backdrop-blur-md">
              <div className="px-4 py-3 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Special handling for Home tab - navigate to main home page
                      if (tab.id === 'home') {
                        navigate('/');
                        return;
                      }
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id && tab.id !== 'home'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    <span>{tab.name}</span>
                  </button>
                ))}
                
                {/* Mobile Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted mt-2 border-t border-border pt-3"
                >
                  <Icon name={isDark ? 'Sun' : 'Moon'} size={18} />
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                {/* Mobile Sign Out */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm('Are you sure you want to sign out?')) {
                      logout();
                    }
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon name="LogOut" size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Main Content with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderTabContent()}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Notifications */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Notifications</h3>
                  <Button variant="ghost" size="sm">
                    <Icon name="MoreHorizontal" size={16} />
                  </Button>
                </div>
                <div className="space-y-4">
                  {notifications?.slice(0, 3).map((notification) => (
                    <div key={notification?.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${notification?.urgent ? 'bg-error/10' : 'bg-primary/10'}`}>
                        <Icon 
                          name={notification?.type === 'booking' ? 'Calendar' : notification?.type === 'review' ? 'Star' : 'Bell'} 
                          size={16} 
                          className={notification?.urgent ? 'text-error' : 'text-primary'} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{notification?.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification?.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification?.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help & Resources */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Help & Resources</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-muted transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon name="BookOpen" size={16} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Provider Guide</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-muted transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon name="Play" size={16} className="text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Video Tutorials</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-muted transition-colors">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon name="MessageCircle" size={16} className="text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Contact Support</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        {/* Customer Messages Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedCustomer({ id: 1, name: 'John Doe' });
            setShowCustomerChat(true);
          }}
          className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg relative"
          title="Customer Messages"
        >
          <Icon name="MessageCircle" size={24} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            5
          </span>
        </Button>
        
        {/* Notifications Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowNotifications(true);
          }}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg relative"
          title="View Notifications"
        >
          <Icon name="Bell" size={24} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            4
          </span>
        </Button>
      </div>

      {/* Chat and Notification Modals */}
      <ChatSystem
        isOpen={showCustomerChat}
        onClose={() => setShowCustomerChat(false)}
        chatType="customer"
        recipientId={selectedCustomer?.id}
        recipientName={selectedCustomer?.name}
      />
      
      <NotificationSystem
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userType="provider"
      />
    </div>
  );
};

export default ServiceProviderDashboard;
