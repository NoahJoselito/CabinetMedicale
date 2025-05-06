import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from './config';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
axiosInstance.interceptors.request.use(
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

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/Formulaire/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
