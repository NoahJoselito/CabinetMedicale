"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { traitementService, Traitement, Service } from '@/services/traitementService';
import { serviceService } from '@/services/serviceService';

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
        Chargement du traitement...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

export default function DossierMedical() {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [traitements, setTraitements] = useState<Traitement[]>([]);
  const [nouveauTraitement, setNouveauTraitement] = useState<Traitement>({ 
      id: 0, 
      nom: "", 
      prix: "",
      prixprisenchager: null,
      services: [] as Service[],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [traitementToDelete, setTraitementToDelete] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Ajouter fonction de rafraîchissement
  const refreshData = async () => {
    try {
      const [traitementData, serviceData] = await Promise.all([
        traitementService.getAll(),
        serviceService.getAll()
      ]);
      
      setTraitements(traitementData);
      setServices(serviceData.map(service => ({
        ...service,
        pivot: {
          traitement_id: 0,
          service_id: service.id
        }
      })));
    } catch (error) {
      toast.error('Erreur lors du rafraîchissement des données');
    }
  };

  // Rafraîchissement automatique
  useEffect(() => {
    // Premier chargement
    const fetchData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    fetchData();

    // Configurer l'intervalle de rafraîchissement (toutes les 30 secondes)
    const intervalId = setInterval(refreshData, 30000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, []);

  // Update getServiceNames to handle undefined services
  const getServiceNames = (services: Service[] | undefined) => {
    return services?.map(service => service.nom).join(", ") || "";
  };

  // Update filteredTraitements with null checks
  const filteredTraitements = traitements.filter(traitement =>
    (traitement.nom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (traitement.prix?.toString() || "").includes(searchTerm) ||
    getServiceNames(traitement.services).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTraitements = filteredTraitements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTraitements.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); // Début du chargement
    
    try {
      const formattedTraitement = {
        nom: nouveauTraitement.nom,
        prix: Number(nouveauTraitement.prix),
        prixprisenchager: nouveauTraitement.prixprisenchager ? Number(nouveauTraitement.prixprisenchager) : null, // Ajout de cette ligne
        services: nouveauTraitement.services.map(s => ({
          id: s.id,
          icone: s.icone,
          nom: s.nom,
          description_courte: s.description_courte,
          details: s.details,
          horaires: s.horaires,
          created_at: s.created_at,
          updated_at: s.updated_at,
          pivot: s.pivot
        }))
      };

      if (isEditing && nouveauTraitement.id) {
        const updated = await traitementService.update(nouveauTraitement.id, formattedTraitement);
        setTraitements(traitements.map(t => t.id === updated.id ? updated : t));
        toast.success('Traitement modifié avec succès !');
      } else {
        const created = await traitementService.create(formattedTraitement);
        setTraitements([...traitements, created]);
        toast.success('Nouveau traitement ajouté avec succès !');
      }
      
      // Reset form
      setNouveauTraitement({ 
        id: 0, 
        nom: "", 
        prix: "", 
        prixprisenchager: null,
        services: [], 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      await refreshData(); // Rafraîchir après création/modification
      setShowForm(false);
      setIsEditing(false);
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false); // Fin du chargement
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "service") {
      const serviceId = parseInt(value);
      const selectedService = services.find(s => s.id === serviceId);
      const updatedServices = (e.target as HTMLInputElement).checked && selectedService
        ? [...nouveauTraitement.services, {
            id: serviceId,
            icone: "",
            nom: selectedService.nom,
            description_courte: "",
            details: "",
            horaires: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            pivot: {
              traitement_id: nouveauTraitement.id,
              service_id: serviceId
            }
          }]
        : nouveauTraitement.services.filter(service => service.id !== serviceId);
      setNouveauTraitement({ ...nouveauTraitement, services: updatedServices });
    } else {
      setNouveauTraitement({ ...nouveauTraitement, [name]: value });
    }
  };  
  const handleEdit = (traitement: {
    services: {
      pivot: { traitement_id: number; service_id: number; }; 
      id: number; 
      icone: string; 
      nom: string; 
      description_courte: string; 
      details: string; 
      horaires: string; 
      created_at: string; 
      updated_at: string; 
    }[];
    id: number;
    nom: string;
    prix: number;
    prixprisenchager?: number | null; // Ajout du champ prixprisenchager
}) => {
    setNouveauTraitement({ 
      id: traitement.id, 
      nom: traitement.nom, 
      prix: traitement.prix.toString(),
      prixprisenchager: traitement.prixprisenchager?.toString() || null, // Ajout de cette ligne
      services: (traitement.services || []).map(service => ({
        ...service,
        pivot: service.pivot || {
          traitement_id: traitement.id,
          service_id: service.id
        }
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsEditing(true);
    setShowForm(true);

  };  const handleDelete = (id: number) => {
    setTraitementToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await traitementService.delete(traitementToDelete as number);
      await refreshData(); // Rafraîchir après suppression
      setShowDeleteConfirm(false);
      setTraitementToDelete(null);
      toast.success('Traitement supprimé avec succès !');
      
      if (currentTraitements.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTraitementToDelete(null);
  };

  if (loading) { return <Loading />;}
  
  return (
    <div className="p-6 h-screen bg-gray-100">
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
        <h1 className="text-gray-600 text-2xl font-bold">Traitement Médical</h1>
        <button 
          onClick={() => {
            setNouveauTraitement({ 
              id: 0, 
              nom: "", 
              prix: "", 
              prixprisenchager: null,
              services: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            setIsEditing(false);
            setShowForm(true);
          }}          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Ajouter un traitement
        </button>
      </div>

      {/* Ajouter la barre de recherche ici */}
      <div className="flex justify-between items-center mb-6 text-gray-600">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un traitement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Liste des traitements */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Liste des traitements</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Nom du traitement</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Prix (Ar)</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Prix prise en charge (Ar)</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Services</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTraitements.map((traitement, index) => (
                <tr key={`traitement-${traitement.id}-${index}`} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">{traitement.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{traitement.nom}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {typeof traitement.prix === 'string' 
                      ? parseFloat(traitement.prix).toLocaleString()
                      : traitement.prix?.toLocaleString() || '0'} Ar
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {traitement.prixprisenchager 
                      ? (typeof traitement.prixprisenchager === 'string'
                          ? parseFloat(traitement.prixprisenchager).toLocaleString()
                          : traitement.prixprisenchager.toLocaleString())
                      : 'Non défini'} {traitement.prixprisenchager ? 'Ar' : ''}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {getServiceNames(traitement.services || [])}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit({
                              id: traitement.id,
                              nom: traitement.nom,
                              prix: Number(traitement.prix),
                              services: traitement.services || []
                              })}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer"
                              title="Modifier"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                      <button 
                        onClick={() => handleDelete(traitement.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, traitements.length)} sur {traitements.length} traitements
          </div>
          <div className="flex space-x-1">
            <button 
              key="prev-button"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'}`}
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={`page-button-${i + 1}`}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              key="next-button"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'}`}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout/modification de traitement (slide-in) */}
      <motion.div 
        className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-70 p-6 overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: showForm ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">
            {isEditing ? "Modifier le traitement" : "Ajouter un traitement"}
          </h2>
          <button 
            onClick={() => setShowForm(false)}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1 ">
              Nom du traitement
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={nouveauTraitement.nom}
              onChange={handleChange}
              required
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Consultation"
            />
          </div>
          
          <div>
            <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1">
              Prix (Ar)
            </label>
            <input
              type="number"
              id="prix"
              name="prix"
              value={nouveauTraitement.prix}
              onChange={handleChange}
              required
              min="0"
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 20000"
            />
          </div>
          
          <div>
            <label htmlFor="prixprisenchager" className="block text-sm font-medium text-gray-700 mb-1">
              Prix prise en charge (Ar)
            </label>
            <input
              type="number"
              id="prixprisenchager"
              name="prixprisenchager"
              value={nouveauTraitement.prixprisenchager || ''}
              onChange={handleChange}
              min="0"
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 50000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services associés
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
              {services.map((service, index) => (
                <div key={`service-checkbox-${service.id}-${index}`} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    name="service"
                    value={service.id}
                    checked={nouveauTraitement.services.some(s => s.id === service.id)}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-700">
                    {service.nom}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm transition-colors duration-300 flex items-center justify-center ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? "Mise à jour..." : "Enregistrement..."}
              </>
            ) : (
              isEditing ? "Mettre à jour" : "Enregistrer"
            )}
          </button>
        </form>
      </motion.div>

      {/* Overlay pour fermer le formulaire en cliquant à l'extérieur */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/30 z-50"
          onClick={() => setShowForm(false)}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={cancelDelete}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-96">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-gray-500 mb-6">
                Êtes-vous sûr de vouloir supprimer ce traitement ? Cette action est irréversible.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer flex items-center ${
                    isDeleting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
