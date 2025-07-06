import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';
import axios from 'axios';

interface Antecedent {
  id?: number;
  user_id?: number;
  titre: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Patient {
  id?: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
  provider: string | null;
  provider_id: string | null;
  last_login: string | null;
  prenom: string;
  numeroTelephone: string;
  date_naissance: string;
  adresse: string;
  specialité: string | null;
  emploi: string | null;
  role_id: number;
  organisme: string | null;
  numerodossierprisenchage: string | null;
  antecedents: Antecedent[];
  password?: string;
  password_confirmation?: string;
}

interface PaginatedResponse {
  current_page: number;
  data: Patient[];
  total: number;
  per_page: number;
  last_page: number;
  from: number;
  to: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
}

// Fonction utilitaire pour appeler l'API route Next.js pour envoyer le mot de passe
async function sendPasswordEmail(email: string, password: string) {
  await axios.post('/api/send-patient-password', { email, password });
}

export const patientService = {
  getPatients: async (page: number = 1): Promise<PaginatedResponse> => {
    const { data } = await axiosInstance.get(`${ENDPOINTS.PATIENTS.LIST}?page=${page}`);
    return data;
  },
  
  createPatient: async (patientData: Patient) => {
    try {
      const passwordToSend = patientData.password;
      const { data } = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, {
        ...patientData,
        role_id: 4,
      });
      // Appeler l'API interne pour envoyer l'email
      if (patientData.email && passwordToSend) {
        await sendPasswordEmail(patientData.email, passwordToSend);
      }
      return data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw {
          response: error.response,
          message: "Validation failed",
        };
      }
      throw error;
    }
  },
  
  updatePatient: async (id: number, patientData: Patient) => {
    const { data } = await axiosInstance.put(ENDPOINTS.PATIENTS.UPDATE(id), patientData);
    return data;
  },
  
  deletePatient: async (id: number) => {
    const { data } = await axiosInstance.delete(ENDPOINTS.PATIENTS.DELETE(id));
    return data;
  }
};
