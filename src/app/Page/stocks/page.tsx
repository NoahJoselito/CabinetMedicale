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
        Chargement du stock...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

export default function Stocks() {
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('');
  const [unitType, setUnitType] = useState('unite');
  const [quantity, setQuantity] = useState('');
  const [unitQuantity, setUnitQuantity] = useState('');
  const [packageCount, setPackageCount] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const services = [
    'Cardiologie',
    'Radiologie',
    'Pédiatrie',
    'Dermatologie',
    'Urgences'
  ];

  if (loading) { return <Loading />; }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-gray-600 text-2xl font-bold mb-6">Gestion des Stocks</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl text-gray-600">
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Service
          </label>
          <select 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un service</option>
            {services.map((service) => (
              <option key={service} value={service}>{service}</option>
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
            />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quantité unitaire par {unitType === 'package' ? 'plaquette/carton' : 'unité'}
              </label>
              <input
                type="number"
                value={unitQuantity}
                onChange={(e) => setUnitQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
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
              />
            </div>
          </>
        )}

        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          Enregistrer
        </button>
      </div>
    </div>
  );
}
