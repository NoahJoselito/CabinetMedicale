import axiosInstance from './axiosConfig';

export interface UserProfile {
  nom: any;
  image: any;
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  provider: string | null;
  provider_id: string | null;
  last_login: string | null;
  prenom: string;
  numeroTelephone: string;
  date_naissance: string;
  adresse: string;
  specialité: string;
  emploi: string;
  role_id: number;
  organisme: string;
  numerodossierprisenchage: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get('/user');
  return response.data;
};

export const updateUserProfile = async (data: Partial<UserProfile>) => {
  const response = await axiosInstance.put('/user', data);
  return response.data;
};
