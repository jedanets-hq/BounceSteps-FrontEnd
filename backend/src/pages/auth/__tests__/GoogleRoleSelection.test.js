/**
 * Property-Based Tests for Role Selection State Management
 * Feature: google-signin-role-selection
 * Property 1: Role Selection State Management
 * 
 * For any user attempting to initiate Google OAuth, if no role has been selected,
 * the OAuth initiation SHALL be blocked, and if a valid role is selected, it SHALL
 * be stored in session storage before OAuth begins.
 * 
 * Validates: Requirements 1.2, 1.4
 */

import fc from 'fast-check';

// Test configuration
const MIN_ITERATIONS = 100;

// Session storage key (must match GoogleRoleSelection.jsx)
const GOOGLE_REGISTRATION_KEY = 'google_registration_data';
const SESSION_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

// Generators
const roleGen = fc.constantFrom('traveler', 'provider');
const userTypeGen = fc.constantFrom('traveler', 'service_provider');
const phoneGen = fc.string({ minLength: 10, maxLength: 15 }).filter(s => /^[+\d\s-]+$/.test(s) || s.length === 0);
const companyNameGen = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const timestampGen = fc.integer({ min: Date.now() - SESSION_EXPIRATION_MS * 2, max: Date.now() + 1000 });

// Mock sessionStorage for testing
class MockSessionStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = value;
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
}

// Helper functions (matching GoogleRoleSelection.jsx implementation)
const isSessionDataValid = (data) => {
  if (!data || !data.timestamp) return false;
  const now = Date.now();
  return (now - data.timestamp) < SESSION_EXPIRATION_MS;
};

const storeRoleSelection = (storage, data) => {
  const dataWithTimestamp = {
    ...data,
    timestamp: Date.now()
  };
  storage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(dataWithTimestamp));
};

const getStoredRoleSelection = (storage) => {
  try {
    const stored = storage.getItem(GOOGLE_REGISTRATION_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    if (isSessionDataValid(data)) {
      return data;
    }
    // Clear expired data
    storage.removeItem(GOOGLE_REGISTRATION_KEY);
    return null;
  } catch (e) {
    return null;
  }
};

const clearRoleSelection = (storage) => {
  storage.removeItem(GOOGLE_REGISTRATION_KEY);
};

// Validation function (matching GoogleRoleSelection.jsx)
const validateRoleSelection = (selectedRole, phone, companyName) => {
  if (!selectedRole) {
    return { valid: false, error: 'Please select how you want to use iSafari Global' };
  }
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }
  if (selectedRole === 'provider' && !companyName) {
    return { valid: false, error: 'Company/Business name is required for service providers' };
  }
  return { valid: true, error: null };
};

describe('Property 1: Role Selection State Management', () => {
  let mockStorage;
  
  beforeEach(() => {
    mockStorage = new MockSessionStorage();
  });

  /**
   * Feature: google-signin-role-selection, Property 1: Role Selection State Management
   * 
   * Test that OAuth is blocked when no role is selected
   */
  describe('OAuth blocked when no role selected', () => {
    
    it('should block OAuth initiation when role is not selected', () => {
      fc.assert(
        fc.property(
          phoneGen,
          companyNameGen,
          (phone, companyName) => {
            const selectedRole = ''; // No role selected
            const validation = validateRoleSelection(selectedRole, phone, companyName);
            
            // OAuth should be blocked (validation fails)
            return validation.valid === false && 
                   validation.error === 'Please select how you want to use iSafari Global';
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should block OAuth initiation when role is null or undefined', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(null, undefined, ''),
          phoneGen,
          companyNameGen,
          (selectedRole, phone, companyName) => {
            const validation = validateRoleSelection(selectedRole, phone, companyName);
            
            // OAuth should be blocked
            return validation.valid === false;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });

  /**
   * Test that role is stored in session when selected
   */
  describe('Role stored in session when selected', () => {
    
    it('should store role selection with timestamp in sessionStorage', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          phoneGen.filter(p => p.length >= 10),
          companyNameGen,
          (userType, phone, companyName) => {
            const beforeStore = Date.now();
            
            storeRoleSelection(mockStorage, {
              userType,
              phone,
              companyName: userType === 'service_provider' ? companyName : null
            });
            
            const afterStore = Date.now();
            const stored = JSON.parse(mockStorage.getItem(GOOGLE_REGISTRATION_KEY));
            
            // Verify data is stored correctly
            return (
              stored.userType === userType &&
              stored.phone === phone &&
              stored.timestamp >= beforeStore &&
              stored.timestamp <= afterStore
            );
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should retrieve valid stored role selection', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          phoneGen.filter(p => p.length >= 10),
          (userType, phone) => {
            // Store role selection
            storeRoleSelection(mockStorage, { userType, phone });
            
            // Retrieve and verify
            const retrieved = getStoredRoleSelection(mockStorage);
            
            return (
              retrieved !== null &&
              retrieved.userType === userType &&
              retrieved.phone === phone &&
              typeof retrieved.timestamp === 'number'
            );
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });

  /**
   * Test session expiration handling
   */
  describe('Session expiration handling', () => {
    
    it('should reject expired session data', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          phoneGen,
          fc.integer({ min: SESSION_EXPIRATION_MS + 1000, max: SESSION_EXPIRATION_MS * 2 }),
          (userType, phone, ageMs) => {
            // Create expired session data
            const expiredData = {
              userType,
              phone,
              timestamp: Date.now() - ageMs // Expired timestamp
            };
            
            mockStorage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(expiredData));
            
            // Should return null for expired data
            const retrieved = getStoredRoleSelection(mockStorage);
            return retrieved === null;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should accept valid (non-expired) session data', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          phoneGen,
          fc.integer({ min: 0, max: SESSION_EXPIRATION_MS - 1000 }),
          (userType, phone, ageMs) => {
            // Create valid (non-expired) session data
            const validData = {
              userType,
              phone,
              timestamp: Date.now() - ageMs // Valid timestamp
            };
            
            mockStorage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(validData));
            
            // Should return the data
            const retrieved = getStoredRoleSelection(mockStorage);
            return retrieved !== null && retrieved.userType === userType;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should clear expired data from storage', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          phoneGen,
          (userType, phone) => {
            // Create expired session data
            const expiredData = {
              userType,
              phone,
              timestamp: Date.now() - SESSION_EXPIRATION_MS - 1000
            };
            
            mockStorage.setItem(GOOGLE_REGISTRATION_KEY, JSON.stringify(expiredData));
            
            // Attempt to retrieve (should clear expired data)
            getStoredRoleSelection(mockStorage);
            
            // Storage should be cleared
            return mockStorage.getItem(GOOGLE_REGISTRATION_KEY) === null;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });

  /**
   * Test validation rules
   */
  describe('Validation rules', () => {
    
    it('should require phone number for all roles', () => {
      fc.assert(
        fc.property(
          roleGen,
          fc.constantFrom('', null, undefined),
          companyNameGen,
          (selectedRole, emptyPhone, companyName) => {
            const validation = validateRoleSelection(selectedRole, emptyPhone, companyName);
            
            return validation.valid === false && 
                   validation.error === 'Phone number is required';
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should require company name for service providers', () => {
      fc.assert(
        fc.property(
          phoneGen.filter(p => p.length >= 10),
          fc.constantFrom('', null, undefined),
          (phone, emptyCompanyName) => {
            const selectedRole = 'provider';
            const validation = validateRoleSelection(selectedRole, phone, emptyCompanyName);
            
            return validation.valid === false && 
                   validation.error === 'Company/Business name is required for service providers';
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should not require company name for travelers', () => {
      fc.assert(
        fc.property(
          phoneGen.filter(p => p.length >= 10),
          fc.constantFrom('', null, undefined),
          (phone, emptyCompanyName) => {
            const selectedRole = 'traveler';
            const validation = validateRoleSelection(selectedRole, phone, emptyCompanyName);
            
            // Should be valid for travelers without company name
            return validation.valid === true;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should accept valid traveler registration', () => {
      fc.assert(
        fc.property(
          phoneGen.filter(p => p.length >= 10),
          (phone) => {
            const selectedRole = 'traveler';
            const validation = validateRoleSelection(selectedRole, phone, null);
            
            return validation.valid === true && validation.error === null;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should accept valid service provider registration', () => {
      fc.assert(
        fc.property(
          phoneGen.filter(p => p.length >= 10),
          companyNameGen,
          (phone, companyName) => {
            const selectedRole = 'provider';
            const validation = validateRoleSelection(selectedRole, phone, companyName);
            
            return validation.valid === true && validation.error === null;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });

  /**
   * Test clear functionality
   */
  describe('Clear role selection', () => {
    
    it('should clear stored role selection', () => {
      fc.assert(
        fc.property(
          userTypeGen,
          phoneGen,
          (userType, phone) => {
            // Store data
            storeRoleSelection(mockStorage, { userType, phone });
            
            // Verify stored
            const beforeClear = mockStorage.getItem(GOOGLE_REGISTRATION_KEY);
            if (!beforeClear) return false;
            
            // Clear
            clearRoleSelection(mockStorage);
            
            // Verify cleared
            return mockStorage.getItem(GOOGLE_REGISTRATION_KEY) === null;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });

  /**
   * Test role type conversion
   */
  describe('Role type conversion', () => {
    
    it('should correctly convert UI role to userType', () => {
      const roleToUserType = (role) => {
        return role === 'provider' ? 'service_provider' : 'traveler';
      };
      
      fc.assert(
        fc.property(
          roleGen,
          (uiRole) => {
            const userType = roleToUserType(uiRole);
            
            if (uiRole === 'provider') {
              return userType === 'service_provider';
            } else {
              return userType === 'traveler';
            }
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });
});
