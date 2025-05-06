import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export interface Doctor {
  id: number;
  name: string;
  email: string;
  prenom: string;
  numeroTelephone: string;
  specialité: string;
  date_naissance: string;
  adresse: string;
  role_id?: number;
  token?: string;
}

export const doctorService = {
  createDoctor: async (doctorData: Omit<Doctor, 'id'>) => {
    try {
      const dataWithRole = {
        ...doctorData,
        role_id: 2 // Role ID for doctors
      };
      const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, dataWithRole);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  },
  getDoctors: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.DOCTORS);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },
  updateDoctor: async (id: number, doctorData: Partial<Doctor>) => {
    try {
      const response = await axiosInstance.put(`${ENDPOINTS.DOCTORS}/${id}`, {
        ...doctorData,
        role_id: 2
      });
      return response.data;
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  },
  deleteDoctor: async (id: number) => {
    try {
      const response = await axiosInstance.delete(`${ENDPOINTS.DOCTORS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw error;
    }
  },
};
