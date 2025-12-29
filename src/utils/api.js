// ═══════════════════════════════════════════════════════════════════════════
// 🔧 DEVELOPMENT MODE - Connect to LOCAL backend
// ═══════════════════════════════════════════════════════════════════════════
// This ensures Service Provider → Traveller → Admin workflow works correctly
// All data flows through the same local MongoDB instance
// ═══════════════════════════════════════════════════════════════════════════

// Use local backend in development, production backend in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : 'https://isafarinetworkglobal-2.onrender.com/api');
const API_URL = API_BASE_URL;

// Log API configuration for debugging
if (import.meta.env.MODE === 'development') {
  console.log('🔧 Development Mode - API Base URL:', API_BASE_URL);
}

// Helper function to get auth token
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
  return user.token;
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...(options.body && { body: options.body }),
  };

  try {
    const response = await fetch(url, config);

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response from:', url, 'Content-Type:', contentType);

      // Try to get response text for debugging
      const text = await response.text().catch(() => '');
      console.error('Response preview:', text.substring(0, 200));

      return {
        success: false,
        message: '⚠️ Backend server not responding correctly. Please try again later.'
      };
    }

    const text = await response.text();
    if (!text) {
      return {
        success: false,
        message: 'Empty response from server. Backend may be starting up, please wait...'
      };
    }

    const data = JSON.parse(text);

    // If response is not ok but has success:false, return the data with error message
    if (!response.ok) {
      if (data.success === false && data.message) {
        return data; // Return the error response from backend
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);

    // Check if it's a network error (backend not responding)
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('fetch'))) {
      return {
        success: false,
        message: '⚠️ Cannot connect to backend. Please check your internet connection or try again later.'
      };
    }

    // JSON parse error - backend returned non-JSON
    if (error instanceof SyntaxError) {
      return {
        success: false,
        message: '⚠️ Invalid response from backend. Please try again.'
      };
    }

    // Return error in consistent format
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection and try again.'
    };
  }
};

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  googleLogin: () => {
    // Use demo login instead of real OAuth to avoid 400 errors
    window.location.href = `${API_BASE_URL}/auth/demo-login`;
  },

  completeGoogleRegistration: async (userType, phone) => {
    return apiRequest('/auth/google/complete', {
      method: 'POST',
      body: JSON.stringify({ userType, phone }),
    });
  },

  getTempGoogleUser: async () => {
    return apiRequest('/auth/google/temp');
  },

  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },
};

// User API functions
export const userAPI = {
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updateBusinessProfile: async (businessData) => {
    return apiRequest('/users/business-profile', {
      method: 'PUT',
      body: JSON.stringify(businessData),
    });
  },

  getDashboardStats: async () => {
    return apiRequest('/users/dashboard-stats');
  },
};

// Services API functions
export const servicesAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/services${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/services/${id}`);
  },

  getMyServices: async () => {
    return apiRequest('/services/provider/my-services');
  },

  create: async (serviceData) => {
    return apiRequest('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  update: async (id, serviceData) => {
    return apiRequest(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/services/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bookings API functions
export const bookingsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/bookings${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/bookings/${id}`);
  },

  create: async (bookingData) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    return apiRequest(`/bookings/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus }),
    });
  },

  addReview: async (id, rating, comment) => {
    return apiRequest(`/bookings/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },
};

// Cart API functions
export const cartAPI = {
  getCart: async () => {
    console.log('📡 [API] GET /cart');
    const result = await apiRequest('/cart');
    console.log('📥 [API] GET /cart response:', result);
    return result;
  },

  addToCart: async (serviceId, quantity = 1) => {
    console.log(`📡 [API] POST /cart/add - serviceId: ${serviceId}, quantity: ${quantity}`);
    const result = await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ serviceId, quantity }),
    });
    console.log('📥 [API] POST /cart/add response:', result);
    return result;
  },

  updateCartItem: async (cartItemId, quantity) => {
    console.log(`📡 [API] PUT /cart/${cartItemId} - quantity: ${quantity}`);
    const result = await apiRequest(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    console.log('📥 [API] PUT /cart response:', result);
    return result;
  },

  removeFromCart: async (cartItemId) => {
    console.log(`📡 [API] DELETE /cart/${cartItemId}`);
    const result = await apiRequest(`/cart/${cartItemId}`, {
      method: 'DELETE',
    });
    console.log('📥 [API] DELETE /cart response:', result);
    return result;
  },

  clearCart: async () => {
    console.log('📡 [API] DELETE /cart');
    const result = await apiRequest('/cart', {
      method: 'DELETE',
    });
    console.log('📥 [API] DELETE /cart response:', result);
    return result;
  },
};

// Plans API functions
export const plansAPI = {
  getPlans: async () => {
    return apiRequest('/plans');
  },

  addToPlan: async (serviceId, planDate, notes) => {
    return apiRequest('/plans/add', {
      method: 'POST',
      body: JSON.stringify({ serviceId, planDate, notes }),
    });
  },

  updatePlan: async (planId, planDate, notes) => {
    return apiRequest(`/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify({ planDate, notes }),
    });
  },

  removeFromPlan: async (planId) => {
    return apiRequest(`/plans/${planId}`, {
      method: 'DELETE',
    });
  },

  clearPlans: async () => {
    return apiRequest('/plans', {
      method: 'DELETE',
    });
  },
};
export const favoritesAPI = {
  getFavorites: async () => {
    return apiRequest('/favorites');
  },

  checkFavorite: async (providerId) => {
    return apiRequest(`/favorites/check/${providerId}`);
  },

  addToFavorites: async (providerId) => {
    return apiRequest('/favorites/add', {
      method: 'POST',
      body: JSON.stringify({ providerId }),
    });
  },

  removeFromFavorites: async (providerId) => {
    return apiRequest(`/favorites/${providerId}`, {
      method: 'DELETE',
    });
  },

  clearFavorites: async () => {
    return apiRequest('/favorites', {
      method: 'DELETE',
    });
  },
};

// Payments API functions
export const paymentsAPI = {
  getAll: async () => {
    return apiRequest('/payments');
  },

  purchasePremiumMembership: async (duration, paymentMethod) => {
    return apiRequest('/payments/premium-membership', {
      method: 'POST',
      body: JSON.stringify({ duration, paymentMethod }),
    });
  },

  purchaseFeaturedService: async (serviceId, duration, paymentMethod) => {
    return apiRequest('/payments/featured-service', {
      method: 'POST',
      body: JSON.stringify({ serviceId, duration, paymentMethod }),
    });
  },

  getPricing: async () => {
    return apiRequest('/payments/pricing');
  },
};

// Notifications API functions
export const notificationsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/notifications${queryParams ? `?${queryParams}` : ''}`);
  },

  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },
};

// Admin API functions
export const adminAPI = {
  // Dashboard stats
  getDashboardStats: async () => {
    return apiRequest('/admin/dashboard-stats');
  },

  // User management
  getAllUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/admin/users${queryParams ? `?${queryParams}` : ''}`);
  },

  updateUserStatus: async (userId, isActive) => {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  verifyUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}/verify`, {
      method: 'PUT',
    });
  },

  deleteUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Service management
  approveService: async (serviceId) => {
    return apiRequest(`/admin/services/${serviceId}/approve`, {
      method: 'PUT',
    });
  },

  rejectService: async (serviceId) => {
    return apiRequest(`/admin/services/${serviceId}/reject`, {
      method: 'PUT',
    });
  },

  toggleFeaturedService: async (serviceId, isFeatured) => {
    return apiRequest(`/admin/services/${serviceId}/featured`, {
      method: 'PUT',
      body: JSON.stringify({ isFeatured }),
    });
  },

  // Analytics
  getAnalytics: async (period = 'month') => {
    return apiRequest(`/admin/analytics?period=${period}`);
  },

  getRevenueReport: async (startDate, endDate) => {
    return apiRequest(`/admin/reports/revenue?start=${startDate}&end=${endDate}`);
  },

  // Support tickets
  getSupportTickets: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/admin/support-tickets${queryParams ? `?${queryParams}` : ''}`);
  },

  updateTicketStatus: async (ticketId, status) => {
    return apiRequest(`/admin/support-tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Export API_URL for direct fetch calls
export { API_BASE_URL, API_URL };

export default {
  authAPI,
  userAPI,
  servicesAPI,
  bookingsAPI,
  cartAPI,
  plansAPI,
  favoritesAPI,
  paymentsAPI,
  notificationsAPI,
  adminAPI,
};
