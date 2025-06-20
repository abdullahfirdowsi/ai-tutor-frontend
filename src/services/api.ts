import axios, { AxiosError } from 'axios';
import { auth } from '../firebase';

// Extend axios types to include custom properties
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _networkRetry?: boolean;
    _networkRetryCount?: number;
  }
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
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

// Add a response interceptor with improved error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      // For list endpoints that return empty lists on 404
      const url = originalRequest.url || '';
      if (url.includes('/recommended') || 
          url.includes('/my-lessons') || 
          url.includes('/activity') ||
          url.includes('/qa/sessions')) {
        console.warn(`Endpoint returned 404, returning empty list: ${url}`);
        
        // Check if it's a QA sessions request
        if (url.includes('/qa/sessions')) {
          return Promise.resolve({ 
            data: { 
              sessions: [],
              total: 0,
              skip: 0,
              limit: 20  // Default limit from backend
            } 
          });
        }
        
        // For other list endpoints
        return Promise.resolve({ 
          data: { 
            items: [], 
            total: 0 
          } 
        });
      }
    }
    
    // Handle 405 Method Not Allowed
    if (error.response?.status === 405) {
      console.error('Method not allowed:', {
        url: originalRequest.url,
        method: originalRequest.method
      });
      return Promise.reject(new Error('Operation not supported'));
    }

    // Handle network errors or timeouts
    if (!error.response) {
      console.error('Network error or timeout:', {
        message: error.message,
        url: originalRequest.url,
        method: originalRequest.method,
        baseURL: api.defaults.baseURL
      });

      // Retry logic for network errors (max 2 retries)
      if (!originalRequest._networkRetry && originalRequest._networkRetryCount !== 2) {
        originalRequest._networkRetry = true;
        originalRequest._networkRetryCount = (originalRequest._networkRetryCount || 0) + 1;
        
        // Exponential backoff
        const backoffDelay = Math.pow(2, originalRequest._networkRetryCount) * 1000;
        console.log(`Retrying request after ${backoffDelay}ms (attempt ${originalRequest._networkRetryCount}/2)`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        return api(originalRequest);
      }

      if (error.message === 'Network Error') {
        console.error('Possible CORS issue or backend server not responding');
        console.error('Backend URL:', api.defaults.baseURL);
        console.error('Request details:', {
          headers: originalRequest.headers,
          data: originalRequest.data
        });
      }
    }

    // Log all errors for debugging
    console.error('API Error:', {
      status: error.response?.status,
      url: originalRequest.url,
      method: originalRequest.method,
      data: error.response?.data,
      headers: originalRequest.headers
    });

    return Promise.reject(error);
  }
);

export default api;