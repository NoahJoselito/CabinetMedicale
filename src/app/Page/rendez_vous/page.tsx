'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Phone, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from "../../components/ui/Button";
import { useSearchParams } from 'next/navigation';

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-24 h-24 flex items-center justify-center">
        <motion.div 
          className="absolute w-full h-full border-4 border-blue-500 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <img 
          src="/img/laod.png" 
          alt="Chargement" 
          className="w-16 h-16 rounded-full"
        />
      </div>

      <motion.div 
        className="mt-4 text-xl font-semibold text-blue-500" 
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ duration: 1, repeat: Infinity }}
      >
        Chargement de la Réservation...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

export default function AppointmentForm() {
  const searchParams = useSearchParams();
  const serviceFromURL = searchParams.get('service') || '';
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: '',
    specialty: '',
    symptoms: '',
    urgency: 'normal'
  });

  useEffect(() => {
    setFormData((prev) => ({ 
      ...prev, 
      specialty: serviceFromURL 
    }));
  }, [serviceFromURL]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Rendez-vous réservé:', formData);
  };

  if (loading) return <Loading />;

  return (
    <div className="h-screen overflow-y-auto bg-gray-100">
      <div className="max-w-lg mx-auto mt-10 p-6 text-gray-600 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Réservez un Rendez-vous</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 font-medium">
              <User size={18} /> Informations Personnelles
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-2"
              placeholder="Votre nom complet"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 font-medium">
                <Mail size={18} /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-2"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-medium">
                <Phone size={18} /> Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-2"
                placeholder="XXX XX XXX XX"
              />
            </div>
          </div>

          <div>
            <label className="font-medium">Spécialité</label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Sélectionnez une spécialité</option>
              <option value="Consultation Générale">Consultation Générale</option>
              <option value="Pédiatrie">Pédiatrie</option>
              <option value="Gynécologie">Gynécologie</option>
              <option value="Cardiologie">Cardiologie</option>
              <option value="Radiologie">Radiologie</option>
              <option value="Dermatologie">Dermatologie</option>
              <option value="Ophtalmologie">Ophtalmologie</option>
              <option value="Dentisterie">Dentisterie</option>
              <option value="Kinésithérapie">Kinésithérapie</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 font-medium">
                <Calendar size={18} /> Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-2"
              />
            </div>

            <div className='cursor-pointer'>
              <label className="flex items-center gap-2 font-medium">
                <Clock size={18} /> Heure
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-2"
              />
            </div>
          </div>

          <div>
            <label className="font-medium">Niveau d'urgence</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value="normal"
                  checked={formData.urgency === 'normal'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Normal
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value="urgent"
                  checked={formData.urgency === 'urgent'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Urgent
              </label>
            </div>
          </div>

          <div>
            <label className="font-medium">Symptômes</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-2"
              rows={3}
              placeholder="Décrivez vos symptômes"
            />
          </div>

          <div>
            <label className="font-medium">Message supplémentaire</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-2"
              rows={3}
              placeholder="Informations complémentaires"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Confirmer le rendez-vous
          </Button>
        </form>
      </div>
    </div>
  );
}
