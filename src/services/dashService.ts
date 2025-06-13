import axiosInstance from './axiosConfig';
import { ENDPOINTS } from './config';

export const getDashboardData = async () => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const [patientsResponse, appointmentsResponse, revenueMonthlyResponse, revenueDailyResponse] = await Promise.all([
      axiosInstance.get(ENDPOINTS.DASHBOARD.RECENT_PATIENTS),
      axiosInstance.get(ENDPOINTS.APPOINTMENTS.ALL),
      axiosInstance.get(ENDPOINTS.DASHBOARD.REVENUE_MONTHLY(currentYear)),
      axiosInstance.get(ENDPOINTS.DASHBOARD.REVENUE_DAILY(currentYear, currentMonth))
    ]);

    // Log revenue data
    console.log('Revenue Response:', revenueMonthlyResponse.data);

    // Extract appointments data with proper field mapping
    const allAppointments = Array.isArray(appointmentsResponse.data?.rendezvous) 
      ? appointmentsResponse.data.rendezvous 
      : Array.isArray(appointmentsResponse.data) 
        ? appointmentsResponse.data 
        : [];

    // Map appointments to correct field names
    const todayAppointments = allAppointments
      .filter((appointment: { date: string | number | Date; heure: any; }) => {
        // Log pour déboguer la date reçue
        console.log('Raw appointment:', {
          date: appointment.date,
          heure: appointment.heure,
          date_complete: `${appointment.date} ${appointment.heure}`
        });

        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        return appointmentDate === new Date().toISOString().split('T')[0];
      })
      .map((appointment: { date: string; heure: string; patient: { name: any; }; nom_patient: any; service: { nom: any; }; type_service: any; }) => {
        // Combiner la date et l'heure
        const dateStr = appointment.date || '';
        const timeStr = appointment.heure || '00:00';
        const fullDateTime = `${dateStr}T${timeStr}`;

        return {
          ...appointment,
          patientName: appointment.patient?.name || appointment.nom_patient || 'N/A',
          service: typeof appointment.service === 'object' 
            ? appointment.service.nom || 'N/A'
            : appointment.service || appointment.type_service || 'N/A',
          date: fullDateTime,
          original_time: timeStr
        };
      });

    // Log pour vérifier les dates traitées
    console.log('Processed appointments:', todayAppointments.map((apt: { id: any; patientName: any; original_time: any; date: any; }) => ({
      id: apt.id,
      patientName: apt.patientName,
      original_time: apt.original_time,
      fullDateTime: apt.date
    })));

    // Format recent patients data with proper field mapping
    const recentPatients = (Array.isArray(patientsResponse.data) 
      ? patientsResponse.data 
      : Array.isArray(patientsResponse.data?.patients)
        ? patientsResponse.data.patients
        : [])
      .map((patient: { id: any; name: any; nom: any; nom_patient: any; email: any; created_at: any; date_creation: any; }) => ({
        id: patient.id,
        name: patient.name || patient.nom || patient.nom_patient,
        email: patient.email,
        created_at: patient.created_at || patient.date_creation
      }));

    // Process monthly revenue data
    const monthlyData = revenueMonthlyResponse.data;
    console.log('Raw Monthly Revenue:', monthlyData);

    const revenueData = {
      labels: monthlyData.labels || [],
      data: monthlyData.data.map((value: string | number) => 
        typeof value === 'string' ? parseFloat(value) : value || 0
      )
    };

    // Process daily revenue data
    const dailyData = revenueDailyResponse.data;
    console.log('Raw Daily Revenue:', dailyData);

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const dailyRevenueData = {
      labels: dailyData.labels || Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
      data: (dailyData.data || Array(daysInMonth).fill(0)).map((value: any) => 
        typeof value === 'string' ? parseFloat(value) || 0 : value || 0
      )
    };

    const today = new Date().getDate();
    const todayRevenue = dailyRevenueData.data[today - 1] || 0;

    console.log('Today\'s Revenue:', todayRevenue);

    return {
      patients: recentPatients,
      appointments: todayAppointments,
      totalAppointments: allAppointments.length,
      recentAppointments: todayAppointments.slice(0, 5),
      revenue: revenueData,
      dailyRevenue: dailyRevenueData,
      todayRevenue
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { 
      patients: [], 
      appointments: [], 
      totalAppointments: 0,
      recentAppointments: [],
      revenue: { labels: [], data: [] },
      dailyRevenue: { labels: [], data: [] }
    };
  }
};
