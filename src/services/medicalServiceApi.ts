import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

// Interface definitions
export interface IMedicalService {
    id: number;
    icone: string;
    nom: string;
    description_courte: string;
    details: string;
    horaires: string;
}

export interface ICreateMedicalService {
    icone: string;
    nom: string;
    description_courte: string;
    details: string;
    horaires: string;
}

export interface IApiResponse<T> {
    service: any;
    data: T;
    message?: string;
    success?: boolean;
}

// Medical Service API methods
export const medicalServiceApi = {
    getAllServices: async (): Promise<IApiResponse<IMedicalService[]>> => {
        try {
            const response = await axiosInstance.get(ENDPOINTS.SERVICES);
            console.log('API Response:', response.data); // Pour debug
            return { service: null, data: response.data };
        } catch (error: any) {
            console.error('API Error:', error); // Pour debug
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des services');
        }
    },
    getServiceById: async (id: number): Promise<IApiResponse<IMedicalService>> => {
        try {
            const response = await axiosInstance.get(`${ENDPOINTS.SERVICES}/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du service');
        }
    },

    createService: async (service: ICreateMedicalService): Promise<IApiResponse<IMedicalService>> => {
        try {
            const response = await axiosInstance.post(ENDPOINTS.SERVICES, service);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la création du service');
        }
    },

    updateService: async (id: number, service: Partial<ICreateMedicalService>): Promise<IApiResponse<IMedicalService>> => {
        try {
            const response = await axiosInstance.put(`${ENDPOINTS.SERVICES}/${id}`, service);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du service');
        }
    },

    deleteService: async (id: number): Promise<IApiResponse<void>> => {
        try {
            const response = await axiosInstance.delete(`${ENDPOINTS.SERVICES}/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du service');
        }
    }
};
