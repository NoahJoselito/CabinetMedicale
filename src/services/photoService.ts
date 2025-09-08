import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

// Interface pour les photos avec relations polymorphiques
export interface Photo {
  id: number;
  photoable_id: number;
  photoable_type: 'User' | 'Patient';
  category: 'profile' | 'medical';
  photo_path: string; // Correspond à file_path dans la réponse API
  file_path?: string; // Alias pour la compatibilité avec l'API
  photo_type?: string; // Pour les photos médicales
  upload_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour l'upload de photo de profil
export interface UploadProfilePhotoData {
  photoable_id: number;
  photoable_type: 'User';
  category: 'profile';
  photo: File;
}

// Interface pour l'upload de photo médicale
export interface UploadMedicalPhotoData {
  photoable_id: number;
  photoable_type: 'Patient';
  category: 'medical';
  photo_type: string;
  upload_date?: string;
  description?: string;
  photo: File;
}

// Interface pour l'upload multiple de photos médicales
export interface UploadMultipleMedicalPhotosData {
  photoable_id: number;
  photoable_type: 'Patient';
  category: 'medical';
  photo_type: string;
  upload_date?: string;
  description?: string;
  photos: File[];
}

// Interface pour la réponse de l'upload multiple
export interface UploadMultiplePhotosResponse {
  success: boolean;
  message: string;
  data: Photo[];
}

// Interface pour l'upload générique (union des deux)
export type UploadPhotoData = UploadProfilePhotoData | UploadMedicalPhotoData;

// Fonction pour normaliser les données de l'API
const normalizePhotoData = (apiPhoto: any): Photo => {
  return {
    id: apiPhoto.id,
    photoable_id: apiPhoto.photoable_id,
    photoable_type: apiPhoto.photoable_type === 'App\\Models\\Patient' ? 'Patient' : 'User',
    category: apiPhoto.category,
    photo_path: apiPhoto.file_path || apiPhoto.photo_path,
    file_path: apiPhoto.file_path,
    photo_type: apiPhoto.photo_type,
    upload_date: apiPhoto.upload_date,
    description: apiPhoto.description,
    created_at: apiPhoto.created_at,
    updated_at: apiPhoto.updated_at
  };
};

export const photoService = {
  // Uploader une photo (profil ou médicale)
  uploadPhoto: async (photoData: UploadPhotoData): Promise<Photo> => {
    try {
      const formData = new FormData();
      
      // Champs communs
      formData.append('photoable_id', photoData.photoable_id.toString());
      formData.append('photoable_type', photoData.photoable_type);
      formData.append('category', photoData.category);
      formData.append('photo', photoData.photo);
      
      // Champs spécifiques aux photos médicales
      if (photoData.category === 'medical') {
        const medicalData = photoData as UploadMedicalPhotoData;
        formData.append('photo_type', medicalData.photo_type);
        
        if (medicalData.description) {
          formData.append('description', medicalData.description);
        }
        
        if (medicalData.upload_date) {
          formData.append('upload_date', medicalData.upload_date);
        }
      }

      const response = await axiosInstance.post(ENDPOINTS.PHOTOS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return normalizePhotoData(response.data);
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  // Uploader plusieurs photos médicales en une seule requête
  uploadMultipleMedicalPhotos: async (photoData: UploadMultipleMedicalPhotosData): Promise<UploadMultiplePhotosResponse> => {
    try {
      const formData = new FormData();
      
      // Champs communs
      formData.append('photoable_id', photoData.photoable_id.toString());
      formData.append('photoable_type', photoData.photoable_type);
      formData.append('category', photoData.category);
      formData.append('photo_type', photoData.photo_type);
      
      // Ajouter toutes les photos
      photoData.photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });
      
      // Champs optionnels
      if (photoData.description) {
        formData.append('description', photoData.description);
      }
      
      if (photoData.upload_date) {
        formData.append('upload_date', photoData.upload_date);
      }

      const response = await axiosInstance.post(ENDPOINTS.PHOTOS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Normaliser les données de réponse
      const normalizedData = {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data ? response.data.data.map(normalizePhotoData) : []
      };
      
      return normalizedData;
    } catch (error) {
      console.error('Error uploading multiple photos:', error);
      throw error;
    }
  },

  // Récupérer les photos d'un patient (photos médicales)
  getPatientPhotos: async (patientId: number): Promise<Photo[]> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PHOTOS.PATIENT(patientId));
      
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
      
      // Normaliser toutes les photos
      return photos.map(normalizePhotoData);
    } catch (error) {
      console.error('Error fetching patient photos:', error);
      // Retourner un tableau vide en cas d'erreur au lieu de throw
      return [];
    }
  },

  // Récupérer la photo de profil d'un utilisateur
  getUserProfilePhoto: async (userId: number): Promise<Photo | null> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PHOTOS.USER(userId));
      
      // Gérer différents formats de réponse de l'API
      if (response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          return normalizePhotoData(response.data[0]);
        } else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          return normalizePhotoData(response.data.data[0]);
        } else if (response.data.photo) {
          return normalizePhotoData(response.data.photo);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile photo:', error);
      return null;
    }
  },

  // Supprimer une photo
  deletePhoto: async (photoId: number): Promise<void> => {
    try {
      await axiosInstance.delete(ENDPOINTS.PHOTOS.DELETE(photoId));
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },

  // Récupérer une photo par ID
  getPhotoById: async (photoId: number): Promise<Photo> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PHOTOS.GET_BY_ID(photoId));
      return normalizePhotoData(response.data);
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw error;
    }
  },

  // Méthodes de compatibilité avec l'ancien système
  // Pour faciliter la migration progressive
  
  // Upload photo médicale (compatibilité)
  uploadMedicalPhoto: async (photoData: {
    patient_id: number;
    photo_type: string;
    photo: File;
    description?: string;
    upload_date?: string;
  }): Promise<Photo> => {
    const uploadData: UploadMedicalPhotoData = {
      photoable_id: photoData.patient_id,
      photoable_type: 'Patient',
      category: 'medical',
      photo_type: photoData.photo_type,
      upload_date: photoData.upload_date,
      description: photoData.description,
      photo: photoData.photo
    };
    
    return photoService.uploadPhoto(uploadData);
  },

  // Upload photo de profil (compatibilité)
  uploadProfilePhoto: async (photoData: {
    user_id: number;
    photo: File;
  }): Promise<Photo> => {
    const uploadData: UploadProfilePhotoData = {
      photoable_id: photoData.user_id,
      photoable_type: 'User',
      category: 'profile',
      photo: photoData.photo
    };
    
    return photoService.uploadPhoto(uploadData);
  },

  // Upload multiple photos médicales (compatibilité)
  uploadMultipleMedicalPhotosCompat: async (photoData: {
    patient_id: number;
    photo_type: string;
    photos: File[];
    description?: string;
    upload_date?: string;
  }): Promise<UploadMultiplePhotosResponse> => {
    const uploadData: UploadMultipleMedicalPhotosData = {
      photoable_id: photoData.patient_id,
      photoable_type: 'Patient',
      category: 'medical',
      photo_type: photoData.photo_type,
      upload_date: photoData.upload_date,
      description: photoData.description,
      photos: photoData.photos
    };
    
    return photoService.uploadMultipleMedicalPhotos(uploadData);
  }
};

export default photoService;
