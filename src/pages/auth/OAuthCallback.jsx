import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../utils/api';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  /**
   * Get the appropriate dashboard path based on user role
   * Implements role-based redirection as per Requirements 3.2, 3.3
   */
  const getDashboardPath = (userType) => {
    switch (userType) {
      case 'service_provider':
        return '/service-provider-dashboard';
      case 'traveler':
        return '/traveler-dashboard';
      case 'admin':
        return '/admin';
      default:
        // Default to home for unknown roles
        console.warn('⚠️ Unknown user type:', userType, '- redirecting to home');
        return '/';
    }
  };

  /**
   * Clear any stored role selection data from sessionStorage
   * Called after successful registration/login
   */
  const clearRoleSelectionData = () => {
    try {
      sessionStorage.removeItem('google_registration_data');
      console.log('🧹 Cleared role selection data from session');
    } catch (e) {
      console.warn('Could not clear session storage:', e);
    }
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');
        const needsRegistration = searchParams.get('needsRegistration');

        // Handle OAuth errors
        if (errorParam) {
          console.error('❌ OAuth error param:', errorParam);
          setError('Authentication failed. Please try again.');
          setStatus('error');
          return;
        }

        // Check if this is a new user needing registration
        if (needsRegistration === 'true') {
          console.log('📝 New user needs registration - checking for role selection');
          
          // Check if role was selected before OAuth
          const storedData = sessionStorage.getItem('google_registration_data');
          if (!storedData) {
            console.log('⚠️ No role selection found - redirecting to role selection');
            setError('Please select your account type before signing up.');
            setStatus('error');
            // Redirect to role selection after a short delay
            setTimeout(() => {
              navigate('/google-role-selection', { 
                state: { 
                  returnFromOAuth: true,
                  googleData: searchParams.get('googleData') 
                }
              });
            }, 2000);
            return;
          }

          // Parse stored role data
          const roleData = JSON.parse(storedData);
          
          // Check if role selection has expired (10 minutes)
          const TEN_MINUTES = 10 * 60 * 1000;
          if (Date.now() - roleData.timestamp > TEN_MINUTES) {
            console.log('⚠️ Role selection expired - redirecting to role selection');
            clearRoleSelectionData();
            setError('Your session expired. Please select your account type again.');
            setStatus('error');
            setTimeout(() => {
              navigate('/google-role-selection');
            }, 2000);
            return;
          }

          console.log('✅ Role selection found:', roleData.userType);
          // Continue with registration flow - the backend should handle this
        }

        // Validate token presence
        if (!token) {
          setError('No authentication token received.');
          setStatus('error');
          return;
        }

        console.log('🔐 OAuth callback - verifying token...');

        // Verify token and get user data
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.user) {
            // Store user with token
            const userWithToken = { ...data.user, token };
            localStorage.setItem('isafari_user', JSON.stringify(userWithToken));
            
            // Clear role selection data after successful login
            clearRoleSelectionData();
            
            console.log('✅ OAuth login successful:', data.user.email, '- Role:', data.user.userType);
            setStatus('success');
            
            // Get the correct dashboard path based on user role
            const dashboardPath = getDashboardPath(data.user.userType);
            console.log('🚀 Redirecting to:', dashboardPath);
            
            // Redirect based on user type
            setTimeout(() => {
              navigate(dashboardPath);
            }, 1500);
          } else {
            throw new Error('Invalid user data received');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to verify authentication');
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        setError(error.message || 'Authentication verification failed. Please try logging in again.');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/login');
  };

  const handleBackToLogin = () => {
    clearRoleSelectionData();
    navigate('/login');
  };

  // Get user-friendly dashboard name for display
  const getDashboardDisplayName = () => {
    const storedUser = localStorage.getItem('isafari_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        switch (user.userType) {
          case 'service_provider':
            return 'Service Provider Dashboard';
          case 'traveler':
            return 'Traveler Dashboard';
          case 'admin':
            return 'Admin Dashboard';
          default:
            return 'your dashboard';
        }
      } catch (e) {
        return 'your dashboard';
      }
    }
    return 'your dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
            <p className="text-gray-600">Please wait while we verify your account...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">Welcome Back!</h2>
            <p className="text-gray-600">Redirecting you to {getDashboardDisplayName()}...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToLogin}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
