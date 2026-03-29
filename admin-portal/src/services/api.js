import axios from 'axios';

// 🚨 PRODUCTION FIX: Remove localhost fallback - MUST have VITE_API_URL set
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('🚨 VITE_API_URL environment variable is required in production');
}

const api = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
