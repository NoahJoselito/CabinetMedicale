"use client";

import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaPlus, FaTimes, FaEye } from 'react-icons/fa';
import { BiSearch } from 'react-icons/bi';
import { motion } from 'framer-motion';
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

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

  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientData, setPatientData] = useState({
    name: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: 4, // Role ID pour patient
    numeroTelephone: '',
    date_naissance: '',
    adresse: '',
    antecedents_medicaux: '',
    groupe_sanguin: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    setTimeout(() => {
      setPatients([
        {
          id: 1,
          name: "Doe",
          prenom: "John",
          email: "john.doe@example.com",
          password: "password123",
          role_id: 4,
          numeroTelephone: "0123456789",
          date_naissance: "1990-01-01",
          adresse: "123 rue exemple",
          antecedents_medicaux: "Hypertension, Diabète type 2",
          groupe_sanguin: "A+"
        },
        {
          id: 2,
          name: "Smith",
          prenom: "Jane",
          email: "jane.smith@example.com",
          password: "password123",
          role_id: 4,
          numeroTelephone: "0987654321",
          date_naissance: "1985-05-15",
          adresse: "456 avenue test",
          antecedents_medicaux: "Asthme",
          groupe_sanguin: "O-"
        },
        {
          id: 3,
          name: "Dupont",
          prenom: "Pierre",
          email: "pierre.dupont@example.com",
          password: "password123",
          role_id: 4,
          numeroTelephone: "0654321789",
          date_naissance: "1978-11-30",
          adresse: "789 boulevard santé",
          antecedents_medicaux: "Allergie aux arachides",
          groupe_sanguin: "B+"
        },
        {
          id: 4,
          name: "Martin",
          prenom: "Sophie",
          email: "sophie.martin@example.com",
          password: "password123",
          role_id: 4,
          numeroTelephone: "0712345678",
          date_naissance: "1992-08-22",
          adresse: "10 rue de la clinique",
          antecedents_medicaux: "Aucun",
          groupe_sanguin: "AB+"
        },
        {
          id: 5,
          name: "Johnson",
          prenom: "Robert",
          email: "robert.johnson@example.com",
          password: "password123",
          role_id: 4,
          numeroTelephone: "0601020304",
          date_naissance: "1965-03-17",
          adresse: "25 rue des soins",
          antecedents_medicaux: "Opération cardiaque (2018)",
          groupe_sanguin: "A-"
        },
        {
          id: 6,
          name: "Brown",
          prenom: "Emma",
          email: "emma.brown@example.com",
          password: "password123",
          role_id: 4,
          numeroTelephone: "0698765432",
          date_naissance: "1995-12-10",
          adresse: "42 avenue médecine",
          antecedents_medicaux: "Migraines chroniques",
          groupe_sanguin: "O+"
        }
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  const filteredPatients = patients.filter((patient: Patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.groupe_sanguin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.numeroTelephone.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

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
        Page {currentPage} sur {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
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

  const handleAddOrEditPatient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (patientData.password !== patientData.password_confirmation) {
      setMessage('Les mots de passe ne correspondent pas !');
      setMessageType('error');
      return;
    }
    
    if (editingPatient) {
      setPatients((prevPatients: Patient[]) =>
        prevPatients.map((pat: Patient) =>
          pat.id === editingPatient.id
            ? {
                ...pat,
                name: patientData.name,
                prenom: patientData.prenom,
                email: patientData.email,
                password: patientData.password,
                role_id: 4, // Forcer le role_id à 4 même lors de l'édition
                numeroTelephone: patientData.numeroTelephone,
                date_naissance: patientData.date_naissance,
                adresse: patientData.adresse,
                antecedents_medicaux: patientData.antecedents_medicaux,
                groupe_sanguin: patientData.groupe_sanguin
              }
            : pat
        )
      );
      setMessage('Patient modifié avec succès !');
      setMessageType('success');
    } else {
      // Exemple d'ajout selon le format fourni
      const newPatient = {
        id: Date.now(),
        name: patientData.name,
        prenom: patientData.prenom,
        email: patientData.email,
        password: patientData.password,
        role_id: 4,
        numeroTelephone: patientData.numeroTelephone,
        date_naissance: patientData.date_naissance,
        adresse: patientData.adresse,
        antecedents_medicaux: patientData.antecedents_medicaux,
        groupe_sanguin: patientData.groupe_sanguin
      };
      
      setPatients((prevPatients: Patient[]) => [...prevPatients, newPatient]);
      setMessage('Patient ajouté avec succès !');
      setMessageType('success');
    }
    
    setPatientData({
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
    });
    setEditingPatient(null);
    setIsFormVisible(false);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setPatientData({
      name: patient.name,
      prenom: patient.prenom,
      email: patient.email,
      password: patient.password,
      password_confirmation: patient.password,
      role_id: patient.role_id,
      numeroTelephone: patient.numeroTelephone,
      date_naissance: patient.date_naissance,
      adresse: patient.adresse,
      antecedents_medicaux: patient.antecedents_medicaux,
      groupe_sanguin: patient.groupe_sanguin
    });
    setIsFormVisible(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      setPatients(prevPatients => prevPatients.filter(pat => pat.id !== patientToDelete.id));
      setMessage('Patient supprimé avec succès !');
      setMessageType('success');
      setShowConfirmModal(false);
      setPatientToDelete(null);
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
        <div className="fixed inset-0 bg-black/25 z-50" onClick={() => setIsFormVisible(false)}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setIsFormVisible(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer">
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
                <label htmlFor="password" className="block text-gray-700">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full px-4 py-2 border rounded"
                    value={patientData.password}
                    onChange={(e) => setPatientData({ ...patientData, password: e.target.value })}
                    required={!editingPatient}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaTimes size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="password_confirmation" className="block text-gray-700">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="password_confirmation"
                    className="w-full px-4 py-2 border rounded"
                    value={patientData.password_confirmation}
                    onChange={(e) => setPatientData({ ...patientData, password_confirmation: e.target.value })}
                    required={!editingPatient}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaTimes size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
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
                <Button className="bg-blue-500 text-white px-6 py-2 rounded-lg">{editingPatient ? 'Mettre à jour' : 'Ajouter'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
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

