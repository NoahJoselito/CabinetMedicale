import axios from 'axios';
import axiosInstance from './axiosConfig';
import { checkUser } from './checkService';
import { photoService, Photo } from './photoService';

export interface UserProfile {
  user: UserProfile;
  nom: any;
  photo: string | null; // Changé de image à photo
  photo_url: string | null;
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

export const updateUserProfile = async (id: number, formData: FormData): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.post(
      `/users-update/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message
    });
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

// Nouvelles fonctions pour gérer les photos de profil avec le système unifié
export const uploadProfilePhoto = async (userId: number, photoFile: File): Promise<Photo> => {
  try {
    return await photoService.uploadProfilePhoto({
      user_id: userId,
      photo: photoFile
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo de profil:', error);
    throw error;
  }
};

export const getUserProfilePhoto = async (userId: number): Promise<Photo | null> => {
  try {
    return await photoService.getUserProfilePhoto(userId);
  } catch (error) {
    console.error('Erreur lors de la récupération de la photo de profil:', error);
    return null;
  }
};

export const deleteProfilePhoto = async (photoId: number): Promise<void> => {
  try {
    await photoService.deletePhoto(photoId);
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo de profil:', error);
    throw error;
  }
};
