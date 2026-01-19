import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services API
export const servicesAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/services', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  create: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },
  update: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/payments', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

export default api;
