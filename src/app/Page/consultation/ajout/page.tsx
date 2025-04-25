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
        Chargement du Consultation...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
  );

export default function DossierMedical() {
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [observation, setObservation] = useState('');
  const [temperature, setTemperature] = useState('');
  const [poids, setPoids] = useState('');
  const [tension, setTension] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<number[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentType, setPaymentType] = useState('totalite');
  const [avance, setAvance] = useState('');
  // Nouveaux états pour les médicaments et antécédents
  const [selectedMedicaments, setSelectedMedicaments] = useState<number[]>([]);
  // Modification: utiliser un tableau d'antécédents au lieu d'un seul
  const [antecedents, setAntecedents] = useState<{id: number, text: string}[]>([]);
  const [nextAntecedentId, setNextAntecedentId] = useState(1);

  // Exemple de liste de patients
  const patients = [
    { id: 1, name: 'Patient 1' },
    { id: 2, name: 'Patient 2' },
    { id: 3, name: 'Patient 3' },
  ];

  // Exemple de traitements
  const treatments = [
    { id: 1, name: 'Consultation générale', price: 50 },
    { id: 2, name: 'Radiographie', price: 120 },
    { id: 3, name: 'Analyse de sang', price: 80 },
    { id: 4, name: 'Échographie', price: 150 },
  ];

  // Exemple de médicaments
  const medicaments = [
    { id: 1, name: 'Paracétamol 500mg' },
    { id: 2, name: 'Amoxicilline 1g' },
    { id: 3, name: 'Ibuprofène 400mg' },
    { id: 4, name: 'Oméprazole 20mg' },
    { id: 5, name: 'Doliprane 1000mg' },
  ];

  // Calculer le prix total lorsque les traitements sélectionnés changent
  useEffect(() => {
    const total = selectedTreatments.reduce((sum, treatmentId) => {
      const treatment = treatments.find(t => t.id === treatmentId);
      return sum + (treatment ? treatment.price : 0);
    }, 0);
    setTotalPrice(total);
  }, [selectedTreatments]);

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

  // Fonction pour ajouter un nouveau champ d'antécédent
  const addAntecedent = () => {
    setAntecedents([...antecedents, { id: nextAntecedentId, text: '' }]);
    setNextAntecedentId(nextAntecedentId + 1);
  };

  // Fonction pour mettre à jour le texte d'un antécédent
  const updateAntecedent = (id: number, text: string) => {
    setAntecedents(antecedents.map(ant => 
      ant.id === id ? { ...ant, text } : ant
    ));
  };

  // Fonction pour supprimer un antécédent
  const removeAntecedent = (id: number) => {
    setAntecedents(antecedents.filter(ant => ant.id !== id));
  };

  if (loading) { return <Loading />;}
    return (
      <div className="p-6 h-screen overflow-auto bg-gray-100">
        <h1 className="text-gray-600 text-2xl font-bold mb-6">Consultation</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Informations de consultation</h2>
          
          {/* Sélection du patient */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Sélection du patient</label>
            <select 
              className="text-gray-700 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
          
          {/* Champ d'observation */}
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
          
          {/* Bouton pour ajouter un antécédent médical */}
          <div className="mb-4">
            <button 
              type="button"
              onClick={addAntecedent}
              className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-100 hover:bg-blue-300 text-sm font-semibold py-2 px-4 rounded-md shadow-md transition duration-200"
            >
              <span className="mr-2">Ajouter un antécédent médical</span>
              <span>+</span>
            </button>
            
            {/* Liste des champs d'antécédents médicaux */}
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
                    <label className="block text-gray-700 mb-2">Antécédent médical</label>
                    <textarea 
                      className="text-gray-700 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={ant.text}
                      onChange={(e) => updateAntecedent(ant.id, e.target.value)}
                      placeholder="Saisir les antécédents médicaux du patient..."
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* État général du patient */}
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
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Poids (kg)</label>
                <input 
                  type="number" 
                  className="text-gray-700 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={poids}
                  onChange={(e) => setPoids(e.target.value)}
                  placeholder="70"
                  step="0.1"
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
        
        {/* Sélection des médicaments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Prescription de médicaments</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Sélection des médicaments (optionnel)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {medicaments.map((medicament) => (
                <div key={medicament.id} className="text-gray-700 flex items-center">
                  <input 
                    type="checkbox" 
                    id={`medicament-${medicament.id}`}
                    checked={selectedMedicaments.includes(medicament.id)}
                    onChange={() => handleMedicamentChange(medicament.id)}
                    className="mr-2 h-5 w-5 text-blue-600 cursor-pointer"
                  />
                  <label htmlFor={`medicament-${medicament.id}`} className="flex-1">
                    {medicament.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sélection des traitements */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Traitements et paiement</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Sélection des traitements</label>
            <div className="space-y-2">
              {treatments.map((treatment: { id: number; name: string; price: number }) => (
                <div key={treatment.id} className="text-gray-700 flex items-center">
                  <input 
                    type="checkbox" 
                    id={`treatment-${treatment.id}`}
                    checked={selectedTreatments.includes(treatment.id)}
                    onChange={() => handleTreatmentChange(treatment.id)}
                    className="mr-2 h-5 w-5 text-blue-600 cursor-pointer"
                  />
                  <label htmlFor={`treatment-${treatment.id}`} className="flex-1">
                    {treatment.name}
                  </label>
                  <span className="text-gray-700 font-medium">{treatment.price} Ar</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Prix total */}
          <div className="mb-6 p-3 bg-gray-100 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Prix total:</span>
              <span className="text-xl font-bold text-blue-600">{totalPrice} Ar</span>
            </div>
          </div>
          
          {/* Options de paiement */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mode de paiement</label>
            <div className="flex space-x-4">
              <div className="text-gray-700 flex items-center">
                <input 
                  type="radio" 
                  id="totalite" 
                  name="paymentType" 
                  value="totalite"
                  checked={paymentType === 'totalite'}
                  onChange={() => setPaymentType('totalite')}
                  className="mr-2 h-5 w-5 text-blue-600 cursor-pointer"
                />
                <label htmlFor="totalite">Totalité</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="avance" 
                  name="paymentType" 
                  value="avance"
                  checked={paymentType === 'avance'}
                  onChange={() => setPaymentType('avance')}
                  className="mr-2 h-5 w-5 text-blue-600"
                />
                <label className="text-gray-700" htmlFor="avance">Avance</label>
              </div>
            </div>
          </div>
          
          {/* Champ d'avance si sélectionné */}
          {paymentType === 'avance' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Montant de l'avance (Ar)</label>
              <input 
                type="number" 
                className="text-gray-700 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={avance}
                onChange={(e) => setAvance(e.target.value)}
                placeholder="Montant"
                max={totalPrice}
              />
            </div>
          )}
          
          {/* Bouton de validation */}
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Enregistrer la consultation
          </button>
        </div>

        {/* Résumé de la consultation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Résumé de la consultation</h2>
          
          <div className="space-y-3 text-gray-700">
            {selectedPatient && (
              <div>
                <span className="font-medium">Patient:</span> {patients.find(p => p.id.toString() === selectedPatient)?.name || selectedPatient}
              </div>
            )}
            
            {(temperature || poids || tension) && (
              <div>
                <span className="font-medium">Constantes:</span>
                {temperature && <span className="ml-2">Temp: {temperature}°C</span>}
                {poids && <span className="ml-2">Poids: {poids}kg</span>}
                {tension && <span className="ml-2">Tension: {tension}</span>}
              </div>
            )}
            
            {selectedTreatments.length > 0 && (
              <div>
                <span className="font-medium">Traitements:</span>
                <ul className="ml-5 list-disc">
                  {selectedTreatments.map(id => (
                    <li key={id}>{treatments.find(t => t.id === id)?.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedMedicaments.length > 0 && (
              <div>
                <span className="font-medium">Médicaments prescrits:</span>
                <ul className="ml-5 list-disc">
                  {selectedMedicaments.map(id => (
                    <li key={id}>{medicaments.find(m => m.id === id)?.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {antecedents.length > 0 && (
              <div>
                <span className="font-medium">Antécédents médicaux:</span>
                <ul className="ml-5 list-disc mt-1">
                  {antecedents.map(ant => (
                    <li key={ant.id} className="italic">{ant.text || "(Non spécifié)"}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {observation && (
              <div>
                <span className="font-medium">Observations:</span>
                <p className="ml-2 mt-1">{observation}</p>
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-200">
              <span className="font-medium">Paiement:</span>
              <span className="ml-2">
                {paymentType === 'totalite' 
                  ? `Totalité (${totalPrice} Ar)` 
                  : `Avance de ${avance} Ar sur ${totalPrice} Ar`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

