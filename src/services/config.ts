export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://medicale.unityfianar.site/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register'
  },
  DOCTORS: '/doctors',
  SERVICES: '/services',
  PATIENTS: '/patients',
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
