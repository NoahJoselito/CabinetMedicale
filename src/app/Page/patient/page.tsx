"use client";

import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaPlus, FaTimes, FaEye } from 'react-icons/fa';
import { BiSearch } from 'react-icons/bi';
import { motion } from 'framer-motion';
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { patientService } from '@/services/patientService';

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
    groupe_sanguin: string;
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
    groupe_sanguin: ''
  };

  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientData, setPatientData] = useState(initialPatientData);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update the pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<{
    data: Patient[];
    current_page: number;
    last_page: number;
    total: number;
  }>({ data: [], current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await patientService.getPatients(currentPage);
        setPaginatedData({
          data: response.data.map(patient => ({
            id: patient.id || 0,
            name: patient.name || '',
            prenom: patient.prenom || '',
            email: patient.email || '',
            password: patient.password || '',
            role_id: patient.role_id || 4,
            numeroTelephone: patient.numeroTelephone || '',
            date_naissance: patient.date_naissance || '',
            adresse: patient.adresse || '',
            antecedents_medicaux: patient.antecedents_medicaux || '',
            groupe_sanguin: patient.groupe_sanguin || ''
          })),
          current_page: response.current_page,
          last_page: response.last_page,
          total: response.total
        });
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
          antecedents_medicaux: patient.antecedents_medicaux || '',
          groupe_sanguin: patient.groupe_sanguin || ''
        })));
      } catch (error) {
        setMessage('Erreur lors du chargement des patients');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();  }, [currentPage]);

  const filteredPatients = patients.filter((patient: Patient) =>
    (patient?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient?.prenom ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient?.groupe_sanguin ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient?.numeroTelephone ?? '').includes(searchTerm) ||
    (patient?.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Remove the old pagination logic that slices the array
  const currentPatients = filteredPatients;

  const PaginationControls = () => (
    <div className="flex justify-center items-center mt-4 gap-2">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer"
      >
        Précédent
      </button>
      <span className="mx-4">
        Page {paginatedData.current_page} sur {paginatedData.last_page} 
        ({paginatedData.total} résultats)
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginatedData.last_page))}
        disabled={currentPage === paginatedData.last_page}
        className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer"
      >
        Suivant
      </button>
    </div>
  );

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
        setMessage('Patient modifié avec succès !');
      } else {
        const response = await patientService.createPatient(patientPayload);
        if (response) {
          setMessage('Patient ajouté avec succès ! Un email avec les identifiants a été envoyé.');
        } else {
          throw new Error('Erreur lors de la création du patient');
        }
      }
      
      setMessageType('success');
      closeForm();
      const response = await patientService.getPatients(currentPage);
      setPatients(response.data as Patient[]);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Une erreur est survenue lors de l\'opération');
      setMessageType('error');
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
      antecedents_medicaux: patient.antecedents_medicaux || '',
      groupe_sanguin: patient.groupe_sanguin || ''
    });
    setIsFormVisible(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      try {
        await patientService.deletePatient(patientToDelete.id);
        setMessage('Patient supprimé avec succès !');
        setMessageType('success');
        const response = await patientService.getPatients(currentPage);
        setPatients(response.data as Patient[]);
      } catch (error) {
        setMessage('Erreur lors de la suppression');
        setMessageType('error');
      } finally {
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
      <h1 className="text-2xl font-bold">Patients</h1>
      <h5 className="mb-6 text-lg">Liste des Patients</h5>

      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}

      <div className="container mx-auto px-4 pb-6">
        <div className="flex justify-between items-center mb-12">
          <div className="relative w-64">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              placeholder="Rechercher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <button onClick={() => setIsFormVisible(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer">
            <FaPlus className="mr-2" /> Ajouter
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">Nom</th>
                <th className="p-4 text-left">Prénom</th>
                <th className="p-4 text-left">Groupe Sanguin</th>
                <th className="p-4 text-left">Téléphone</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Date de naissance</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.length > 0 ? (
                currentPatients.map((patient: Patient) => (
                  <tr key={patient.id} className="border-t">
                    <td className="p-4">{patient.name}</td>
                    <td className="p-4">{patient.prenom}</td>
                    <td className="p-4">{patient.groupe_sanguin}</td>
                    <td className="p-4">{patient.numeroTelephone}</td>
                    <td className="p-4">{patient.email}</td>
                    <td className="p-4">{new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleEdit(patient)} className="text-blue-500 cursor-pointer">
                        <FaEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(patient)} className="text-red-500 cursor-pointer">
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="p-4 text-center">Aucun patient trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls />
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
              <div className="mb-4">
                <label htmlFor="groupe_sanguin" className="block text-gray-700">Groupe sanguin</label>
                <select
                  id="groupe_sanguin"
                  className="w-full px-4 py-2 border rounded"
                  value={patientData.groupe_sanguin}
                  onChange={(e) => setPatientData({ ...patientData, groupe_sanguin: e.target.value })}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
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
            <h3 className="text-lg font-semibold mb-4">Êtes-vous sûr de vouloir supprimer ce patient ?</h3>
            <p className="mb-4 text-gray-600">
              {patientToDelete && `${patientToDelete.prenom} ${patientToDelete.name} (${patientToDelete.groupe_sanguin})`}
            </p>
            <div className="flex justify-between">
              <button onClick={cancelDelete} className="bg-gray-300 text-black px-4 py-2 rounded cursor-pointer">
                Annuler
              </button>
              <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyComponent;

