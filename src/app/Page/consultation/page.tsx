"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { consultService, ConsultationResponse, PaymentRequest } from '@/services/consultService';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Load consultations on mount
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const data = await consultService.getConsultations();
        // Mettre à jour les montants restants et les montants déjà payés
        const consultationsWithPayments = await Promise.all(
          data.consultations.map(async (consultation) => {
            try {
              const remaining = await consultService.getPaymentRemaining(consultation.id);
              return {
                ...consultation,
                payementrestant: Number(remaining.payementrestant),
                montantPaye: Number(consultation.total) - Number(remaining.payementrestant),
                total: Number(consultation.total),
                seancerestant: Number(consultation.seancerestant || 0)
              } as unknown as ConsultationResponse;
            } catch (error) {
              console.error(`Error fetching payments for consultation ${consultation.id}:`, error);
              return {
                ...consultation,
                payementrestant: Number(consultation.total),
                montantPaye: 0,
                total: Number(consultation.total),
                seancerestant: Number(consultation.seancerestant || 0)
              } as unknown as ConsultationResponse;
            }
          })
        );
        setConsultations(consultationsWithPayments);
      } catch (error) {
        console.error('Failed to load consultations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, []);

  // Filter consultations based on search and filters
  const filteredConsultations = consultations.filter(consultation => {
    if (filterStatus === 'paid' && consultation.statuspaiement !== 'Payé') return false;
    if (filterStatus === 'unpaid' && consultation.statuspaiement === 'Payé') return false;
    
    const searchString = `${consultation.patient.name} ${consultation.patient.prenom}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Get all unique treatments for the filter
  const allTreatments = [...new Set(consultations.flatMap(c => 
    c.traitements.map(t => t.nom)
  ))];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConsultations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);

  const [currentPatient, setCurrentPatient] = useState<{
    payementrestant: number;
    montantPaye: number;
    id: number;
    name: string;
    seance: string;
    amount: number;
    paid: boolean;
    seanceCount: number;
    completedSeances: number;
  } | null>(null);
  
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
  const [validateAllSeances, setValidateAllSeances] = useState(false);
  const [numeroDossier, setNumeroDossier] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [showPriseEnChargeModal, setShowPriseEnChargeModal] = useState(false);
  
  // Function to change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSeanceValidation = (id: number) => {
    const consultation = consultations.find(c => c.id === id);
    if (consultation) {
      setCurrentPatient({
              id: consultation.id,
              name: `${consultation.patient.name} ${consultation.patient.prenom}`,
              seance: consultation.traitements.map(t => t.nom).join(', '),
              amount: Number(consultation.total),
              paid: consultation.statuspaiement === 'Payé',
              seanceCount: consultation.nb_seances,
              completedSeances: consultation.nb_seances - (consultation.seancerestant || 0),
              payementrestant: Number(consultation.payementrestant),
              montantPaye: Number(consultation.montantPaye)
            });
    } else {
      setCurrentPatient(null);
    }
    setShowSeanceModal(true);
  };
  const handlePaymentValidation = (id: number) => {
    const consultation = consultations.find(p => p.id === id);
    if (consultation) {
      setCurrentPatient({
        id: consultation.id,
        name: `${consultation.patient.name} ${consultation.patient.prenom}`,
        seance: consultation.traitements.map(t => t.nom).join(', '),
        amount: Number(consultation.total),
        paid: consultation.statuspaiement === 'Payé',
        seanceCount: consultation.seanceCount || 0,
        completedSeances: consultation.completedSeances || 0,
        payementrestant: Number(consultation.payementrestant),
        montantPaye: Number(consultation.montantPaye)
      });
    } else {
      setCurrentPatient(null);
    }
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  };  const confirmSeance = async () => {
    if (currentPatient) {
      setIsValidating(true);
      try {
        if (validateAllSeances) {
          // Validate remaining seances one by one
          const remainingSeances = currentPatient.seanceCount - currentPatient.completedSeances;
          for (let i = 0; i < remainingSeances; i++) {
            await consultService.validateSeance(currentPatient.id);
          }
          toast.success(`${remainingSeances} séances ont été validées avec succès`);
          toast.info('Traitement terminé');
        } else {
          const response = await consultService.validateSeance(currentPatient.id);
          toast.success('Séance validée avec succès');
          
          // Check if this was the last seance
          if (currentPatient.completedSeances + 1 >= currentPatient.seanceCount) {
            toast.info('Toutes les séances ont été complétées');
          }
        }
        
        // Refresh consultations list
        const data = await consultService.getConsultations();
        setConsultations(data.consultations);
        
        setShowSeanceModal(false);
        setCurrentPatient(null);
        setValidateAllSeances(false);
      } catch (error: any) {
        console.error('Failed to validate seance:', error);
        toast.error(error.message || 'Une erreur est survenue lors de la validation de la séance');
      } finally {
        setIsValidating(false);
      }
    }
  };

  const proceedToPaymentDetails = () => {
    setShowPaymentModal(false);
    
    switch (paymentMethod) {
      case 'cash':
        setCashAmount(currentPatient?.payementrestant?.toString() || '');
        setShowCashModal(true);
        break;
      case 'mobile':
        setMobileNumber('');
        setShowMobileModal(true);
        break;
      case 'prisencharge':
        setNumeroDossier('');
        setOrganisme('');
        setShowPriseEnChargeModal(true);
        break;
    }
};

  const confirmPayment = async () => {
    if (!currentPatient) return;

    setIsProcessingPayment(true);
    try {
      // Validate payment amount first
      const montantPaiement = paymentMethod === 'cash' && cashAmount
        ? Number(cashAmount)
        : Number(currentPatient.payementrestant);

      if (montantPaiement <= 0) {
        toast.error('Montant de paiement invalide');
        return;
      }

      if (montantPaiement > Number(currentPatient.payementrestant)) {
        toast.error('Le montant ne peut pas dépasser le montant restant');
        return;
      }

      // Prepare payment data
      const paymentData: PaymentRequest = {
        consultation_id: currentPatient.id,
        montant: montantPaiement.toFixed(2),
        date_paiement: new Date().toISOString().split('T')[0],
        type: paymentMethod === 'cash' ? 'espece' : 
              paymentMethod === 'mobile' ? 'mobilemoney' : 'prisencharge',
        ...(paymentMethod === 'mobile' && { numero_mobile: mobileNumber }),
        ...(paymentMethod === 'prisencharge' && {
          numero_dossier: numeroDossier,
          organisme: organisme
        })
      };

      console.log('[UI] Processing payment:', paymentData);

      // Process payment
      const response = await consultService.makePayment(paymentData);
      
      console.log('[UI] Payment successful:', response);

      // Show success message
      toast.success(`Paiement de ${montantPaiement.toLocaleString()} Ar effectué avec succès`);
      
      // Check remaining amount
      const remainingAmount = response["Reste à payer"];
      if (remainingAmount <= 0) {
        toast.success('Consultation entièrement réglée !');
      } else {
        toast.info(`Reste à payer: ${remainingAmount.toLocaleString()} Ar`);
      }

      // Refresh consultations
      await refreshConsultations();
      
      // Reset forms
      resetPaymentForms();

    } catch (error: any) {
      console.error('[UI] Payment error:', error);
      
      // Show specific error message
      if (error.message.includes('validation')) {
        toast.error('Données de paiement invalides. Vérifiez les informations saisies.');
      } else if (error.message.includes('non trouvée')) {
        toast.error('Consultation non trouvée. Veuillez actualiser la page.');
      } else if (error.message.includes('serveur')) {
        toast.error('Problème de connexion. Veuillez réessayer.');
      } else {
        toast.error(error.message || 'Erreur lors du paiement');
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };
  // Ajouter cette fonction pour rafraîchir les consultations
  const refreshConsultations = async () => {
    try {
      const data = await consultService.getConsultations();
      // Force refresh of payment status for each consultation
      const updatedConsultations = await Promise.all(
        data.consultations.map(async (consultation) => {
          const remaining = await consultService.getPaymentRemaining(consultation.id);
          const payementrestant = Number(remaining.payementrestant);
          const montantPaye = Number(consultation.total) - payementrestant;
            
          return {
            ...consultation,
            payementrestant,
            montantPaye,
            total: Number(consultation.total),
            seancerestant: Number(consultation.seancerestant || 0),
            statuspaiement: payementrestant <= 0 ? 'Payé' : 'En cours'
          } as unknown as ConsultationResponse;
        })
      );
      setConsultations(updatedConsultations);
    } catch (error) {
      console.error('Failed to refresh consultations:', error);
      toast.error('Erreur lors du rafraîchissement des données');
    }
  };

  // Ajouter cette fonction pour réinitialiser les formulaires
  const resetPaymentForms = () => {
    setShowCashModal(false);
    setShowCardModal(false);
    setShowMobileModal(false);
    setShowPriseEnChargeModal(false);
    setShowPaymentModal(false);
    setCurrentPatient(null);
    setCashAmount('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
    setMobileNumber('');
    setMobileCode('');
    setNumeroDossier('');
    setOrganisme('');
  };

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
                  {allTreatments.map(seance => (
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
                  <th className="py-3 px-6 text-left">Patient / Docteur</th>
                  <th className="py-3 px-6 text-left">Traitement</th>
                  <th className="py-3 px-6 text-right">Montant</th>
                  <th className="py-3 px-6 text-center">Statut</th>
                  <th className="py-3 px-6 text-center">Séances</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {currentItems.length > 0 ? (
                  currentItems.map((consultation) => (
                    <tr key={consultation.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">
                        <div>
                          <div className="font-medium text-gray-900">
                            {consultation.patient.name} {consultation.patient.prenom}
                          </div>
                          {consultation.docteur && (
                            <div className="text-sm text-gray-500">
                              Dr. {consultation.docteur.prenom} {consultation.docteur.name}
                              {consultation.docteur.specialité && (
                                <span> - {consultation.docteur.specialité}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        {consultation.traitements.map(t => t.nom).join(', ')}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span>{Number(consultation.total).toLocaleString()} Ar</span>
                          <span className="text-sm text-green-600">
                            Payé: {Number(consultation.montantPaye).toLocaleString()} Ar
                          </span>
                          {consultation.payementrestant > 0 && (
                            <span className="text-sm text-red-600">
                              Reste: {Number(consultation.payementrestant).toLocaleString()} Ar
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className={`py-1 px-3 rounded-full text-xs ${
                          consultation.statuspaiement === 'Payé' 
                            ? 'bg-green-200 text-green-700' 
                            : consultation.payementrestant > 0
                              ? 'bg-red-200 text-red-700'
                              : 'bg-red-200 text-red-700'
                        }`}>
                          {consultation.statuspaiement}
                          {consultation.payementrestant > 0 && ` (${consultation.payementrestant} Ar)`}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center">
                          <span className={`font-medium ${
                            consultation.statusseance === 'Complet'
                              ? 'text-green-600'
                              : consultation.seancerestant === null
                                ? 'text-red-600'
                                : 'text-blue-600'
                          }`}>
                            {consultation.statusseance === 'Complet' 
                              ? 'Complet'
                              : consultation.seancerestant !== null 
                                ? `${consultation.nb_seances - consultation.seancerestant}/${consultation.nb_seances}`
                                : 'Non commencé'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          {consultation.statusseance !== 'Complet' && consultation.seancerestant !== null && (
                            <button 
                              onClick={() => handleSeanceValidation(consultation.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-xs transition duration-300 cursor-pointer"
                            >
                              Valider séance
                            </button>
                          )}
                          {consultation.statuspaiement !== 'Payé' && consultation.payementrestant > 0 && (
                            <button
                            onClick={() => handlePaymentValidation(consultation.id)}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-xs transition duration-300 cursor-pointer"
                          >
                            Régler paiement
                          </button>
                        )}
                        {consultation.statusseance === 'Complet' && consultation.statuspaiement === 'Payé' && (
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
        {filteredConsultations.length > itemsPerPage && (
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
                <span className="text-gray-500 font-bold">{filteredConsultations.filter(c => c.statuspaiement !== 'Payé').length}</span>
              </div>
              <div>
                <span className="text-gray-600 text-xs">Traitements terminés: </span>
                <span className="text-gray-500 font-bold">{filteredConsultations.filter(c => c.statuspaiement === 'Payé').length}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600 text-xs">Séances effectuées: </span>
                <span className="text-gray-500 font-bold">
                  {filteredConsultations.reduce((total, c) => total + c.traitements.length, 0)} / 
                  {filteredConsultations.reduce((total, c) => total + c.seanceCount, 0)}
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
                <p className="font-medium text-blue-700">Progression des séances</p>
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
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-blue-600">
                    <span className="font-medium">Séances effectuées:</span> {currentPatient.completedSeances}
                  </p>
                  <p className="text-blue-600">
                    <span className="font-medium">Séances restantes:</span> {currentPatient.seanceCount - currentPatient.completedSeances}
                  </p>
                  <p className="text-blue-600 mt-2">
                    {currentPatient.completedSeances + 1 >= currentPatient.seanceCount 
                      ? "Cette séance terminera le traitement." 
                      : `Il restera ${currentPatient.seanceCount - currentPatient.completedSeances - 1} séance(s) après celle-ci.`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  checked={validateAllSeances}
                  onChange={(e) => setValidateAllSeances(e.target.checked)}
                />
                <span>Valider toutes les séances restantes</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowSeanceModal(false);
                  setValidateAllSeances(false);
                }}
                disabled={isValidating}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button 
                onClick={confirmSeance}
                disabled={isValidating}
                className="relative px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isValidating ? (
                  <>
                    <motion.div 
                      className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Validation en cours...</span>
                  </>
                ) : (
                  <span>{validateAllSeances ? 'Valider toutes les séances' : 'Valider la séance'}</span>
                )}
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
              <p><span className="font-medium">Déjà payé:</span> {Number(currentPatient.montantPaye).toLocaleString()} Ar</p>
              <p><span className="font-medium text-red-600">Reste à payer:</span> {Number(currentPatient.payementrestant).toLocaleString()} Ar</p>
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
                    value="mobile"
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={paymentMethod === 'mobile'}
                    onChange={() => setPaymentMethod('mobile')}
                  />
                  <span>Mobile Money</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="prisencharge"
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={paymentMethod === 'prisencharge'}
                    onChange={() => setPaymentMethod('prisencharge')}
                  />
                  <span>Prise en charge</span>
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
              <p><span className="font-medium">Montant total:</span> {currentPatient.amount.toLocaleString()} Ar</p>
              <p><span className="font-medium">Déjà payé:</span> {Number(currentPatient.montantPaye).toLocaleString()} Ar</p>
              <p><span className="font-medium text-red-600">Reste à payer:</span> {Number(currentPatient.payementrestant).toLocaleString()} Ar</p>
              {cashAmount && (
                <div className="mt-2 space-y-1">
                  <p><span className="font-medium">Montant saisi:</span> {parseFloat(cashAmount).toLocaleString()} Ar</p>
                  <p><span className="font-medium">Nouveau reste:</span> <span className="text-blue-600">{Math.max(0, Number(currentPatient.payementrestant) - parseFloat(cashAmount)).toLocaleString()} Ar</span></p>
                </div>
              )}
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
                max={currentPatient.payementrestant}
              />
              <p className="text-xs text-gray-500 mt-1">
                Montant maximum: {Number(currentPatient.payementrestant).toLocaleString()} Ar
              </p>
            </div>
            
            {parseFloat(cashAmount) > Number(currentPatient.payementrestant) && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-700">Attention:</p>
                <p className="text-yellow-700">
                  Le montant saisi dépasse le montant restant à payer.
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
                  disabled={!cashAmount || parseFloat(cashAmount) <= 0 || isProcessingPayment}
                  className={`px-4 py-2 rounded-md flex items-center justify-center ${
                    isProcessingPayment || !cashAmount || parseFloat(cashAmount) <= 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  }`}
                >
                  {isProcessingPayment ? (
                    <>
                      <motion.div 
                        className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    'Confirmer le paiement'
                  )}
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
                <p><span className="font-medium">Montant à payer:</span> {Number(currentPatient.payementrestant).toLocaleString()} Ar</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone *
                </label>
                <input 
                  type="text" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le numéro de téléphone"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 10 chiffres (ex: 0341234567)
                </p>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Instructions:</span> Le paiement de {Number(currentPatient.payementrestant).toLocaleString()} Ar sera effectué via Mobile Money sur le numéro {mobileNumber}.
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
                  disabled={!mobileNumber || mobileNumber.length < 10 || isProcessingPayment}
                  className={`px-4 py-2 rounded-md flex items-center justify-center ${
                    !mobileNumber || mobileNumber.length < 10 || isProcessingPayment
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  }`}
                >
                  {isProcessingPayment ? (
                    <>
                      <motion.div 
                        className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    'Confirmer le paiement'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOUVEAU Modal pour prise en charge */}
        {showPriseEnChargeModal && currentPatient && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white text-gray-500 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Prise en charge</h3>
              
              <div className="mb-4">
                <p><span className="font-medium">Patient:</span> {currentPatient.name}</p>
                <p><span className="font-medium">Montant à prendre en charge:</span> {Number(currentPatient.payementrestant).toLocaleString()} Ar</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de dossier *
                </label>
                <input 
                  type="text" 
                  value={numeroDossier}
                  onChange={(e) => setNumeroDossier(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le numéro de dossier"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisme *
                </label>
                <input 
                  type="text" 
                  value={organisme}
                  onChange={(e) => setOrganisme(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de l'organisme"
                  required
                />
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Information:</span> Cette prise en charge sera enregistrée pour le montant restant à payer.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowPriseEnChargeModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Retour
                </button>
                <button 
                  onClick={confirmPayment}
                  disabled={!numeroDossier || !organisme || isProcessingPayment}
                  className={`px-4 py-2 rounded-md flex items-center justify-center ${
                    isProcessingPayment || !numeroDossier || !organisme
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  }`}
                >
                  {isProcessingPayment ? (
                    <>
                      <motion.div 
                        className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    'Confirmer la prise en charge'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

