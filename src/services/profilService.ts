import axios from 'axios';
import { checkUser } from './checkService';

export interface UserProfile {
  nom: any;
  image: any;
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  provider: string | null;
  provider_id: string | null;
  last_login: string;
  prenom: string;
  numeroTelephone: string;
  date_naissance: string;
  adresse: string;
  specialité: string;
  emploi: string;
  role_id: number;
  organisme: string | null;
  numerodossierprisenchage: string | null;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const result = await checkUser();
    return result.user;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/profile/update`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.user;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

export const updatePassword = async (passwordData: UpdatePasswordData): Promise<void> => {
  try {
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/profile/update-password`,
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    throw error;
  }
};
