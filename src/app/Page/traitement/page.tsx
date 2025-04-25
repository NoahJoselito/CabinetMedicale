"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
  const [traitements, setTraitements] = useState([
    { id: 1, nom: "Consultation", prix: 20000 },
    { id: 2, nom: "Radiographie", prix: 35000 },
    { id: 3, nom: "Analyse de sang", prix: 15000 },
    { id: 4, nom: "Échographie", prix: 40000 },
    { id: 5, nom: "Vaccination", prix: 12000 },
    { id: 6, nom: "Physiothérapie", prix: 25000 },
    { id: 7, nom: "Consultation spécialiste", prix: 45000 },
    { id: 8, nom: "IRM", prix: 120000 },
    { id: 9, nom: "Scanner", prix: 80000 },
    { id: 10, nom: "Électrocardiogramme", prix: 30000 },
  ]);
  const [nouveauTraitement, setNouveauTraitement] = useState({ id: 0, nom: "", prix: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [traitementToDelete, setTraitementToDelete] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTraitements = traitements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(traitements.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isEditing && nouveauTraitement.id) {
      // Update existing treatment
      setTraitements(traitements.map(t => 
        t.id === nouveauTraitement.id 
          ? { ...t, nom: nouveauTraitement.nom, prix: parseFloat(nouveauTraitement.prix as string) } 
          : t
      ));
    } else {
      // Add new treatment
      const newId = traitements.length > 0 ? Math.max(...traitements.map(t => t.id)) + 1 : 1;
      const nouveauTraitementAvecId = {
        id: newId,
        nom: nouveauTraitement.nom,
        prix: parseFloat(nouveauTraitement.prix as string)
      };
      setTraitements([...traitements, nouveauTraitementAvecId]);
    }
    
    // Reset form
    setNouveauTraitement({ id: 0, nom: "", prix: "" });
    setShowForm(false);
    setIsEditing(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNouveauTraitement({ ...nouveauTraitement, [name]: value });
  };

  const handleEdit = (traitement: { id: number; nom: string; prix: number }) => {
    setNouveauTraitement({ 
      id: traitement.id, 
      nom: traitement.nom, 
      prix: traitement.prix.toString() 
    });
    setIsEditing(true);
    setShowForm(true);
  };
  const handleDelete = (id: number) => {
    setTraitementToDelete(id as any);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setTraitements(traitements.filter(t => t.id !== traitementToDelete));
    setShowDeleteConfirm(false);
    setTraitementToDelete(null);
    
    // Adjust current page if needed after deletion
    if (currentTraitements.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTraitementToDelete(null);
  };

  if (loading) { return <Loading />;}
  
  return (
    <div className="p-6 h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-gray-600 text-2xl font-bold">Traitement Médical</h1>
        <button 
          onClick={() => {
            setNouveauTraitement({ id: 0, nom: "", prix: "" });
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
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTraitements.map((traitement) => (
                <tr key={traitement.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">{traitement.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{traitement.nom}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{traitement.prix.toLocaleString()} Ar</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(traitement)}
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
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'}`}
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
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
        className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 p-6 overflow-y-auto"
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
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
          
          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm transition-colors duration-300"
          >
            {isEditing ? "Mettre à jour" : "Enregistrer"}
          </button>
        </form>
      </motion.div>

      {/* Overlay pour fermer le formulaire en cliquant à l'extérieur */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
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
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
