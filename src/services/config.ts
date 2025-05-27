export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://medicale.unityfianar.site/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register'
  },
  DOCTORS: '/doctors',
  SERVICES: '/services',
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/register', // Changed back to /register for creating new patients
    UPDATE: (id: number) => `/patients/${id}`,
    DELETE: (id: number) => `/patients/${id}`
  },
  TRAITEMENTS: '/traitements',
  STOCK: {
    LIST: '/stocks', // Updated endpoint
    CREATE: '/stocks',
    UPDATE: (id: number) => `/stocks/${id}`,
    DELETE: (id: number) => `/stocks/${id}`
  },
  CONSULTATIONS: {
    LIST: '/consultations',
    CREATE: '/consultations',
    UPDATE: (id: number) => `/consultations/${id}`,
    GET_BY_ID: (id: number) => `/consultations/${id}`,
    CONSPATIENTS: {
      SEARCH: '/patients/search',
      LIST: '/patients',
      CREATE: '/register', // Changed from '/patients' to '/register'
      UPDATE: (id: number) => `/patients/${id}`,
      GET_BY_ID: (id: number) => `/patients/${id}`, // Use this for patient details
      GET_CONSULTATIONS: (id: number) => `/consultations/patients/${id}/consultations`, // Updated endpoint path
    },
    TREATMENTS: '/traitements',    // Mettre à jour l'endpoint pour les traitements
    PRODUCTS: '/stocks',              // Updated path to match backend
    VALIDATE_SEANCE: '/consultations/addseance',
    PAYMENTS: '/payments',
    PAYMENT_REMAINING: (id: number) => `/payments/restant/${id}`,
  }
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
