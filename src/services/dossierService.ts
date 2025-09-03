import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientDetail {
  patient: {
    id: number;
    name: string;
    email: string;
    prenom: string;
    numeroTelephone: string;
    date_naissance: string | null;
    adresse: string | null;
    specialité: string | null;
    emploi: string | null;
    role_id: number;
    antecedents: Array<{
      id: number;
      user_id: number;
      titre: string;
      description: string | null;
      created_at: string;
      updated_at: string;
    }>;
    consultations: Array<{
      id: number;
      user_id: number;
      docteur_id?: number;
      docteur?: {
        id: number;
        name: string;
        prenom: string;
        specialité?: string;
      };
      date_consultation: string;
      nb_seances: number;
      total: string;
      observation: string;
      temperature: string;
      tension: string;
      traitements: Array<{
        id: number;
        nom: string;
        prix: string;
        pivot: {
          prix: string;
        };
      }>;
      produits: any[];
      paiements: Array<{
        id: number;
        montant: string;
        date_paiement: string;
      }>;
    }>;
  };
  consultations: Array<any>; // We'll use patient.consultations instead
}

interface ApiResponse {
  data: Patient[];
  message?: string;
  status?: number;
}

export const dossierService = {
  getAllPatients: async (): Promise<Patient[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse>(ENDPOINTS.CONSULTATIONS.CONSPATIENTS.LIST);
      // Check if response.data exists and contains the data array
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // If data is directly an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Return empty array if no valid data
      return [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await axiosInstance.get(ENDPOINTS.CONSULTATIONS.CONSPATIENTS.GET_BY_ID(Number(id)));
    return response.data;
  },

  getPatientDetails: async (id: string): Promise<PatientDetail> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CONSULTATIONS.CONSPATIENTS.GET_CONSULTATIONS(Number(id)));
      return response.data;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  }
};

export default dossierService;
