"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RDVService, Service, Patient } from '@/services/RDVService'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface AddAppointmentFormProps {
  onClose: () => void
}

export default function AddAppointmentForm({ onClose }: AddAppointmentFormProps) {
  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]
  const [services, setServices] = useState<Service[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    phone: '',
    date: today, // Initialisation avec la date du jour
    time: '',
    reason: '',
    serviceId: '' // Nouveau champ
  })

  const [newPatientData, setNewPatientData] = useState({
    name: '',
    prenom: '',
    email: '',
    numeroTelephone: '',
    date_naissance: '',
    adresse: '',
    specialité: '',
    emploi: '',
    organisme: '',
    numerodossierprisenchage: '',
    antecedents: [{ titre: 'Aucun antécédent', description: 'Aucun antécédent connu' }] // Default value
  });

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await RDVService.getAllServices()
        setServices(data)
      } catch (error) {
        console.error('Failed to load services:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadServices()
  }, [])

  const handlePatientSearch = async (query: string) => {
    setSearchTerm(query)
    if (query.length >= 2) {
      try {
        const results = await RDVService.searchPatients(query);
        setPatients(results);
        setShowNewPatientForm(results.length === 0);
      } catch (error) {
        console.error('Failed to search patients:', error);
        setShowNewPatientForm(true);
      }
    } else {
      setPatients([]);
      setShowNewPatientForm(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      ...formData,
      patientId: patient.id.toString(),
      patientName: `${patient.name} ${patient.prenom}`,
      phone: patient.numeroTelephone
    })
    setPatients([])
    setSearchTerm(`${patient.name} ${patient.prenom}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let patientInfo;

      // Création d'un nouveau patient
      if (!selectedPatient && showNewPatientForm) {
        if (!newPatientData.antecedents[0].titre || !newPatientData.antecedents[0].description) {
          toast.error('Veuillez remplir les informations sur les antécédents', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
          });
          setIsSubmitting(false);
          return;
        }

        const newPatientPayload = {
          ...newPatientData,
          password: 'Patient@123',
          password_confirmation: 'Patient@123',
          role_id: 4
        };

        try {
          const response = await RDVService.createPatient(newPatientPayload);
          patientInfo = response.user;
          toast.success('Nouveau patient créé avec succès!', {
            position: "top-right",
            autoClose: 2000,
          });
        } catch (error: any) {
          if (error.response?.status === 422) {
            const errors = error.response.data.errors;
            Object.values(errors).forEach((errorMessages: any) => {
              errorMessages.forEach((message: string) => 
                toast.error(message, {
                  position: "top-right",
                  autoClose: 4000,
                })
              );
            });
            setIsSubmitting(false);
            return;
          }
          throw error;
        }
      } else if (!selectedPatient) {
        toast.error('Veuillez sélectionner ou créer un patient', {
          position: "top-right",
          autoClose: 3000,
        });
        setIsSubmitting(false);
        return;
      } else {
        patientInfo = selectedPatient;
      }

      // Création du rendez-vous
      const appointmentData = {
        patient: {
          name: patientInfo.name,
          prenom: patientInfo.prenom,
          email: patientInfo.email,
          password: 'Patient@123',
          password_confirmation: 'Patient@123',
          role_id: 4,
          numeroTelephone: patientInfo.numeroTelephone,
          organisme: patientInfo.organisme,
          numerodossierprisenchage: patientInfo.numerodossierprisenchage
        },
        service_id: parseInt(formData.serviceId),
        date: formData.date,
        heure: formData.time,
        motif: formData.reason
      };

      await RDVService.createAppointment(appointmentData);
      toast.success('Rendez-vous enregistré avec succès!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Attendre que le toast soit affiché avant de fermer
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-lg p-6"
    >
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-blue-600">Nouveau Rendez-vous</h3>
        <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-gray-700 mb-2">Rechercher un patient</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handlePatientSearch(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Rechercher un patient..."
          />
          {patients.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => selectPatient(patient)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {patient.name} {patient.prenom} - {patient.numeroTelephone}
                </div>
              ))}
            </div>
          )}
        </div>
                {showNewPatientForm && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <h4 className="font-medium text-gray-700">Nouveau Patient</h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom"
                value={newPatientData.name}
                onChange={(e) => setNewPatientData({...newPatientData, name: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Prénom"
                value={newPatientData.prenom}
                onChange={(e) => setNewPatientData({...newPatientData, prenom: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newPatientData.email}
                onChange={(e) => setNewPatientData({...newPatientData, email: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                value={newPatientData.numeroTelephone}
                onChange={(e) => setNewPatientData({...newPatientData, numeroTelephone: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="date"
                placeholder="Date de naissance"
                value={newPatientData.date_naissance}
                onChange={(e) => setNewPatientData({...newPatientData, date_naissance: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Adresse"
                value={newPatientData.adresse}
                onChange={(e) => setNewPatientData({...newPatientData, adresse: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Organisme"
                value={newPatientData.organisme}
                onChange={(e) => setNewPatientData({...newPatientData, organisme: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Numéro de dossier"
                value={newPatientData.numerodossierprisenchage}
                onChange={(e) => setNewPatientData({...newPatientData, numerodossierprisenchage: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="col-span-2">
              <h5 className="font-medium text-gray-700 mb-2">Antécédents</h5>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Titre de l'antécédent"
                  value={newPatientData.antecedents[0].titre}
                  onChange={(e) => setNewPatientData({
                    ...newPatientData,
                    antecedents: [{
                      ...newPatientData.antecedents[0],
                      titre: e.target.value
                    }]
                  })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <textarea
                  placeholder="Description de l'antécédent"
                  value={newPatientData.antecedents[0].description}
                  onChange={(e) => setNewPatientData({
                    ...newPatientData,
                    antecedents: [{
                      ...newPatientData.antecedents[0],
                      description: e.target.value
                    }]
                  })}
                  className="w-full p-2 border rounded-lg"
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-2">Service</label>
          <select
            value={formData.serviceId}
            onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
            className={`w-full p-2 border rounded-lg bg-white cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
            required
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? 'Chargement des services...' : 'Sélectionnez un service'}
            </option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.icone} {service.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            min={today} // Empêcher la sélection de dates passées
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Heure</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Motif</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            className="w-full p-2 border rounded-lg"
            rows={3}
            required
          />
        </div>



        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-400 bg-gray-300 rounded-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
