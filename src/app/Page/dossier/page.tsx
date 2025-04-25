"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Search } from "lucide-react";
import Link from "next/link";

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

  const medicalFiles = [
    { name: "ANDRIAMANANA Nadia Holihainitra", id: "0043" },
    { name: "BARTHELEMY Raffaello Laurenz", id: "0038" },
    { name: "BE Francesca Murielle", id: "0073" },
    { name: "BEZARA Graziella Pegny Constance", id: "0077" },
    { name: "BOTOMAZAVA Didier", id: "0019" },
    { name: "CHANTAL -", id: "0036" },
    { name: "EDOUARD Jean Christophe", id: "0012" },
    { name: "FANOMEZANJANAH ARY Teddy", id: "0096" },
    { name: "HASINAVALONA Rija Arimanana", id: "0026" },
    { name: "LAHIFANIRINA Haja Gayou", id: "0023" },
    { name: "MAMY VAVY Justine", id: "0064" },
    { name: "MANAHY Armella Litihia Anassoa", id: "0094" },
    { name: "MANANTSARA Christian Carl", id: "0091" },
    { name: "MANANTSARA Christian Nathane", id: "0017" },
    { name: "MAXIMIN Shadya", id: "00 95" },
    { name: "NDRIA Tefy Felamalala Riem", id: "0011" },
    { name: "ONIMALALA Raymonde Larissa", id: "00114" },
    { name: "RAHANTANIRINA Adrienne Sabrina", id: "0020" },
    { name: "RAHARISON François Jennifa", id: "0085" },
    { name: "RAMAROSON Jean Erick", id: "0098" },
    { name: "RANAIVOJAONA Murielle Nancy Tatina", id: "0097" },
    { name: "RANDRENALJAONA Fenosoa Lalaina", id: "00120" },
    { name: "RANDRIAMBOLOLO NA Eric", id: "0014" },
    { name: "RANDRIAJAFY Lovanahary", id: "00115" },
    { name: "RASOLONIRINA Andrianila Tilotra", id: "0092" },
    { name: "RASON Eric", id: "0008" },
    { name: "RATOVONJANAHARY Anita Gaelle", id: "00112" },
    { name: "RATSIALARISONANA Haja Mirentsoa", id: "00110" },
  ];
  const MedicalFiles = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState(medicalFiles);

    useEffect(() => {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }, []);

    useEffect(() => {
      const results = medicalFiles.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        file.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(results);
    }, [searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };
    if (loading) { return <Loading />;}

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dossiers Médical</h1>
        
        {/* Barre de recherche */}
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
          {filteredFiles.length === 0 && searchTerm && (
            <p className="mt-2 text-sm text-gray-500">Aucun dossier trouvé pour "{searchTerm}"</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center border border-gray-200">
              <Folder className="w-12 h-12 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700 mt-2 text-center">{file.name}</h2>
              <p className="text-xs text-gray-500">Matricule: {file.id}</p>
              <Link href={`/Page/dossier/${file.id}`}>
                <button className="cursor-pointer mt-3 bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600 transition">
                  Ouvrir le dossier
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default MedicalFiles;