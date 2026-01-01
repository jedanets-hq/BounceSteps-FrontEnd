import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../utils/api';
import migrateLocalStorageToDatabase from '../utils/migrateLocalStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  
  // Get navigate hook safely
  let navigate;
  try {
    navigate = useNavigate();
  } catch (err) {
    console.warn('useNavigate hook not available:', err);
    navigate = null;
  }

  // Check for existing user session on app load
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔄 [AuthContext] Initializing...');
      // Check if user is already logged in
      const savedUser = localStorage.getItem('isafari_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && userData.token) {
            console.log('✅ [AuthContext] User session restored:', userData.email);
            setUser(userData);
          }
        } catch (error) {
          console.error('❌ [AuthContext] Error parsing saved user:', error);
          localStorage.removeItem('isafari_user');
        }
      } else {
        console.log('ℹ️ [AuthContext] No saved user session');
      }
      setIsLoading(false);
      setIsInitialized(true);
      console.log('✅ [AuthContext] Initialization complete');
    };

    initializeAuth();
  }, []);

  // Set error message and clear it after 5 seconds
  const setErrorWithTimeout = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Register new user
  const register = async (formData, userType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userType: userType,
        // Service provider specific fields
        ...(userType === 'service_provider' && {
          companyName: formData.companyName,
          businessType: formData.businessType,
          description: formData.description,
          serviceLocation: formData.serviceLocation,
          serviceCategories: formData.serviceCategories,
          locationData: formData.locationData
        })
      };

      const response = await authAPI.register(userData);
      
      if (response.success) {
        const userWithToken = { ...response.user, token: response.token };
        setUser(userWithToken);
        localStorage.setItem('isafari_user', JSON.stringify(userWithToken));
        return { success: true, user: userWithToken };
      } else {
        const errorMsg = response.message || 'Registration failed';
        setErrorWithTimeout(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error.message || 'Registration failed. Please try again.';
      setErrorWithTimeout(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const userWithToken = { ...response.user, token: response.token };
        setUser(userWithToken);
        localStorage.setItem('isafari_user', JSON.stringify(userWithToken));
        
        // Migrate localStorage data to database
        setTimeout(() => {
          migrateLocalStorageToDatabase().catch(err => 
            console.error('Migration error (non-blocking):', err)
          );
        }, 500);
        
        return { success: true, user: userWithToken };
      } else {
        setErrorWithTimeout(response.message || 'Invalid email or password');
        return { success: false, error: response.message };
      }
    } catch (error) {
      setErrorWithTimeout('Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth login
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Redirect to Google OAuth
      authAPI.googleLogin();
      return { success: true };
    } catch (error) {
      setErrorWithTimeout('Google login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Complete Google registration
  const completeGoogleRegistration = async (userType, phone) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.completeGoogleRegistration(userType, phone);
      
      if (response.success) {
        const userWithToken = { ...response.user, token: response.token };
        setUser(userWithToken);
        localStorage.setItem('isafari_user', JSON.stringify(userWithToken));
        
        // Migrate localStorage data to database
        setTimeout(() => {
          migrateLocalStorageToDatabase().catch(err => 
            console.error('Migration error (non-blocking):', err)
          );
        }, 500);
        
        return { success: true, user: userWithToken };
      } else {
        setErrorWithTimeout(response.message || 'Registration completion failed');
        return { success: false, error: response.message };
      }
    } catch (error) {
      setErrorWithTimeout('Registration completion failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Get temporary Google user data
  const getTempGoogleUser = async () => {
    try {
      const response = await authAPI.getTempGoogleUser();
      return response.success ? response.user : null;
    } catch (error) {
      console.error('Error getting temp Google user:', error);
      return null;
    }
  };

  // Logout user - Clear session and redirect to login
  const logout = () => {
    // Clear user state
    setUser(null);
    setError(null);
    
    // Clear all localStorage data related to user session
    localStorage.removeItem('isafari_user');
    localStorage.removeItem('isafari_cart');
    localStorage.removeItem('isafari_preferences');
    localStorage.removeItem('isafari_bookings');
    localStorage.removeItem('isafari_favorites');
    localStorage.removeItem('isafari_search_history');
    localStorage.removeItem('isafari_notifications');
    localStorage.removeItem('isafari_documents');
    localStorage.removeItem('isafari_expenses');
    localStorage.removeItem('isafari_services');
    localStorage.removeItem('isafari_earnings');
    localStorage.removeItem('isafari_analytics');
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    // Navigate to login page using React Router or fallback
    if (navigate) {
      navigate('/login', { replace: true });
    } else {
      // Fallback for cases where navigate is not available
      window.location.href = '/login';
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await userAPI.updateProfile(updates);
      
      if (response.success) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        localStorage.setItem('isafari_user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        setErrorWithTimeout(response.message || 'Failed to update profile');
        return { success: false, error: response.message };
      }
    } catch (error) {
      setErrorWithTimeout('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  // Switch user type between traveler and provider
  const switchUserType = (newType) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const updatedUser = { ...user, userType: newType };
      setUser(updatedUser);
      localStorage.setItem('isafari_user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      setErrorWithTimeout('Failed to switch user type');
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.userType === role;
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const value = {
    user,
    isLoading,
    isInitialized,
    error,
    register,
    login,
    loginWithGoogle,
    completeGoogleRegistration,
    getTempGoogleUser,
    logout,
    updateProfile,
    switchUserType,
    hasRole,
    isAuthenticated,
    setError: setErrorWithTimeout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
