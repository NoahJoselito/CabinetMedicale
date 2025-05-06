import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return data;
  },
};
