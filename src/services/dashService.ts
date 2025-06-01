import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export const getDashboardData = async () => {
  try {
    const patientsResponse = await axiosInstance.get(ENDPOINTS.PATIENTS.LIST);
    console.log('Patient Data Structure:', {
      firstPatient: patientsResponse.data?.data?.[0] || patientsResponse.data?.[0],
      dataPath: patientsResponse.data?.data ? 'data.data' : 'data',
      availableFields: patientsResponse.data?.data?.[0] 
        ? Object.keys(patientsResponse.data.data[0])
        : Object.keys(patientsResponse.data?.[0] || {})
    });

    const consultationsResponse = await axiosInstance.get(ENDPOINTS.CONSULTATIONS.LIST);
    
    // Log the raw response to see the structure
    console.log('Consultations Response:', consultationsResponse.data);

    // Handle both possible data structures
    const consultations = consultationsResponse.data?.consultations || 
                         consultationsResponse.data?.data || 
                         consultationsResponse.data || 
                         [];
    
    console.log('Processed Consultations:', consultations);

    // Count all consultations without filtering for now
    const activeConsultations = Array.isArray(consultations) ? consultations : [];
    
    console.log('Active Consultations Count:', activeConsultations.length);

    // Données simulées du chiffre d'affaires (à remplacer par l'appel API réel)
    const revenueData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      data: [45000, 52000, 48000, 54000, 58000, 47000, 51000, 55000, 49000, 53000, 56000, 50000]
    };

    return {
      patients: patientsResponse.data?.data || patientsResponse.data || [],
      consultations: activeConsultations,
      totalConsultations: activeConsultations.length,
      recentConsultations: activeConsultations.slice(0, 5),
      revenue: revenueData
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { 
      patients: [], 
      consultations: [], 
      totalConsultations: 0,
      recentConsultations: [],
      revenue: { labels: [], data: [] }
    };
  }
};
