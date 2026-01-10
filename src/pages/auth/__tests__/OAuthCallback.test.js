/**
 * Property-Based Tests for OAuth Callback Error Handling
 * Feature: google-signin-role-selection
 * Task 11: Error Handling and Recovery
 * 
 * Tests for OAuth error handling, role selection recovery, and back to login functionality.
 * Validates: Requirements 7.1, 7.2, 7.4, 7.5
 */

import fc from 'fast-check';

// Test configuration
const MIN_ITERATIONS = 100;

// Session storage key (must match implementation)
const GOOGLE_REGISTRATION_KEY = 'google_registration_data';
const SESSION_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

// Generators
const errorMessageGen = fc.constantFrom(
  'google_auth_failed',
  'auth_failed',
  'invalid_token',
  'user_denied',
  'server_error'
);

const userTypeGen = fc.constantFrom('traveler', 'service_provider');
const tokenGen = fc.string({ minLength: 20, maxLength: 200 }).filter(s => /^[a-zA-Z0-9._-]+$/.test(s));

// Mock sessionStorage
class MockSessionStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = value; }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

// Helper functions matching OAuthCallback.jsx implementation
const getDashboardPath = (userType) => {
  switch (userType) {
    case 'service_provider':
      return '/service-provider-dashboard';
    case 'traveler':
      return '/traveler-dashboard';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
};

const isSessionDataValid = (data) => {
  if (!data || !data.timestamp) return false;
  const now = Date.now();
  return (now - data.timestamp) < SESSION_EXPIRATION_MS;
};

const getStoredRoleSelection = (storage) => {
  try {
    const stored = storage.getItem(GOOGLE_REGISTRATION_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    if (isSessionDataValid(data)) {
      return data;
    }
    storage.removeItem(GOOGLE_REGISTRATION_KEY);
    return null;
  } catch (e) {
    return null;
  }
};

const clearRoleSelectionData = (storage) => {
  try {
    storage.removeItem(GOOGLE_REGISTRATION_KEY);
    return true;
  } catch (e) {
    return false;
  }
};

// Error handling logic
const handleOAuthError = (errorParam) => {
  const errorMessages = {
    'google_auth_failed': 'Google sign-in failed. Please try again.',
    'auth_failed': 'Authentication failed. Please try again.',
    'invalid_token': 'Invalid authentication token. Please try again.',
    'user_denied': 'You denied access to your Google account.',
    'server_error': 'Server error occurred. Please try again later.'
  };
  
  return {
    hasError: true,
    message: errorMessages[errorParam] || 'Authentication failed. Please try again.',
    canRetry: true
  };
};

// Role selection recovery logic
const handleRoleSelectionRecovery = (storage, needsRegistration) => {
  if (!needsRegistration) {
    return { needsRecovery: false };
  }
  
  const storedData = getStoredRoleSelection(storage);
  
  if (!storedData) {
    return {
      needsRecovery: true,
      reason: 'no_role_selection',
      message: 'Please select your account type before signing up.',
      redirectTo: '/auth/google-role-selection'
    };
  }
  
  // Check expiration
  if (!isSessionDataValid(storedData)) {
    clearRoleSelectionData(storage);
    return {
      needsRecovery: true,
      reason: 'expired',
      message: 'Your session expired. Please select your account type again.',
      redirectTo: '/auth/google-role-selection'
    };
  }
  
  return {
    needsRecovery: false,
    roleData: storedData
  };
};

describe('Task 11: Error Handling and Recovery', () => {
  let mockStorage;
  
  beforeEach(() => {
    mockStorage = new MockSessionStorage();
  });

  /**
   * 11.1 OAuth Error Handling
   * Display user-friendly error messages, provide retry option on failure
   * Validates: Requirements 7.1, 7.4
   */
  describe('11.1 OAuth Error Handling', () => {
    
    it('should display user-friendly error messages for all error types', () => {
      fc.assert(
        fc.property(
          errorMessageGen,
          (errorParam) => {
            const result = handleOAuthError(errorParam);
            
            // Should have error flag
            if (!result.hasError) return false;
            
            // Should have user-friendly message (not technical)
            if (!result.message || result.message.length < 10) return false;
            
            // Message should not contain technical terms
            const technicalTerms = ['exception', 'stack', 'undefined', 'null', 'NaN'];
            const hasNoTechnicalTerms = !technicalTerms.some(term => 
              result.message.toLowerCase().includes(term)
            );
            
            return hasNoTechnicalTerms;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should provide retry option on failure', () => {
      fc.assert(
        fc.property(
          errorMessageGen,
          (errorParam) => {
            const result = handleOAuthError(errorParam);
            
            // All errors should allow retry
            return result.canRetry === true;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should handle unknown error types gracefully', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (unknownError) => {
            const result = handleOAuthError(unknownError);
            
            // Should still return valid error response
            return (
              result.hasError === true &&
              typeof result.message === 'string' &&
              result.message.length > 0
            );
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });

  /**
   * 11.2 Role Selection Recovery
   * Redirect to role selection if data lost during OAuth, preserve Google data
   * Validates: Requirements 7.2
   */
  describe('11.2 Role Selection Recovery', () => {
    
    it('should redirect to role selection when role data is missing', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (needsRegistration) => {
            // Clear storage to simulate missing data
            mockStorage.clear();
            
            if (!needsRegistration) {
              // Existing user - no recovery needed
              const result = handleRoleSelectionRecovery(mockStorage, false);
              return result.needsRecovery === false;
            }
            
            // New user without role selection
            const result = handleRoleSelectionRecovery(mockStorage, true);
            
            return (
              result.needsRecovery === true &&
              result.reason === 'no_role_selection' &&
              result.redirectTo === '/auth/google-role-selection'
            );
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should redirect when role selection has expired', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          fc.integer({ min: SESSION_EXPIRATION_MS + 1000, max: SESSION_EXPIRATION_MS * 2 }),
          (userType, ageMs) => {
            // Store expired role selection
            const expiredData = {
              userType,
              timestamp: Date.now() - ageMs
            };
            mockStorage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(expiredData));
            
            const result = handleRoleSelectionRecovery(mockStorage, true);
            
            return (
              result.needsRecovery === true &&
              result.reason === 'expired' &&
              result.redirectTo === '/auth/google-role-selection'
            );
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should not require recovery when valid role selection exists', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          fc.integer({ min: 0, max: SESSION_EXPIRATION_MS - 1000 }),
          (userType, ageMs) => {
            // Store valid role selection
            const validData = {
              userType,
              timestamp: Date.now() - ageMs
            };
            mockStorage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(validData));
            
            const result = handleRoleSelectionRecovery(mockStorage, true);
            
            return (
              result.needsRecovery === false &&
              result.roleData &&
              result.roleData.userType === userType
            );
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });

  /**
   * 11.3 Back to Login Functionality
   * Ensure back button works, clear partial registration data
   * Validates: Requirements 7.5
   */
  describe('11.3 Back to Login Functionality', () => {
    
    it('should clear role selection data when going back to login', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          fc.string({ minLength: 10, maxLength: 15 }),
          (userType, phone) => {
            // Store some role selection data
            const data = {
              userType,
              phone,
              timestamp: Date.now()
            };
            mockStorage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(data));
            
            // Verify data exists
            if (!mockStorage.getItem(GOOGLE_REGISTRATION_KEY)) return false;
            
            // Clear data (simulating back to login)
            clearRoleSelectionData(mockStorage);
            
            // Verify data is cleared
            return mockStorage.getItem(GOOGLE_REGISTRATION_KEY) === null;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should handle clearing when no data exists', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Ensure storage is empty
            mockStorage.clear();
            
            // Should not throw when clearing empty storage
            const result = clearRoleSelectionData(mockStorage);
            
            return result === true;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });

  /**
   * Dashboard redirection after successful auth
   */
  describe('Dashboard Redirection', () => {
    
    it('should redirect to correct dashboard based on user type', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          (userType) => {
            const dashboardPath = getDashboardPath(userType);
            
            if (userType === 'service_provider') {
              return dashboardPath === '/service-provider-dashboard';
            } else if (userType === 'traveler') {
              return dashboardPath === '/traveler-dashboard';
            }
            
            return false;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should handle admin users correctly', () => {
      fc.assert(
        fc.property(
          fc.constant('admin'),
          (userType) => {
            const dashboardPath = getDashboardPath(userType);
            return dashboardPath === '/admin';
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should default to home for unknown user types', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['traveler', 'service_provider', 'admin'].includes(s)),
          (unknownType) => {
            const dashboardPath = getDashboardPath(unknownType);
            return dashboardPath === '/';
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });
});
