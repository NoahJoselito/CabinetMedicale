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
    SEARCH: '/patients/search',  // Add this line
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
    LIST: '/consultations',  // This should match your base URL endpoint
    CREATE: '/consultations',
    UPDATE: (id: number) => `/consultations/${id}`,
    GET_BY_ID: (id: number) => `/consultations/${id}`,
    CONSPATIENTS: {
      SEARCH: '/patients/search',
      LIST: '/patients',
      CREATE: '/register',  // Updated to match the backend endpoint
      UPDATE: (id: number) => `/patients/${id}`,
      GET_BY_ID: (id: number) => `/patients/${id}`,
      GET_CONSULTATIONS: (id: number) => `/consultations/patients/${id}/consultations`,
    },
    TREATMENTS: '/traitements',    // Mettre à jour l'endpoint pour les traitements
    PRODUCTS: '/stocks',              // Updated path to match backend
    VALIDATE_SEANCE: '/consultations/addseance',
    PAYMENTS: '/payments',
    PAYMENT_REMAINING: (id: number) => `/payments/restant/${id}`,
  },
  APPOINTMENTS: {
    CREATE: '/rendezvous',
    LIST: '/rendezvous',
    ALL: '/rendezvous', // Ajout de l'endpoint pour tous les rendez-vous
    BY_MONTH: '/rendezvous/month',
    BY_DATE: '/rendezvous/getbydate', // Ajout du nouvel endpoint
    GET_BY_ID: (id: number) => `/rendezvous/${id}`,
  },
  DASHBOARD: {
    RECENT_PATIENTS: '/dashboard/patients/recents',
    REVENUE_MONTHLY: (year: number) => `/dashboard/revenue-monthly?year=${year}`,
    REVENUE_DAILY: (year: number, month: number) => `/dashboard/revenue-daily?year=${year}&month=${month}`,
  }
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
