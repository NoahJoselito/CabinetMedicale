import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export interface Patient {
  id: number;
  name: string;
  email: string;
  prenom: string;
  numeroTelephone: string;
  date_naissance: string;
  adresse: string;
}

interface Antecedent {
  titre: string;
  description?: string;
}

export interface Treatment {
  id: number;
  nom: string;        // Changer libelle à nom pour correspondre à l'API
  description?: string;
  prix: number;      // Changer prix pour correspondre à l'API
  status?: string;
}

export interface Product {
  id: number;
  nom: string;        // Changé de libelle à nom pour correspondre à l'API
  description?: string;
  prix: number;
  quantite: number;
  status?: string;
}

export interface Payment {
  montant: number;
  date: string;
  type: 'espece' | 'mobilemoney' | 'prisencharge';
  numero_mobile?: string | null;
  numero_dossier?: string | null;
  organisme?: string | null;
}

export interface Consultation {
  patient: {
    name: string;
    prenom: string;
    email: string;
    password?: string;
    password_confirmation?: string;  // Add password confirmation
    role_id: number;
    numeroTelephone?: string;
    date_naissance?: string;
    adresse?: string;
  };
  date_consultation: string;
  nb_seances: number;
  total: number;
  observation: string;
  temperature: number;
  tension: string;
  antecedents: {
    titre: string;
    description: string | null;
  }[];
  traitements: number[];
  produits: number[];
  paiements: {
    montant: number;
    date: string;
    type: 'espece' | 'mobilemoney' | 'prisencharge';
    numero_mobile?: string | null;
    numero_dossier?: string | null;
    organisme?: string | null;
  }[];
}

interface ConsultationResponse {
  message: string;
  consultation: {
    id: number;
    user_id: number;
    date_consultation: string;
    nb_seances: number;
    total: number;
    observation: string;
    temperature: number;
    tension: string;
    created_at: string;
    updated_at: string;
    patient: Patient;
    traitements: Array<{
      id: number;
      nom: string;
      prix: string;
      created_at: string;
      updated_at: string;
      pivot: {
        consultation_id: number;
        traitement_id: number;
        prix: string;
        created_at: string;
        updated_at: string;
      };
    }>;
    produits: Array<{
      id: number;
      nom: string;
      quantite_total: number;
      prix: string;
      // ...other fields...
      pivot: {
        consultation_id: number;
        stock_id: number;
        prix: string;
        created_at: string;
        updated_at: string;
      };
    }>;
    paiements: Array<{
      id: number;
      consultation_id: number;
      montant: string;
      date_paiement: string;
      created_at: string;
      updated_at: string;
    }>;
    antecedents: Array<{
      id: number;
      user_id: number;
      titre: string;
      description: string | null;
      created_at: string;
      updated_at: string;
      pivot: {
        consultation_id: number;
        antecedent_id: number;
        created_at: string;
        updated_at: string;
      };
    }>;
  };
}

export const consultService = {
  searchPatients: async (query: string): Promise<Patient[]> => {
    const response = await axiosInstance.get(`${ENDPOINTS.CONSULTATIONS.CONSPATIENTS.SEARCH}?q=${query}`);
    return response.data;
  },
  getPatientById: async (id: number): Promise<Patient> => {
    const response = await axiosInstance.get(`${ENDPOINTS.CONSULTATIONS.CONSPATIENTS}/id/${id}`);
    return response.data;
  },
  createPatient: async (patientData: Partial<Patient>) => {
    try {
      const formattedData = {
        ...patientData,
        role_id: 4, // Patient role
        password: 'DefaultPass123!', // Default password
        password_confirmation: 'DefaultPass123!' // Password confirmation
      };

      const response = await axiosInstance.post(ENDPOINTS.CONSULTATIONS.CONSPATIENTS.CREATE, formattedData);
      if (response.data) {
        return response.data;
      }
      throw new Error('Erreur lors de la création du patient');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création du patient';
      throw error;
    }
  },
  createConsultation: async (consultationData: Consultation): Promise<ConsultationResponse> => {
    try {
      const defaultPassword = 'DefaultPass123!';
      const formattedData = {
        patient: {
          name: consultationData.patient.name || '',
          prenom: consultationData.patient.prenom || '',
          email: consultationData.patient.email || '',
          role_id: 4,
          password: defaultPassword,
          password_confirmation: defaultPassword,
          numeroTelephone: consultationData.patient.numeroTelephone || '',
          date_naissance: consultationData.patient.date_naissance || null,
          adresse: consultationData.patient.adresse || ''
        },
        date_consultation: consultationData.date_consultation,
        nb_seances: Number(consultationData.nb_seances),
        total: Number(consultationData.total).toFixed(2),
        observation: consultationData.observation?.trim() || '',
        temperature: Number(consultationData.temperature).toFixed(1),
        tension: String(consultationData.tension).substring(0, 15),
        antecedents: consultationData.antecedents.map(ant => ({
          titre: ant.titre.trim(),
          description: ant.description?.trim() || null
        })),
        traitements: consultationData.traitements,
        produits: consultationData.produits,
        paiements: consultationData.paiements.map(p => ({
          montant: Number(p.montant).toFixed(2),
          date: p.date,
          type: p.type,
          numero_mobile: p.type === 'mobilemoney' ? p.numero_mobile : null
        }))
      };

      // Validate required fields
      if (!formattedData.patient.name || !formattedData.patient.prenom || !formattedData.patient.email) {
        throw new Error('Les informations du patient sont incomplètes');
      }

      console.log('Sending formatted data:', JSON.stringify(formattedData, null, 2));

      const response = await axiosInstance.post(
        ENDPOINTS.CONSULTATIONS.CREATE,
        formattedData
      );

      if (!response.data) {
        throw new Error('Réponse vide du serveur');
      }

      return response.data;
    } catch (error: any) {
      // Just throw the error and let the component handle notifications
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
  getTreatments: async (): Promise<Treatment[]> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CONSULTATIONS.TREATMENTS);
      console.log('Treatments response:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data.map(item => ({
          id: item.id,
          nom: item.nom,           // Utiliser item.nom au lieu de item.libelle
          description: item.description,
          prix: item.prix,
          status: item.status
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching treatments:', error);
      return [];
    }
  },
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.STOCK.LIST);
      console.log('Stock response:', response.data); // Debug log pour voir la structure
      
      if (Array.isArray(response.data)) {
        return response.data.map(item => ({
          id: item.id,
          nom: item.nom,           // Utilisez le bon nom de champ
          description: item.description,
          prix: item.prix,
          quantite: item.quantite,
          status: item.status
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching stock:', error);
      return [];
    }
  },
  getConsultations: async (): Promise<ConsultationResponse[]> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CONSULTATIONS.LIST);
      console.log('Consultations response:', response.data);
      return response.data.consultations || [];
    } catch (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }
  },
};
