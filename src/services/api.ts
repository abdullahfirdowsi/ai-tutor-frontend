import axios from 'axios';
import { auth } from '../firebase';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'https://ai-tutor-backend-bjbg.onrender.com/api/v1',

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increase timeout to 60 seconds for slow backend
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Force token refresh
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Maybe redirect to login here
      }
    }
    
    // Handle network errors or timeouts
    if (!error.response) {
      console.error('Network error or timeout:', error.message);
      
      // Check if it's a CORS error
      if (error.message === 'Network Error') {
        console.error('This might be a CORS issue or the backend server is not responding');
        console.error('Backend URL:', api.defaults.baseURL);
        console.error('Make sure the backend server is running and CORS is properly configured');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;