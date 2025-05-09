import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

interface Stock {
  id?: number;
  nom: string;
  quantite_total: number;
  quantite_carton: number;
  service_id: number;
}

export const stockService = {
  getAll: async () => {
    const { data } = await axiosInstance.get(ENDPOINTS.STOCK.LIST);
    return data;
  },

  create: async (stock: Stock) => {
    const { data } = await axiosInstance.post(ENDPOINTS.STOCK.CREATE, stock);
    return data;
  },

  update: async (id: number, stock: Stock) => {
    const { data } = await axiosInstance.put(ENDPOINTS.STOCK.UPDATE(id), stock);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await axiosInstance.delete(ENDPOINTS.STOCK.DELETE(id));
    return data;
  },

  getServices: async () => {
    const { data } = await axiosInstance.get(ENDPOINTS.SERVICES);
    return data;
  },
};
