"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Search } from "lucide-react";
import Link from "next/link";
import { dossierService } from '@/services/dossierService';
import type { Patient } from '@/services/dossierService';

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
        Chargement du dossier...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
  );

const MedicalFiles = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await dossierService.getAllPatients();
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setPatients(data);
          setFilteredPatients(data);
        } else {
          console.error('Invalid data format received:', data);
          setError('Format de données incorrect');
        }
      } catch (err) {
        setError('Erreur lors du chargement des dossiers');
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (!Array.isArray(patients)) return;
    
    const results = patients.filter(patient => 
      patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      patient?.id?.toString().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(results);
  }, [searchTerm, patients]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dossiers Médical</h1>
      
      <div className="mb-6 relative">
        <div className="flex items-center border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="pl-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom ou matricule..."
            className="w-full py-3 px-4 outline-none text-gray-700"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {filteredPatients.length === 0 && searchTerm && (
          <p className="mt-2 text-sm text-gray-500">Aucun dossier trouvé pour "{searchTerm}"</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.isArray(filteredPatients) && filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center border border-gray-200">
              <Folder className="w-12 h-12 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700 mt-2 text-center">{patient.name}</h2>
              <p className="text-xs text-gray-500">Matricule: {patient.id}</p>
              <Link href={`/Page/dossier/${patient.id}`}>)
                <button className="cursor-pointer mt-3 bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600 transition">
                  Ouvrir le dossier
                </button>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            {searchTerm ? 'Aucun résultat trouvé' : 'Aucun dossier disponible'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalFiles;