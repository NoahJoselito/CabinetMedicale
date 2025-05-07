import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

interface Patient {
  id?: number;
  name: string;
  prenom: string;
  email: string;
  password?: string;
  numeroTelephone: string;
  date_naissance: string;
  adresse: string;
  antecedents_medicaux?: string;
  groupe_sanguin?: string;
  role_id: 4;
}

interface PaginatedResponse {
  current_page: number;
  data: Patient[];
  total: number;
  per_page: number;
  last_page: number;
}

export const patientService = {
  getPatients: async (page: number = 1): Promise<PaginatedResponse> => {
    const { data } = await axiosInstance.get(`${ENDPOINTS.PATIENTS}?page=${page}`);
    return data;
  },
  createPatient: async (patientData: Patient) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, patientData);
    return data;
  },
  updatePatient: async (id: number, patientData: Patient) => {
    const { data } = await axiosInstance.put(`${ENDPOINTS.PATIENTS}/${id}`, patientData);
    return data;
  },
  deletePatient: async (id: number) => {
    const { data } = await axiosInstance.delete(`${ENDPOINTS.PATIENTS}/${id}`);
    return data;
  }
};
