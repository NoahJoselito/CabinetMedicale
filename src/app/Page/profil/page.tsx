"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiLogOut, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiBriefcase, FiGlobe, FiUpload, FiCamera } from 'react-icons/fi';
import Link from "next/link";
import { img } from 'framer-motion/client';

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
        Chargement du profil...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
  );

export default function Profil() {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    nom: "Dupont",
    prenom: "Marie",
    email: "marie.dupont@example.com",
    telephone: "+261 34 567 89 01",
    dateNaissance: "15/04/1985",
    adresse: "Lot 160 Antananarivo, 75011 Madagascar",
    emploi: "Pédiatre",
    bio: "Passionnée de santé, je suis spécialisée en pédiatrie et je suis passionnée par la technologie médicale. Mon objectif est de contribuer à la santé et au bien-être de nos enfants grâce à la technologie avancée.",
    siteWeb: "https://mariedupont.dev",
    linkedin: "https://linkedin.com/in/mariedupont"
  });
  
  const [formData, setFormData] = useState({ ...userData });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleEditToggle = () => {
    if (editMode) {
      setUserData({ ...formData });
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) { return <Loading />; }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6 shadow-lg overflow-hidden group">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={`${userData.prenom} ${userData.nom}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl text-blue-500 font-bold">
                  {<img src='/img/profile.jpg' alt='logo' className='w-30 h-30'>
                  </img>}
                </span>
              )}
              
             
              {editMode && (
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={triggerFileInput}
                >
                  <div className="flex flex-col items-center text-white">
                    <FiCamera className="text-white text-2xl mb-1" />
                    <span className="text-xs">Changer la photo</span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{userData.prenom} {userData.nom}</h1>
              <p className="text-xl opacity-90">{userData.emploi}</p>
            </div>
            <div className="ml-auto mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={handleEditToggle}
                className="cursor-pointer flex items-center bg-white text-blue-700 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition"
              >
                {editMode ? <><FiSave className="mr-2" /> Enregistrer</> : <><FiEdit2 className="mr-2" /> Modifier</>}
              </button>
              <Link href="/Formulaire/login">
              <button className="cursor-pointer flex items-center bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition">
                <FiLogOut className="mr-2" /> Déconnexion
              </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-700">Informations personnelles</h2>
          <div className="mt-4 space-y-3 text-gray-600">
            {Object.entries(userData).map(([key, value]) => (
              key !== 'nom' && key !== 'prenom' && (
                <div key={key}>
                  <label className="block font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')} :</label>
                  {editMode ? (
                    <input 
                      type="text" 
                      name={key} 
                      value={formData[key as keyof typeof formData]} 
                      onChange={handleInputChange} 
                      className="border p-2 rounded w-full"
                    />
                  ) : (
                    <p className="text-gray-700">{value}</p>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
