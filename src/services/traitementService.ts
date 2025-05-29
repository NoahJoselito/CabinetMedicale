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
  pivot: {
    traitement_id: number;
    service_id: number;
  };
}

export interface Traitement {
  id: number;
  nom: string;
  prix: string | number;  // Update this line to handle both string and number
  prixprisenchager: string | number | null;
  created_at: string;
  updated_at: string;
  services: Service[];
}

export const traitementService = {
  getAll: async () => {
    const { data } = await axiosInstance.get<Traitement[]>(ENDPOINTS.TRAITEMENTS);
    return data;
  },

  getById: async (id: number) => {
    const { data } = await axiosInstance.get<Traitement>(`${ENDPOINTS.TRAITEMENTS}/${id}`);
    return data;
  },

  create: async (traitement: Partial<Traitement>) => {
    const formattedData = {
      nom: traitement.nom,
      prix: parseFloat(traitement.prix?.toString() || '0').toFixed(2),
      prixprisenchager: traitement.prixprisenchager ? Math.round(Number(traitement.prixprisenchager)) : null, // Converti en entier
      services: traitement.services?.map(service => service.id)
    };
    const { data } = await axiosInstance.post<Traitement>(ENDPOINTS.TRAITEMENTS, formattedData);
    return data;
  },

  update: async (id: number, traitement: Partial<Traitement>) => {
    const formattedData = {
      nom: traitement.nom,
      prix: Number(traitement.prix).toFixed(2),
      prixprisenchager: traitement.prixprisenchager ? Math.round(Number(traitement.prixprisenchager)) : null, // Converti en entier
      services: traitement.services?.map(service => service.id) || []
    };
    
    try {
      console.log('Update payload:', formattedData);
      const { data } = await axiosInstance.put<Traitement>(
        `${ENDPOINTS.TRAITEMENTS}/${id}`, 
        formattedData
      );
      return data;
    } catch (error: any) {
      console.error('Update error details:', error.response?.data);
      throw error;
    }
  },

  delete: async (id: number) => {
    await axiosInstance.delete(`${ENDPOINTS.TRAITEMENTS}/${id}`);
  }
};
