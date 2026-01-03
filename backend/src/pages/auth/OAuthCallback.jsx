import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../utils/api';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userType = searchParams.get('user_type');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Authentication failed. Please try again.');
          setStatus('error');
          return;
        }

        if (!token) {
          setError('No authentication token received.');
          setStatus('error');
          return;
        }

        // Store token and login user
        localStorage.setItem('token', token);
        
        // Verify token and get user data
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          await login(userData.user, token);
          
          setStatus('success');
          
          // Redirect based on user type
          setTimeout(() => {
            if (userType === 'service_provider') {
              navigate('/dashboard');
            } else if (userType === 'traveler') {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }, 2000);
        } else {
          throw new Error('Failed to verify authentication');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Authentication verification failed. Please try logging in again.');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, login]);

  const handleRetry = () => {
    navigate('/login');
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
            <h2 className="text-xl font-semibold mb-2 text-green-600">Authentication Successful!</h2>
            <p className="text-gray-600">Redirecting you to your dashboard...</p>
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
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
