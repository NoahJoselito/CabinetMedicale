"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaTrash, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import { BiSearch } from 'react-icons/bi';
import { motion } from 'framer-motion';
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { patientService } from '@/services/patientService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        Chargement des patients...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

const MyComponent = () => {
  interface Patient {
    id: number;
    name: string;
    prenom: string;
    email: string;
    password: string;
    role_id: number;
    numeroTelephone: string;
    date_naissance: string;
    adresse: string;
    antecedents_medicaux: string;
  }

  const initialPatientData = {
    name: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: 4,
    numeroTelephone: '',
    date_naissance: '',
    adresse: '',
    antecedents_medicaux: '',
  };

  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientData, setPatientData] = useState(initialPatientData);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Supprimer ces états de pagination
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatients();
      setPatients(response.data.map(patient => ({
        id: patient.id || 0,
        name: patient.name || '',
        prenom: patient.prenom || '',
        email: patient.email || '',
        password: patient.password || '',
        role_id: patient.role_id || 4,
        numeroTelephone: patient.numeroTelephone || '',
        date_naissance: patient.date_naissance || '',
        adresse: patient.adresse || '',
        antecedents_medicaux: patient.antecedents_medicaux || ''
      })));
    } catch (error) {
      toast.error('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Modifier le calcul des patients filtrés
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const currentPatients = patients.filter((patient: Patient) =>
    (patient?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient?.prenom ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient?.numeroTelephone ?? '').includes(searchTerm) ||
    (patient?.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcul pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedPatients = currentPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentPatients.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const resetForm = () => {
    setPatientData(initialPatientData);
    setEditingPatient(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    resetForm();
  };

  // Ajouter cette fonction pour générer un mot de passe aléatoire
  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleAddOrEditPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const randomPassword = generateRandomPassword();
      const patientPayload = {
        ...patientData,
        role_id: 4 as const,
        password: !editingPatient ? randomPassword : undefined,
        password_confirmation: !editingPatient ? randomPassword : undefined
      };
      
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, patientPayload);
        toast.success('Patient modifié avec succès !');
      } else {
        const response = await patientService.createPatient(patientPayload);
        if (response) {
          toast.success('Patient ajouté avec succès !');
        } else {
          throw new Error('Erreur lors de la création du patient');
        }
      }
      
      closeForm();
      const response = await patientService.getPatients();
      setPatients(response.data.map(patient => ({
        id: patient.id || 0,
        name: patient.name || '',
        prenom: patient.prenom || '',
        email: patient.email || '',
        password: patient.password || '',
        role_id: patient.role_id || 4,
        numeroTelephone: patient.numeroTelephone || '',
        date_naissance: patient.date_naissance || '',
        adresse: patient.adresse || '',
        antecedents_medicaux: patient.antecedents_medicaux || ''
      })));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setPatientData({
      name: patient.name || '',
      prenom: patient.prenom || '',
      email: patient.email || '',
      password: '',  // Changed from patient.password
      password_confirmation: '', // Changed from patient.password
      role_id: patient.role_id || 4,
      numeroTelephone: patient.numeroTelephone || '',
      date_naissance: patient.date_naissance || '',
      adresse: patient.adresse || '',
      antecedents_medicaux: patient.antecedents_medicaux || ''
    });
    setIsFormVisible(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      setIsDeletingPatient(true);
      try {
        await patientService.deletePatient(patientToDelete.id);
        toast.success('Patient supprimé avec succès !');
        const response = await patientService.getPatients();
        setPatients(response.data.map(patient => ({
          id: patient.id || 0,
          name: patient.name || '',
          prenom: patient.prenom || '',
          email: patient.email || '',
          password: patient.password || '',
          role_id: patient.role_id || 4,
          numeroTelephone: patient.numeroTelephone || '',
          date_naissance: patient.date_naissance || '',
          adresse: patient.adresse || '',
          antecedents_medicaux: patient.antecedents_medicaux || ''
        })));
      } catch (error) {
        toast.error('Erreur lors de la suppression du patient');
      } finally {
        setIsDeletingPatient(false);
        setShowConfirmModal(false);
        setPatientToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setPatientToDelete(null);
  };

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen text-gray-700 p-8 bg-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <h5 className="text-lg">Liste des Patients</h5>
          <div className="relative w-64 mt-4">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              placeholder="Rechercher"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <button 
          onClick={() => setIsFormVisible(true)} 
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center z-50"
        >
          <FaPlus className="mr-2 " /> Ajouter un Patient
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Nom</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Prénom</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Téléphone</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Date de naissance</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient: Patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{patient.name}</td>
                    <td className="py-3 px-4">{patient.prenom}</td>
                    <td className="py-3 px-4">{patient.numeroTelephone}</td>
                    <td className="py-3 px-4">{patient.email}</td>
                    <td className="py-3 px-4">{new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(patient)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                          title="Modifier"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          title="Supprimer"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-4 text-center">Aucun patient trouvé</td></tr>
              )}
            </tbody>
          </table>
                  <div className="overflow-x-auto">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Éléments par page :
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 10, 15, 20].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Remplacer la pagination existante par celle-ci */}
          {currentPatients.length > 0 && (
            <div className="flex justify-end items-center gap-4 mt-4">
              <div className="text-sm text-gray-600">
                Affichage de {indexOfFirstItem + 1} à{' '}
                {Math.min(indexOfLastItem, currentPatients.length)} sur{' '}
                {currentPatients.length} entrées
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="cursor-pointer px-3 py-1 rounded bg-blue-500 hover:bg-blue-300 disabled:bg-gray-300 text-sm text-white"
                >
                  Précédent
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer px-3 py-1 rounded bg-blue-500 hover:bg-blue-300 disabled:bg-gray-300 text-sm text-white"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              {currentPatients.length} patient(s) trouvé(s)
            </div>
          </div>
        </div>
      </div>

      {isFormVisible && (
        <div className="fixed inset-0 bg-black/25 z-50" onClick={closeForm}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeForm} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer">
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">{editingPatient ? 'Modifier' : 'Ajouter'} un patient</h2>
            <form onSubmit={handleAddOrEditPatient}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700">Nom</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border rounded"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="prenom" className="block text-gray-700">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  className="w-full px-4 py-2 border rounded"
                  value={patientData.prenom}
                  onChange={(e) => setPatientData({ ...patientData, prenom: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <Input
                  type="email"
                  label="Email"
                  name="email"
                  className="w-full px-4 py-2 border rounded"
                  value={patientData.email}
                  onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="numeroTelephone" className="block text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  id="numeroTelephone"
                  className="w-full px-4 py-2 border rounded"
                  value={patientData.numeroTelephone}
                  onChange={(e) => setPatientData({ ...patientData, numeroTelephone: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="date_naissance" className="block text-gray-700">Date de naissance</label>
                <input
                  type="date"
                  id="date_naissance"
                  className="w-full px-4 py-2 border rounded"
                  value={patientData.date_naissance}
                  onChange={(e) => setPatientData({ ...patientData, date_naissance: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="adresse" className="block text-gray-700">Adresse</label>
                <textarea
                  id="adresse"
                  className="w-full px-4 py-2 border rounded"
                  value={patientData.adresse}
                  onChange={(e) => setPatientData({ ...patientData, adresse: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="antecedents_medicaux" className="block text-gray-700">Antécédents médicaux</label>
                <textarea
                  id="antecedents_medicaux"
                  className="w-full px-4 py-2 border rounded"
                  value={patientData.antecedents_medicaux}
                  onChange={(e) => setPatientData({ ...patientData, antecedents_medicaux: e.target.value })}
                />
              </div>
              <div className="flex justify-between items-center float-right mb-4">
                <Button 
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement...
                    </>
                  ) : (
                    editingPatient ? 'Mettre à jour' : 'Ajouter'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold mb-4">Êtes-vous sûr de vouloir supprimer ce patient ?</h3>
              <p className="mb-4 text-gray-600">
                {patientToDelete && `${patientToDelete.prenom} ${patientToDelete.name}`}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelDelete}
                  disabled={isDeletingPatient}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeletingPatient}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isDeletingPatient ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Suppression...</span>
                    </>
                  ) : (
                    <span>Supprimer</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyComponent;

