import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export interface Service {
  id: number;
  icone: string;
  nom: string;
  description_courte: string;
  details: string;
  horaires: string;
  created_at: string;
  updated_at: string;
}

export const RDVService = {
  getAllServices: async (): Promise<Service[]> => {
    const { data } = await axiosInstance.get(ENDPOINTS.SERVICES);
    return data;
  }
};
