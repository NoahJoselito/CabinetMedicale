"use client"

import { useState, useEffect } from "react"
import { RDVService, AppointmentDetail } from "@/services/RDVService"

interface Appointment {
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

const Calendar = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [dailyAppointments, setDailyAppointments] = useState<{[key: string]: Appointment[]}>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentDay = new Date().getDate()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate() // Calcul correct du nombre de jours


  const startDayOffset = new Date(currentYear, currentMonth, 1).getDay()

  const getAppointmentsForDay = async (day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Check if we already have the appointments for this day
    if (dailyAppointments[dateStr]) {
      return dailyAppointments[dateStr];
    }

    try {
      const appointments = await RDVService.getAppointmentsByDate(dateStr);

      // Filter these appointments by current patient if role is patient (role_id === 4)
      let currentUser: any = null;
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        currentUser = userStr ? JSON.parse(userStr) : null;
      } catch (_) {
        currentUser = null;
      }
      const filteredForDay = (currentUser?.role_id === 4 && currentUser?.id)
        ? appointments.filter(apt => apt.patient?.id === currentUser.id)
        : appointments;
      // Store the appointments in state
      setDailyAppointments(prev => ({
        ...prev,
        [dateStr]: filteredForDay
      }));
      return filteredForDay;
    } catch (error) {
      console.error('Error fetching appointments for day:', error);
      return [];
    }
  }

  // Load appointments for the current month and filter for patient if role is 4
  useEffect(() => {
    const loadMonthAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await RDVService.getAppointmentsByMonth(currentYear, currentMonth + 1);
        // Determine if current user is a patient
        let currentUser: any = null;
        try {
          const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          currentUser = userStr ? JSON.parse(userStr) : null;
        } catch (_) {
          currentUser = null;
        }

        const filteredData = (currentUser?.role_id === 4 && currentUser?.id)
          ? data.filter(apt => apt.patient?.id === currentUser.id)
          : data;
        
        // Group appointments by date
        const appointmentsByDate = filteredData.reduce((acc: {[key: string]: Appointment[]}, apt) => {
          if (!acc[apt.date]) {
            acc[apt.date] = [];
          }
          acc[apt.date].push(apt);
          return acc;
        }, {});

        setDailyAppointments(appointmentsByDate);
        setAppointments(filteredData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Impossible de charger les rendez-vous. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMonthAppointments();
  }, [currentYear, currentMonth]);

  const handleDateClick = async (day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedTime(null);
    
    try {
      const appointments = await getAppointmentsForDay(day);
      setSelectedDateAppointments(appointments);
    } catch (error) {
      console.error('Error fetching appointments for selected date:', error);
      setSelectedDateAppointments([]);
    }
  }

  const handleViewDetails = async (appointmentId: number) => {
    try {
      setIsLoading(true);
      const details = await RDVService.getAppointmentDetails(appointmentId);
      setSelectedAppointment(details);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      setError('Impossible de charger les détails du rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the calendar grid rendering
  const renderCalendarDays = () => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      const dayAppointments = dailyAppointments[dateStr] || [];
      const hasAppointments = dayAppointments.length > 0;
      const isSelected = selectedDate === dateStr;

      return (
        <div key={day} className="relative">
          <button
            onClick={() => handleDateClick(day)}
            className={`w-full h-auto min-h-[120px] p-1 border rounded-lg relative cursor-pointer transition-all
              ${isSelected ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200"}
              ${hasAppointments ? "bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-gray-50"}`}
          >
            <span className={`absolute top-1 left-1 text-sm ${hasAppointments ? "font-semibold text-blue-600" : ""}`}>
              {day}
            </span>

            {hasAppointments && (
              <div className="mt-5 text-xs">
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div 
                      key={apt.id} 
                      className="mx-1 p-1.5 bg-white/80 backdrop-blur-sm rounded border border-blue-200 shadow-sm hover:bg-blue-50"
                      title={`${apt.patient.name} ${apt.patient.prenom} - ${apt.service.nom}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-blue-600 text-[10px]">{apt.heure}</span>
                        <span className="truncate text-gray-600 text-[10px]">
                          {apt.patient.name.substring(0, 10)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-center text-blue-500 text-[10px] font-medium bg-blue-50 rounded-md py-0.5">
                      +{dayAppointments.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>
        </div>
      );
    });
  };

  // Load initial appointments for each day and filter for patient if role is 4
  useEffect(() => {
    const loadAllAppointments = async () => {
      setIsLoading(true);
      try {
        const allAppointments = await RDVService.getAllAppointments();

        let currentUser: any = null;
        try {
          const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          currentUser = userStr ? JSON.parse(userStr) : null;
        } catch (_) {
          currentUser = null;
        }

        const filteredAll = (currentUser?.role_id === 4 && currentUser?.id)
          ? allAppointments.filter(apt => apt.patient?.id === currentUser.id)
          : allAppointments;
        
        // Group appointments by date
        const appointmentsByDate = filteredAll.reduce((acc: {[key: string]: Appointment[]}, apt) => {
          if (!acc[apt.date]) {
            acc[apt.date] = [];
          }
          acc[apt.date].push(apt);
          return acc;
        }, {});

        setDailyAppointments(appointmentsByDate);
        setAppointments(filteredAll);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setError('Erreur lors du chargement des rendez-vous');
        setIsLoading(false);
      }
    };

    loadAllAppointments();
  }, []);

  // Debug: Log appointments state changes
  useEffect(() => {
    console.log('Appointments state updated:', appointments);
  }, [appointments]);

  const renderDetailModal = () => {
    if (!selectedAppointment) return null;
    
    return (
      <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${isDetailModalOpen ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
          <div className="flex justify-between items-center bg-blue-500 text-white px-6 py-4 rounded-t-lg">
            <h3 className="text-lg font-semibold">Détails du rendez-vous</h3>
            <button onClick={() => setIsDetailModalOpen(false)} className="text-white hover:text-gray-200 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold">{new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-600">Heure</p>
                <p className="font-semibold">{selectedAppointment.heure}</p>
              </div>
              <div>
                <p className="text-gray-600">Patient</p>
                <p className="font-semibold">{selectedAppointment.patient.name} {selectedAppointment.patient.prenom}</p>
              </div>
              <div>
                <p className="text-gray-600">Service</p>
                <p className="font-semibold">{selectedAppointment.service.nom}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Motif</p>
                <p className="font-semibold">{selectedAppointment.motif || 'Non spécifié'}</p>
              </div>
              <div>
                <p className="text-gray-600">Statut</p>
                <p className="font-semibold">{selectedAppointment.status || 'En attente'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <p>Debug: Total appointments loaded: {appointments.length}</p>
        <p>Current month: {currentMonth + 1}/{currentYear}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
          </h2>

          <div className="grid grid-cols-7 gap-3 mb-4">
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
              <div key={day} className="text-sm font-semibold text-center text-gray-500">
                {day}
              </div>
            ))}

            {/* Espaces vides pour les jours avant le 1er */}
            {Array(startDayOffset).fill(null).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {renderCalendarDays()}
          </div>

          {/* Liste détaillée des rendez-vous pour la date sélectionnée */}
          {selectedDate && (
            <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-500 text-white px-4 py-3">
                <h3 className="text-lg font-semibold">
                  Rendez-vous du {new Date(selectedDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {selectedDateAppointments.length > 0 ? (
                  selectedDateAppointments.map(apt => (
                    <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-500 text-sm">Heure</span>
                          <p className="font-semibold">{apt.heure}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Patient</span>
                          <p className="font-semibold">{`${apt.patient?.name || ''} ${apt.patient?.prenom || ''}`}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Service</span>
                          <p className="font-semibold">{apt.service?.nom || ''}</p>
                        </div>
                        <div className="flex items-center justify-end">
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Aucun rendez-vous programmé pour cette date
                  </div>
                )}
              </div>
            </div>
          )}

          {renderDetailModal()}
        </>
      )}
    </div>
  )
}

export default Calendar
