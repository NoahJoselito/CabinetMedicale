"use client"

import Calendar from "./components/calendar"
import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import AddAppointmentForm from './components/AddAppointmentForm'
import { RDVService } from '@/services/RDVService'
import { FaCalendarCheck, FaClock, FaInfoCircle } from 'react-icons/fa'

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
        src="../img/laod.png" 
        alt="Chargement" 
        className="w-16 h-16 rounded-full"
      />
    </div>

    <motion.div 
      className="mt-4 text-xl font-semibold text-blue-500" 
      animate={{ scale: [1, 1.1, 1] }} 
      transition={{ duration: 1, repeat: Infinity }}
    >
      Chargement des rendez-vous...
    </motion.div>
    <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
  </motion.div>
</div>

);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(0);

  useEffect(() => {
    const loadAppointmentsCount = async () => {
      try {
        const appointments = await RDVService.getAllAppointments();
        setAppointmentsCount(appointments.length);
      } catch (error) {
        console.error('Error loading appointments count:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointmentsCount();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen  p-4 flex justify-center items-start text-gray-800">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-500">
              Gestion des Rendez-vous
            </h2>
          </div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <span>+ Nouveau RDV</span>
            </button>
          </div>
          {/* Statistiques */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600">
              <FaCalendarCheck className="text-xl" />
              <span className="font-semibold">Total des rendez-vous</span>
            </div>
            <p className="text-2xl font-bold mt-2">{appointmentsCount} RDV</p>
          </div>

          {/* Info Boxes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <FaClock className="text-xl text-blue-600" />
              <h3 className="font-semibold">Horaires de consultation</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>Lundi - Vendredi: 8h00 - 18h00</li>
              <li>Samedi: 8h00 - 12h00</li>
              <li>Dimanche: Fermé</li>
            </ul>
          </div>

          {/* Notice */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-700">
              <FaInfoCircle className="text-xl" />
              <h3 className="font-semibold">Important</h3>
            </div>
            <p className="mt-2 text-yellow-600">
              Pour les urgences en dehors des heures de consultation, 
              veuillez contacter le service d'urgence au 15.
            </p>
          </div>
        </div>

        {showForm ? (
          <AddAppointmentForm onClose={() => setShowForm(false)} />
        ) : (
          <Calendar />
        )}
      </div>
    </div>
  );
}