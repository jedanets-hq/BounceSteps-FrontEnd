import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { API_URL } from '../../utils/api';

// Session storage key and expiration time (10 minutes)
const GOOGLE_REGISTRATION_KEY = 'google_registration_data';
const SESSION_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Validates if stored session data is still valid (not expired)
 * @param {Object} data - Session data with timestamp
 * @returns {boolean} - True if data is valid and not expired
 */
const isSessionDataValid = (data) => {
  if (!data || !data.timestamp) return false;
  const now = Date.now();
  return (now - data.timestamp) < SESSION_EXPIRATION_MS;
};

/**
 * Stores role selection data in sessionStorage with timestamp
 * @param {Object} data - Role selection data
 */
const storeRoleSelection = (data) => {
  const dataWithTimestamp = {
    ...data,
    timestamp: Date.now()
  };
  sessionStorage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(dataWithTimestamp));
};

/**
 * Retrieves and validates role selection from sessionStorage
 * @returns {Object|null} - Valid session data or null
 */
const getStoredRoleSelection = () => {
  try {
    const stored = sessionStorage.getItem(GOOGLE_REGISTRATION_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    if (isSessionDataValid(data)) {
      return data;
    }
    // Clear expired data
    sessionStorage.removeItem(GOOGLE_REGISTRATION_KEY);
    return null;
  } catch (e) {
    console.error('Error reading session storage:', e);
    return null;
  }
};

/**
 * Clears role selection from sessionStorage
 */
const clearRoleSelection = () => {
  sessionStorage.removeItem(GOOGLE_REGISTRATION_KEY);
};

const GoogleRoleSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleData, setGoogleData] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isNewUserFlow, setIsNewUserFlow] = useState(false);

  useEffect(() => {
    // Check if this is a new user flow (from "Sign up with Google" button)
    const newUser = searchParams.get('newUser');
    if (newUser === 'true') {
      setIsNewUserFlow(true);
      
      // Check for previously stored role selection (in case of OAuth redirect back)
      const storedData = getStoredRoleSelection();
      if (storedData) {
        setSelectedRole(storedData.userType === 'service_provider' ? 'provider' : 'traveler');
        setPhone(storedData.phone || '');
        setCompanyName(storedData.companyName || '');
      }
      return;
    }

    // Get Google data from URL params (from OAuth callback)
    const googleDataParam = searchParams.get('googleData');
    if (googleDataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(googleDataParam));
        setGoogleData(data);
        
        // Check for stored role selection from before OAuth
        const storedData = getStoredRoleSelection();
        if (storedData) {
          setSelectedRole(storedData.userType === 'service_provider' ? 'provider' : 'traveler');
          setPhone(storedData.phone || '');
          setCompanyName(storedData.companyName || '');
        }
      } catch (e) {
        console.error('Error parsing Google data:', e);
        setError('Invalid Google data. Please try again.');
      }
    } else {
      // No Google data and not new user flow - check if role was lost during OAuth
      const storedData = getStoredRoleSelection();
      if (storedData) {
        // Role data exists but Google data is missing - redirect to start OAuth again
        setIsNewUserFlow(true);
        setSelectedRole(storedData.userType === 'service_provider' ? 'provider' : 'traveler');
        setPhone(storedData.phone || '');
        setCompanyName(storedData.companyName || '');
        setError('Please complete the Google sign-in process.');
      } else {
        // No data at all - redirect to login
        setError('No registration data found. Please try signing in again.');
      }
    }
  }, [searchParams]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  // Handle new user flow - redirect to Google OAuth after role selection
  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    
    // Validate role selection is mandatory
    if (!selectedRole) {
      setError('Please select how you want to use iSafari Global');
      return;
    }

    if (!phone) {
      setError('Phone number is required');
      return;
    }

    if (selectedRole === 'provider' && !companyName) {
      setError('Company/Business name is required for service providers');
      return;
    }

    setIsLoading(true);
    setError('');

    // Store selection in sessionStorage with timestamp for after OAuth
    storeRoleSelection({
      userType: selectedRole === 'provider' ? 'service_provider' : 'traveler',
      phone,
      companyName: selectedRole === 'provider' ? companyName : null
    });

    // Redirect to Google OAuth
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://isafarinetworkglobal-2.onrender.com/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  // Handle OAuth callback flow - complete registration
  const handleOAuthSubmit = async (e) => {
    e.preventDefault();
    
    // Validate role selection is mandatory
    if (!selectedRole) {
      setError('Please select how you want to use iSafari Global');
      return;
    }

    if (!phone) {
      setError('Phone number is required');
      return;
    }

    if (selectedRole === 'provider' && !companyName) {
      setError('Company/Business name is required for service providers');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Register the Google user with selected role
      const response = await fetch(`${API_URL}/auth/google/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          googleId: googleData.googleId,
          email: googleData.email,
          firstName: googleData.firstName,
          lastName: googleData.lastName,
          avatarUrl: googleData.avatarUrl,
          userType: selectedRole === 'provider' ? 'service_provider' : 'traveler',
          phone: phone,
          companyName: selectedRole === 'provider' ? companyName : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        // Clear session storage after successful registration
        clearRoleSelection();
        
        // Store user data and token
        const userWithToken = { ...data.user, token: data.token };
        localStorage.setItem('isafari_user', JSON.stringify(userWithToken));
        
        // Navigate to appropriate dashboard based on role
        if (selectedRole === 'provider') {
          navigate('/service-provider-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!isNewUserFlow && !googleData && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              {googleData?.avatarUrl && (
                <img 
                  src={googleData.avatarUrl} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-primary/20"
                />
              )}
              {isNewUserFlow ? (
                <>
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-primary/10 flex items-center justify-center">
                    <svg className="w-10 h-10" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <h1 className="text-3xl font-display font-medium text-foreground mb-2">
                    Sign up with Google
                  </h1>
                  <p className="text-muted-foreground">
                    Choose your account type and provide your details to get started
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-display font-medium text-foreground mb-2">
                    Welcome, {googleData?.firstName}!
                  </h1>
                  <p className="text-muted-foreground">
                    Complete your registration to start using iSafari Global
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Signed in as: {googleData?.email}
                  </p>
                </>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="AlertCircle" size={20} className="text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={isNewUserFlow ? handleNewUserSubmit : handleOAuthSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  How would you like to use iSafari Global?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('traveler')}
                    className={`p-6 border-2 rounded-lg transition-all text-left ${
                      selectedRole === 'traveler'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedRole === 'traveler' ? 'bg-primary/20' : 'bg-primary/10'
                      }`}>
                        <Icon name="User" size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Traveler</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Explore destinations, book services, and plan your perfect trip
                    </p>
                    {selectedRole === 'traveler' && (
                      <div className="mt-3 flex items-center text-primary text-sm">
                        <Icon name="Check" size={16} className="mr-1" />
                        Selected
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('provider')}
                    className={`p-6 border-2 rounded-lg transition-all text-left ${
                      selectedRole === 'provider'
                        ? 'border-secondary bg-secondary/5 shadow-md'
                        : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedRole === 'provider' ? 'bg-secondary/20' : 'bg-secondary/10'
                      }`}>
                        <Icon name="Briefcase" size={24} className="text-secondary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Service Provider</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      List your services and connect with travelers worldwide
                    </p>
                    {selectedRole === 'provider' && (
                      <div className="mt-3 flex items-center text-secondary text-sm">
                        <Icon name="Check" size={16} className="mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Company Name - Only for Service Providers */}
              {selectedRole === 'provider' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company / Business Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company or business name"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required={selectedRole === 'provider'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be displayed to travelers
                  </p>
                </div>
              )}

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 XXX XXX XXX"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll use this to contact you about your bookings
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                disabled={isLoading || !selectedRole}
                className="mt-6"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    {isNewUserFlow ? 'Connecting to Google...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {isNewUserFlow ? (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </>
                    ) : (
                      <>
                        <Icon name="UserPlus" size={20} />
                        Complete Registration
                      </>
                    )}
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  ← Back to Login
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Powered by <span className="font-semibold">JEDA NETWORKS</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GoogleRoleSelection;
