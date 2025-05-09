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

export const serviceService = {
  getAll: async () => {
    const { data } = await axiosInstance.get<Service[]>(ENDPOINTS.SERVICES);
    return data;
  }
};
