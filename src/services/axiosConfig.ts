import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from './config';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    retry?: number;
  }
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 30000,
  // Add response caching control
  validateStatus: (status) => status < 500 // Treat 500 errors as retryable
});

// Add retry interceptor
axiosInstance.interceptors.response.use(undefined, async (err) => {
  const { config, message } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }

  config.retry -= 1;
  if (config.retry === 0) {
    return Promise.reject(err);
  }

  // Delay before retrying
  const delay = new Promise(resolve => setTimeout(resolve, 1000));
  await delay;
  
  console.log(`Retrying request to ${config.url}. Attempts remaining: ${config.retry}`);
  return axiosInstance(config);
});

// Add payment endpoints to retry configuration
const PAYMENT_ENDPOINTS = ['/payments', '/payments/restant'];

const PAYMENT_CONFIG = {
  timeout: 30000,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    // Add more retries for payment endpoints
    if (PAYMENT_ENDPOINTS.some(endpoint => config.url?.includes(endpoint))) {
      config.retry = 5; // More retries for payments
      config.timeout = 60000; // Longer timeout
    } else {
      config.retry = 3;
    }
    
    if (config.url?.includes('/payments')) {
      config.timeout = PAYMENT_CONFIG.timeout;
      Object.assign(config.headers, PAYMENT_CONFIG.headers);
    }

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
