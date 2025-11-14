import axios from 'axios';

// Get API URL from environment variable or use relative path for same-domain
const API_URL = import.meta.env.VITE_API_URL || '';

// Configure axios defaults
if (API_URL) {
  axios.defaults.baseURL = API_URL;
  console.log('🌐 API Base URL:', API_URL);
} else {
  // In development, use relative paths (will use Vite proxy)
  console.log('🔧 Using relative API paths (development mode)');
}

// Add request interceptor for auth tokens
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

