"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'

// Services disponibles (à déplacer vers une configuration ou API si nécessaire)
const AVAILABLE_SERVICES = [
  { id: 1, name: "Consultation générale" },
  { id: 2, name: "Pédiatrie" },
  { id: 3, name: "Cardiologie" },
  { id: 4, name: "Dermatologie" },
  { id: 5, name: "Gynécologie" }
]

interface AddAppointmentFormProps {
  onClose: () => void
}

export default function AddAppointmentForm({ onClose }: AddAppointmentFormProps) {
  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    date: today, // Initialisation avec la date du jour
    time: '',
    reason: '',
    serviceId: '' // Nouveau champ
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ajouter ici la logique pour sauvegarder le rendez-vous
    console.log(formData)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-blue-600">Nouveau Rendez-vous</h3>
        <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Nom du patient</label>
          <input
            type="text"
            value={formData.patientName}
            onChange={(e) => setFormData({...formData, patientName: e.target.value})}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Service</label>
          <select
            value={formData.serviceId}
            onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
            className="w-full p-2 border rounded-lg bg-white"
            required
          >
            <option value="">Sélectionnez un service</option>
            {AVAILABLE_SERVICES.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
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
            className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-400  bg-gray-300 rounded-lg"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </motion.div>
  )
}
