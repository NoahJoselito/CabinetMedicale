import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export interface Service {
  id: number;
  icone: string;
  nom: string;
  description_courte: string;
  details: string;
  horaires: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: number;
  name: string;
  prenom: string;
  email: string;
  numeroTelephone: string;
  organisme: string;
  numerodossierprisenchage: string;
  date_naissance?: string;
  adresse?: string;
  specialité?: string;
  emploi?: string | null;
  antecedents?: Array<{
    titre: string;
    description: string;
  }>;
}

export interface Appointment {
  id: number;
  date: string;
  heure: string;
  patient: {
    id?: number;
    name: string;
    prenom: string;
  };
  service: {
    nom: string;
  };
}

export interface AppointmentDetail extends Appointment {
  motif: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AppointmentData {
  patient: {
    name: string;
    prenom: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id: number;
    numeroTelephone: string;
    organisme: string;
    numerodossierprisenchage: string;
  };
  service_id: number;
  date: string;
  heure: string;
  motif: string;
}

interface NewPatientData {
  name: string;
  prenom: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  numeroTelephone: string;
  date_naissance: string;
  adresse: string;
  specialité: string;
  emploi: string | null;
  organisme: string;
  numerodossierprisenchage: string;
  antecedents: Array<{
    titre: string;
    description: string;
  }>;
}

export const RDVService = {
  getAllServices: async (): Promise<Service[]> => {
    const { data } = await axiosInstance.get(ENDPOINTS.SERVICES);
    return data;
  },
  searchPatients: async (query: string): Promise<Patient[]> => {
    const { data } = await axiosInstance.get(`${ENDPOINTS.PATIENTS.SEARCH}?q=${query}`);
    return data;
  },
  createAppointment: async (appointmentData: AppointmentData) => {
    const { data } = await axiosInstance.post(ENDPOINTS.APPOINTMENTS.CREATE, appointmentData);
    return data;
  },
  createPatient: async (patientData: NewPatientData) => {
    const { data } = await axiosInstance.post(ENDPOINTS.PATIENTS.CREATE, patientData);
    return data;
  },
  getAppointmentsByMonth: async (year: number, month: number): Promise<Appointment[]> => {
    try {
      const formattedMonth = month.toString().padStart(2, '0');
      const { data } = await axiosInstance.get(`${ENDPOINTS.APPOINTMENTS.BY_MONTH}?year=${year}&month=${formattedMonth}`);
      
      if (!data || !data.rendezvous) {
        console.warn('No appointments data received from server');
        return [];
      }

      // Formatage amélioré des rendez-vous
      return data.rendezvous
        .filter((rdv: any) => rdv.date && rdv.heure)
        .map((rdv: any) => {
          // S'assurer que la date est au bon format YYYY-MM-DD
          const dateObj = new Date(rdv.date);
          const formattedDate = dateObj.toISOString().split('T')[0];
          
          return {
            id: rdv.id,
            date: formattedDate,
            heure: rdv.heure ? rdv.heure.substring(0, 5) : '',
            patient: {
              id: rdv.patient?.id || rdv.user?.id,
              name: rdv.patient?.name || rdv.user?.name || 'Non renseigné',
              prenom: rdv.patient?.prenom || rdv.user?.prenom || ''
            },
            service: {
              nom: rdv.service?.nom || 'Service non spécifié'
            }
          };
        });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },
  getAppointmentsByDate: async (date: string): Promise<Appointment[]> => {
    try {
      const { data } = await axiosInstance.post(ENDPOINTS.APPOINTMENTS.BY_DATE, { date });
      
      if (!data || !Array.isArray(data)) {
        console.warn('No appointments data received from server');
        return [];
      }

      return data.map((rdv: any) => ({
        id: rdv.id,
        date: rdv.date,
        heure: rdv.heure,
        patient: {
          id: rdv.patient?.id,
          name: rdv.patient?.name || 'Non renseigné',
          prenom: rdv.patient?.prenom || ''
        },
        service: {
          nom: rdv.service?.nom || 'Service non spécifié'
        }
      }));
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      return [];
    }
  },
  getAllAppointments: async (): Promise<Appointment[]> => {
    try {
      const { data } = await axiosInstance.get(ENDPOINTS.APPOINTMENTS.ALL);
      
      if (!data || !data.rendezvous) {
        console.warn('No appointments data received from server');
        return [];
      }

      return data.rendezvous.map((rdv: any) => ({
        id: rdv.id,
        date: rdv.date,
        heure: rdv.heure,
        patient: {
          id: rdv.patient?.id,
          name: rdv.patient?.name || 'Non renseigné',
          prenom: rdv.patient?.prenom || ''
        },
        service: {
          nom: rdv.service?.nom || 'Service non spécifié'
        }
      }));
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      return [];
    }
  },
  getAppointmentDetails: async (id: number): Promise<AppointmentDetail> => {
    try {
      const { data } = await axiosInstance.get(`${ENDPOINTS.APPOINTMENTS.GET_BY_ID(id)}`);
      return {
        ...data,
        patient: {
          id: data.patient?.id,
          name: data.patient?.name || 'Non renseigné',
          prenom: data.patient?.prenom || ''
        },
        service: {
          nom: data.service?.nom || 'Service non spécifié'
        }
      };
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      throw error;
    }
  }
};
