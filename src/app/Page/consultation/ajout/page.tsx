"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { consultService, Patient, Treatment, Product, Payment } from '@/services/consultService';

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
        Chargement du Consultation...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
  );

export default function DossierMedical() {
  const [loading, setLoading] = useState(true);
  const [observation, setObservation] = useState('');
  const [temperature, setTemperature] = useState<string>('');
  const [tension, setTension] = useState('');
  const [poids, setPoids] = useState<string>('');
  const [selectedTreatments, setSelectedTreatments] = useState<number[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentType, setPaymentType] = useState('totalite');
  const [avance, setAvance] = useState<string>('');
  const [modePayment, setModePayment] = useState<'espece' | 'mobilemoney' | 'prisencharge'>('espece');
  const [selectedMedicaments, setSelectedMedicaments] = useState<number[]>([]);
  const [antecedents, setAntecedents] = useState<{id: number, titre: string, description?: string}[]>([]);
  const [nextAntecedentId, setNextAntecedentId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    prenom: '',
    email: '',
    numeroTelephone: '',
    date_naissance: '',
    adresse: ''
  });
  const [nbSeances, setNbSeances] = useState<string>('1');
  const [dateConsultation, setDateConsultation] = useState(new Date().toISOString().split('T')[0]);

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [numeroDossier, setNumeroDossier] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [paiementInitial, setPaiementInitial] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [treatmentsData, productsData] = await Promise.all([
          consultService.getTreatments(),
          consultService.getProducts()
        ]);
        console.log('Fetched products:', productsData); // Debug log
        setTreatments(treatmentsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Ajouter une notification d'erreur ici
      } finally {
        setIsLoadingTreatments(false);
        setIsLoadingProducts(false);
      }
    };

    fetchData();
  }, []);

useEffect(() => {
  let total = 0;

  // Ajouter les prix des traitements sélectionnés
  selectedTreatments.forEach(treatmentId => {
    const treatment = treatments.find(t => t.id === treatmentId);
    if (treatment) {
      total += Number(treatment.prix); // Assure-toi que prix est bien un nombre
    }
  });

  // Ajouter les prix des médicaments sélectionnés
  selectedMedicaments.forEach(medicamentId => {
    const medicament = products.find(p => p.id === medicamentId);
    if (medicament) {
      total += Number(medicament.prix); // Pareil ici
    }
  });

  // Met à jour le prix total
  setTotalPrice(total);

  // Affiche dans la console (optionnel)
  console.log('Prix total:', total, 'Ar');
}, [selectedTreatments, selectedMedicaments, treatments, products]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleTreatmentChange = (treatmentId: number) => {
    setSelectedTreatments((prev: number[]) => {
      if (prev.includes(treatmentId)) {
        return prev.filter(id => id !== treatmentId);
      } else {
        return [...prev, treatmentId];
      }
    });
  };

  const handleMedicamentChange = (medicamentId: number) => {
    setSelectedMedicaments((prev: number[]) => {
      if (prev.includes(medicamentId)) {
        return prev.filter(id => id !== medicamentId);
      } else {
        return [...prev, medicamentId];
      }
    });
  };

  const addAntecedent = () => {
    setAntecedents([...antecedents, { 
      id: nextAntecedentId, 
      titre: '', 
      description: '' 
    }]);
    setNextAntecedentId(nextAntecedentId + 1);
  };

  const updateAntecedent = (id: number, field: 'titre' | 'description', value: string) => {
    setAntecedents(antecedents.map(ant => 
      ant.id === id ? { ...ant, [field]: value } : ant
    ));
  };

  const removeAntecedent = (id: number) => {
    setAntecedents(antecedents.filter(ant => ant.id !== id));
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const results = await consultService.searchPatients(query);
        setSearchResults(results);
        setShowSearchResults(true);
        setShowNewPatientForm(results.length === 0);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
        setShowSearchResults(false);
        setShowNewPatientForm(true);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setShowNewPatientForm(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatientData(patient);
    setSearchQuery(`${patient.name} ${patient.prenom}`);
    setShowSearchResults(false);
  };

  const handleNewPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newPatient.email) {
        toast.warning('L\'email est obligatoire');
        return;
      }

      const patientData = {
        ...newPatient,
        role_id: 4,
        password: 'DefaultPass123!', // Will be handled by the backend
        password_confirmation: 'DefaultPass123!'
      };

      const createdPatient = await consultService.createPatient(patientData);
      
      if (createdPatient) {
        toast.success('Patient créé avec succès');
        setSelectedPatientData(createdPatient);
        setSearchQuery(`${createdPatient.name} ${createdPatient.prenom}`);
        setShowNewPatientForm(false);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du patient:', error);
      toast.error(error?.response?.data?.message || 'Erreur lors de la création du patient');
    }
  };

  const newPatientFormJSX = showNewPatientForm && (
    <div className="mt-4 p-4 border border-blue-200 rounded-md bg-blue-50">
      <h3 className="text-lg font-medium text-blue-800 mb-4">Ajouter un nouveau patient</h3>
      <form onSubmit={handleNewPatientSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <label className="block text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md"
              value={newPatient.name}
              onChange={e => setNewPatient({...newPatient, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md"
              value={newPatient.prenom}
              onChange={e => setNewPatient({...newPatient, prenom: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-md"
              value={newPatient.email}
              onChange={e => setNewPatient({...newPatient, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              required
              className="w-full p-2 border rounded-md"
              value={newPatient.numeroTelephone}
              onChange={e => setNewPatient({...newPatient, numeroTelephone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Date de naissance</label>
            <input
              type="date"
              required
              className="w-full p-2 border rounded-md"
              value={newPatient.date_naissance}
              onChange={e => setNewPatient({...newPatient, date_naissance: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md"
              value={newPatient.adresse}
              onChange={e => setNewPatient({...newPatient, adresse: e.target.value})}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowNewPatientForm(false)}
            className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter le patient
          </button>
        </div>
      </form>
    </div>
  );

  const handleSubmit = async () => {
    if (!selectedPatientData) {
      toast.warning('Veuillez sélectionner un patient');
      return;
    }

    try {
      // Validate required fields
      if (!temperature || !tension || !dateConsultation) {
        toast.warning('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (selectedTreatments.length === 0 && selectedMedicaments.length === 0) {
        toast.warning('Veuillez sélectionner au moins un traitement ou un médicament');
        return;
      }

      // Ensure required patient fields are present
      if (!selectedPatientData.name || !selectedPatientData.prenom || !selectedPatientData.email) {
        toast.error('Les informations du patient sont incomplètes');
        return;
      }

      const consultationData = {
        patient: {
          name: selectedPatientData.name,
          prenom: selectedPatientData.prenom,
          email: selectedPatientData.email,
          role_id: 4,
          numeroTelephone: selectedPatientData.numeroTelephone || '',
          date_naissance: selectedPatientData.date_naissance || '',
          adresse: selectedPatientData.adresse || ''
        },
        date_consultation: dateConsultation,
        nb_seances: parseInt(nbSeances) || 1,
        total: totalPrice,
        observation: observation.trim(),
        temperature: parseFloat(temperature) || 37,
        tension: tension.trim(),
        antecedents: antecedents.map(({ titre, description }) => ({
          titre: titre.trim(),
          description: description?.trim() || null
        })),
        traitements: selectedTreatments,
        produits: selectedMedicaments,
        paiements: [{
          montant: paymentType === 'totalite' ? totalPrice : parseFloat(avance) || 0,
          date: dateConsultation,
          type: modePayment,
          numero_mobile: modePayment === 'mobilemoney' ? mobileMoneyNumber : null,
          numero_dossier: modePayment === 'prisencharge' ? numeroDossier : null,
          organisme: modePayment === 'prisencharge' ? organisme : null
        }],
        paiement_initial: modePayment === 'espece' ? {
          montant: parseFloat(paiementInitial),
          type: 'espece' as const,
          date: dateConsultation
        } : undefined,
      };

      const response = await consultService.createConsultation(consultationData);
      
      if (response?.consultation?.id) {
        toast.success('Consultation enregistrée avec succès');
        
        // Reset form
        setObservation('');
        setTemperature('');
        setTension('');
        setSelectedTreatments([]);
        setSelectedMedicaments([]);
        setAntecedents([]);
        setSelectedPatientData(null);
        setSearchQuery('');
        setDateConsultation(new Date().toISOString().split('T')[0]);
        setNbSeances('1');
        setTotalPrice(0);
        setPaymentType('totalite');
        setAvance('');
        setMobileMoneyNumber('');
        setNumeroDossier('');
        setOrganisme('');

        // Refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      // Show detailed validation errors if available
      if (error.errors) {
        const validationErrors = Object.values(error.errors)
          .flat()
          .join('\n');
        toast.error(validationErrors);
      } else {
        toast.error(error.message || 'Erreur lors de l\'enregistrement');
      }
    }
  };

  const handleNbSeancesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNbSeances(value === '' ? '1' : value);
  };

  if (loading) { return <Loading />;}
    return (
      <div className="p-6 h-screen overflow-auto bg-gray-100">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
        />
        
        <h1 className="text-gray-600 text-2xl font-bold mb-6">Consultation</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Informations de consultation</h2>
          
          <div className="mb-4 relative">
            <label className="block text-gray-700 mb-2">Rechercher un patient</label>
            <input 
              type="text"
              className="text-gray-700 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Commencez à taper le nom du patient..."
            />
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg text-gray-700">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectPatient(patient)}
                  >
                    <div className="font-medium">{patient.name} {patient.prenom}</div>
                    <div className="text-sm text-gray-600">{patient.email}</div>
                  </div>
                ))}
              </div>
            )}
            {newPatientFormJSX}
          </div>

          {selectedPatientData && (
            <div className="mb-4 p-4 bg-blue-50 rounded-md text-gray-700">
              <h3 className="font-medium mb-2">Informations du patient</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Nom:</span> {selectedPatientData.name}</div>
                <div><span className="font-medium">Prénom:</span> {selectedPatientData.prenom}</div>
                <div><span className="font-medium">Téléphone:</span> {selectedPatientData.numeroTelephone}</div>
                <div><span className="font-medium">Date de naissance:</span> {new Date(selectedPatientData.date_naissance).toLocaleDateString()}</div>
                <div className="col-span-2"><span className="font-medium">Adresse:</span> {selectedPatientData.adresse}</div>
              </div>
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 rounded-md border border-gray-200">
            <h3 className="font-medium mb-3 text-gray-700">Informations de la consultation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <label className="block text-gray-600 mb-1">Date de consultation</label>
                <input 
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={dateConsultation}
                  onChange={(e) => setDateConsultation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Nombre de séances</label>
                <input 
                  type="number"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={nbSeances}
                  onChange={handleNbSeancesChange}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Observations</label>
            <textarea 
              className="text-gray-700 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Saisir vos observations médicales..."
            />
          </div>
          
          <div className="mb-4">
            <button 
              type="button"
              onClick={addAntecedent}
              className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-100 hover:bg-blue-300 text-sm font-semibold py-2 px-4 rounded-md shadow-md transition duration-200"
            >
              <span className="mr-2">Ajouter un antécédent médical</span>
              <span>+</span>
            </button>
            
            {antecedents.length > 0 && (
              <div className="mt-3 space-y-3">
                {antecedents.map(ant => (
                  <div key={ant.id} className="p-3 bg-blue-50 rounded-md border border-blue-200 relative">
                    <button 
                      type="button"
                      onClick={() => removeAntecedent(ant.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                      aria-label="Supprimer l'antécédent"
                    >
                      ×
                    </button>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-700 mb-1">Titre de l'antécédent</label>
                        <input 
                          type="text"
                          className="text-gray-700 w-full p-2 border border-gray-300 rounded-md"
                          value={ant.titre}
                          onChange={(e) => updateAntecedent(ant.id, 'titre', e.target.value)}
                          placeholder="Ex: Hypertension, Diabète..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Description (optionnelle)</label>
                        <textarea 
                          className="text-gray-700 w-full p-2 border border-gray-300 rounded-md"
                          rows={2}
                          value={ant.description || ''}
                          onChange={(e) => updateAntecedent(ant.id, 'description', e.target.value)}
                          placeholder="Détails supplémentaires..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="text-md font-medium mb-3 text-gray-700">État général du patient</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Température (°C)</label>
                <input 
                  type="number" 
                  className="text-gray-700 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="37.0"
                  step="0.1"
                  min="35"
                  max="42"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Tension (mmHg)</label>
                <input 
                  type="text" 
                  className="text-gray-700 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={tension}
                  onChange={(e) => setTension(e.target.value)}
                  placeholder="120/80"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Prescription de médicaments</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Sélection des médicaments (optionnel)</label>
            {isLoadingProducts ? (
              <div className="text-gray-500">Chargement des médicaments...</div>
            ) : products.length === 0 ? (
              <div className="text-gray-500">Aucun médicament disponible</div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex items-center flex-1">
                      <input 
                        type="checkbox" 
                        id={`medicament-${product.id}`}
                        checked={selectedMedicaments.includes(product.id)}
                        onChange={() => handleMedicamentChange(product.id)}
                        className="mr-3 h-5 w-5 text-blue-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <label htmlFor={`medicament-${product.id}`} className="font-medium text-gray-700 cursor-pointer">
                          {product.nom}  {/* Changé de product.libelle à product.nom */}
                        </label>
                        <span className="text-sm text-gray-500">{product.quantite}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-900 font-medium">{product.prix} Ar</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Traitements et paiement</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Sélection des traitements</label>
            {isLoadingTreatments ? (
              <div className="text-gray-500">Chargement des traitements...</div>
            ) : (
              <div className="space-y-2">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex items-center flex-1">
                      <input 
                        type="checkbox" 
                        id={`treatment-${treatment.id}`}
                        checked={selectedTreatments.includes(treatment.id)}
                        onChange={() => handleTreatmentChange(treatment.id)}
                        className="mr-3 h-5 w-5 text-blue-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <label htmlFor={`treatment-${treatment.id}`} className="font-medium text-gray-700 cursor-pointer">
                          {treatment.nom}  {/* Utiliser treatment.nom */}
                        </label>
                        {treatment.description && (
                          <span className="text-sm text-gray-500">({treatment.description})</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-900 font-medium">{treatment.prix} Ar</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-6 p-3 bg-gray-100 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Prix total:</span>
              <span className="text-xl font-bold text-blue-600">{totalPrice} Ar</span>
            </div>
          </div>
          
          {/* Mode de paiement selection UI */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Mode de paiement</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <button
                type="button"
                onClick={() => setModePayment('espece')}
                className={`p-3 border rounded-md cursor-pointer ${
                  modePayment === 'espece' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Espèce
              </button>
              <button
                type="button"
                onClick={() => setModePayment('mobilemoney')}
                className={`p-3 border rounded-md cursor-pointer ${
                  modePayment === 'mobilemoney' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setModePayment('prisencharge')}
                className={`p-3 border rounded-md cursor-pointer ${
                  modePayment === 'prisencharge' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Prise en charge
              </button>
            </div>
            
            {modePayment === 'mobilemoney' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <label className="block text-gray-700 mb-2">
                  Numéro Mobile Money
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
                  value={mobileMoneyNumber}
                  onChange={(e) => setMobileMoneyNumber(e.target.value)}
                  placeholder="Ex: 034XXXXXXX"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Veuillez entrer le numéro qui sera utilisé pour le paiement Mobile Money
                </p>
              </div>
            )}
            {modePayment === 'prisencharge' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Numéro de dossier
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
                    value={numeroDossier}
                    onChange={(e) => setNumeroDossier(e.target.value)}
                    placeholder="Ex: PEC-2023-001"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">
                    Organisme de prise en charge
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
                    value={organisme}
                    onChange={(e) => setOrganisme(e.target.value)}
                    placeholder="Ex: OSTIE, BSA, ..."
                    required
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  Veuillez remplir les informations relatives à la prise en charge
                </p>
              </div>
            )}
            {modePayment === 'espece' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <label className="block text-gray-700 mb-2">
                  Montant en espèces
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
                  value={paiementInitial}
                  onChange={(e) => setPaiementInitial(e.target.value)}
                  placeholder="Entrez le montant"
                  required
                />
              </div>
            )}
          </div>

          <button 
            className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            onClick={handleSubmit}
          >
            Enregistrer la consultation
          </button>
        </div>
      </div>
    );
}
