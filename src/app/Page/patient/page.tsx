"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    email_verified_at: string | null;
    numeroTelephone: string;
    date_naissance: string;
    adresse: string;
    specialité: string | null;
    emploi: string | null;
    role_id: number;
    organisme: string | null;
    numerodossierprisenchage: string | null;
    antecedents: Array<{
      id: number;
      user_id: number;
      titre: string;
      description: string | null;
      created_at: string;
      updated_at: string;
    }>;
    provider?: string | null;
    provider_id?: string | null;
    last_login?: string | null;
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
    emploi: '',
    organisme: '',
    numerodossierprisenchage: '',
    specialité: '',
    provider: null,
    provider_id: null,
    last_login: null,
    email_verified_at: null,
    antecedents: [] as Array<{
      id: number;
      user_id: number;
      titre: string;
      description: string | null;
      created_at: string;
      updated_at: string;
    }>
  };


  const [allPatients, setAllPatients] = useState<Patient[]>([]); // Tous les patients
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


  const [antecedents, setAntecedents] = useState<Array<{ titre: string; description: string | null }>>([]);


  // Fonction pour charger tous les patients une seule fois
  const fetchAllPatients = useCallback(async () => {
    try {
      setLoading(true);


      const response = await patientService.getPatients(1); // Charger la première page
      
      // Si il y a plusieurs pages, charger toutes les pages
      let allPatientsData = [...response.data];
      
      if (response.last_page > 1) {
        const promises = [];
        for (let page = 2; page <= response.last_page; page++) {
          promises.push(patientService.getPatients(page));
        }
        
        const additionalPages = await Promise.all(promises);
        additionalPages.forEach(pageResponse => {
          allPatientsData = [...allPatientsData, ...pageResponse.data];
        });
      }

      // Normaliser les données
      const normalizedPatients = allPatientsData.map(patient => ({
        id: patient.id ?? 0,
        name: patient.name ?? '',
        prenom: patient.prenom ?? '',
        email: patient.email ?? '',
        email_verified_at: patient.email_verified_at ?? null,
        numeroTelephone: patient.numeroTelephone ?? '',
        date_naissance: patient.date_naissance ?? '',
        adresse: patient.adresse ?? '',
        specialité: patient.specialité ?? null,
        emploi: patient.emploi ?? null,
        role_id: patient.role_id ?? 4,
        organisme: patient.organisme ?? null,
        numerodossierprisenchage: patient.numerodossierprisenchage ?? null,
        antecedents: (patient.antecedents ?? []).map(ant => ({
          id: ant.id ?? 0,
          user_id: ant.user_id ?? 0,
          titre: ant.titre ?? '',
          description: ant.description ?? null,
          created_at: ant.created_at ?? '',
          updated_at: ant.updated_at ?? ''
        }))
      }));

      setAllPatients(normalizedPatients);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      toast.error('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    fetchAllPatients();
  }, [fetchAllPatients]);

  // Filtrer les patients selon le terme de recherche
  const filteredPatients = useMemo(() => {
    return allPatients.filter((patient: Patient) =>
      (patient?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient?.prenom ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient?.numeroTelephone ?? '').includes(searchTerm) ||
      (patient?.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPatients, searchTerm]);
  // Calculer la pagination côté front
  const paginationData = useMemo(() => {
    const totalItems = filteredPatients.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;


    const currentItems = filteredPatients.slice(startIndex, endIndex);

    return {
      currentItems,
      totalItems,
      totalPages,
      startIndex,
      endIndex
    };
  }, [filteredPatients, currentPage, itemsPerPage]);

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  // Fonction pour changer le nombre d'éléments par page
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Retourner à la première page
  };

  // Fonction de recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Retourner à la première page lors de la recherche
  };

  const resetForm = () => {
    setPatientData(initialPatientData);
    setEditingPatient(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAntecedents([]);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    resetForm();
  };

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
      const randomPassword = !editingPatient ? generateRandomPassword() : '';
      const patientPayload = {
        ...patientData,
        role_id: 4,
        password: !editingPatient ? randomPassword : undefined,
        password_confirmation: !editingPatient ? randomPassword : undefined,
        antecedents: antecedents
      };
      
      if (editingPatient) {
        try {
          const response = await patientService.updatePatient(editingPatient.id, patientPayload);
          if (response) {
            toast.success('Patient modifié avec succès !', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light"
            });
            // Mettre à jour le patient dans la liste locale
            setAllPatients(prevPatients => 
              prevPatients.map(patient => 
                patient.id === editingPatient.id 
                  ? { ...patient, ...patientPayload, antecedents: antecedents.map((ant, index) => ({
                      id: index + 1,
                      user_id: editingPatient.id,
                      titre: ant.titre,
                      description: ant.description,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    })) }
                  : patient
              )
            );
            closeForm();
          }
        } catch (error: any) {
          handleError(error);
        }
      } else {
        try {
          const response = await patientService.createPatient(patientPayload);
          if (response) {
            toast.success('Nouveau patient ajouté avec succès !', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light"
            });           
            // Ajouter le nouveau patient à la liste locale
            const newPatient: Patient = {
              id: Date.now(), // ID temporaire
              ...patientPayload,
              email_verified_at: null,
              provider: null,
              provider_id: null,
              last_login: null,
              antecedents: antecedents.map((ant, index) => ({
                id: index + 1,
                user_id: Date.now(),
                titre: ant.titre,
                description: ant.description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }))
            };
            
            setAllPatients(prevPatients => [newPatient, ...prevPatients]);
            closeForm();
          }
        } catch (error: any) {
          handleError(error);
        }
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors de l\'opération', {
        theme: "colored"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction utilitaire pour gérer les erreurs
  const handleError = (error: any) => {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      Object.entries(errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((message) => {

            toast.error(`${field}: ${message}`, {
              position: "top-right",
              autoClose: 5000,
              theme: "colored"
            });
          });
        }
      });
    } else {
      toast.error('Une erreur est survenue', {
        theme: "colored"
      });
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setPatientData(prevData => ({
      ...prevData,
      ...initialPatientData,
      name: patient.name || '',
      prenom: patient.prenom || '',
      email: patient.email || '',
      password: '',
      password_confirmation: '',
      role_id: patient.role_id || 4,
      numeroTelephone: patient.numeroTelephone || '',
      date_naissance: patient.date_naissance || '',
      adresse: patient.adresse || '',
      emploi: patient.emploi || '',
      organisme: patient.organisme || '',
      numerodossierprisenchage: patient.numerodossierprisenchage || '',
      specialité: patient.specialité || '',
      provider: null,
      provider_id: null,
      last_login: null,
      email_verified_at: null,
      antecedents: patient.antecedents || []

    }));
    
    setAntecedents(patient.antecedents?.map(ant => ({


      titre: ant.titre,



      description: ant.description
    })) || []);
    
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
        // Supprimer le patient de la liste locale
        setAllPatients(prevPatients => 
          prevPatients.filter(patient => patient.id !== patientToDelete.id)
        );
        
        // Ajuster la page courante si nécessaire
        const newTotalItems = allPatients.length - 1;
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
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

  const handleAddAntecedent = () => {
    setAntecedents([...antecedents, { titre: '', description: '' }]);
  };

  const handleRemoveAntecedent = (index: number) => {
    setAntecedents(antecedents.filter((_, i) => i !== index));
  };

  const handleAntecedentChange = (index: number, field: 'titre' | 'description', value: string) => {
    const newAntecedents = [...antecedents];
    newAntecedents[index][field] = value;
    setAntecedents(newAntecedents);
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
        <div className="overflow-x-auto">
          {/* Contrôles de pagination en haut */}
          <div className="flex justify-between items-center mb-4">

          </div>

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


              {paginationData.currentItems.length > 0 ? (
                paginationData.currentItems.map((patient: Patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{patient.name}</td>
                    <td className="py-3 px-4">{patient.prenom}</td>
                    <td className="py-3 px-4">{patient.numeroTelephone}</td>
                    <td className="py-3 px-4">{patient.email}</td>
                    <td className="py-3 px-4">
                      {new Date(patient.date_naissance).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(patient)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>


                  <td colSpan={6} className="text-center py-8">
                    {searchTerm ? (
                      <div>
                        <p className="text-gray-500 mb-2">Aucun patient trouvé pour "{searchTerm}"</p>
                        <button
                          onClick={() => handleSearch('')}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Effacer la recherche
                        </button>
                      </div>
                    ) : (
                      'Aucun patient trouvé'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            <div className="text-sm text-gray-600">
              Affichage de {paginationData.startIndex + 1} à{' '}
              {Math.min(paginationData.endIndex, paginationData.totalItems)} sur {paginationData.totalItems} entrées
              {searchTerm && ` (filtré de ${allPatients.length} entrées au total)`}
            </div>
            <div className="flex justify-end items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Éléments par page :
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 10, 15, 20, 25, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

          {/* Pagination en bas */}
          {paginationData.totalPages > 1 && (
            <div className="flex justify-end items-right gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {/* Affichage des numéros de page */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(paginationData.totalPages, startPage + maxVisiblePages - 1);
                
                // Ajuster startPage si on est près de la fin
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                // Première page + ellipsis si nécessaire
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(<span key="ellipsis1" className="px-2">...</span>);
                  }
                }

                // Pages visibles
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                // Dernière page + ellipsis si nécessaire
                if (endPage < paginationData.totalPages) {
                  if (endPage < paginationData.totalPages - 1) {
                    pages.push(<span key="ellipsis2" className="px-2">...</span>);
                  }
                  pages.push(
                    <button
                      key={paginationData.totalPages}
                      onClick={() => handlePageChange(paginationData.totalPages)}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      {paginationData.totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationData.totalPages}
                className="cursor-pointer px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}


          {/* Informations de pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">

              Page {currentPage} sur {paginationData.totalPages}
            </div>
            <div className="text-sm text-gray-600">
              {paginationData.totalItems} patient(s) au total
              {searchTerm && ` (${allPatients.length} sans filtre)`}
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

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">
                  Informations professionnelles
                </h3>
                
                <div className="mb-4">
                  <label htmlFor="emploi" className="block text-gray-700 mb-1">Emploi</label>
                  <input
                    type="text"
                    id="emploi"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={patientData.emploi || ''}
                    onChange={(e) => setPatientData({ ...patientData, emploi: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="organisme" className="block text-gray-700 mb-1">Organisme</label>
                  <input
                    type="text"
                    id="organisme"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={patientData.organisme || ''}
                    onChange={(e) => setPatientData({ ...patientData, organisme: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="numerodossierprisenchage" className="block text-gray-700 mb-1">
                    Numéro de dossier de prise en charge
                  </label>
                  <input
                    type="text"
                    id="numerodossierprisenchage"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={patientData.numerodossierprisenchage || ''}
                    onChange={(e) => setPatientData({ ...patientData, numerodossierprisenchage: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="specialite" className="block text-gray-700 mb-1">Spécialité</label>
                  <input
                    type="text"
                    id="specialite"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={patientData.specialité || ''}
                    onChange={(e) => setPatientData({ ...patientData, specialité: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">
                  Antécédents Médicaux
                </h3>
                
                {antecedents.map((antecedent, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Antécédent #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveAntecedent(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-gray-700 mb-1">Titre</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded"
                        value={antecedent.titre}
                        onChange={(e) => handleAntecedentChange(index, 'titre', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full px-4 py-2 border rounded"
                        value={antecedent.description || ''}
                        onChange={(e) => handleAntecedentChange(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddAntecedent}
                  className="cursor-pointer mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                >
                  <FaPlus size={14} />
                  Ajouter un antécédent
                </button>
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
                  className="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeletingPatient}
                  className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isDeletingPatient ? (
                    <>
                      <div className=" w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
