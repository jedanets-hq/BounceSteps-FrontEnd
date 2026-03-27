import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { API_URL } from '../../utils/api';
import LocationSelector from '../../components/LocationSelector';
import { serviceCategories as allServiceCategories } from '../../data/locations';
import Header from '../../components/ui/Header';

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

/**
 * Safely decode Base64 string (handles URL-safe base64 and padding)
 * @param {string} str - Base64 encoded string
 * @returns {string} - Decoded string
 */
const safeBase64Decode = (str) => {
  // CRITICAL: Convert spaces back to '+' (URL query strings convert '+' to space)
  let base64 = str.replace(/ /g, '+');
  // Replace URL-safe base64 characters back to standard base64
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  
  // Decode using atob
  try {
    return atob(base64);
  } catch (e) {
    // Try decodeURIComponent first for URL-encoded base64
    try {
      return atob(decodeURIComponent(base64));
    } catch (e2) {
      throw new Error('Base64 decode failed');
    }
  }
};

/**
 * Safely parse Google data from URL parameter with multiple decoding strategies
 * @param {string} googleDataParam - URL encoded Google data
 * @returns {Object|null} - Parsed Google data or null
 */
const parseGoogleData = (googleDataParam) => {
  if (!googleDataParam) return null;
  
  console.log('🔍 Attempting to parse googleData, length:', googleDataParam.length);
  console.log('🔍 First 50 chars:', googleDataParam.substring(0, 50));
  
  // CRITICAL FIX: Check for duplicated base64 data (bug where data is repeated twice)
  // This happens when the same base64 string is concatenated with itself
  const checkForDuplicatedData = (param) => {
    // If length is even and > 100, check if first half equals second half
    if (param.length > 100 && param.length % 2 === 0) {
      const halfLength = param.length / 2;
      const firstHalf = param.substring(0, halfLength);
      const secondHalf = param.substring(halfLength);
      if (firstHalf === secondHalf) {
        console.log('⚠️ Detected duplicated base64 data, using first half');
        return firstHalf;
      }
    }
    return param;
  };
  
  // Clean the parameter first
  let cleanParam = checkForDuplicatedData(googleDataParam);
  
  const strategies = [
    // Strategy 1: Base64 decode FIRST (backend uses base64 encoding)
    () => {
      const decoded = safeBase64Decode(cleanParam);
      const result = JSON.parse(decoded);
      console.log('✅ Strategy 1 (base64 decode) worked');
      return result;
    },
    // Strategy 2: URL decode then Base64 decode
    () => {
      const urlDecoded = decodeURIComponent(cleanParam);
      const decoded = safeBase64Decode(urlDecoded);
      const result = JSON.parse(decoded);
      console.log('✅ Strategy 2 (URL + base64 decode) worked');
      return result;
    },
    // Strategy 3: Direct parse (browser may have already decoded)
    () => {
      const result = JSON.parse(cleanParam);
      console.log('✅ Strategy 3 (direct parse) worked');
      return result;
    },
    // Strategy 4: Single decodeURIComponent
    () => {
      const decoded = decodeURIComponent(cleanParam);
      const result = JSON.parse(decoded);
      console.log('✅ Strategy 4 (single decode) worked');
      return result;
    },
    // Strategy 5: Double decodeURIComponent (for double-encoded URLs)
    () => {
      const decoded = decodeURIComponent(decodeURIComponent(cleanParam));
      const result = JSON.parse(decoded);
      console.log('✅ Strategy 5 (double decode) worked');
      return result;
    },
    // Strategy 6: Manual URL character replacement
    () => {
      const decoded = cleanParam
        .replace(/%7B/gi, '{')
        .replace(/%7D/gi, '}')
        .replace(/%22/gi, '"')
        .replace(/%3A/gi, ':')
        .replace(/%2C/gi, ',')
        .replace(/%40/gi, '@')
        .replace(/%2F/gi, '/')
        .replace(/%3D/gi, '=')
        .replace(/%20/gi, ' ')
        .replace(/\+/g, ' ');
      const result = JSON.parse(decoded);
      console.log('✅ Strategy 6 (manual replace) worked');
      return result;
    },
    // Strategy 7: Try with original param if clean param failed (fallback)
    () => {
      if (cleanParam !== googleDataParam) {
        const decoded = safeBase64Decode(googleDataParam);
        // Try to extract valid JSON from potentially corrupted data
        const jsonMatch = decoded.match(/\{[^}]+\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('✅ Strategy 7 (extract JSON from corrupted data) worked');
          return result;
        }
      }
      throw new Error('No valid JSON found');
    }
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = strategies[i]();
      if (result && result.email && result.googleId) {
        console.log('✅ Google data parsed successfully:', result.email);
        return result;
      }
    } catch (e) {
      console.log(`⚠️ Strategy ${i + 1} failed:`, e.message);
    }
  }
  
  console.error('❌ All parsing strategies failed');
  console.error('❌ Raw data preview:', googleDataParam.substring(0, 100));
  return null;
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
  // Name fields for traveler
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isNewUserFlow, setIsNewUserFlow] = useState(false);
  // CRITICAL: Track initialization state to prevent blank screen
  const [isInitialized, setIsInitialized] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Service Provider specific fields - Location and Categories
  const [serviceLocation, setServiceLocation] = useState({ region: '', district: '', ward: '', street: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [description, setDescription] = useState('');

  // Helper function for auto-completing registration
  const autoCompleteRegistration = async (gData, sData) => {
    try {
      // Build registration object correctly based on role
      const role = sData.userType === 'service_provider' ? 'provider' : 'traveler';
      
      console.log('🎯 Auto-completing registration for:', gData.email);
      
      const response = await fetch(`${API_URL}/auth/google/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          googleId: gData.googleId,
          email: gData.email,
          firstName: sData.firstName || gData.firstName,
          lastName: sData.lastName || gData.lastName,
          avatarUrl: gData.avatarUrl,
          userType: sData.userType,
          phone: sData.phone,
          dateOfBirth: sData.dateOfBirth,
          companyName: sData.companyName,
          serviceLocation: sData.serviceLocation,
          serviceCategories: sData.serviceCategories,
          locationData: sData.locationData,
          description: sData.description
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Auto-registration successful!');
        clearRoleSelection();
        
        const userWithToken = { ...data.user, token: data.token };
        localStorage.setItem('isafari_user', JSON.stringify(userWithToken));
        
        // Notify AuthContext
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'isafari_user',
          newValue: JSON.stringify(userWithToken),
          url: window.location.href
        }));
        
        // Use longer delay to ensure localStorage is fully committed
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Redirect to home as requested
        window.location.href = '/';
      } else {
        console.error('❌ Auto-registration failed:', data.message);
        setError(data.message || 'Registration failed. Please try again.');
        setIsLoading(false);
        setIsInitialized(true);
        // Restore form state from stored data so user can retry
        setSelectedRole(role);
        setPhone(sData.phone || '');
        setDateOfBirth(sData.dateOfBirth || '');
        if (role === 'provider') {
          setCompanyName(sData.companyName || '');
          if (sData.locationData) setServiceLocation(sData.locationData);
          if (sData.serviceCategories) setSelectedCategories(sData.serviceCategories);
          if (sData.description) setDescription(sData.description);
        } else {
          if (sData.firstName) setFirstName(sData.firstName);
          if (sData.lastName) setLastName(sData.lastName);
        }
        // Show form so user can retry - but keep googleData flow (NOT newUserFlow)
        setIsNewUserFlow(false);
      }
    } catch (err) {
      console.error('❌ Auto-registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
      setIsInitialized(true);
      setIsNewUserFlow(false);
    }
  };

  // Initialize component - runs once on mount
  useEffect(() => {
    console.log('🔍 GoogleRoleSelection mounted');
    
    // Flag to prevent double initialization
    let isSubscribed = true;
    
    // CRITICAL: Set a maximum timeout to prevent infinite loading
    const maxTimeoutId = setTimeout(() => {
      if (!isSubscribed) return;
      if (!isInitialized) {
        setIsNewUserFlow(true);
        setError('');
        setIsInitialized(true);
        setIsLoading(false);
      }
    }, 5000);
    
    const initializeComponent = async () => {
      try {
        const newUser = searchParams.get('newUser');
        if (newUser === 'true') {
          if (!isSubscribed) return;
          setIsNewUserFlow(true);
          
          const storedData = getStoredRoleSelection();
          if (storedData) {
            setSelectedRole(storedData.userType === 'service_provider' ? 'provider' : 'traveler');
            setPhone(storedData.phone || '');
            setCompanyName(storedData.companyName || '');
            if (storedData.firstName) setFirstName(storedData.firstName);
            if (storedData.lastName) setLastName(storedData.lastName);
            if (storedData.locationData) setServiceLocation(storedData.locationData);
            if (storedData.serviceCategories && storedData.serviceCategories.length > 0) {
              setSelectedCategories(storedData.serviceCategories);
            }
            if (storedData.description) setDescription(storedData.description);
          }
          setIsInitialized(true);
          return;
        }

        const googleDataParam = searchParams.get('googleData');
        if (googleDataParam) {
          const parsedData = parseGoogleData(googleDataParam);
          
          if (parsedData) {
            if (!isSubscribed) return;
            setGoogleData(parsedData);
            
            const storedData = getStoredRoleSelection();
            if (storedData && storedData.userType && storedData.phone) {
              setIsInitialized(true);
              setIsLoading(true);
              autoCompleteRegistration(parsedData, storedData);
              return;
            } else {
              if (storedData) {
                setSelectedRole(storedData.userType === 'service_provider' ? 'provider' : 'traveler');
                setPhone(storedData.phone || '');
                setCompanyName(storedData.companyName || '');
                if (storedData.firstName) setFirstName(storedData.firstName);
                if (storedData.lastName) setLastName(storedData.lastName);
                if (storedData.locationData) setServiceLocation(storedData.locationData);
                if (storedData.serviceCategories && storedData.serviceCategories.length > 0) {
                  setSelectedCategories(storedData.serviceCategories);
                }
                if (storedData.description) setDescription(storedData.description);
              }
              setIsInitialized(true);
            }
          } else {
            if (!isSubscribed) return;
            setError('Unable to process Google sign-in data. Please try again.');
            setIsNewUserFlow(true);
            setIsInitialized(true);
          }
        } else {
          const storedData = getStoredRoleSelection();
          if (!isSubscribed) return;
          if (storedData) {
            setIsNewUserFlow(true);
            setSelectedRole(storedData.userType === 'service_provider' ? 'provider' : 'traveler');
            setPhone(storedData.phone || '');
            setCompanyName(storedData.companyName || '');
            if (storedData.firstName) setFirstName(storedData.firstName);
            if (storedData.lastName) setLastName(storedData.lastName);
            if (storedData.locationData) setServiceLocation(storedData.locationData);
            if (storedData.serviceCategories && storedData.serviceCategories.length > 0) {
              setSelectedCategories(storedData.serviceCategories);
            }
            if (storedData.description) setDescription(storedData.description);
            setError('Please complete the Google sign-in process.');
            setIsInitialized(true);
          } else {
            setIsNewUserFlow(true);
            setError('No registration data found. Please select your account type and try again.');
            setIsInitialized(true);
          }
        }
      } catch (err) {
        if (!isSubscribed) return;
        setIsNewUserFlow(true);
        setError('An error occurred. Please try signing up again.');
        setIsInitialized(true);
      }
    };

    setTimeout(initializeComponent, 100);
    
    return () => {
      isSubscribed = false;
      clearTimeout(maxTimeoutId);
    };
  }, [searchParams]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    
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
    if (selectedRole === 'traveler') {
      if (!firstName.trim()) {
        setError('First name is required');
        return;
      }
      if (!lastName.trim()) {
        setError('Last name is required');
        return;
      }
    }
    if (selectedRole === 'provider') {
      if (!serviceLocation.region || !serviceLocation.district) {
        setError('Please select your service location (Region and District are required)');
        return;
      }
      if (selectedCategories.length === 0) {
        setError('Please select at least one service category');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    const serviceLocationString = selectedRole === 'provider' 
      ? `${serviceLocation.street}, ${serviceLocation.ward}, ${serviceLocation.district}, ${serviceLocation.region}, Tanzania`
          .replace(/^, |, , /g, ', ').replace(/^, /, '').trim()
      : null;

    storeRoleSelection({
      userType: selectedRole === 'provider' ? 'service_provider' : 'traveler',
      phone,
      companyName: selectedRole === 'provider' ? companyName : null,
      firstName: selectedRole === 'traveler' ? firstName.trim() : null,
      lastName: selectedRole === 'traveler' ? lastName.trim() : null,
      dateOfBirth: dateOfBirth,
      serviceLocation: serviceLocationString,
      serviceCategories: selectedRole === 'provider' ? selectedCategories : [],
      locationData: selectedRole === 'provider' ? serviceLocation : null,
      description: selectedRole === 'provider' ? description : null
    });

    window.location.href = `${API_URL}/auth/google/register`;
  };

  const handleOAuthSubmit = async (e) => {
    e.preventDefault();
    
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
    if (selectedRole === 'traveler') {
      if (!firstName.trim()) {
        setError('First name is required');
        return;
      }
      if (!lastName.trim()) {
        setError('Last name is required');
        return;
      }
    }
    if (selectedRole === 'provider') {
      if (!serviceLocation.region || !serviceLocation.district) {
        setError('Please select your service location (Region and District are required)');
        return;
      }
      if (selectedCategories.length === 0) {
        setError('Please select at least one service category');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    // Strict age verification (18+)
    if (!dateOfBirth) {
      setError('Date of birth is required');
      setIsLoading(false);
      return;
    }

    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    if (calculateAge(dateOfBirth) < 18) {
      setError('You must be at least 18 years old to join iSafari Global.');
      setIsLoading(false);
      return;
    }

    try {
      const serviceLocationString = selectedRole === 'provider' 
        ? `${serviceLocation.street}, ${serviceLocation.ward}, ${serviceLocation.district}, ${serviceLocation.region}, Tanzania`
            .replace(/^, |, , /g, ', ').replace(/^, /, '').trim()
        : undefined;

      const finalFirstName = selectedRole === 'traveler' ? firstName.trim() : googleData.firstName;
      const finalLastName = selectedRole === 'traveler' ? lastName.trim() : googleData.lastName;

      const response = await fetch(`${API_URL}/auth/google/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          googleId: googleData.googleId,
          email: googleData.email,
          firstName: finalFirstName,
          lastName: finalLastName,
          avatarUrl: googleData.avatarUrl,
          userType: selectedRole === 'provider' ? 'service_provider' : 'traveler',
          phone: phone,
          dateOfBirth: dateOfBirth,
          companyName: selectedRole === 'provider' ? companyName : undefined,
          serviceLocation: serviceLocationString,
          serviceCategories: selectedRole === 'provider' ? selectedCategories : undefined,
          locationData: selectedRole === 'provider' ? serviceLocation : undefined,
          description: selectedRole === 'provider' ? description : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        clearRoleSelection();
        const userWithToken = { ...data.user, token: data.token };
        
        try {
          localStorage.setItem('isafari_user', JSON.stringify(userWithToken));
          
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'isafari_user',
            newValue: JSON.stringify(userWithToken),
            url: window.location.href
          }));
        } catch (storageError) {
          console.error('❌ localStorage error:', storageError);
          setError('Failed to save login data. Please try again.');
          setIsLoading(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // ALWAYS redirect to home page as requested
        window.location.href = '/';
      } else {
        setError(data.message || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration data...</p>
        </div>
      </div>
    );
  }

  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{googleData ? 'Creating your account...' : 'Processing...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              {googleData?.avatarUrl && (
                <img 
                  src={googleData.avatarUrl} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-primary/20"
                />
              )}
              <h1 className="text-3xl font-display font-medium text-foreground mb-2">
                {googleData ? `Welcome, ${googleData.firstName}!` : 'Complete Your Profile'}
              </h1>
              <p className="text-muted-foreground">
                Please tell us how you'll be using iSafari Global
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center">
                <Icon name="AlertCircle" size={20} className="mr-3 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={isNewUserFlow ? handleNewUserSubmit : handleOAuthSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('traveler')}
                  className={`p-6 rounded-xl border-2 transition-all text-left flex flex-col items-center text-center space-y-3 ${
                    selectedRole === 'traveler'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`p-3 rounded-full ${selectedRole === 'traveler' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon name="Suitcase" size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">I'm a Traveler</h3>
                    <p className="text-xs text-muted-foreground mt-1">I want to discover and book authentic experiences</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('provider')}
                  className={`p-6 rounded-xl border-2 transition-all text-left flex flex-col items-center text-center space-y-3 ${
                    selectedRole === 'provider'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`p-3 rounded-full ${selectedRole === 'provider' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon name="Store" size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">I'm a Service Provider</h3>
                    <p className="text-xs text-muted-foreground mt-1">I want to list my services and manage bookings</p>
                  </div>
                </button>
              </div>

              {selectedRole === 'provider' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business / Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your business name"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required={selectedRole === 'provider'}
                  />
                </div>
              )}

              {selectedRole === 'traveler' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required={selectedRole === 'traveler'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required={selectedRole === 'traveler'}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

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
              </div>

              {selectedRole === 'provider' && (
                <div className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-medium mb-4 flex items-center"><Icon name="MapPin" size={18} className="mr-2" /> Service Location *</h4>
                    <LocationSelector value={serviceLocation} onChange={setServiceLocation} required={true} showWard={true} showStreet={true} />
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-medium mb-4 flex items-center"><Icon name="Briefcase" size={18} className="mr-2" /> Service Categories *</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(allServiceCategories).map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category])}
                          className={`p-2 text-xs rounded border transition-all ${selectedCategories.includes(category) ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-background border-border hover:border-secondary'}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Business Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Tell us about your business..." />
                  </div>
                </div>
              )}

              <Button type="submit" fullWidth disabled={isLoading || !selectedRole} className="mt-6">
                {isLoading ? <><Icon name="Loader2" size={20} className="animate-spin mr-2" /> Processing...</> : (isNewUserFlow ? 'Continue with Google' : 'Complete Registration')}
              </Button>

              <div className="text-center">
                <button type="button" onClick={() => navigate('/login')} className="text-sm text-muted-foreground hover:text-primary">← Back to Login</button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
              Powered by <span className="font-semibold text-primary">JEDA NETWORKS</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GoogleRoleSelection;
