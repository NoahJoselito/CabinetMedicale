"use client";
import { useState, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { doctorService } from "@/services/doctorService";
import type { Doctor } from "@/services/doctorService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center  to-white">
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
          className="w-16 h-16 rounded-full shadow-md"
        />
      </div>
      <motion.div 
        className="mt-4 text-xl font-semibold text-blue-600" 
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ duration: 1, repeat: Infinity }}
      >
        Chargement du Docteur...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

export default function Docteur() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    numeroTelephone: '',
    date_naissance: '',
    adresse: '',
    specialité: ''
  });
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(doctors.length / itemsPerPage);
  
  // Fonction pour gérer les changements des champs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour démarrer l'édition
  const handleEditClick = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      prenom: doctor.prenom,
      email: doctor.email,
      password: '',
      password_confirmation: '',
      numeroTelephone: doctor.numeroTelephone,
      date_naissance: doctor.date_naissance.split('T')[0],
      adresse: doctor.adresse,
      specialité: doctor.specialité
    });
    setIsFormOpen(true);
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingDoctor) {
        // Mode édition
        await doctorService.updateDoctor(editingDoctor.id, formData);
        toast.success(' Docteur modifié avec succès!');
      } else {
        // Mode création
        await doctorService.createDoctor(formData);
        toast.success(' Docteur ajouté avec succès! Un email de confirmation a été envoyé.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      setIsFormOpen(false);
      setEditingDoctor(null);
      const response = await doctorService.getDoctors();
      setDoctors(response.data);
      setFormData({
        name: '',
        prenom: '',
        email: '',
        password: '',
        password_confirmation: '',
        numeroTelephone: '',
        date_naissance: '',
        adresse: '',
        specialité: ''
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        (editingDoctor ? "Erreur lors de la modification" : "Erreur lors de l'ajout du docteur");
      toast.error(` ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDeletingDoctor(doctor);
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingDoctor) return;
    setIsDeleting(true);
    
    try {
      await doctorService.deleteDoctor(deletingDoctor.id);
      toast.success(`Le docteur ${deletingDoctor.name} ${deletingDoctor.prenom} a été supprimé avec succès`);
      const response = await doctorService.getDoctors();
      setDoctors(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la suppression";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletingDoctor(null);
    }
  };
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorService.getDoctors();
        setDoctors(response.data);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Erreur lors du chargement des docteurs";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Overlay */}
      {isFormOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50]"
          onClick={() => setIsFormOpen(false)}
        />
      )}

      {/* Content to blur */}
      <div className={`relative ${isFormOpen ? 'filter blur-md pointer-events-none select-none' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Docteurs</h1>
            <p className="text-gray-600">Liste de tous les docteurs du cabinet</p>
          </div>
          <Button
            variant="primary"
            leftIcon={<FaPlus />}
            onClick={() => setIsFormOpen(true)}
          >
            Ajouter un docteur
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-end px-10 py-1 mb-4 text-sm text-gray-600">
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

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom complet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-500">Chargement des données...</span>
                    </div>
                  </td>
                </tr>
              ) : doctors.length > 0 ? (
                currentDoctors.map((doctor) => (
                  <tr key={doctor.id} className="text-gray-900 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap">{doctor.name} {doctor.prenom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{doctor.specialité}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{doctor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{doctor.numeroTelephone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => handleEditClick(doctor)}
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                          onClick={() => handleDeleteClick(doctor)}
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Aucun docteur trouvé</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Nouvelle pagination */}
          {doctors.length > 0 && (
            <div className="flex justify-end items-center gap-4 mt-4 p-4">
              <div className="text-sm text-gray-600">
                Affichage de {indexOfFirstItem + 1} à{' '}
                {Math.min(indexOfLastItem, doctors.length)} sur{' '}
                {doctors.length} entrées
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
        </div>
      </div>

      {/* Sliding Form */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white/90 backdrop-filter backdrop-blur-md shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-600">
              {editingDoctor ? 'Modifier le docteur' : 'Ajouter un docteur'}
            </h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Nom" 
              name="name" 
              placeholder="Doe" 
              type="text" 
              value={formData.name} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Prénom" 
              name="prenom" 
              placeholder="John" 
              type="text" 
              value={formData.prenom} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Email" 
              name="email" 
              type="email" 
              placeholder="docteur@example.com" 
              value={formData.email} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Mot de passe" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Confirmation du mot de passe" 
              name="password_confirmation" 
              type="password" 
              value={formData.password_confirmation} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Téléphone" 
              name="numeroTelephone" 
              placeholder="0123456789" 
              type="text" 
              value={formData.numeroTelephone} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Date de naissance" 
              name="date_naissance" 
              type="date" 
              value={formData.date_naissance} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Adresse" 
              name="adresse" 
              placeholder="123 rue exemple" 
              type="text" 
              value={formData.adresse} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Spécialité" 
              name="specialité"
              placeholder="Spécialité"
              type="text"
              value={formData.specialité}
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : (editingDoctor ? 'Modifier' : 'Ajouter')}
            </Button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-[70] w-96">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le docteur {deletingDoctor?.name} {deletingDoctor?.prenom} ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingDoctor(null);
                }}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Suppression...
                  </div>
                ) : (
                  'Supprimer'
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}