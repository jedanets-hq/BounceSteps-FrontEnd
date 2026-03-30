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
import MessagesTab from './components/MessagesTab';
import RatingStars from '../../components/RatingStars';
import ReviewForm from '../../components/ReviewForm';
import { API_URL } from '../../utils/api';
const TravelerDashboard = () => {
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [favoriteProviders, setFavoriteProviders] = useState([]);
  const [tripPlans, setTripPlans] = useState([]);
  const [loadingTripPlans, setLoadingTripPlans] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  
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
  
  // Stories states
  const [myStories, setMyStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [storyFormData, setStoryFormData] = useState({
    title: '',
    content: '',
    location: '',
    trip_date: ''
  });
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  
  const fileInputRef = useRef(null);
  
  const { user, logout, isLoading, updateProfile } = useAuth();
  const { cartItems: contextCartItems, removeFromCart, getCartTotal, clearCart, addToCart, loadCartFromDatabase } = useCart();
  const { favorites: contextFavorites, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;
    
    // If user exists in context, we're good
    if (user && user.userType === 'traveler') return;
    
    // Check localStorage directly as fallback (handles race conditions after OAuth)
    try {
      const savedUser = localStorage.getItem('isafari_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData && userData.token && userData.userType === 'traveler') {
          // User exists in localStorage but not in context yet - wait for context to update
          console.log('⏳ [TravelerDashboard] User in localStorage, waiting for context...');
          // Give AuthContext more time to sync
          return;
        }
        // User exists but wrong role - redirect to correct dashboard
        if (userData && userData.token && userData.userType === 'service_provider') {
          console.log('🔄 [TravelerDashboard] User is service_provider, redirecting...');
          navigate('/service-provider-dashboard');
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
          if (userData && userData.token && userData.userType === 'traveler') {
            console.log('✅ [TravelerDashboard] User found on delayed check, staying on page');
            // Force a re-render by updating state
            window.location.reload();
            return;
          }
        }
      } catch (e) {
        console.error('Error on delayed localStorage check:', e);
      }
      
      // No user anywhere - redirect to login
      console.log('🔒 [TravelerDashboard] No user found, redirecting to login');
      navigate('/login');
    }, 500);
    
    return () => clearTimeout(redirectTimer);
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

  // Load stories from database
  const loadMyStories = async () => {
    try {
      setLoadingStories(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        console.warn('[DASHBOARD] User not logged in - cannot load stories');
        setLoadingStories(false);
        return;
      }

      const response = await fetch(`${API_URL}/traveler-stories/my-stories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMyStories(data.stories || []);
      } else {
        console.error('Failed to load stories:', data.message);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoadingStories(false);
    }
  };

  // Submit new story
  const handleSubmitStory = async (e) => {
    e.preventDefault();
    
    if (!storyFormData.title || !storyFormData.content) {
      alert('Please fill in title and content');
      return;
    }

    try {
      setIsSubmittingStory(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      const response = await fetch(`${API_URL}/traveler-stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storyFormData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ ' + data.message);
        setShowStoryForm(false);
        setStoryFormData({
          title: '',
          content: '',
          location: '',
          trip_date: ''
        });
        // Reload stories
        loadMyStories();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('❌ Failed to submit story. Please try again.');
    } finally {
      setIsSubmittingStory(false);
    }
  };

  // Delete story
  const handleDeleteStory = async (storyId) => {
    if (!confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      const response = await fetch(`${API_URL}/traveler-stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Story deleted successfully');
        loadMyStories();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('❌ Failed to delete story');
    }
  };

  // Load stories when stories tab is active
  useEffect(() => {
    if (activeTab === 'stories' && user?.id) {
      loadMyStories();
    }
  }, [activeTab, user?.id]);

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

  // Check localStorage directly as fallback (handles race conditions after OAuth)
  if (!user) {
    // Try to get user from localStorage directly
    try {
      const savedUser = localStorage.getItem('isafari_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData && userData.token && userData.userType === 'traveler') {
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
    
    // No user at all - will be redirected by useEffect
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

  // Filter active bookings (pending, confirmed, or in-progress) - ensure myBookings is array
  const activeBookings = Array.isArray(myBookings) ? myBookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status)
  ) : [];

  // Filter completed bookings - ensure myBookings is array
  const completedBookings = Array.isArray(myBookings) ? myBookings.filter(b => 
    ['completed', 'finished'].includes(b.status)
  ) : [];

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
    { id: 'messages', name: 'Messages', icon: 'MessageCircle' },
    { id: 'preferences', name: 'My Profile', icon: 'User' },
    { id: 'stories', name: 'My Stories', icon: 'BookOpen' },
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
                  <p className="text-white/90">Start planning your next adventure with BounceSteps</p>
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
                    <p className="text-2xl font-bold text-foreground">{pastTrips?.length + completedBookings?.length}</p>
                    <p className="text-sm text-muted-foreground">Completed Trips</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Upcoming Trips */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-medium">Upcoming Adventures</h3>
              </div>
              {upcomingTrips.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingTrips?.map(trip => (
                    <UpcomingTripCard key={trip?.id} trip={trip} onViewDetails={handleViewTripDetails} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No upcoming trips planned</p>
                  <p className="text-sm text-muted-foreground mb-4">Start planning your next adventure!</p>
                  <Button onClick={() => navigate('/journey-planner')}>
                    <Icon name="Plus" size={16} />
                    Plan New Trip
                  </Button>
                </div>
              )}
            </div>

          </div>
        );

      case 'trips':
        // Get saved journey plans from state (loaded from database)
        const savedJourneyPlans = tripPlans.length > 0 ? tripPlans : JSON.parse(localStorage.getItem('journey_plans') || '[]');
        
        // Group bookings by trip/date to create trip cards - ensure myBookings is array
        const groupedTrips = Array.isArray(myBookings) ? myBookings.reduce((acc, booking) => {
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
        }, {}) : {};
        
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
                            let statusIcon = '';
                            
                            if (endDate && endDate < today) {
                              // Trip has ended - Completed
                              statusLabel = 'Completed';
                              statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200';
                              statusIcon = 'CheckCircle2';
                            } else if (startDate && startDate <= today && (!endDate || endDate >= today)) {
                              // Trip is ongoing
                              statusLabel = 'In Progress';
                              statusClass = 'bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-primary/80';
                              statusIcon = 'RefreshCw';
                            } else {
                              // Trip is upcoming
                              statusLabel = 'Upcoming';
                              statusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200';
                              statusIcon = 'Clock';
                            }
                            
                            return (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusClass}`}>
                                <Icon name={statusIcon} size={14} />
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
                                onClick={async () => {
                                  // Add services to cart
                                  for (const service of plan.services || []) {
                                    await addToCart({
                                      id: service.id,
                                      serviceId: service.id,
                                      title: service.title || service.name,
                                      price: parseFloat(service.price || 0),
                                      quantity: 1
                                    });
                                  }
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
                    let statusIcon = '';
                    let iconName = 'MapPin';
                    let bgClass = 'bg-primary/5';
                    let iconBgClass = 'bg-primary';
                    
                    if (booking.status === 'completed' || bookingDate < today) {
                      isCompleted = true;
                      statusLabel = 'Completed';
                      statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200';
                      statusIcon = 'CheckCircle2';
                      iconName = 'CheckCircle';
                      bgClass = 'bg-green-50 dark:bg-green-900/20';
                      iconBgClass = 'bg-green-500';
                    } else if (booking.status === 'confirmed') {
                      statusLabel = 'Confirmed';
                      statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200';
                      statusIcon = 'CheckCircle';
                    } else if (booking.status === 'pending') {
                      statusLabel = 'Pending';
                      statusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200';
                      statusIcon = 'Clock';
                    } else if (booking.status === 'rejected' || booking.status === 'cancelled') {
                      statusLabel = 'Cancelled';
                      statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200';
                      statusIcon = 'XCircle';
                    } else {
                      statusLabel = 'Pending';
                      statusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200';
                      statusIcon = 'Clock';
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
                                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                  <Icon name="Calendar" size={12} className="mr-1" />
                                  {new Date(booking.booking_date || booking.bookingDate).toLocaleDateString('en-US', { 
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
                              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusClass}`}>
                                <Icon name={statusIcon} size={14} />
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
              <h2 className="font-display text-2xl font-medium">My Favorites</h2>
            </div>
            
            {favoriteProviders.length > 0 ? (
              <div className="space-y-8">
                {/* Favorite Services */}
                {favoriteProviders.some(fav => fav.service_id) && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Icon name="Star" size={20} className="text-primary" />
                      Favorite Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteProviders.filter(fav => fav.service_id).map((favorite, index) => {
                        // Parse images if they're stored as JSON string
                        let serviceImages = [];
                        try {
                          if (favorite.service_images) {
                            if (typeof favorite.service_images === 'string') {
                              serviceImages = JSON.parse(favorite.service_images);
                            } else if (Array.isArray(favorite.service_images)) {
                              serviceImages = favorite.service_images;
                            }
                          }
                        } catch (e) {
                          console.error('Error parsing service images:', e);
                        }
                        
                        return (
                        <div key={favorite.id || index} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          {/* Service Image */}
                          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                            {serviceImages.length > 0 ? (
                              <img 
                                src={serviceImages[0]} 
                                alt={favorite.service_title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="Package" size={48} className="text-primary/40" />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-6">
                            <h3 className="font-semibold text-foreground text-lg mb-2">{favorite.service_title}</h3>
                            
                            {favorite.service_description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {favorite.service_description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Icon name="Tag" size={14} className="text-primary" />
                                <span className="text-sm text-muted-foreground">{favorite.service_category}</span>
                              </div>
                              <span className="text-lg font-bold text-primary">
                                TZS {parseFloat(favorite.service_price || 0).toLocaleString()}
                              </span>
                            </div>
                            
                            {favorite.service_location && (
                              <p className="text-sm text-muted-foreground flex items-center mb-4">
                                <Icon name="MapPin" size={14} className="mr-1" />
                                {favorite.service_location}
                              </p>
                            )}
                            
                            {favorite.service_provider_name && (
                              <p className="text-xs text-muted-foreground mb-4">
                                By: {favorite.service_provider_name}
                              </p>
                            )}
                            
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={async () => {
                                  // Add to cart
                                  const result = await addToCart({
                                    id: favorite.service_id,
                                    serviceId: favorite.service_id,
                                    title: favorite.service_title,
                                    name: favorite.service_title,
                                    price: parseFloat(favorite.service_price || 0),
                                    quantity: 1
                                  });
                                  
                                  if (result.success) {
                                    alert('✅ Added to cart!');
                                    setActiveTab('cart');
                                  } else {
                                    alert('❌ ' + (result.message || 'Failed to add to cart'));
                                  }
                                }}
                              >
                                <Icon name="ShoppingBag" size={14} />
                                Add to Cart
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:bg-red-50"
                                onClick={async () => {
                                  await removeFromFavorites('service', favorite.service_id);
                                }}
                              >
                                <Icon name="HeartOff" size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Favorite Providers */}
                {favoriteProviders.some(fav => fav.provider_id) && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Icon name="Building2" size={20} className="text-primary" />
                      Favorite Providers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteProviders.filter(fav => fav.provider_id).map((provider, index) => (
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
                                onClick={() => navigate(`/provider/${provider.provider_id}`)}
                              >
                                <Icon name="Eye" size={14} />
                                View Profile
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:bg-red-50"
                                onClick={async () => {
                                  await removeFromFavorites('provider', provider.provider_id);
                                }}
                              >
                                <Icon name="HeartOff" size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="Heart" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No favorites yet</p>
                <p className="text-sm text-muted-foreground mb-4">Add services or providers to your favorites to see them here</p>
                <Button onClick={() => navigate('/destination-discovery')}>
                  <Icon name="Search" size={16} />
                  Discover Services
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
            </div>

            {/* Pre-Orders Section */}
            <PreOrdersSection bookings={myBookings} loading={loadingBookings} onRefresh={fetchMyBookings} />
            
            {/* Cart Items - MOBILE OPTIMIZED */}
            <div className="bg-card rounded-lg border border-border p-3 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center text-base sm:text-lg">
                <Icon name="ShoppingCart" size={18} className="mr-2 sm:size-20" />
                Cart Items
              </h3>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Icon name="ShoppingCart" size={40} className="text-muted-foreground mx-auto mb-4 sm:size-48" />
                  <p className="text-muted-foreground mb-2">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mb-4">Services you add will appear here for booking</p>
                  <Button
                    type="button"
                    onClick={() => navigate('/journey-planner')}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Icon name="Plus" size={16} />
                    Plan New Journey
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
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
                    <div key={item.id || index} className="border border-border rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors max-w-full">
                      {/* MOBILE: Stack image and content vertically, DESKTOP: Side by side */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3">
                        {/* Service Image - MOBILE RESPONSIVE */}
                        <div className="w-full sm:w-20 md:w-24 h-32 sm:h-20 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-purple-100 dark:from-blue-900 dark:to-purple-900">
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
                            <Icon name="Image" size={20} className="sm:size-24" />
                            <span className="text-xs mt-1 hidden sm:block">No Image</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Title and Price - MOBILE STACKED */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-base sm:text-lg break-words">{item.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 break-words">{item.category}</p>
                              {item.location && (
                                <p className="text-xs text-muted-foreground flex items-center mt-1 break-words">
                                  <Icon name="MapPin" size={12} className="mr-1 flex-shrink-0" />
                                  <span className="truncate">{item.location}</span>
                                </p>
                              )}
                            </div>
                            <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
                              <p className="text-lg font-bold text-primary break-words">TZS {(item.price * item.quantity).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground break-words">TZS {item.price?.toLocaleString()} × {item.quantity}</p>
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 break-words">{item.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Payment Methods from Service Provider - MOBILE RESPONSIVE */}
                      {item.payment_methods && Object.keys(item.payment_methods).some(key => item.payment_methods[key]?.enabled) && (
                        <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Accepted Payments:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.payment_methods.visa?.enabled && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                <Icon name="CreditCard" size={10} className="mr-1" />
                                Visa/Card
                              </span>
                            )}
                            {item.payment_methods.paypal?.enabled && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
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
                      
                      {/* Action Buttons - MOBILE RESPONSIVE */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          <Button 
                            variant="default" 
                            size="sm"
                            className="w-full sm:w-auto"
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
                            <Icon name="Package" size={14} className="flex-shrink-0" />
                            <span className="ml-2">Pre-Order</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive bg-red-50 hover:bg-red-100 border-red-200 w-full sm:w-auto"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm('Remove this service from cart?')) {
                                removeFromCart(item.id);
                              }
                            }}
                          >
                            <Icon name="Trash2" size={14} className="flex-shrink-0" />
                            <span className="ml-2">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )})}
                  
                  {/* Cart Summary & Payment Options - MOBILE RESPONSIVE */}
                  <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-base sm:text-lg font-semibold">Total Amount:</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary break-words">
                          TZS {getCartTotal().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {cartItems.length} service(s) in cart
                      </p>
                    </div>
                    
                    {/* Payment Section - MOBILE RESPONSIVE */}
                    <div className="space-y-3" data-payment-section>
                      {/* Direct Payment Option - MOBILE OPTIMIZED */}
                      <div className="border border-border rounded-lg p-3 sm:p-4 border-green-500/50 bg-green-50/30 dark:bg-green-900/10">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 self-start">
                            <Icon name="CreditCard" size={18} className="text-green-500 sm:size-20" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground break-words">Direct Payment</h4>
                            <p className="text-sm text-muted-foreground mt-1 break-words">
                              Pay now and automatically confirm your booking with service providers.
                            </p>
                          </div>
                        </div>
                        
                        {/* Show Provider Payment Methods from Cart Items - MOBILE RESPONSIVE */}
                        {cartItems.length > 0 && cartItems.some(item => item.payment_methods && Object.keys(item.payment_methods).some(key => item.payment_methods[key]?.enabled)) && (
                          <div className="mb-4 p-2 sm:p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-2 break-words">Provider Accepted Payment Methods:</p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {cartItems.map((item, idx) => (
                                item.payment_methods && Object.keys(item.payment_methods).some(key => item.payment_methods[key]?.enabled) && (
                                  <div key={idx} className="flex flex-wrap gap-1.5">
                                    {item.payment_methods.visa?.enabled && (
                                      <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                        <Icon name="CreditCard" size={12} className="mr-1 flex-shrink-0" />
                                        <span className="break-words">Visa/Card</span>
                                      </span>
                                    )}
                                    {item.payment_methods.paypal?.enabled && (
                                      <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                        <span className="break-words">PayPal</span>
                                      </span>
                                    )}
                                    {item.payment_methods.googlePay?.enabled && (
                                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                        <span className="break-words">GPay</span>
                                      </span>
                                    )}
                                    {item.payment_methods.mobileMoney?.enabled && (
                                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                        <Icon name="Smartphone" size={12} className="mr-1 flex-shrink-0" />
                                        <span className="break-words">M-Money</span>
                                      </span>
                                    )}
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                          size="sm"
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
                          <Icon name="CheckCircle" size={16} className="flex-shrink-0" />
                          <span className="ml-2 break-words">Proceed to Payment</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pre-Order Status Information - MOBILE RESPONSIVE */}
            <div className="bg-card rounded-lg border border-border p-3 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center text-base sm:text-lg break-words">
                <Icon name="Info" size={18} className="mr-2 flex-shrink-0 sm:size-20" />
                <span className="break-words">How Pre-Orders Work</span>
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-primary">1</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base break-words">Submit Request</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">Send pre-order to service providers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-primary">2</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base break-words">Provider Reviews</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">Service provider accepts or rejects your request</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-primary">3</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base break-words">Get Confirmation</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">Receive booking confirmation and payment instructions</p>
                  </div>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-2 sm:p-3 mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-foreground flex items-center break-words">
                    <Icon name="CheckCircle" size={14} className="mr-2 text-green-500 flex-shrink-0 sm:size-16" />
                    <span className="break-words">Track your pre-order status in the "Active Pre-Orders" section</span>
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        );

      case 'messages':
        return <MessagesTab />;

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

      case 'stories':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">My Travel Stories</h2>
            </div>

            {/* Story Submission Form Modal */}
            {showStoryForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-foreground">Share Your Travel Story</h3>
                      <button
                        onClick={() => {
                          setShowStoryForm(false);
                          setStoryFormData({ title: '', content: '', location: '', trip_date: '' });
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="X" size={24} />
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmitStory} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Story Title *
                      </label>
                      <input
                        type="text"
                        value={storyFormData.title}
                        onChange={(e) => setStoryFormData({ ...storyFormData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Give your story a catchy title..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Story *
                      </label>
                      <textarea
                        value={storyFormData.content}
                        onChange={(e) => setStoryFormData({ ...storyFormData, content: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px]"
                        placeholder="Share your travel experience, what made it special, memorable moments..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={storyFormData.location}
                        onChange={(e) => setStoryFormData({ ...storyFormData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Where did this adventure take place?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Trip Date
                      </label>
                      <input
                        type="date"
                        value={storyFormData.trip_date}
                        onChange={(e) => setStoryFormData({ ...storyFormData, trip_date: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="bg-primary/5 dark:bg-primary/20 border border-primary/20 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Icon name="Info" size={20} className="text-primary dark:text-primary/60 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-primary dark:text-primary/80">
                          <p className="font-medium mb-1">Story Review Process</p>
                          <p>Your story will be reviewed by our admin team before appearing on the homepage. This helps maintain quality and appropriate content for all travelers.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowStoryForm(false);
                          setStoryFormData({ title: '', content: '', location: '', trip_date: '' });
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingStory}
                        className="flex-1"
                      >
                        {isSubmittingStory ? (
                          <>
                            <Icon name="Loader2" size={16} className="animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Icon name="Send" size={16} />
                            Submit Story
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Stories List */}
            {loadingStories ? (
              <div className="flex justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
              </div>
            ) : myStories.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {myStories.map((story) => (
                  <div key={story.id} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">{story.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {story.location && (
                              <span className="flex items-center">
                                <Icon name="MapPin" size={14} className="mr-1" />
                                {story.location}
                              </span>
                            )}
                            {story.trip_date && (
                              <span className="flex items-center">
                                <Icon name="Calendar" size={14} className="mr-1" />
                                {new Date(story.trip_date).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Icon name="Clock" size={14} className="mr-1" />
                              {new Date(story.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            story.status === 'approved' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                              : story.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                          }`}>
                            {story.status === 'approved' ? '✓ Approved' : story.status === 'pending' ? '⏳ Pending Review' : '✗ Rejected'}
                          </span>
                          <button
                            onClick={() => handleDeleteStory(story.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete story"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-foreground whitespace-pre-line line-clamp-4 mb-4">
                        {story.content}
                      </p>

                      {story.status === 'approved' && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                          <span className="flex items-center">
                            <Icon name="Heart" size={14} className="mr-1" />
                            {story.likes_count || 0} likes
                          </span>
                          <span className="text-green-600 dark:text-green-400 flex items-center">
                            <Icon name="Eye" size={14} className="mr-1" />
                            Visible on homepage
                          </span>
                        </div>
                      )}
                      
                      {story.status === 'pending' && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                            <Icon name="Clock" size={14} className="mr-2" />
                            Your story is awaiting admin approval. It will appear on the homepage once approved.
                          </p>
                        </div>
                      )}
                      
                      {story.status === 'rejected' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-4">
                          <p className="text-sm text-red-800 dark:text-red-200 flex items-center">
                            <Icon name="XCircle" size={14} className="mr-2" />
                            This story was not approved for publication.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No stories yet</p>
                <p className="text-sm text-muted-foreground mb-4">Share your travel experiences with the community!</p>
                <Button onClick={() => setShowStoryForm(true)}>
                  <Icon name="Plus" size={16} />
                  Share Your First Story
                </Button>
              </div>
            )}
          </div>
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
                    window.open('mailto:support@bouncesteps.com?subject=Support Request', '_blank');
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
                    <p className="font-medium text-foreground">BounceSteps Emergency</p>
                    <p className="text-sm text-muted-foreground">+255 800 BOUNCE</p>
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
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/30"
        style={{ backgroundColor: isDark ? 'rgba(13,17,23,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center h-14 px-3 sm:px-6 lg:px-8 gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/bouncesteps-logo.png"
                alt="BounceSteps"
                className="h-8 sm:h-10 w-auto"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }}>
                <span className="text-xl font-bold text-primary">B</span>
                <span className="text-xl font-light text-muted-foreground">ounceSteps</span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs — hidden on mobile */}
            <nav className="hidden md:flex flex-1 items-center mx-2 lg:mx-4 overflow-hidden">
              <div className="flex items-center w-full gap-0.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (tab.id === 'home') { navigate('/'); return; }
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center justify-center gap-1 flex-1 min-w-0 px-1 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      activeTab === tab.id && tab.id !== 'home'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Icon name={tab.icon} size={13} className={`flex-shrink-0 ${activeTab === tab.id && tab.id !== 'home' ? 'text-primary-foreground' : 'text-primary/70'}`} />
                    <span className="truncate hidden lg:inline">{tab.name}</span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-foreground/80 hover:bg-muted transition-all duration-200"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <Icon name={isDark ? 'Sun' : 'Moon'} size={18} />
              </button>
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-foreground/80 hover:bg-muted transition-all duration-200"
                aria-label="Open navigation menu"
              >
                <Icon name="Menu" size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer Overlay */}
      {mobileNavOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile Nav Drawer Panel */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-card border-l border-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          mobileNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-medium text-lg">Menu</h2>
          <button 
            onClick={() => setMobileNavOpen(false)}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
          {/* User Profile Summary */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex flex-shrink-0 items-center justify-center text-primary-foreground font-bold">
              {user?.firstName?.charAt(0) || 'T'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-primary flex items-center gap-1 truncate">
                <Icon name="Plane" size={12} /> Traveler
              </p>
            </div>
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-1">Navigation</p>

          <div className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id && tab.id !== 'home';
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'home') { navigate('/'); }
                    else { setActiveTab(tab.id); }
                    setMobileNavOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                    active 
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={20} className={active ? 'text-primary-foreground' : 'text-muted-foreground'} />
                  <span className="flex-1">{tab.name}</span>
                  {!active && <Icon name="ChevronRight" size={16} className="opacity-40" />}
                </button>
              );
            })}
          </div>

          {/* Additional Actions at the bottom if needed */}
          <div className="mt-auto pt-6 pb-2">
            <div className="h-px bg-border my-2 w-full" />
            <button
              onClick={() => {
                setMobileNavOpen(false);
                logout();
              }}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-left text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Icon name="LogOut" size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>



      <div className="pt-14">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
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

      {/* Review Modal */}
      {showReviewForm && selectedBookingForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Rate Your Experience
              </h2>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedBookingForReview(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="X" size={24} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-medium text-foreground mb-1">
                  {selectedBookingForReview.service_title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedBookingForReview.business_name}
                </p>
              </div>
              
              <ReviewForm
                serviceId={selectedBookingForReview.service_id}
                bookingId={selectedBookingForReview.id}
                onSubmit={async (review) => {
                  setShowReviewForm(false);
                  setSelectedBookingForReview(null);
                  await fetchMyBookings();
                }}
                onCancel={() => {
                  setShowReviewForm(false);
                  setSelectedBookingForReview(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelerDashboard;