"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiLogOut, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiBriefcase, FiGlobe, FiUpload, FiCamera, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from "next/link";
import Image from 'next/image';
import { getUserProfile, updateUserProfile, updatePassword, UserProfile, UpdatePasswordData } from '@/services/profilService';
import { toast } from 'react-toastify';

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
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setUserData(data);
        setFormData(data);
        if (data.photo_url) {
          setProfileImage(data.photo_url);
          localStorage.setItem('userPhoto', data.photo_url);
        }
      } catch (err) {
        setError('Erreur lors du chargement du profil');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditToggle = async () => {
    if (editMode && formData) {
      try {
        const formDataToSend = new FormData();
        
        // Append user data
        formDataToSend.append('name', formData.name || '');
        formDataToSend.append('prenom', formData.prenom || '');
        formDataToSend.append('email', formData.email || '');
        formDataToSend.append('numeroTelephone', formData.numeroTelephone || '');
        formDataToSend.append('date_naissance', formData.date_naissance || '');
        formDataToSend.append('adresse', formData.adresse || '');
        formDataToSend.append('specialité', formData.specialité || '');
        formDataToSend.append('emploi', formData.emploi || '');
        formDataToSend.append('organisme', formData.organisme || '');

        // Gérer la photo
        if (fileInputRef.current?.files?.[0]) {
          formDataToSend.append('photo', fileInputRef.current.files[0]);
        }

        const response = await updateUserProfile(formData.id, formDataToSend);
        const updatedUser = response.user || response;
        
        // Utiliser directement photo_url fourni par le backend
        if (updatedUser.photo_url) {
          setProfileImage(updatedUser.photo_url);
          localStorage.setItem('userPhoto', updatedUser.photo_url);
          // Nettoyer l'aperçu temporaire et réinitialiser l'input fichier
          localStorage.removeItem('tempUserPhoto');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }

        setUserData(updatedUser);
        setFormData(updatedUser);
        setError(null);
        toast.success('Profil mis à jour avec succès');
      } catch (err) {
        setError('Erreur lors de la mise à jour du profil');
        console.error('Error updating profile:', err);
        toast.error('Erreur lors de la mise à jour du profil');
        return;
      }
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setProfileImage(imageDataUrl);
        // Sauvegarder temporairement dans localStorage
        localStorage.setItem('tempUserPhoto', imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getDisplayableFields = (user: UserProfile) => {
    return {
      name: { label: 'Nom', value: user.name },
      prenom: { label: 'Prénom', value: user.prenom },
      email: { label: 'Email', value: user.email },
      numeroTelephone: { label: 'Téléphone', value: user.numeroTelephone },
      date_naissance: { label: 'Date de naissance', value: user.date_naissance },
      adresse: { label: 'Adresse', value: user.adresse },
      specialité: { label: 'Spécialité', value: user.specialité },
      emploi: { label: 'Emploi', value: user.emploi },
      organisme: { label: 'Organisme', value: user.organisme }
    };
  };

  // Normalize any server-provided date into YYYY-MM-DD for <input type="date"/>
  const toDateInputValue = (value: string | null | undefined) => {
    if (!value) return '';
    // If it's already YYYY-MM-DD, keep it
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return '';
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateDisplay = (value: string | null | undefined) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value as string;
    try {
      return parsed.toLocaleDateString('fr-FR');
    } catch {
      return value as string;
    }
  };

  if (loading) { return <Loading />; }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  if (!userData) return null;

  return (
    <div className="min-h-screen from-slate-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl bg-white/90 shadow-sm ring-1 ring-slate-100">
          {/* Hero / Cover */}
          <div className="relative h-36 md:h-44 w-full ">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 2px, transparent 2px)' }} />
          </div>

          {/* Header content */}
          <div className="px-4 md:px-8 pb-6 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="rounded-full p-[3px] bg-gradient-to-tr from-blue-500 to-blue-500 w-36 h-36 md:w-40 md:h-40">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-white/90">
              <Image 
                src={profileImage || localStorage.getItem('userPhoto') || '/img/profile.jpg'} 
                alt={`Photo de ${userData.prenom} ${userData.name}`}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 144px, 160px"
                priority
                unoptimized
              />
              {editMode && (
                <div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-10 opacity-0 hover:opacity-100 transition-opacity"
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
                </div>
              </div>

              {/* Name + role + actions */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
                  <div className="">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {userData?.prenom} {userData?.name}
              </h1>
                    <p className="text-slate-600">{userData?.emploi}</p>
            </div>
                  <div className="md:ml-auto flex items-center gap-3 relative z-10">
              <button 
                onClick={handleEditToggle}
                      className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${editMode ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus:ring-blue-600'}`}
              >
                      {editMode ? (<><FiSave /> Enregistrer</>) : (<><FiEdit2 /> Modifier</>)}
              </button>
              <Link href="/Formulaire/login">
                      <button className="cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-red-600 text-white shadow-sm hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600">
                        <FiLogOut /> Déconnexion
              </button>
              </Link>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Email</div>
                    <div className="text-sm font-medium text-slate-800 truncate">{userData?.email}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Téléphone</div>
                    <div className="text-sm font-medium text-slate-800 truncate">{userData?.numeroTelephone}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Naissance</div>
                    <div className="text-sm font-medium text-slate-800 truncate">{formatDateDisplay(userData?.date_naissance)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 md:px-8 py-8">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">Informations personnelles</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData && Object.entries(getDisplayableFields(userData)).map(([fieldName, { label, value }]) => (
                <div key={fieldName} className="">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {label}
                  </label>
                {editMode ? (
                  fieldName === 'date_naissance' ? (
                    <input
                      type="date"
                      name={fieldName}
                      value={toDateInputValue(formData?.date_naissance)}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                    />
                  ) : (
                    <input 
                      type="text" 
                      name={fieldName}
                      value={formData?.[fieldName as keyof UserProfile] || ''}
                      onChange={handleInputChange} 
                      className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                    />
                  )
                ) : (
                  <div className="block w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-800">
                    {fieldName === 'date_naissance' ? formatDateDisplay(value as string) : value}
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}