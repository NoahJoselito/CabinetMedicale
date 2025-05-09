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
  TRAITEMENTS: '/traitements',
  STOCK: {
    LIST: '/stocks',
    CREATE: '/stocks',
    UPDATE: (id: number) => `/stocks/${id}`,
    DELETE: (id: number) => `/stocks/${id}`,
  }
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
