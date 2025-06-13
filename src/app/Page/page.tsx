"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDashboardData } from '@/services/dashService';
import { FaUsers, FaCalendarCheck, FaChartLine } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
// Mise à jour de l'interface Patient
interface Patient {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// Mise à jour de l'interface pour les rendez-vous
interface Service {
  nom: string;
}

interface Appointment {
  id: number;
  date: string;
  original_time: string;
  patientName: string;
  service: string | Service;
}

interface DashboardData {
  patients: Patient[];
  appointments: Appointment[];
  totalAppointments: number;
  revenue: {
    labels: string[];
    data: number[];
  };
  dailyRevenue: {
    labels: string[];
    data: number[];
  };
  todayRevenue?: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    patients: [],
    appointments: [],
    totalAppointments: 0,
    revenue: {
      labels: [],
      data: []
    },
    dailyRevenue: {
      labels: [],
      data: []
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        console.log('Dashboard Data Received:', data);
        
        setDashboardData({
          patients: Array.isArray(data.patients) ? data.patients : [],
          appointments: data.appointments,
          totalAppointments: data.totalAppointments,
          revenue: data.revenue,
          dailyRevenue: data.dailyRevenue
        });
        
        console.log('Dashboard State Updated:', {
          patientsCount: data.patients.length,
          appointmentsCount: data.totalAppointments
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setDashboardData({ patients: [], appointments: [], totalAppointments: 0, revenue: { labels: [], data: [] }, dailyRevenue: { labels: [], data: [] } });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6 w-full min-h-screen pt-20 bg-gray-100">
      <h1 className="text-gray-600 text-3xl font-bold mb-8">Tableau de Bord</h1>
      
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
              <h2 className="text-gray-600 text-sm">Rendez-vous</h2>
              <p className="text-2xl font-bold text-gray-700">
                {dashboardData.totalAppointments}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-full">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Chiffre d'affaires du jour</h2>
              <p className="text-2xl font-bold text-gray-700">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'MGA'
                }).format(dashboardData.dailyRevenue.data[new Date().getDate() - 1] || 0)}
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
                    Service
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(Array.isArray(dashboardData.appointments) ? dashboardData.appointments : [])
                  .map((appointment, index) => (
                    <tr key={appointment.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.original_time || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patientName}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {typeof appointment.service === 'string' 
                            ? appointment.service 
                            : appointment.service?.nom || 'N/A'}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg shadow-lg p-6 mt-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Chiffre d'affaires mensuel</h2>
        <div className="h-[400px] w-full">
          <Bar
            data={{
              labels: dashboardData.revenue?.labels || [],
              datasets: [
                {
                  label: 'Chiffre d\'affaires (Ar)',
                  data: dashboardData.revenue?.data || [],
                  backgroundColor: 'rgba(34, 151, 197, 0.6)',
                  borderColor: 'rgba(34, 151, 197, 0.6)',
                  borderWidth: 2,
                  borderRadius: 6,
                  barThickness: 32,
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              devicePixelRatio: 2,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'MGA'
                        }).format(context.parsed.y);
                      }
                      return label;
                    }
                  }
                },
                legend: {
                  position: 'top',
                  labels: {
                    font: {
                      size: 14,
                      weight: 'bold'
                    },
                    padding: 20
                  }
                },
                title: {
                  display: true,
                  text: 'Chiffre d\'affaires par mois',
                  font: {
                    size: 16,
                    weight: 'bold'
                  },
                  padding: 20
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawOnChartArea: true,
                   
                  },
                  ticks: {
                    font: {
                      size: 12,
                      weight: 500
                    },
                    padding: 10,
                    callback: function(value) {
                      return value.toLocaleString() + ' Ar';
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      size: 12,
                      weight: 500
                    },
                    padding: 5
                  }
                }
              }
            }}
          />
        </div>
      </motion.div>

      {/* Daily Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-lg shadow-lg p-6 mt-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Chiffre d'affaires journalier</h2>
        <div className="h-[400px] w-full">
          <Bar
            data={{
              labels: dashboardData.dailyRevenue?.labels || [],
              datasets: [
                {
                  label: 'Chiffre d\'affaires (Ar)',
                  data: dashboardData.dailyRevenue?.data || [],
                  backgroundColor: 'rgba(72, 187, 120, 0.6)',
                  borderColor: 'rgba(72, 187, 120, 0.6)',
                  borderWidth: 2,
                  borderRadius: 6,
                  barThickness: 32,
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              devicePixelRatio: 2,
              plugins: {
                tooltip: {
                  enabled: true,
                  mode: 'index',
                  intersect: false,
                },
                legend: {
                  position: 'top',
                  labels: {
                    font: {
                      size: 14,
                      weight: 'bold'
                    },
                    padding: 20
                  }
                },
                title: {
                  display: true,
                  text: `Chiffre d'affaires journalier - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
                  font: {
                    size: 16,
                    weight: 'bold'
                  },
                  padding: 20
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0, 0, 0, 0.1)' },
                  ticks: {
                    font: { size: 12, weight: 500 },
                    padding: 10,
                    callback: (value) => `${value.toLocaleString()} Ar`
                  }
                },
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { size: 12, weight: 500 },
                    padding: 5
                  }
                }
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
