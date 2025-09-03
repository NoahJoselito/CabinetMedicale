import { JSX } from 'react';
import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export interface Patient {
  prisesEnCharge: any;
  id: number;
  name: string;
  email: string;
  prenom: string;
  numeroTelephone: string;
  date_naissance: string;
  adresse: string;
  specialité?: string | null;
  emploi?: string | null;
  role_id: number;
  organisme: string | null;
  numerodossierprisenchage: string | null;
  antecedents: {
    id: number;
    user_id: number;
    titre: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }[];
}

interface Antecedent {
  titre: string;
  description?: string;
}

export interface Treatment {
  id: number;
  nom: string;
  prix: string;
  prixprisenchager: number | null;
  created_at: string;
  updated_at: string;
  services: Array<{
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
  }>;
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
  paiement_initial: any;
  total(total: any): unknown;
  patient: {
    adresse: string;
    date_naissance: null;
    id: number;
    name: string;
    prenom: string;
    email: string;
    role_id: number;
    numeroTelephone: string;
  };
  date_consultation: string;
  nb_seances: number;
  observation: string;
  temperature: number;
  tension: string;
  antecedents: Array<{
    id: number;
    user_id: number;
    titre: string;
    description: string | null;
  }>;
  traitements: number[];
  produits: number[];
  paiements: Array<{
    montant: number;
    date: string;
    type: 'espece' | 'mobilemoney' | 'prisencharge';
  }>;
  docteur_id?: number; // Ajout du docteur_id
}

export interface ConsultationResponse {
  montantPaye(montantPaye: any): unknown;
  consultation: any;
  completedSeances: number;
  seanceCount: number;
  id: number;
  user_id: number;
  docteur_id?: number; // Ajout du docteur_id
  docteur?: { // Ajout des informations du docteur
    id: number;
    name: string;
    prenom: string;
    specialité?: string;
  };
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

// Mise à jour de l'interface PaymentRequest pour inclure tous les champs
export interface PaymentRequest {
  consultation_id: number;
  montant: string;
  date_paiement: string;
  type: 'espece' | 'mobilemoney' | 'prisencharge';
  numero_mobile?: string;
  numero_dossier?: string;
  organisme?: string;
}

// Interface pour la réponse de paiement
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

export interface PriseEnCharge {
  id: number;
  numero_dossier: string;
  organisme: string;
  date_debut: string;
  date_fin?: string;
  status: 'active' | 'expired';
}

export interface PatientDetails {
  antecedents?: {
    id: number;
    titre: string;
    description: string | null;
  }[];
  prisesEnCharge?: PriseEnCharge[];
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface PatientSearchParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreatePatientData extends Omit<Partial<Patient>, 'antecedents'> {
  password?: string;
  password_confirmation?: string;
  antecedents?: Array<{
    titre: string;
    description: string | null;
  }>;
  etatGeneral?: string;
  observations?: string;
}

export const consultService = {
  searchPatients: async (query: string): Promise<Patient[]> => {
    try {
      const params: PatientSearchParams = {
        search: query,
        per_page: 10
      };

      const response = await axiosInstance.get(ENDPOINTS.CONSULTATIONS.CONSPATIENTS.LIST, {
        params
      });

      // Handle both paginated and non-paginated responses
      const patients = response.data.data || response.data;
      console.log('Search response:', patients);
      
      return Array.isArray(patients) ? patients : [];
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  getPatientDetails: async (patientId: number): Promise<Patient> => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.CONSULTATIONS.CONSPATIENTS.GET_BY_ID(patientId)
      );
      
      if (response.data) {
        console.log('Patient details:', response.data);
        return response.data;
      }
      throw new Error('Patient non trouvé');
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  },
  createPatient: async (patientData: CreatePatientData) => {
    try {
      const formattedData = {
        ...patientData,
        role_id: 4,
        password: 'DefaultPass123!',
        password_confirmation: 'DefaultPass123!',
        antecedents: patientData.antecedents?.map(ant => ({
          titre: ant.titre,
          description: ant.description || null
        })),
        etatGeneral: patientData.etatGeneral || null,
        observations: patientData.observations || null
      };

      console.log('Creating patient with data:', formattedData);

      const response = await axiosInstance.post(ENDPOINTS.CONSULTATIONS.CONSPATIENTS.CREATE, formattedData);
      
      if (response.data) {
        console.log('Created patient:', response.data);
        return response.data;
      }
      throw new Error('Erreur lors de la création du patient');
    } catch (error: any) {
      console.error('Error creating patient:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
  createConsultation: async (consultationData: Consultation): Promise<ConsultationResponse> => {
    try {
      const defaultPassword = 'DefaultPass123!';
      
      // Récupérer l'utilisateur connecté depuis localStorage
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
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
        ],
        docteur_id: currentUser?.id || consultationData.docteur_id // Ajouter l'ID du docteur
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
          nom: item.nom,
          prix: item.prix,
          prixprisenchager: item.prixprisenchager || null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          services: item.services || []
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
      // Validate payment data
      if (!paymentData.consultation_id) {
        throw new Error('ID de consultation manquant');
      }
      if (!paymentData.montant || isNaN(Number(paymentData.montant)) || Number(paymentData.montant) <= 0) {
        throw new Error('Montant de paiement invalide');
      }
      if (!paymentData.date_paiement) {
        throw new Error('Date de paiement manquante');
      }
      if (!paymentData.type) {
        throw new Error('Type de paiement manquant');
      }

      // Type-specific validations
      if (paymentData.type === 'mobilemoney' && !paymentData.numero_mobile) {
        throw new Error('Numéro de téléphone mobile requis pour le paiement mobile');
      }
      if (paymentData.type === 'prisencharge') {
        if (!paymentData.numero_dossier) {
          throw new Error('Numéro de dossier requis pour la prise en charge');
        }
        if (!paymentData.organisme) {
          throw new Error('Organisme requis pour la prise en charge');
        }
      }

      // Continue with payment processing
      console.log('[Payment] Starting payment process:', paymentData);

      // Get initial remaining amount
      const initialResponse = await axiosInstance.get(
        ENDPOINTS.CONSULTATIONS.PAYMENT.REMAINING(paymentData.consultation_id)
      );

      const initialAmount = Number(initialResponse.data.payementrestant);
      const paymentAmount = Number(paymentData.montant);

      console.log('[Payment] Initial state:', { initialAmount, paymentAmount });

      // Validate payment amount
      if (paymentAmount <= 0) {
        throw new Error('Le montant du paiement doit être supérieur à 0');
      }

      if (paymentAmount > initialAmount) {
        throw new Error('Le montant du paiement ne peut pas dépasser le montant restant');
      }

      // Make the payment request
      const response = await axiosInstance.post(
        ENDPOINTS.CONSULTATIONS.PAYMENT.CREATE,
        {
          consultation_id: paymentData.consultation_id,
          montant: paymentAmount.toString(),
          date_paiement: paymentData.date_paiement,
          type: paymentData.type,
          ...(paymentData.type === 'mobilemoney' && { 
            numero_mobile: paymentData.numero_mobile 
          }),
          ...(paymentData.type === 'prisencharge' && {
            numero_dossier: paymentData.numero_dossier,
            organisme: paymentData.organisme
          })
        }
      );

      console.log('[Payment] Payment response:', response.data);

      // If we have a successful response, return it immediately
      if (response.data && response.status === 200) {
        // Calculate expected remaining amount
        const expectedRemaining = Math.max(0, initialAmount - paymentAmount);
        
        return {
          Message: response.data.Message || 'Paiement effectué avec succès',
          consultation: response.data.consultation || {
            consultation_id: paymentData.consultation_id,
            montant: paymentAmount,
            date_paiement: paymentData.date_paiement,
            type: paymentData.type,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            id: response.data.id || Date.now()
          },
          "Reste à payer": response.data["Reste à payer"] !== undefined 
            ? response.data["Reste à payer"] 
            : expectedRemaining
        };
      }

      throw new Error('Réponse invalide du serveur');

    } catch (error: any) {
      console.error('[Payment] Error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          throw new Error(`Erreur de validation: ${errorMessages}`);
        }
      }
      
      if (error.response?.status === 404) {
        throw new Error('Consultation non trouvée');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }

      // Return the original error message or a generic one
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Une erreur est survenue lors du paiement'
      );
    }
  },

  getPaymentRemaining: async (consultationId: number): Promise<PaymentRemaining> => {
    try {
      const timestamp = Date.now();
      const response = await axiosInstance.get(
        `${ENDPOINTS.CONSULTATIONS.PAYMENT.REMAINING(consultationId)}?timestamp=${timestamp}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );

      const remaining = Number(response.data.payementrestant);
      console.log(`[Payment] Consultation ${consultationId} - Montant restant:`, remaining);
      
      return {
        payementrestant: remaining
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du montant restant:', error);
      throw error;
    }
  },
  };
