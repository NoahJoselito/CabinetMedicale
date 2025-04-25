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
        Chargement du docteur...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

const MyComponent = () => {
  interface Doctor {
    id: number;
    name: string;
    prenom: string;
    email: string;
    password: string;
    role_id: number;
    numeroTelephone: string;
    date_naissance: string;
    adresse: string;
    specialité: string;
  }

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorData, setDoctorData] = useState({ 
    name: '', 
    prenom: '', 
    email: '', 
    password: '', 
    password_confirmation: '',
    role_id: 2, 
    numeroTelephone: '', 
    date_naissance: '', 
    adresse: '', 
    specialité: '' 
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    setTimeout(() => {
      setDoctors([
        { 
          id: 1, 
          name: "Dupont", 
          prenom: "Jean", 
          email: "jean.dupont@example.com", 
          password: "password123", 
          role_id: 2, 
          numeroTelephone: "0123456789", 
          date_naissance: "1975-05-15", 
          adresse: "45 rue de Paris, 75001 Paris", 
          specialité: "Cardiologue" 
        },
        { 
          id: 2, 
          name: "Curie", 
          prenom: "Marie", 
          email: "marie.curie@example.com", 
          password: "password123", 
          role_id: 2, 
          numeroTelephone: "0987654321", 
          date_naissance: "1980-11-20", 
          adresse: "12 avenue Victor Hugo, 75016 Paris", 
          specialité: "Radiologue" 
        },
        { 
          id: 3, 
          name: "Martin", 
          prenom: "Paul", 
          email: "paul.martin@example.com", 
          password: "password123", 
          role_id: 2, 
          numeroTelephone: "0223344556", 
          date_naissance: "1985-03-10", 
          adresse: "8 rue du Commerce, 75015 Paris", 
          specialité: "Chirurgien" 
        },
        { 
          id: 4, 
          name: "Dupuis", 
          prenom: "Claire", 
          email: "claire.dupuis@example.com", 
          password: "password123", 
          role_id: 2, 
          numeroTelephone: "0777889900", 
          date_naissance: "1982-07-22", 
          adresse: "25 boulevard Saint-Michel, 75005 Paris", 
          specialité: "Pédiatre" 
        },
        { 
          id: 5, 
          name: "Bernard", 
          prenom: "Alice", 
          email: "alice.bernard@example.com", 
          password: "password123", 
          role_id: 2, 
          numeroTelephone: "0645454656", 
          date_naissance: "1978-09-30", 
          adresse: "3 rue de Rivoli, 75004 Paris", 
          specialité: "Dermatologue" 
        },
        { 
          id: 6, 
          name: "Lefevre", 
          prenom: "Louis", 
          email: "louis.lefevre@example.com", 
          password: "password123", 
          role_id: 2, 
          numeroTelephone: "0712345678", 
          date_naissance: "1970-12-05", 
          adresse: "17 rue de la Paix, 75002 Paris", 
          specialité: "Ophtalmologue" 
        }
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  const filteredDoctors = doctors.filter((doctor: Doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialité.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.numeroTelephone.includes(searchTerm) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

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

  const handleAddOrEditDoctor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (doctorData.password !== doctorData.password_confirmation) {
      setMessage('Les mots de passe ne correspondent pas !');
      setMessageType('error');
      return;
    }
    
    if (editingDoctor) {
      setDoctors((prevDoctors: Doctor[]) =>
        prevDoctors.map((doc: Doctor) =>
          doc.id === editingDoctor.id
            ? { 
                ...doc, 
                name: doctorData.name,
                prenom: doctorData.prenom,
                email: doctorData.email,
                password: doctorData.password,
                role_id: 2, // Forcer le role_id à 2 même lors de l'édition
                numeroTelephone: doctorData.numeroTelephone,
                date_naissance: doctorData.date_naissance,
                adresse: doctorData.adresse,
                specialité: doctorData.specialité
              }
            : doc
        )
      );
      setMessage('Docteur modifié avec succès !');
      setMessageType('success');
    } else {
      setDoctors((prevDoctors: Doctor[]) =>
        [...prevDoctors, { 
          id: Date.now(), 
          name: doctorData.name,
          prenom: doctorData.prenom,
          email: doctorData.email,
          password: doctorData.password,
          role_id: 2, // Forcer le role_id à 2 lors de l'ajout
          numeroTelephone: doctorData.numeroTelephone,
          date_naissance: doctorData.date_naissance,
          adresse: doctorData.adresse,
          specialité: doctorData.specialité
        }]
      );
      setMessage('Docteur ajouté avec succès !');
      setMessageType('success');
    }
    
    setDoctorData({ 
      name: '', 
      prenom: '', 
      email: '', 
      password: '', 
      password_confirmation: '',
      role_id: 2, // Réinitialiser avec role_id à 2
      numeroTelephone: '', 
      date_naissance: '', 
      adresse: '', 
      specialité: '' 
    });
    setEditingDoctor(null);
    setIsFormVisible(false);
  };
  

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorData({ 
      name: doctor.name,
      prenom: doctor.prenom,
      email: doctor.email,
      password: doctor.password,
      password_confirmation: doctor.password,
      role_id: doctor.role_id,
      numeroTelephone: doctor.numeroTelephone,
      date_naissance: doctor.date_naissance,
      adresse: doctor.adresse,
      specialité: doctor.specialité
    });
    setIsFormVisible(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (doctorToDelete) {
      setDoctors(prevDoctors => prevDoctors.filter(doc => doc.id !== doctorToDelete.id));
      setMessage('Docteur supprimé avec succès !');
      setMessageType('success');
      setShowConfirmModal(false);
      setDoctorToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setDoctorToDelete(null);
  };

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen text-gray-700 p-8 bg-gray-100">
      <h1 className="text-2xl font-bold">Docteurs</h1>
      <h5 className="mb-6 text-lg">Liste des Docteurs</h5>

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
                <th className="p-4 text-left">Spécialité</th>
                <th className="p-4 text-left">Téléphone</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Date de naissance</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDoctors.length > 0 ? (
                currentDoctors.map((doctor: Doctor) => (
                  <tr key={doctor.id} className="border-t">
                    <td className="p-4">{doctor.name}</td>
                    <td className="p-4">{doctor.prenom}</td>
                    <td className="p-4">{doctor.specialité}</td>
                    <td className="p-4">{doctor.numeroTelephone}</td>
                    <td className="p-4">{doctor.email}</td>
                    <td className="p-4">{doctor.date_naissance}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleEdit(doctor)} className="text-blue-500 cursor-pointer">
                        <FaEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(doctor)} className="text-red-500 cursor-pointer">
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="p-4 text-center">Aucun médecin trouvé</td></tr>
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
            <h2 className="text-xl font-bold mb-4">{editingDoctor ? 'Modifier' : 'Ajouter'} un docteur</h2>
            <form onSubmit={handleAddOrEditDoctor}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700">Nom</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border rounded"
                  value={doctorData.name}
                  onChange={(e) => setDoctorData({ ...doctorData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="prenom" className="block text-gray-700">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  className="w-full px-4 py-2 border rounded"
                  value={doctorData.prenom}
                  onChange={(e) => setDoctorData({ ...doctorData, prenom: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <Input
                  type="email"
                  label="Email"
                  name="email"
                  className="w-full px-4 py-2 border rounded"
                  value={doctorData.email}
                  onChange={(e) => setDoctorData({ ...doctorData, email: e.target.value })}
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
                    value={doctorData.password}
                    onChange={(e) => setDoctorData({ ...doctorData, password: e.target.value })}
                    required={!editingDoctor}
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
                    value={doctorData.password_confirmation}
                    onChange={(e) => setDoctorData({ ...doctorData, password_confirmation: e.target.value })}
                    required={!editingDoctor}
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
                  value={doctorData.numeroTelephone}
                  onChange={(e) => setDoctorData({ ...doctorData, numeroTelephone: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="date_naissance" className="block text-gray-700">Date de naissance</label>
                <input
                  type="date"
                  id="date_naissance"
                  className="w-full px-4 py-2 border rounded"
                  value={doctorData.date_naissance}
                  onChange={(e) => setDoctorData({ ...doctorData, date_naissance: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="adresse" className="block text-gray-700">Adresse</label>
                <textarea
                  id="adresse"
                  className="w-full px-4 py-2 border rounded"
                  value={doctorData.adresse}
                  onChange={(e) => setDoctorData({ ...doctorData, adresse: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <Input
                  type="text"
                  label="Spécialité"
                  name="specialite"
                  className="w-full px-4 py-2 border rounded"
                  value={doctorData.specialité}
                  onChange={(e) => setDoctorData({ ...doctorData, specialité: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <Button className="bg-blue-500 text-white px-6 py-2 rounded-lg">{editingDoctor ? 'Mettre à jour' : 'Ajouter'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Êtes-vous sûr de vouloir supprimer ce médecin ?</h3>
            <p className="mb-4 text-gray-600">
              {doctorToDelete && `${doctorToDelete.prenom} ${doctorToDelete.name} (${doctorToDelete.specialité})`}
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

