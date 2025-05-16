import axios from 'axios';
import { API_URL } from './config';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Add timeout
});

// Update request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log('[Request]', {
      url: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// Update response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      console.log('Response success:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    const errorResponse = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    };

    console.error('API Error:', JSON.stringify(errorResponse, null, 2));

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/Formulaire/login';
      return Promise.reject(new Error('Session expirée'));
    }

    // Handle validation errors (422)
    if (error.response?.status === 422) {
      return Promise.reject({
        message: 'Validation failed',
        errors: error.response.data.errors
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
