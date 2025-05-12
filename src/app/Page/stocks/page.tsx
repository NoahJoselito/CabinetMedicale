"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { stockService } from '@/services/stockService';

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
        Chargement du stock...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

export default function Stocks() {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [unitType, setUnitType] = useState('unite');
  const [quantity, setQuantity] = useState('');
  const [unitQuantity, setUnitQuantity] = useState('');
  const [packageCount, setPackageCount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [nomStock, setNomStock] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksData, servicesData] = await Promise.all([
          stockService.getAll(),
          stockService.getServices()
        ]);
        setStocks(stocksData);
        setServices(servicesData);
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Modifier la logique de filtrage
  const filteredStocks = stocks.filter(stock =>
    stock.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    services.find(s => s.id === stock.service_id)?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStocks = filteredStocks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const stockData = {
        nom: nomStock,
        quantite_total: unitType === 'unite' ? parseInt(quantity) : parseInt(unitQuantity) * parseInt(packageCount),
        quantite_carton: unitType === 'unite' ? 0 : parseInt(packageCount), // Mettre 0 si c'est à l'unité
        service_id: parseInt(selectedService) // Now selectedService contains the service ID directly
      };

      if (isEditing && editingStock) {
        await stockService.update(editingStock.id, stockData);
        toast.success('Stock modifié avec succès !');
      } else {
        await stockService.create(stockData);
        toast.success('Stock ajouté avec succès !');
      }

      // Refresh the stock list
      const updatedStocks = await stockService.getAll();
      setStocks(updatedStocks);
      
      resetForm();
      setShowForm(false);
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNomStock('');
    setSelectedService('');
    setUnitType('unite');
    setQuantity('');
    setUnitQuantity('');
    setPackageCount('');
    setEditingStock(null);
    setIsEditing(false);
  };

  const handleEdit = (stock: any) => {
    setEditingStock(stock);
    setNomStock(stock.nom);
    setSelectedService(stock.service_id.toString());
    setQuantity(stock.quantite_total.toString());
    setPackageCount(stock.quantite_carton.toString());
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setStockToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!stockToDelete) return;
    setIsDeleting(true);
    try {
      await stockService.delete(stockToDelete);
      setStocks(stocks.filter(stock => stock.id !== stockToDelete));
      toast.success('Stock supprimé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setStockToDelete(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <ToastContainer />
      
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-gray-600 text-2xl font-bold">Gestion des Stocks</h1>
        <div className="flex justify-between items-center text-gray-600">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Rechercher un stock..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ajouter au stock
          </button>
        </div>
      </div>

      {/* Liste des stocks */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Liste des stocks</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Service</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Nom</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Quantité</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentStocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">{stock.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {services.find(s => s.id === stock.service_id)?.nom || 'Service inconnu'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{stock.nom}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {stock.quantite_carton > 0 
                      ? `${stock.quantite_total} unités (${stock.quantite_carton} cartons)`
                      : `${stock.quantite_total} unités`
                    }
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(stock)}
                        className="cursor-pointer text-blue-500 hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(stock.id)}
                        className="cursor-pointer text-red-500 hover:text-red-700"
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
            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, stocks.length)} sur {stocks.length} stocks
          </div>
          <div className="flex space-x-1">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`cursor-pointer px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
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
              className={`cursor-pointer px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout/modification (slide-in) */}
      <motion.div 
        className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-70 p-6 overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: showForm ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">
            {isEditing ? "Modifier le stock" : "Ajouter au stock"}
          </h2>
          <button 
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nom du médicament
            </label>
            <input
              type="text"
              value={nomStock}
              onChange={(e) => setNomStock(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Ex: Doliprane"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Service
            </label>
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.nom}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Type d'unité
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="unite"
                  checked={unitType === 'unite'}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="mr-2"
                />
                À l'unité
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="package"
                  checked={unitType === 'package'}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="mr-2"
                />
                Plaquette/Carton
              </label>
            </div>
          </div>

          {unitType === 'unite' ? (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quantité
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Quantité total dans une plaquette/carton
                </label>
                <input
                  type="number"
                  value={unitQuantity}
                  onChange={(e) => setUnitQuantity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nombre de plaquettes/cartons
                </label>
                <input
                  type="number"
                  value={packageCount}
                  onChange={(e) => setPackageCount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`cursor-pointer w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm transition-colors duration-300 flex items-center justify-center ${
              isSubmitting ? 'opacity-75 cursor-not-allowed bg-blue-400' : 'hover:bg-blue-600'
            }`}
          >
            {isSubmitting && (
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSubmitting ? (
              isEditing ? "Modification en cours..." : "Ajout en cours..."
            ) : (
              isEditing ? "Modifier" : "Ajouter"
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
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-96">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-gray-500 mb-6">
                Êtes-vous sûr de vouloir supprimer cet élément du stock ? Cette action est irréversible.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={` cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center ${
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
