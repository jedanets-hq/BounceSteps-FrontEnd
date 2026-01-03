import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import TripDetailsModal from '../../components/TripDetailsModal';
import PastTripGallery from './components/PastTripGallery';
import UpcomingTripCard from './components/UpcomingTripCard';
import PreOrdersSection from './components/PreOrdersSection';
import { API_URL } from '../../utils/api';
const TravelerDashboard = () => {
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [favoriteProviders, setFavoriteProviders] = useState([]);
  const [tripPlans, setTripPlans] = useState([]);
  const [loadingTripPlans, setLoadingTripPlans] = useState(false);
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const fileInputRef = useRef(null);
  
  const { user, logout, isLoading, updateProfile } = useAuth();
  const { cartItems: contextCartItems, removeFromCart, getCartTotal, clearCart, addToCart, loadCartFromDatabase } = useCart();
  const { favorites: contextFavorites } = useFavorites();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user, navigate]);

  // Initialize profile data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Read URL parameters for tab and openPayment
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    const openPaymentParam = searchParams.get('openPayment');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    // If openPayment=true, show payment info after a short delay
    if (openPaymentParam === 'true' && tabParam === 'cart') {
      setTimeout(() => {
        // Scroll to payment section
        const paymentSection = document.querySelector('[data-payment-section]');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location.search]);

  // Redirect to main home if activeTab is 'home'
  useEffect(() => {
    if (activeTab === 'home') {
      navigate('/');
    }
  }, [activeTab, navigate]);

  // Profile editing functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileDataChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Please login again');
        return;
      }

      // Call API to update profile
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          avatar_url: profileImage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local storage with new data
        const updatedUserData = {
          ...userData,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          profileImage: profileImage
        };
        localStorage.setItem('isafari_user', JSON.stringify(updatedUserData));
        
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
        window.location.reload();
      } else {
        alert('Failed to update profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('New passwords do not match!');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      setIsSavingPassword(true);
      
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully!');
      } else {
        alert('Failed to change password: ' + data.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original user data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
      setProfileImage(user.profileImage || null);
    }
    setIsEditingProfile(false);
  };

  // Sync cart items from CartContext - THIS IS THE SINGLE SOURCE OF TRUTH
  useEffect(() => {
    console.log('🔄 [DASHBOARD] Syncing cart from CartContext:', contextCartItems.length, 'items');
    setCartItems(contextCartItems);
  }, [contextCartItems]);

  // Load cart from database when dashboard loads
  useEffect(() => {
    if (user?.id && loadCartFromDatabase) {
      console.log('📥 [DASHBOARD] Dashboard loaded - loading cart via CartContext');
      loadCartFromDatabase().then(() => {
        console.log('✅ [DASHBOARD] Cart loaded from database');
      });
    }
  }, [user?.id, loadCartFromDatabase]);

  // Load cart from CartContext when cart tab becomes active
  useEffect(() => {
    if (activeTab === 'cart' && user?.id && loadCartFromDatabase) {
      console.log('📥 [DASHBOARD] Cart tab active - reloading from database via CartContext');
      // Force reload from database through CartContext
      loadCartFromDatabase();
    }
  }, [activeTab, user?.id, loadCartFromDatabase]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Fetch bookings
  useEffect(() => {
    if (user?.id) {
      fetchMyBookings();
    }
  }, [user]);

  // Load cart from database when cart tab is active
  useEffect(() => {
    if (activeTab === 'cart' && loadCartFromDatabase) {
      loadCartFromDatabase();
    }
  }, [activeTab, loadCartFromDatabase]);

  // Load cart from database when dashboard loads - USE CARTCONTEXT
  // (Removed duplicate - already handled above)

  // Sync favorites from FavoritesContext - NO NEED TO CALL loadFavoritesFromDatabase
  // The context already loads favorites on mount, just sync the local state
  useEffect(() => {
    if (contextFavorites) {
      console.log('🔄 [DASHBOARD] Syncing favorites from context:', contextFavorites.length, 'items');
      setFavoriteProviders(contextFavorites);
    }
  }, [contextFavorites]);

  // Load trip plans from database when dashboard loads - USE PLANSAPI
  useEffect(() => {
    if (user?.id) {
      loadTripPlansFromDatabase();
    }
  }, [user?.id]);

  // Load trip plans from database
  const loadTripPlansFromDatabase = async () => {
    try {
      setLoadingTripPlans(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        console.warn('[DASHBOARD] User not logged in - cannot load trip plans from database');
        // Fallback to localStorage
        const savedPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
        setTripPlans(savedPlans);
        setLoadingTripPlans(false);
        return;
      }

      console.log('📥 [DASHBOARD] Loading trip plans from database...');
      const response = await fetch(`${API_URL}/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📦 [DASHBOARD] Trip plans response:', data);
      
      if (data.success && data.plans) {
        console.log('✅ [DASHBOARD] Trip plans loaded:', data.plans.length, 'items');
        setTripPlans(data.plans);
      } else {
        console.warn('⚠️ [DASHBOARD] No trip plans or error');
        // Fallback to localStorage
        const savedPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
        setTripPlans(savedPlans);
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Error loading trip plans:', error);
      // Fallback to localStorage
      const savedPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
      setTripPlans(savedPlans);
    } finally {
      setLoadingTripPlans(false);
    }
  };

  // Handler functions for new modals
  const handleViewTripDetails = (trip) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
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

  // Show login prompt if not authenticated
  // Use demo user for testing if no authentication
  const currentUser = user || {
    id: "demo-traveler",
    first_name: "Demo",
    last_name: "Traveler",
    email: "demo@isafari.com", 
    userType: "traveler",
    avatar_url: null
  };

  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      console.log('🔍 [TRAVELER] Fetching my bookings...');

      if (!token) {
        console.error('❌ No token found');
        return;
      }

      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Invalid response content type');
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('❌ Empty response from server');
        return;
      }

      const data = JSON.parse(text);
      console.log('📦 Bookings data:', data);
      
      if (data.success && data.bookings) {
        console.log('✅ Bookings received:', data.bookings.length);
        console.log('📋 My bookings:', data.bookings);
        setMyBookings(data.bookings);
      } else {
        console.error('❌ Failed to fetch bookings:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const createBooking = async (serviceId, bookingDate, participants) => {
    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Please login to create a booking');
        return false;
      }

      console.log('Creating booking with:', { serviceId, bookingDate, participants });

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: parseInt(serviceId), // Ensure it's a number
          bookingDate,
          participants: parseInt(participants) // Ensure it's a number
        })
      });

      const data = await response.json();
      console.log('Booking response:', data);
      
      if (data.success) {
        console.log('✅ Pre-order created successfully:', data.booking);
        console.log('🔄 Refreshing bookings list...');
        await fetchMyBookings(); // Refresh bookings list
        console.log('✅ Bookings refreshed!');
        return true;
      } else {
        console.error('❌ Booking failed:', data.message);
        alert('Error: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating pre-order. Please try again.');
      return false;
    }
  };

  // Real trips data (will be fetched from database)
  const upcomingTrips = [];

  // Filter active bookings (pending, confirmed, or in-progress)
  const activeBookings = myBookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status)
  );


  // Real past trips data (will be fetched from database)
  const pastTrips = [];

  // Loyalty data (will be calculated from bookings)
  const loyaltyData = {
    currentTier: "bronze",
    points: 0,
    pointsEarned: 0
  };

  const tabs = [
    { id: 'home', name: 'Home', icon: 'Home' },
    { id: 'overview', name: 'Overview', icon: 'LayoutDashboard' },
    { id: 'trips', name: 'Your Trip', icon: 'MapPin' },
    { id: 'favorites', name: 'Favorites', icon: 'Heart' },
    { id: 'cart', name: 'Cart & Payment', icon: 'ShoppingCart' },
    { id: 'preferences', name: 'My Profile', icon: 'User' },
    { id: 'support', name: 'Support', icon: 'HelpCircle' }
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
                  <h2 className="font-display text-2xl font-medium mb-2">Welcome back, {user?.firstName || 'Traveler'}!</h2>
                  <p className="text-white/90">Start planning your next adventure with iSafari Global</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-white/80 text-sm">Current time</p>
                    <p className="text-xl font-medium">{currentTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="MapPin" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{upcomingTrips?.length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Trips</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Calendar" size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{activeBookings?.length}</p>
                    <p className="text-sm text-muted-foreground">Active Bookings</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="Star" size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{loyaltyData?.points?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Reward Points</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="Globe" size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{pastTrips?.length}</p>
                    <p className="text-sm text-muted-foreground">Countries Visited</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Upcoming Trips */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-medium">Upcoming Adventures</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingTrips?.map(trip => (
                  <UpcomingTripCard key={trip?.id} trip={trip} onViewDetails={handleViewTripDetails} />
                ))}
              </div>
            </div>
            {/* All Service Bookings */}
            <div>
              <h3 className="font-display text-xl font-medium mb-6">My Service Bookings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingBookings ? (
                  <div className="col-span-3 flex justify-center py-12">
                    <Icon name="Loader2" size={32} className="animate-spin text-primary" />
                  </div>
                ) : myBookings.length > 0 ? (
                  myBookings.map(booking => (
                    <div key={booking.id} className="bg-card border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-foreground">{booking.service_title || booking.service?.title || 'Service'}</h4>
                          <p className="text-sm text-muted-foreground">{booking.business_name || booking.provider?.businessName || 'Provider'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {booking.status === 'confirmed' ? '✅ Confirmed' : 
                           booking.status === 'pending' ? '🟡 Pending' : 
                           booking.status === 'completed' ? '✔️ Completed' :
                           '❌ Rejected'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center text-muted-foreground">
                          <Icon name="Calendar" size={14} className="mr-2" />
                          {new Date(booking.booking_date || booking.bookingDate).toLocaleDateString()}
                        </p>
                        <p className="flex items-center text-muted-foreground">
                          <Icon name="Users" size={14} className="mr-2" />
                          {booking.participants} participant(s)
                        </p>
                        <p className="font-semibold text-primary">
                          TZS {(booking.total_price || booking.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No bookings yet</p>
                    <Button 
                      className="mt-4"
                      type="button"
                      onClick={() => navigate('/journey-planner')}
                    >
                      <Icon name="Plus" size={16} />
                      Create Your First Journey
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'trips':
        // Get saved journey plans from state (loaded from database)
        const savedJourneyPlans = tripPlans.length > 0 ? tripPlans : JSON.parse(localStorage.getItem('journey_plans') || '[]');
        
        // Group bookings by trip/date to create trip cards
        const groupedTrips = myBookings.reduce((acc, booking) => {
          const tripDate = new Date(booking.booking_date || booking.bookingDate).toLocaleDateString();
          if (!acc[tripDate]) {
            acc[tripDate] = {
              date: tripDate,
              bookings: [],
              totalAmount: 0
            };
          }
          acc[tripDate].bookings.push(booking);
          acc[tripDate].totalAmount += (booking.total_price || booking.totalAmount || 0);
          return acc;
        }, {});
        
        const tripsList = Object.values(groupedTrips).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Check if trip is completed (all bookings completed or date passed)
        const isTripCompleted = (trip) => {
          const tripDate = new Date(trip.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return tripDate < today || trip.bookings.every(b => b.status === 'completed');
        };
        
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">My Trips</h2>
              <Button onClick={() => navigate('/journey-planner')}>
                <Icon name="Plus" size={16} />
                Plan New Trip
              </Button>
            </div>
            
            {/* Your Trip Section */}
            {savedJourneyPlans.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg flex items-center">
                  <Icon name="Bookmark" size={20} className="mr-2 text-primary" />
                  Saved Trip Plans
                </h3>
                {savedJourneyPlans.map((plan, index) => (
                  <div key={plan.id || index} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className={`p-4 ${plan.status === 'pending_payment' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-primary/5'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${plan.status === 'pending_payment' ? 'bg-yellow-500' : 'bg-primary'}`}>
                            <Icon name="MapPin" size={24} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">
                              {plan.area || plan.district}, {plan.region}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {plan.services?.length || 0} service(s) • TZS {(plan.totalCost || 0).toLocaleString()} • {plan.travelers} traveler(s)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {plan.startDate && plan.endDate ? `${plan.startDate} - ${plan.endDate}` : 'Dates not set'}
                            </p>
                            {/* Show location - handle multiple destinations */}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                              <Icon name="MapPin" size={12} className="mr-1" />
                              {plan.isMultiTrip && plan.destinations && plan.destinations.length > 0
                                ? plan.destinations
                                    .filter(dest => dest.region)
                                    .map(dest => `${dest.ward || dest.district || ''}, ${dest.region}`.replace(/^, /, ''))
                                    .join(' → ')
                                : plan.locationString || `${plan.area || plan.district || ''}, ${plan.region || ''}`.replace(/^, /, '') || 'Location not set'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {(() => {
                            // Determine trip status based on dates
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const endDate = plan.endDate ? new Date(plan.endDate) : null;
                            const startDate = plan.startDate ? new Date(plan.startDate) : null;
                            
                            let statusLabel = '';
                            let statusClass = '';
                            
                            if (endDate && endDate < today) {
                              // Trip has ended - Completed
                              statusLabel = '✅ Completed';
                              statusClass = 'bg-green-100 text-green-700';
                            } else if (startDate && startDate <= today && (!endDate || endDate >= today)) {
                              // Trip is ongoing
                              statusLabel = '🔄 In Progress';
                              statusClass = 'bg-blue-100 text-blue-700';
                            } else {
                              // Trip is upcoming
                              statusLabel = '🟡 Upcoming';
                              statusClass = 'bg-yellow-100 text-yellow-700';
                            }
                            
                            return (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                                {statusLabel}
                              </span>
                            );
                          })()}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTrip({
                                ...plan,
                                isJourneyPlan: true
                              });
                              setShowTripDetails(true);
                            }}
                          >
                            <Icon name="Eye" size={16} />
                            View Details
                          </Button>
                          {(() => {
                            // Only show Continue to Cart button for upcoming trips
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const endDate = plan.endDate ? new Date(plan.endDate) : null;
                            
                            // Don't show button if trip is completed
                            if (endDate && endDate < today) {
                              return null;
                            }
                            
                            return (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  // Add services to cart
                                  plan.services?.forEach(service => {
                                    addToCart({
                                      ...service,
                                      location: plan.locationString || `${plan.area || plan.district}, ${plan.region}`,
                                      travelers: plan.travelers,
                                      journey_details: {
                                        startDate: plan.startDate,
                                        endDate: plan.endDate,
                                        travelers: plan.travelers
                                      }
                                    });
                                  });
                                  // Navigate to cart with payment section open
                                  navigate('/traveler-dashboard?tab=cart&openPayment=true');
                                }}
                              >
                                <Icon name="ShoppingCart" size={16} />
                                Continue to Cart & Payment
                              </Button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    {/* Services Preview */}
                    <div className="p-4 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        {plan.services?.slice(0, 4).map((service, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                            <Icon name="Tag" size={12} className="mr-1" />
                            {service.name || service.title} - TZS {(service.price || 0).toLocaleString()}
                          </span>
                        ))}
                        {plan.services?.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                            +{plan.services.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Booked Trips List - Shows only actual booked services */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg flex items-center">
                <Icon name="Calendar" size={20} className="mr-2 text-primary" />
                Booked Services
              </h3>
              {loadingBookings ? (
                <div className="flex justify-center py-12">
                  <Icon name="Loader2" size={32} className="animate-spin text-primary" />
                </div>
              ) : myBookings.length > 0 ? (
                <div className="space-y-4">
                  {myBookings.map((booking, index) => {
                    // Determine booking status based on date
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const bookingDate = new Date(booking.booking_date || booking.bookingDate);
                    bookingDate.setHours(0, 0, 0, 0);
                    
                    let isCompleted = false;
                    let statusLabel = '';
                    let statusClass = '';
                    let iconName = 'MapPin';
                    let bgClass = 'bg-primary/5';
                    let iconBgClass = 'bg-primary';
                    
                    if (booking.status === 'completed' || bookingDate < today) {
                      isCompleted = true;
                      statusLabel = '✅ Completed';
                      statusClass = 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300';
                      iconName = 'CheckCircle';
                      bgClass = 'bg-green-50 dark:bg-green-900/20';
                      iconBgClass = 'bg-green-500';
                    } else if (booking.status === 'confirmed') {
                      statusLabel = '✅ Confirmed';
                      statusClass = 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300';
                    } else if (booking.status === 'pending') {
                      statusLabel = '🟡 Pending';
                      statusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300';
                    } else if (booking.status === 'rejected' || booking.status === 'cancelled') {
                      statusLabel = '❌ Cancelled';
                      statusClass = 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300';
                    } else {
                      statusLabel = '🟡 Pending';
                      statusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300';
                    }
                    
                    return (
                      <div key={booking.id || index} className="bg-card border border-border rounded-lg overflow-hidden">
                        {/* Booking Header */}
                        <div className={`p-4 ${bgClass}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgClass}`}>
                                <Icon name={iconName} size={24} className="text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground text-lg">
                                  {booking.service_title || booking.service?.title || 'Service Booking'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {booking.business_name || booking.provider?.businessName || 'Provider'} • {booking.participants || 1} participant(s)
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  📅 {new Date(booking.booking_date || booking.bookingDate).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {/* Status Badge */}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                                {statusLabel}
                              </span>
                              {/* View Button */}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTrip({
                                    ...booking,
                                    isBooking: true,
                                    date: new Date(booking.booking_date || booking.bookingDate).toLocaleDateString(),
                                    bookings: [booking],
                                    totalAmount: booking.total_price || booking.totalAmount || 0
                                  });
                                  setShowTripDetails(true);
                                }}
                              >
                                <Icon name="Eye" size={16} />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Booking Details Preview */}
                        <div className="p-4 border-t border-border">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                                <Icon name="Tag" size={12} className="mr-1" />
                                {booking.service_title || booking.service?.title || 'Service'}
                              </span>
                              {booking.category && (
                                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                  {booking.category}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-primary">
                              TZS {(booking.total_price || booking.totalAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No booked services yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Book services to see them here!</p>
                  <Button onClick={() => navigate('/journey-planner')}>
                    <Icon name="Plus" size={16} />
                    Plan Your First Trip
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">Favorite Providers</h2>
              <Button variant="outline" onClick={() => navigate('/destination-discovery')}>
                <Icon name="Search" size={16} />
                Discover More
              </Button>
            </div>
            
            {favoriteProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProviders.map((provider, index) => (
                  <div key={provider.id || index} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="Building2" size={32} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">{provider.business_name || provider.name}</h3>
                          {provider.location && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Icon name="MapPin" size={14} className="mr-1" />
                              {provider.location}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        {provider.followers_count !== undefined && (
                          <span className="text-sm text-muted-foreground">
                            <Icon name="Users" size={14} className="inline mr-1" />
                            {provider.followers_count} followers
                          </span>
                        )}
                        {provider.is_verified && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/provider/${provider.id}`)}
                        >
                          <Icon name="Eye" size={14} />
                          View Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={async () => {
                            const updated = favoriteProviders.filter(p => p.id !== provider.id);
                            setFavoriteProviders(updated);
                            localStorage.setItem('favorite_providers', JSON.stringify(updated));
                            
                            // Remove from database
                            try {
                              const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
                              const token = userData.token;
                              
                              await fetch(`${API_URL}/users/favorites/${provider.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                            } catch (error) {
                              console.error('Error removing favorite from database:', error);
                            }
                          }}
                        >
                          <Icon name="HeartOff" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="Heart" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No favorite providers yet</p>
                <p className="text-sm text-muted-foreground mb-4">Add providers to your favorites to see them here</p>
                <Button onClick={() => navigate('/destination-discovery')}>
                  <Icon name="Search" size={16} />
                  Discover Providers
                </Button>
              </div>
            )}
          </div>
        );

      case 'cart':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">Cart & Payment</h2>
              <Button 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const paymentWindow = window.open('', '_blank', 'width=600,height=500');
                  paymentWindow.document.write(`
                    <html>
                      <head><title>Payment Methods - iSafari Global</title></head>
                      <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                          <h1 style="color: #2563eb; margin-bottom: 20px;">Payment Methods</h1>
                          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <h3>💳 Credit/Debit Cards</h3>
                            <p>Visa, Mastercard, American Express accepted</p>
                          </div>
                          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <h3>📱 Mobile Money</h3>
                            <p>M-Pesa, Tigo Pesa, Airtel Money</p>
                          </div>
                          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <h3>🏦 Bank Transfer</h3>
                            <p>Direct bank transfers available</p>
                          </div>
                          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3>💰 PayPal</h3>
                            <p>Secure PayPal payments</p>
                          </div>
                          <button onclick="window.close()" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
                        </div>
                      </body>
                    </html>
                  `);
                }}
              >
                <Icon name="CreditCard" size={16} />
                Payment Methods
              </Button>
            </div>

            {/* Pre-Orders Section */}
            <PreOrdersSection bookings={myBookings} loading={loadingBookings} onRefresh={fetchMyBookings} />
            
            {/* Cart Items */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Icon name="ShoppingCart" size={20} className="mr-2" />
                Cart Items
              </h3>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="ShoppingCart" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mb-4">Services you add will appear here for booking</p>
                  <Button
                    type="button"
                    onClick={() => navigate('/journey-planner')}
                  >
                    <Icon name="Plus" size={16} />
                    Plan New Journey
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => {
                    // Get service image
                    const getItemImage = () => {
                      const imageData = item.images || item.image;
                      if (!imageData) return null;
                      
                      let images = [];
                      if (typeof imageData === 'string') {
                        try {
                          const parsed = JSON.parse(imageData);
                          images = Array.isArray(parsed) ? parsed : [parsed];
                        } catch (e) {
                          if (imageData.includes(',')) {
                            images = imageData.split(',').map(url => url.trim());
                          } else {
                            images = [imageData];
                          }
                        }
                      } else if (Array.isArray(imageData)) {
                        images = imageData;
                      }
                      
                      const validImages = images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
                      return validImages.length > 0 ? validImages[0] : null;
                    };
                    
                    const itemImage = getItemImage();
                    
                    return (
                    <div key={item.id || index} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex gap-4 mb-3">
                        {/* Service Image */}
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                          {itemImage ? (
                            <img 
                              src={itemImage} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex-col items-center justify-center text-gray-400 ${itemImage ? 'hidden' : 'flex'}`}>
                            <Icon name="Image" size={24} />
                            <span className="text-xs mt-1">No Image</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground text-lg">{item.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                              {item.location && (
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                  <Icon name="MapPin" size={12} className="mr-1" />
                                  {item.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-primary">TZS {(item.price * item.quantity).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">TZS {item.price?.toLocaleString()} × {item.quantity}</p>
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Payment Methods from Service Provider */}
                      {item.payment_methods && Object.keys(item.payment_methods).some(key => item.payment_methods[key]?.enabled) && (
                        <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Accepted Payments:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.payment_methods.visa?.enabled && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                <Icon name="CreditCard" size={10} className="mr-1" />
                                Visa/Card
                              </span>
                            )}
                            {item.payment_methods.paypal?.enabled && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                PayPal
                              </span>
                            )}
                            {item.payment_methods.googlePay?.enabled && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                GPay
                              </span>
                            )}
                            {item.payment_methods.mobileMoney?.enabled && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                <Icon name="Smartphone" size={10} className="mr-1" />
                                M-Money
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              const bookingDate = item.journey_details?.startDate || new Date().toISOString().split('T')[0];
                              const participants = item.journey_details?.travelers || item.quantity || 1;
                              // Use service_id (the actual service ID), not item.id (cart item ID)
                              const serviceId = item.service_id || item.serviceId || item.id;
                              console.log('📦 Pre-Order: Using service_id:', serviceId, 'from item:', item);
                              const success = await createBooking(serviceId, bookingDate, participants);
                              
                              if (success) {
                                // Remove from cart after successful pre-order (use cart item id)
                                removeFromCart(item.id);
                                alert(`✅ Pre-order created for "${item.title}"! Check "My Pre-Orders & Provider Feedback" section above.`);
                              }
                            }}
                          >
                            <Icon name="Package" size={14} />
                            Pre-Order
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive bg-red-50 hover:bg-red-100 border-red-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm('Remove this service from cart?')) {
                                removeFromCart(item.id);
                              }
                            }}
                          >
                            <Icon name="Trash2" size={14} />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  )})}
                  
                  {/* Cart Summary & Payment Options */}
                  <div className="border-t pt-6 mt-6">
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold text-primary">
                          TZS {getCartTotal().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {cartItems.length} service(s) in cart
                      </p>
                    </div>
                    
                    <div className="space-y-3" data-payment-section>
                      {/* Direct Payment Option */}
                      <div className="border border-border rounded-lg p-4 border-green-500/50 bg-green-50/30 dark:bg-green-900/10">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="CreditCard" size={20} className="text-green-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">Direct Payment</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Pay now and automatically confirm your booking with service providers.
                            </p>
                          </div>
                        </div>
                        
                        {/* Show Provider Payment Methods from Cart Items */}
                        {cartItems.length > 0 && cartItems.some(item => item.payment_methods && Object.keys(item.payment_methods).some(key => item.payment_methods[key]?.enabled)) && (
                          <div className="mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Provider Accepted Payment Methods:</p>
                            <div className="flex flex-wrap gap-2">
                              {cartItems.map((item, idx) => (
                                item.payment_methods && Object.keys(item.payment_methods).some(key => item.payment_methods[key]?.enabled) && (
                                  <div key={idx} className="flex flex-wrap gap-1.5">
                                    {item.payment_methods.visa?.enabled && (
                                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                        <Icon name="CreditCard" size={12} className="mr-1" />
                                        Visa/Card
                                      </span>
                                    )}
                                    {item.payment_methods.paypal?.enabled && (
                                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                        PayPal
                                      </span>
                                    )}
                                    {item.payment_methods.googlePay?.enabled && (
                                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                        GPay
                                      </span>
                                    )}
                                    {item.payment_methods.mobileMoney?.enabled && (
                                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                        <Icon name="Smartphone" size={12} className="mr-1" />
                                        M-Money
                                      </span>
                                    )}
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (cartItems.length === 0) {
                              alert('Your cart is empty. Please add services first.');
                              return;
                            }
                            
                            // Create bookings for all cart items
                            let successCount = 0;
                            for (const item of cartItems) {
                              const bookingDate = item.journey_details?.startDate || new Date().toISOString().split('T')[0];
                              const participants = item.journey_details?.travelers || 1;
                              const success = await createBooking(item.id || item.service_id, bookingDate, participants);
                              if (success) successCount++;
                            }
                            
                            if (successCount > 0) {
                              alert(`✅ Payment Successful!\n\n${successCount} service(s) booked.\n\nYour booking has been confirmed. Check "Active Pre-Orders" in Overview tab for details.`);
                              clearCart();
                              localStorage.removeItem('isafari_direct_payment');
                              setActiveTab('overview');
                            } else {
                              alert('❌ Payment failed. Please try again.');
                            }
                          }}
                        >
                          <Icon name="CheckCircle" size={16} />
                          Proceed to Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pre-Order Status Information */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Info" size={20} className="mr-2" />
                How Pre-Orders Work
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Submit Request</p>
                    <p className="text-sm text-muted-foreground">Send pre-order to service providers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Provider Reviews</p>
                    <p className="text-sm text-muted-foreground">Service provider accepts or rejects your request</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Get Confirmation</p>
                    <p className="text-sm text-muted-foreground">Receive booking confirmation and payment instructions</p>
                  </div>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-3 mt-4">
                  <p className="text-sm text-foreground flex items-center">
                    <Icon name="CheckCircle" size={16} className="mr-2 text-green-500" />
                    Track your pre-order status in the "Active Pre-Orders" section
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        );

      case 'preferences':
        return (
          <>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl sm:text-2xl font-medium">My Profile & Preferences</h2>
              </div>
            
              {/* Profile Information */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative flex justify-center sm:justify-start">
                      <img 
                        src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=ffffff&color=0D8ABC&size=128`} 
                        alt="Profile" 
                        className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-7 sm:h-7 bg-green-500 rounded-full border-2 sm:border-3 border-white"></div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-display text-xl sm:text-2xl font-bold mb-1">{user?.firstName || 'Traveler'} {user?.lastName || ''}</h3>
                      <p className="text-white/90 capitalize mb-2">{user?.userType || 'Traveler'} Account</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm space-y-1 sm:space-y-0">
                        <span className="flex items-center justify-center sm:justify-start">
                          <Icon name="Mail" size={14} className="mr-1" />
                          <span className="truncate">{user?.email}</span>
                        </span>
                        <span className="flex items-center justify-center sm:justify-start">
                          <Icon name="Hash" size={14} className="mr-1" />
                          ID: {user?.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Account Actions - Mobile & Desktop */}
                  <div className="flex flex-col sm:flex-col space-y-2 w-full sm:w-auto">
                    <Button variant="default" size="sm" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditingProfile(true);
                    }}>
                      <Icon name="Edit" size={14} />
                      <span className="ml-2">Edit Profile</span>
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full sm:w-auto" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsChangingPassword(true);
                    }}>
                      <Icon name="Lock" size={14} />
                      <span className="ml-2">Change Password</span>
                    </Button>
                    <Button variant="destructive" size="sm" className="bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm('Are you sure you want to sign out?')) {
                        logout();
                      }
                    }}>
                      <Icon name="LogOut" size={14} />
                      <span className="ml-2">Sign Out</span>
                    </Button>
                  </div>
                </div>
            </div>
          </div>
              </div>
          </>
        );

      case 'support':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">Support & Help Center</h2>
              <Button variant="destructive" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open('tel:+255123456789', '_self');
              }}>
                <Icon name="Phone" size={16} />
                Emergency Call
              </Button>
            </div>
            
            {/* Support Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Live Chat */}
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="MessageCircle" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">Chat with our support team in real-time for quick assistance</p>
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Live chat feature coming soon! Please use email or phone support for now.');
                  }}
                >
                  <Icon name="MessageCircle" size={16} />
                  Start Chat
                </Button>
              </div>
              
              {/* Email Support */}
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Mail" size={24} className="text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Send us an email and we'll respond within 24 hours</p>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open('mailto:support@isafari.global?subject=Support Request', '_blank');
                  }}
                >
                  <Icon name="Mail" size={16} />
                  Send Email
                </Button>
              </div>
              
              {/* Phone Support */}
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Phone" size={24} className="text-green-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Call us directly for urgent matters</p>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open('tel:+255123456789', '_self');
                  }}
                >
                  <Icon name="Phone" size={16} />
                  +255 123 456 789
                </Button>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Icon name="HelpCircle" size={20} className="mr-2" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h4 className="font-medium text-foreground mb-2">How do I cancel a booking?</h4>
                  <p className="text-sm text-muted-foreground">You can cancel your booking from the "Your Trip" section. Go to the booking you want to cancel and click the cancel button. Refund policies vary by service provider.</p>
                </div>
                <div className="border-b border-border pb-4">
                  <h4 className="font-medium text-foreground mb-2">How do I contact a service provider?</h4>
                  <p className="text-sm text-muted-foreground">After making a booking, you can message the service provider directly through the chat feature in your booking details.</p>
                </div>
                <div className="border-b border-border pb-4">
                  <h4 className="font-medium text-foreground mb-2">What payment methods are accepted?</h4>
                  <p className="text-sm text-muted-foreground">We accept M-Pesa, Tigo Pesa, Airtel Money, credit/debit cards (Visa, Mastercard), and bank transfers.</p>
                </div>
                <div className="pb-2">
                  <h4 className="font-medium text-foreground mb-2">How do I update my profile?</h4>
                  <p className="text-sm text-muted-foreground">Go to "My Profile" tab and click "Edit Profile" to update your personal information, profile picture, and preferences.</p>
                </div>
              </div>
            </div>
            
            {/* Emergency Contacts */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center">
                <Icon name="AlertTriangle" size={20} className="mr-2" />
                Emergency Contacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                    <Icon name="Phone" size={18} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">iSafari Emergency</p>
                    <p className="text-sm text-muted-foreground">+255 800 ISAFARI</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                    <Icon name="Shield" size={18} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Tanzania Police</p>
                    <p className="text-sm text-muted-foreground">112 / 114</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                    <Icon name="Heart" size={18} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Medical Emergency</p>
                    <p className="text-sm text-muted-foreground">115</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                    <Icon name="Flame" size={18} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fire Department</p>
                    <p className="text-sm text-muted-foreground">114</p>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/assets/images/isafari-logo.png" 
                alt="iSafari Global" 
                className="h-8 sm:h-10 w-auto"
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
            <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-sm">
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

      <div className="pt-14 sm:pt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>



      {/* Enhanced Modal Components */}
      <TripDetailsModal
        trip={selectedTrip}
        isOpen={showTripDetails}
        onClose={() => setShowTripDetails(false)}
      />

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-muted rounded-lg">
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleProfileDataChange('firstName', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleProfileDataChange('lastName', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileDataChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Change Password</h2>
                <button onClick={() => setIsChangingPassword(false)} className="p-2 hover:bg-muted rounded-lg">
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsChangingPassword(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleChangePassword} disabled={isSavingPassword}>
                  {isSavingPassword ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelerDashboard;