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
  paiement_initial?: {
    montant: number;
    type: 'espece';
    date: string;
  };
}

export interface ConsultationResponse {
  consultation: any;
  completedSeances: number;
  seanceCount: number;
  id: number;
  user_id: number;
  date_consultation: string;
  nb_seances: number;
  seancerestant: number | null;
  total: string;
  observation: string;
  temperature: string;
  tension: string;
  created_at: string;
  updated_at: string;
  payementrestant: number;
  statuspaiement: string;
  statusseance: string;
  patient: {
    id: number;
    name: string;
    email: string;
    prenom: string;
    numeroTelephone: string;
    date_naissance: string | null;
    adresse: string | null;
  };
  traitements: Array<{
    id: number;
    nom: string;
    prix: string;
    pivot: {
      consultation_id: number;
      traitement_id: number;
      prix: string;
    };
  }>;
  produits: Array<{
    id: number;
    nom: string;
    quantite_total: number;
    prix: string;
    pivot: {
      consultation_id: number;
      stock_id: number;
      prix: string;
    };
  }>;
  paiements: Array<{
    id: number;
    consultation_id: number;
    montant: string;
    date_paiement: string;
    type: 'espece' | 'mobilemoney' | 'prisencharge';
  }>;
  antecedents: Array<{
    id: number;
    user_id: number;
    titre: string;
    description: string | null;
    pivot: {
      consultation_id: number;
      antecedent_id: number;
    };
  }>;
}

export interface PaymentRequest {
  consultation_id: number;
  montant: string;
  type: 'espece' | 'mobilemoney' | 'prisencharge';
  date_paiement: string;
  numero_mobile?: string;
  numero_dossier?: string;
  organisme?: string;
}

export interface PaymentResponse {
  Message: string;
  consultation: {
    consultation_id: number;
    montant: number;
    date_paiement: string;
    type: 'espece' | 'mobilemoney' | 'prisencharge';
    updated_at: string;
    created_at: string;
    id: number;
  };
  "Reste à payer": number;
}

export interface PaymentRemaining {
  payementrestant: number;
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
        paiements: [
          ...(consultationData.paiement_initial ? [{
            montant: Number(consultationData.paiement_initial.montant).toFixed(2),
            date: consultationData.paiement_initial.date,
            type: 'espece'
          }] : []),
          ...consultationData.paiements
        ]
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
  getConsultations: async (): Promise<{consultations: ConsultationResponse[]}> => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CONSULTATIONS.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }
  },
  validateSeance: async (consultationId: number): Promise<ConsultationResponse> => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await axiosInstance.get(
          `${ENDPOINTS.CONSULTATIONS.VALIDATE_SEANCE}/${consultationId}`,
          { timeout: 30000 } // Override timeout for this specific request
        );
        return response.data;
      } catch (error: any) {
        attempt++;
        
        if (attempt === maxRetries) {
          console.error(`Failed to validate seance after ${maxRetries} attempts:`, error);
          throw new Error('La validation de la séance a échoué. Veuillez réessayer.');
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error('La validation de la séance a échoué. Veuillez réessayer.');
  },
  makePayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    try {
      // Log de débogage
      console.log('Making payment with data:', paymentData);

      // Formater correctement les données
      const formattedPayment = {
        consultation_id: paymentData.consultation_id,
        montant: paymentData.montant,
        date_paiement: paymentData.date_paiement,
        type: paymentData.type,
        ...(paymentData.type === 'mobilemoney' && { numero_mobile: paymentData.numero_mobile }),
        ...(paymentData.type === 'prisencharge' && {
          numero_dossier: paymentData.numero_dossier,
          organisme: paymentData.organisme
        })
      };

      // Log des données formatées
      console.log('Formatted payment data:', formattedPayment);

      const response = await axiosInstance.post(
        ENDPOINTS.CONSULTATIONS.PAYMENTS,
        formattedPayment,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 secondes de timeout
        }
      );

      // Log de la réponse
      console.log('Payment response:', response);

      if (!response.data) {
        throw new Error('Réponse vide du serveur');
      }

      return response.data;
    } catch (error: any) {
      // Log détaillé de l'erreur
      console.error('Payment error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        requestData: paymentData
      });

      if (error.response) {
        throw {
          message: error.response.data?.message || 'Erreur lors du paiement',
          status: error.response.status,
          data: error.response.data
        };
      }

      throw new Error('Erreur de connexion au serveur');
    }
  },
  getPaymentRemaining: async (consultationId: number): Promise<PaymentRemaining> => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.CONSULTATIONS.PAYMENT_REMAINING(consultationId)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching remaining payment:', error);
      throw error;
    }
  },
};
