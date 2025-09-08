export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    CHECKUSER: '/checkuser' // Ajoutez /api ici si la base URL n'a pas /api
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
    PAYMENT: {
      CREATE: '/payments',
      VERIFY:  `/payments`,
      REMAINING: (id: number) => `/payments/restant/${id}`,
      STATUS: `/payments`,
    },
  },
  // Nouveau système de photos unifié avec relations polymorphiques
  PHOTOS: {
    UPLOAD: '/photos/upload',
    PATIENT: (patientId: number) => `/photos/patient/${patientId}`,
    USER: (userId: number) => `/photos/user/${userId}`,
    DELETE: (id: number) => `/photos/${id}`,
    GET_BY_ID: (id: number) => `/photos/${id}`,
  },
  // Ancien système (à supprimer progressivement)
  MEDICAL_PHOTOS: {
    LIST: (patientId: number) => `/medical-photos/patient/${patientId}`,
    UPLOAD: '/medical-photos/upload',
    DELETE: (id: number) => `/medical-photos/${id}`,
    GET_BY_ID: (id: number) => `/medical-photos/${id}`,
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
    TOTAL_PATIENT: '/dashboard/totalpatient', // Ajouté pour le total des patients
  }
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
