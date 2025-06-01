"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDashboardData } from '@/services/dashService';
import { FaUsers, FaCalendarCheck, FaChartLine } from 'react-icons/fa';

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
        src="./img/laod.png" 
        alt="Chargement" 
        className="w-16 h-16 rounded-full"
      />
    </div>

    <motion.div 
      className="mt-4 text-xl font-semibold text-blue-500" 
      animate={{ scale: [1, 1.1, 1] }} 
      transition={{ duration: 1, repeat: Infinity }}
    >
      Chargement de la tableaux de bord...
    </motion.div>
    <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
  </motion.div>
</div>

);
interface Patient {
  id: number;
  name?: string;
  email?: string;
  telephone?: string;  // Champ principal pour le téléphone
  phone?: string;      // Fallback 1
  phone_number?: string; // Fallback 2
  created_at?: string;
}

interface DashboardData {
  patients: Patient[];
  consultations: any[];
  totalConsultations: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    patients: [],
    consultations: [],
    totalConsultations: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        console.log('Dashboard Data Received:', data);
        
        setDashboardData({
          patients: Array.isArray(data.patients) ? data.patients : [],
          consultations: data.consultations,
          totalConsultations: data.totalConsultations
        });
        
        console.log('Dashboard State Updated:', {
          patientsCount: data.patients.length,
          consultationsCount: data.totalConsultations
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setDashboardData({ patients: [], consultations: [], totalConsultations: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6 w-full min-h-screen pt-20 bg-gray-100">
      <h1 className="text-gray-800 text-3xl font-bold mb-8">Tableau de Bord</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-full">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Patients</h2>
              <p className="text-2xl font-bold text-gray-700">{dashboardData.patients.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-full">
              <FaCalendarCheck className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Consultations</h2>
              <p className="text-2xl font-bold text-gray-700">
                {dashboardData.totalConsultations}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-full">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Taux de consultation</h2>
              <p className="text-2xl font-bold text-gray-700">
                {dashboardData.patients.length > 0 
                  ? Math.round((dashboardData.consultations.length / dashboardData.patients.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tables Container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Recent Patients Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-6 w-full md:w-1/2"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Patients Récents</h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(Array.isArray(dashboardData.patients) ? dashboardData.patients : [])
                  .slice(0, 5)
                  .map((patient: any) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {patient.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {patient.created_at 
                            ? new Date(patient.created_at).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Appointments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-lg p-6 w-full md:w-1/2"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Rendez-vous du jour</h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heure
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.consultations.map((appointment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patientName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${appointment.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' : 
                          appointment.status === 'Confirmé' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'En cours' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
