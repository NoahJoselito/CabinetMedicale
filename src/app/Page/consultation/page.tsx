"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';

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
        Chargement de consultation...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

export default function DossierMedical() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSeance, setSelectedSeance] = useState('');
  const [showSeanceModal, setShowSeanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileCode, setMobileCode] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const [currentPatient, setCurrentPatient] = useState<{
    id: number;
    name: string;
    seance: string;
    amount: number;
    paid: boolean;
    seanceCount: number;
    completedSeances: number;
  } | null>(null);
  
  const [patients, setPatients] = useState([
    { id: 1, name: "Jean Dupont", seance: "Consultation générale", amount: 3500, paid: false, seanceCount: 5, completedSeances: 3 },
    { id: 2, name: "Marie Martin", seance: "Suivi médical", amount: 2200, paid: false, seanceCount: 3, completedSeances: 2 },
    { id: 3, name: "Pierre Durand", seance: "Examen cardiaque", amount: 1800, paid: false, seanceCount: 2, completedSeances: 0 },
    { id: 4, name: "Sophie Lefebvre", seance: "Consultation spécialiste", amount: 1900, paid: false, seanceCount: 4, completedSeances: 1 },
    { id: 5, name: "Jean Dupont", seance: "Contrôle annuel", amount: 3500, paid: false, seanceCount: 1, completedSeances: 0 },
    { id: 6, name: "Marie Martin", seance: "Vaccination", amount: 2200, paid: false, seanceCount: 1, completedSeances: 0 },
    { id: 7, name: "Pierre Durand", seance: "Consultation urgente", amount: 1800, paid: false, seanceCount: 1, completedSeances: 0 },
    { id: 8, name: "Sophie Lefebvre", seance: "Suivi traitement", amount: 1900, paid: false, seanceCount: 6, completedSeances: 4 },
  ]);

  const seances = [...new Set(patients.map(patient => patient.seance))];

  const handleSeanceValidation = (id: number) => {
    const patient = patients.find(p => p.id === id);
    setCurrentPatient(patient || null);
    setShowSeanceModal(true);
  };

  const handlePaymentValidation = (id: number) => {
    const patient = patients.find(p => p.id === id);
    setCurrentPatient(patient || null);
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  };

  const confirmSeance = () => {
    if (currentPatient) {
      const newCompletedSeances = currentPatient.completedSeances + 1;
      const isCompleted = newCompletedSeances >= currentPatient.seanceCount;
      
      setPatients(patients.map(patient => 
        patient.id === currentPatient.id ? { 
          ...patient, 
          completedSeances: newCompletedSeances,
          paid: isCompleted
        } : patient
      ));
      
      setShowSeanceModal(false);
      setCurrentPatient(null);
    }
  };

  const proceedToPaymentDetails = () => {
    setShowPaymentModal(false);
    
    if (paymentMethod === 'cash') {
      setCashAmount(currentPatient?.amount.toString() || '');
      setShowCashModal(true);
    } else if (paymentMethod === 'card') {
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
      setShowCardModal(true);
    } else if (paymentMethod === 'mobile') {
      setMobileNumber('');
      setMobileCode('');
      setShowMobileModal(true);
    }
  };

  const confirmPayment = () => {
    if (currentPatient) {
      setPatients(patients.map(patient => 
        patient.id === currentPatient.id ? { 
          ...patient, 
          paid: true
        } : patient
      ));
      
      // Fermer tous les modals
      setShowCashModal(false);
      setShowCardModal(false);
      setShowMobileModal(false);
      setCurrentPatient(null);
      
      // Réinitialiser les champs
      setCashAmount('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
      setMobileNumber('');
      setMobileCode('');
    }
  };

  const filteredPatients = patients
    .filter(patient => {
      if (filterStatus === 'paid' && !patient.paid) return false;
      if (filterStatus === 'unpaid' && patient.paid) return false;
      
      if (selectedSeance && patient.seance !== selectedSeance) return false;
      
      return patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             patient.seance.toLowerCase().includes(searchTerm.toLowerCase());
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  // Function to change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, selectedSeance]);
  
  if (loading) { return <Loading />;}
    return (
      <div className="p-6 min-h-screen bg-gray-100">
        <h1 className="text-gray-600 text-2xl font-bold mb-6">Consultation</h1>
        <div className="flex justify-end mb-4">
            <Link href={`/Page/consultation/ajout`}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2 cursor-pointer">
                <span>Nouvelle consultation</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-xl font-semibold mb-4">Suivi des séances</h2>
          
          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher un patient..." 
                className="text-gray-700 w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  className="text-gray-500 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="paid">Terminés</option>
                  <option value="unpaid">En cours</option>
                </select>
              </div>
              
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  className="text-gray-500 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  value={selectedSeance}
                  onChange={(e) => setSelectedSeance(e.target.value)}
                >
                  <option value="">Toutes les séances</option>
                  {seances.map(seance => (
                    <option key={seance} value={seance}>{seance}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Patient</th>
                  <th className="py-3 px-6 text-left">Traitement</th>
                  <th className="py-3 px-6 text-right">Montant</th>
                  <th className="py-3 px-6 text-center">Statut</th>
                  <th className="py-3 px-6 text-center">Séances</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {currentItems.length > 0 ? (
                  currentItems.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{patient.name}</td>
                      <td className="py-3 px-6 text-left">{patient.seance}</td>
                      <td className="py-3 px-6 text-right">{patient.amount.toLocaleString()} Ar</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`py-1 px-3 rounded-full text-xs ${patient.paid ? 'bg-green-200 text-green-700' : 'bg-blue-200 text-blue-700'}`}>
                          {patient.paid ? 'Terminé' : 'En cours'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center">
                          <span className={`font-medium ${patient.completedSeances === patient.seanceCount ? 'text-green-600' : 'text-blue-600'}`}>
                            {patient.completedSeances}/{patient.seanceCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          {patient.completedSeances < patient.seanceCount && (
                            <button 
                              onClick={() => handleSeanceValidation(patient.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-xs transition duration-300 cursor-pointer"
                            >
                              Valider séance
                            </button>
                          )}
                          {!patient.paid && (
                            <button
                            onClick={() => handlePaymentValidation(patient.id)}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-xs transition duration-300 cursor-pointer"
                          >
                            Régler paiement
                          </button>
                        )}
                        {patient.completedSeances === patient.seanceCount && patient.paid && (
                          <span className="text-green-600 text-xs">Traitement terminé</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Aucun résultat trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination component */}
        {filteredPatients.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <span>Afficher</span>
              <select 
                className="mx-2 border rounded px-2 py-1"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>par page</span>
            </div>
            
            <nav className="flex items-center">
              <button 
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-l-md border ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-blue-500 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                Précédent
              </button>
              
              <div className="flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 border-t border-b ${
                      currentPage === number
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-r-md border ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-blue-500 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                Suivant
              </button>
            </nav>
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Résumé des séances</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600 text-xs">Traitements en cours: </span>
                <span className="text-gray-500 font-bold">{filteredPatients.filter(p => !p.paid).length}</span>
              </div>
              <div>
                <span className="text-gray-600 text-xs">Traitements terminés: </span>
                <span className="text-gray-500 font-bold">{filteredPatients.filter(p => p.paid).length}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600 text-xs">Séances effectuées: </span>
                <span className="text-gray-500 font-bold">
                  {filteredPatients.reduce((total, p) => total + p.completedSeances, 0)} / 
                  {filteredPatients.reduce((total, p) => total + p.seanceCount, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour valider la séance */}
      {showSeanceModal && currentPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-500 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Validation de séance</h3>
            
            <div className="mb-4">
            <p><span className="font-medium">Traitement:</span> {currentPatient.seance}</p>
              <p><span className="font-medium">Montant:</span> {currentPatient.amount.toLocaleString()} Ar</p>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-700">Progression des séances:</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(currentPatient.completedSeances / currentPatient.seanceCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-blue-700 font-medium">
                    {currentPatient.completedSeances}/{currentPatient.seanceCount}
                  </span>
                </div>
                <p className="mt-2 text-sm text-blue-600">
                  {currentPatient.completedSeances + 1 >= currentPatient.seanceCount 
                    ? "Cette séance terminera le traitement." 
                    : `Il restera ${currentPatient.seanceCount - currentPatient.completedSeances - 1} séance(s) après celle-ci.`
                  }
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={true}
                  readOnly
                />
                <span>Confirmer que la séance a été effectuée</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowSeanceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={confirmSeance}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
              >
                Valider la séance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour choisir le mode de paiement */}
      {showPaymentModal && currentPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-500 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Règlement du paiement</h3>
            
            <div className="mb-4">
              <p><span className="font-medium">Patient:</span> {currentPatient.name}</p>
              <p><span className="font-medium">Traitement:</span> {currentPatient.seance}</p>
              <p><span className="font-medium">Montant total:</span> {currentPatient.amount.toLocaleString()} Ar</p>
              
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-700">Détails du paiement:</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${(currentPatient.completedSeances / currentPatient.seanceCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-green-700 font-medium">
                    {currentPatient.completedSeances}/{currentPatient.seanceCount} séances
                  </span>
                </div>
                <p className="mt-2 text-sm text-green-600">
                  {currentPatient.completedSeances === currentPatient.seanceCount 
                    ? "Toutes les séances ont été effectuées." 
                    : `${currentPatient.completedSeances} séance(s) effectuée(s) sur ${currentPatient.seanceCount}.`
                  }
                </p>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-medium">Choisissez une méthode de paiement</p>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cash"
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <span>Espèces</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="card"
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <span>Carte bancaire</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="mobile"
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={paymentMethod === 'mobile'}
                    onChange={() => setPaymentMethod('mobile')}
                  />
                  <span>Mobile Money</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={proceedToPaymentDetails}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour paiement en espèces */}
      {showCashModal && currentPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-500 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Paiement en espèces</h3>
            
            <div className="mb-4">
              <p><span className="font-medium">Patient:</span> {currentPatient.name}</p>
              <p><span className="font-medium">Montant à payer:</span> {currentPatient.amount.toLocaleString()} Ar</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant reçu
              </label>
              <input 
                type="number" 
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez le montant reçu"
              />
            </div>
            
            {parseFloat(cashAmount) > 0 && parseFloat(cashAmount) < currentPatient.amount && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg text-red-600">
                <p className="font-medium">Attention: Montant insuffisant</p>
                <p className="text-sm">Le montant reçu est inférieur au montant dû.</p>
              </div>
            )}
            
            {parseFloat(cashAmount) > currentPatient.amount && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-700">Monnaie à rendre:</p>
                <p className="text-xl font-bold text-blue-700">
                  {(parseFloat(cashAmount) - currentPatient.amount).toLocaleString()} Ar
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowCashModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Retour
                </button>
                <button 
                  onClick={confirmPayment}
                  disabled={!cashAmount || parseFloat(cashAmount) < currentPatient.amount}
                  className={`px-4 py-2 rounded-md ${
                    !cashAmount || parseFloat(cashAmount) < currentPatient.amount
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  }`}
                >
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour paiement par carte bancaire */}
        {showCardModal && currentPatient && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white text-gray-500 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Paiement par carte bancaire</h3>
              
              <div className="mb-4">
                <p><span className="font-medium">Patient:</span> {currentPatient.name}</p>
                <p><span className="font-medium">Montant à payer:</span> {currentPatient.amount.toLocaleString()} Ar</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de carte
                </label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19}
                />
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                  </label>
                  <input 
                    type="text" 
                    value={cardExpiry}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        let formatted = value;
                        if (value.length > 2) {
                          formatted = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        setCardExpiry(formatted);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC/CVV
                  </label>
                  <input 
                    type="text" 
                    value={cardCVC}
                    onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="XXX"
                    maxLength={3}
                  />
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Les informations de carte bancaire sont traitées de manière sécurisée et ne sont pas stockées dans notre système.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowCardModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Retour
                </button>
                <button 
                  onClick={confirmPayment}
                  disabled={!cardNumber || cardNumber.length < 19 || !cardExpiry || cardExpiry.length < 5 || !cardCVC || cardCVC.length < 3}
                  className={`px-4 py-2 rounded-md ${
                    !cardNumber || cardNumber.length < 19 || !cardExpiry || cardExpiry.length < 5 || !cardCVC || cardCVC.length < 3
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  }`}
                >
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour paiement par Mobile Money */}
        {showMobileModal && currentPatient && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white text-gray-500 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Paiement par Mobile Money</h3>
              
              <div className="mb-4">
                <p><span className="font-medium">Patient:</span> {currentPatient.name}</p>
                <p><span className="font-medium">Montant à payer:</span> {currentPatient.amount.toLocaleString()} Ar</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input 
                  type="text" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le numéro de téléphone"
                  maxLength={10}
                />
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Instructions:</span> Veuillez effectuer le paiement via votre application Mobile Money, puis entrez le code de confirmation reçu par SMS.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowMobileModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Retour
                </button>
                <button 
                  onClick={confirmPayment}
                  disabled={!mobileNumber || mobileNumber.length < 10 }
                  className={`px-4 py-2 rounded-md ${
                    !mobileNumber || mobileNumber.length < 10
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  }`}
                >
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

