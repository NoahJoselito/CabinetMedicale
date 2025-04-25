"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { div } from 'framer-motion/client';

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
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
          className="w-16 h-16 rounded-full shadow-md"
        />
      </div>
      <motion.div 
        className="mt-4 text-xl font-semibold text-blue-600" 
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ duration: 1, repeat: Infinity }}
      >
        Chargement du Service...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

const services = [
  { 
    id: 1,
    name: "Consultation Générale", 
    description: "Examen médical complet pour diagnostiquer et traiter les maladies courantes.",
    icon: "🩺",
    details: "Nos consultations générales comprennent un examen physique complet, une évaluation de vos antécédents médicaux, et des recommandations personnalisées pour maintenir ou améliorer votre santé. Nos médecins généralistes sont disponibles pour traiter une variété de conditions et peuvent vous orienter vers des spécialistes si nécessaire.",
    horaires: "Lundi au Vendredi: 8h-18h | Samedi: 9h-12h"
  },
  { 
    id: 2,
    name: "Pédiatrie", 
    description: "Soins spécialisés pour les nourrissons, les enfants et les adolescents.",
    icon: "👶",
    details: "Notre service de pédiatrie offre des soins complets pour les enfants de tous âges, depuis les nouveau-nés jusqu'aux adolescents. Nos pédiatres sont formés pour diagnostiquer et traiter les maladies infantiles, effectuer des bilans de santé réguliers, et conseiller les parents sur la nutrition, le développement et la prévention.",
    horaires: "Lundi au Vendredi: 9h-17h"
  },
  { 
    id: 3,
    name: "Gynécologie", 
    description: "Consultations et suivi médical pour la santé des femmes.",
    icon: "👩",
    details: "Notre service de gynécologie propose des examens préventifs, des dépistages, des consultations pour la contraception, le suivi de grossesse, et le traitement des troubles gynécologiques. Nos gynécologues offrent un environnement confidentiel et respectueux pour discuter de tous les aspects de la santé féminine.",
    horaires: "Lundi, Mercredi, Vendredi: 9h-16h"
  },
  { 
    id: 4,
    name: "Cardiologie", 
    description: "Examens et traitements pour les maladies cardiovasculaires.",
    icon: "❤️",
    details: "Notre service de cardiologie est équipé pour diagnostiquer et traiter les maladies du cœur et des vaisseaux sanguins. Nous proposons des électrocardiogrammes, des tests d'effort, des échocardiographies et des consultations spécialisées pour la prévention et la gestion des maladies cardiovasculaires.",
    horaires: "Mardi et Jeudi: 10h-18h"
  },
  { 
    id: 5,
    name: "Radiologie", 
    description: "Imagerie médicale pour un diagnostic précis (échographies, radiographies, etc.).",
    icon: "📷",
    details: "Notre département de radiologie utilise des technologies d'imagerie avancées pour aider au diagnostic de diverses conditions médicales. Nous proposons des radiographies, des échographies, et des examens spécialisés, tous réalisés par des techniciens qualifiés et interprétés par des radiologues expérimentés.",
    horaires: "Lundi au Vendredi: 8h-16h"
  },
  { 
    id: 6,
    name: "Dermatologie", 
    description: "Traitement des maladies de la peau, des cheveux et des ongles.",
    icon: "🧴",
    details: "Notre service de dermatologie traite les affections cutanées comme l'acné, l'eczéma, le psoriasis et les infections fongiques. Nous effectuons également des dépistages du cancer de la peau et proposons des traitements pour les problèmes capillaires et des ongles.",
    horaires: "Lundi et Mercredi: 9h-17h"
  },
  { 
    id: 7,
    name: "Ophtalmologie", 
    description: "Examens de la vision et prise en charge des maladies oculaires.",
    icon: "👁️",
    details: "Notre service d'ophtalmologie offre des examens complets de la vue, des prescriptions de lunettes et lentilles de contact, ainsi que le diagnostic et le traitement des maladies oculaires comme la cataracte, le glaucome et la dégénérescence maculaire.",
    horaires: "Mardi et Jeudi: 9h-16h"
  },
  { 
    id: 8,
    name: "Dentisterie", 
    description: "Soins dentaires et traitements orthodontiques.",
    icon: "🦷",
    details: "Notre service dentaire propose des nettoyages réguliers, des obturations, des extractions, des traitements de canal, des couronnes et des prothèses. Nous offrons également des services d'orthodontie pour corriger l'alignement des dents et améliorer votre sourire.",
    horaires: "Lundi au Vendredi: 8h30-17h"
  },
  { 
    id: 9,
    name: "Kinésithérapie", 
    description: "Rééducation physique et traitement des douleurs musculaires.",
    icon: "💪",
    details: "Notre service de kinésithérapie aide les patients à récupérer leur mobilité et leur force après une blessure ou une chirurgie. Nos kinésithérapeutes utilisent diverses techniques manuelles, des exercices thérapeutiques et des modalités physiques pour réduire la douleur et améliorer la fonction physique.",
    horaires: "Lundi au Vendredi: 8h-19h | Samedi: 9h-13h"
  }
];

// Liste d'icônes pour le sélecteur d'icônes
const iconOptions = ["🩺", "👶", "👩", "❤️", "📷", "🧴", "👁️", "🦷", "💪", "🧠", "🦴", "🫁", "🫀", "🧬", "💊", "💉"];

// Type pour un service
type Service = {
  id: number;
  name: string;
  description: string;
  icon: string;
  details: string;
  horaires: string;
};


// Menu contextuel (clic droit)
const ContextMenu = ({ 
  x, 
  y, 
  onEdit, 
  onDelete, 
  onClose 
}: { 
  x: number; 
  y: number; 
  onEdit: () => void; 
  onDelete: () => void; 
  onClose: () => void 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Ajuster la position si le menu dépasse la fenêtre
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });
  
  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;
      
      // Ajuster horizontalement si nécessaire
      if (x + menuRect.width > windowWidth) {
        adjustedX = x - menuRect.width - 20; // Placer à gauche de la carte
      }
      
      // Ajuster verticalement si nécessaire
      if (y + menuRect.height > windowHeight) {
        adjustedY = windowHeight - menuRect.height - 10;
      }
      
      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div 
      ref={menuRef}
      className="fixed bg-white shadow-lg rounded-lg py-2 z-50 w-48 border border-gray-200"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      <div className="absolute w-3 h-3 bg-white transform rotate-45 -left-1.5 top-3 border-l border-t border-gray-200"></div>
      <button 
        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700 flex items-center cursor-pointer"
        onClick={onEdit}
      >
        <span className="mr-2">✏️</span> Modifier
      </button>
      <button 
        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center cursor-pointer"
        onClick={onDelete}
      >
        <span className="mr-2">🗑️</span> Supprimer
      </button>
    </motion.div>
  );
};


// Formulaire d'ajout/édition de service
const ServiceForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  isEditing = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (service: Omit<Service, 'id'>) => void; 
  initialData?: Service | null;
  isEditing?: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "🩺",
    details: "",
    horaires: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        icon: initialData.icon,
        details: initialData.details,
        horaires: initialData.horaires
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      name: "",
      description: "",
      icon: "🩺",
      details: "",
      horaires: ""
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-white w-full max-w-md h-full overflow-y-auto p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                {isEditing ? "Modifier le service" : "Ajouter un service"}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Icône</label>
                <select 
                  name="icon" 
                  value={formData.icon} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Nom du service</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  required
                  className="text-gray-950 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Neurologie"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Description courte</label>
                <input 
                  type="text" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  required
                  className="text-gray-950 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brève description du service"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Détails du service</label>
                <textarea 
                  name="details" 
                  value={formData.details} 
                  onChange={handleChange}
                  required
                  rows={4}
                  className="text-gray-950 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description détaillée du service..."
                />
              </div>

              <div>
              <label className="block text-gray-700 font-medium mb-2">Horaires</label>
                <input 
                  type="text" 
                  name="horaires" 
                  value={formData.horaires} 
                  onChange={handleChange}
                  required
                  className="text-gray-950 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Lundi au Vendredi: 9h-17h"
                />
              </div>

              <button 
                type="submit"
                className="cursor-pointer w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
              >
                {isEditing ? "Enregistrer les modifications" : "Ajouter le service"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal de confirmation de suppression
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  serviceName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  serviceName: string 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-white rounded-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le service <span className="font-semibold text-blue-600">{serviceName}</span> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal pour afficher les détails du service
const ServiceDetailModal = ({ service, onClose }: { service: Service; onClose: () => void }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <span className="text-4xl mr-3">{service.icon}</span>
            <h2 className="text-2xl font-bold text-blue-700">{service.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">Description</h3>
          <p className="text-gray-700 mb-4">{service.description}</p>
          
          <h3 className="text-lg font-semibold text-blue-600 mb-2">Détails du service</h3>
          <p className="text-gray-700 mb-4">{service.details}</p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Horaires</h3>
            <p className="text-gray-700">{service.horaires}</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link href={`/Page/rendez_vous?service=${encodeURIComponent(service.name)}`} className="mt-4">
            <button 
              className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Prendre rendez-vous
            </button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};


// Composant pour chaque carte de service
const ServiceCard = ({ 
  service, 
  index, 
  onLearnMore, 
  onContextMenu 
}: { 
  service: Service; 
  index: number; 
  onLearnMore: (service: Service) => void; 
  onContextMenu: (e: React.MouseEvent, service: Service, cardRef: React.RefObject<HTMLDivElement | null>) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:border-blue-300 transition-all duration-300 relative"
      onContextMenu={(e) => cardRef.current && onContextMenu(e, service, cardRef)}    >
      <div className="text-4xl mb-3">{service.icon}</div>
      <h2 className="text-xl font-bold mb-3 text-blue-700">{service.name}</h2>
      <p className="text-gray-600 leading-relaxed">{service.description}</p>
      <button 
        className="cursor-pointer mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
        onClick={() => onLearnMore(service)}
      >
        En savoir plus
      </button>
    </motion.div>
  );
};

// Dans le composant principal ServicesPage, modifiez la fonction handleContextMenu:
const handleContextMenu = (e: React.MouseEvent, service: Service, cardRef: React.RefObject<HTMLDivElement>, setContextMenu: React.Dispatch<React.SetStateAction<{ x: number; y: number; service: Service } | null>>) => {
  e.preventDefault();
  
  // Obtenir la position du card
  if (cardRef.current) {
    const rect = cardRef.current.getBoundingClientRect();
    
    // Positionner le menu à droite de la carte
    const contextMenu = {
      x: rect.right + 10, // 10px d'espace entre la carte et le menu
      y: rect.top,
      service
    };
    setContextMenu(contextMenu);
  }
};
// Layout qui contiendra le contenu principal
const ServiceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [servicesList, setServicesList] = useState<Service[]>(services);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; service: Service } | null>(null);
  const [nextId, setNextId] = useState(services.length + 1);
  
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Fermer le menu contextuel lors d'un clic n'importe où
    const handleClick = () => {
      setContextMenu(null);
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleLearnMore = (service: Service) => {
    setSelectedService(service);
  };
  
  const closeModal = () => {
    setSelectedService(null);
  };

  const handleAddService = (newService: Omit<Service, 'id'>) => {
    const serviceWithId = { ...newService, id: nextId };
    setServicesList(prev => [...prev, serviceWithId]);
    setNextId(prev => prev + 1);
  };

  const handleEditService = (updatedService: Omit<Service, 'id'>) => {
    if (!serviceToEdit) return;
    
    setServicesList(prev => 
      prev.map(service => 
        service.id === serviceToEdit.id 
          ? { ...updatedService, id: serviceToEdit.id } 
          : service
      )
    );
  };

  const handleDeleteService = () => {
    if (!serviceToDelete) return;
    
    setServicesList(prev => 
      prev.filter(service => service.id !== serviceToDelete.id)
    );
    setIsDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  const handleContextMenu = (e: React.MouseEvent, service: Service) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      service
    });
  };

  const handleEditClick = () => {
    if (!contextMenu) return;
    
    setServiceToEdit(contextMenu.service);
    setIsEditFormOpen(true);
    setContextMenu(null);
  };

  const handleDeleteClick = () => {
    if (!contextMenu) return;
    
    setServiceToDelete(contextMenu.service);
    setIsDeleteModalOpen(true);
    setContextMenu(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='bg-gray-100'>
      <ServiceLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-1">
            <motion.h1 
              className="text-4xl font-bold text-blue-800 mb-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Nos Services Médicaux
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Notre cabinet médical propose une gamme complète de services pour répondre à tous vos besoins de santé.
              <span className="block mt-2 text-sm text-gray-500 italic">Clic droit sur un service pour le modifier ou le supprimer</span>
            </motion.p>
            
            <motion.button
              className="cursor-pointer mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddFormOpen(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="mr-2">+</span> Ajouter un service
            </motion.button>
          </div>
          <br />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((service, index) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                index={index} 
                onLearnMore={handleLearnMore}
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {selectedService && (
            <ServiceDetailModal 
              service={selectedService} 
              onClose={closeModal} 
            />
          )}
        </AnimatePresence>

        <ServiceForm 
          isOpen={isAddFormOpen} 
          onClose={() => setIsAddFormOpen(false)} 
          onSave={handleAddService} 
        />

        <ServiceForm 
          isOpen={isEditFormOpen}
          onClose={() => {
            setIsEditFormOpen(false);
            setServiceToEdit(null);
          }}
          onSave={handleEditService}
          initialData={serviceToEdit}
          isEditing={true}
        />

        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setServiceToDelete(null);
          }}
          onConfirm={handleDeleteService}
          serviceName={serviceToDelete?.name || ""}
        />

        <AnimatePresence>
          {contextMenu && (
            <ContextMenu 
              x={contextMenu.x}
              y={contextMenu.y}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onClose={() => setContextMenu(null)}
            />
          )}
        </AnimatePresence>
      </ServiceLayout>
    </div>
  );
}

