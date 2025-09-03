import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export interface MedicalPhoto {
  id: number;
  patient_id: number;
  photo_type: string;
  photo_path: string;
  upload_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadPhotoData {
  patient_id: number;
  photo_type: string;
  photo: File;
  description?: string;
  upload_date?: string;
}

export const medicalPhotoService = {
  // Récupérer toutes les photos d'un patient
  getPatientPhotos: async (patientId: number): Promise<MedicalPhoto[]> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.MEDICAL_PHOTOS.LIST(patientId));
      
      // Gérer différents formats de réponse de l'API
      let photos = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          photos = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          photos = response.data.data;
        } else if (response.data.photos && Array.isArray(response.data.photos)) {
          photos = response.data.photos;
        }
      }
      
      return photos;
    } catch (error) {
      console.error('Error fetching patient photos:', error);
      // Retourner un tableau vide en cas d'erreur au lieu de throw
      return [];
    }
  },

  // Uploader une nouvelle photo
  uploadPhoto: async (photoData: UploadPhotoData): Promise<MedicalPhoto> => {
    try {
      const formData = new FormData();
      formData.append('patient_id', photoData.patient_id.toString());
      formData.append('photo_type', photoData.photo_type);
      formData.append('photo', photoData.photo);
      
      if (photoData.description) {
        formData.append('description', photoData.description);
      }
      
      if (photoData.upload_date) {
        formData.append('upload_date', photoData.upload_date);
      }

      const response = await axiosInstance.post(ENDPOINTS.MEDICAL_PHOTOS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  // Supprimer une photo
  deletePhoto: async (photoId: number): Promise<void> => {
    try {
      await axiosInstance.delete(ENDPOINTS.MEDICAL_PHOTOS.DELETE(photoId));
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },

  // Récupérer une photo par ID
  getPhotoById: async (photoId: number): Promise<MedicalPhoto> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.MEDICAL_PHOTOS.GET_BY_ID(photoId));
      return response.data;
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw error;
    }
  }
};

export default medicalPhotoService;
