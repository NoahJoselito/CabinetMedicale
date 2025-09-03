'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { consultService, Patient, Treatment } from '@/services/consultService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Antecedent {
  id: number;
  user_id: number;
  titre: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientResponse {
  current_page: number;
  data: Patient[];
  total: number;
}

interface NewPatientForm {
  name: string;
  prenom: string;
  email: string;
  numeroTelephone: string;
  date_naissance: string;
  adresse: string;
  specialité: string;
  emploi: string;
  organisme: string;
  numerodossierprisenchage: string;
  antecedents: Array<{
    titre: string;
    description: string;
  }>;
  etatGeneral: string;
  observations: string;
}

interface ConsultationForm {
  date_consultation: string;
  nb_seances: string;  // Changed to string
  observation: string;
  temperature: string; // Changed to string
  tension: string;
}

interface StockItem {
  quantite_carton: number;
  quantite_total: ReactNode;
  id: number;
  nom: string;
  prix: string;
  quantite?: number;  // Make these optional since they might not exist in Product
  description?: string;
  service_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface PaymentForm {
  montant: string;
  type: 'espece' | 'mobilemoney' | 'prisencharge';
  date_paiement: string;
}

const ConsultationAjoutPage: React.FC = () => {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false);

  const [newPatient, setNewPatient] = useState<NewPatientForm>({
    name: '',
    prenom: '',
    email: '',
    numeroTelephone: '',
    date_naissance: '',
    adresse: '',
    specialité: '',
    emploi: '',
    organisme: '',
    numerodossierprisenchage: '',
    antecedents: [],
    etatGeneral: '',
    observations: ''
  });

  const [newAntecedent, setNewAntecedent] = useState({
    titre: '',
    description: ''
  });

  const [consultationForm, setConsultationForm] = useState<ConsultationForm>({
    date_consultation: '',
    nb_seances: '1',  // Initialize as string
    observation: '',
    temperature: '37.0', // Initialize as string
    tension: ''
  });

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<number[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    montant: '',
    type: 'espece',
    date_paiement: new Date().toISOString().split('T')[0]
  });

  // Ajout d'un état pour stocker la dernière consultation créée
  const [lastConsultation, setLastConsultation] = useState<any>(null);

  // Pour afficher le menu de choix PDF
  const [showPdfMenu, setShowPdfMenu] = useState(false);

  // Recherche de patients
  const searchPatients = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const patients = await consultService.searchPatients(term);
      setSearchResults(patients);
      
      if (patients.length === 0) {
        setShowAddForm(true);
        setNewPatient(prev => ({
          ...prev,
          name: term
        }));
      } else {
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPatients(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sélectionner un patient
  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setShowAddForm(false);
  };

  // Gérer les changements du formulaire nouveau patient
  const handleNewPatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Ajouter un antécédent
  const addAntecedent = () => {
    if (newAntecedent.titre.trim()) {
      setNewPatient(prev => ({
        ...prev,
        antecedents: [...prev.antecedents, { ...newAntecedent }]
      }));
      setNewAntecedent({ titre: '', description: '' });
    }
  };

  // Supprimer un antécédent
  const removeAntecedent = (index: number) => {
    setNewPatient(prev => ({
      ...prev,
      antecedents: prev.antecedents.filter((_, i) => i !== index)
    }));
  };

  // Créer un nouveau patient
  const createPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const createdPatient = await consultService.createPatient({
        name: newPatient.name,
        prenom: newPatient.prenom,
        email: newPatient.email,
        numeroTelephone: newPatient.numeroTelephone,
        date_naissance: newPatient.date_naissance,
        adresse: newPatient.adresse,
        specialité: newPatient.specialité,
        emploi: newPatient.emploi,
        organisme: newPatient.organisme,
        numerodossierprisenchage: newPatient.numerodossierprisenchage,
        antecedents: newPatient.antecedents.map(ant => ({
          titre: ant.titre,
          description: ant.description
        }))
      });
      
      setSelectedPatient(createdPatient);
      setShowAddForm(false);
      // Reset form
      setNewPatient({
        name: '',
        prenom: '',
        email: '',
        numeroTelephone: '',
        date_naissance: '',
        adresse: '',
        specialité: '',
        emploi: '',
        organisme: '',
        numerodossierprisenchage: '',
        antecedents: [],
        etatGeneral: '',
        observations: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Soumettre la consultation
  const handleSubmitConsultation = async () => {
    if (!selectedPatient) return;
    
    setIsSubmittingConsultation(true);
    try {
      // Récupérer l'utilisateur connecté depuis localStorage
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      const consultationData = {
        patient: {
          id: selectedPatient.id,
          name: selectedPatient.name,
          prenom: selectedPatient.prenom,
          email: selectedPatient.email,
          role_id: selectedPatient.role_id,
          numeroTelephone: selectedPatient.numeroTelephone,
          adresse: selectedPatient.adresse || '',
          date_naissance: null // Always set to null for consultation
        },
        date_consultation: consultationForm.date_consultation,
        nb_seances: parseInt(consultationForm.nb_seances),
        observation: consultationForm.observation,
        temperature: parseFloat(consultationForm.temperature),
        tension: consultationForm.tension,
        antecedents: selectedPatient.antecedents,
        traitements: selectedTreatments,
        produits: selectedProducts,
        paiements: [],
        paiement_initial: 0,
        docteur_id: currentUser?.id, // Ajouter l'ID du docteur connecté
        // Transmettre aussi les métadonnées du docteur pour affichage immédiat côté client
        docteur: currentUser ? {
          id: currentUser.id,
          name: currentUser.name,
          prenom: currentUser.prenom,
          specialité: currentUser.specialité || '',
        } : undefined,

        total: (total: any) => total
      };

      const createdConsultation = await consultService.createConsultation(consultationData);
      // S'assurer que la consultation sauvegardée contient bien les infos du docteur pour le PDF
      const enrichedConsultation = {
        ...createdConsultation,
        docteur: createdConsultation?.docteur || consultationData.docteur || currentUser || null,
        consultation: createdConsultation?.consultation ? {
          ...createdConsultation.consultation,
          docteur: createdConsultation?.consultation?.docteur || consultationData.docteur || currentUser || null,
        } : createdConsultation?.consultation,
      };
      setLastConsultation(enrichedConsultation); // Stocker la consultation pour impression
      
      toast.success('Consultation créée avec succès!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: () => {
          // Reset forms and redirect after toast closes
          setConsultationForm({
            date_consultation: '',
            nb_seances: '1',
            observation: '',
            temperature: '37.0',
            tension: ''
          });
          setSelectedTreatments([]);
          setSelectedProducts([]);
          setPaymentForm({
            montant: '',
            type: 'espece',
            date_paiement: new Date().toISOString().split('T')[0]
          });
          setSelectedPatient(null);
          setSearchTerm('');
          
          router.push('/Page/consultation/ajout');
          router.refresh();
        }
      });

    } catch (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      toast.error('Erreur lors de la création de la consultation', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsSubmittingConsultation(false);
    }

  };
  // Réinitialiser la recherche
  const resetSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedPatient(null);
    setShowAddForm(false);
  };

  const handleConsultationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConsultationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add this effect to fetch treatments
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await consultService.getTreatments();
        setTreatments(response);
      } catch (error) {
        console.error('Error fetching treatments:', error);
      }
    };
    fetchTreatments();
  }, []);

  // Add handler for treatment selection
  const handleTreatmentSelection = (treatmentId: number) => {
    setSelectedTreatments(prev => {
      if (prev.includes(treatmentId)) {
        return prev.filter(id => id !== treatmentId);
      }
      return [...prev, treatmentId];
    });
  };

  // Add this effect to fetch stocks
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await consultService.getProducts();
        const stockItems = response.map(product => ({
          ...product,
          prix: product.prix.toString(),
          quantite_carton: 0,
          quantite_total: product.quantite || 0
        }));
        setStocks(stockItems);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };
    fetchStocks();
  }, []);

  // Add handler for product selection
  const handleProductSelection = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Calculer le total des traitements
  const calculateTotal = () => {
    const treatmentsTotal = treatments
      .filter(t => selectedTreatments.includes(t.id))
      .reduce((sum, t) => {
        if (selectedPatient?.numerodossierprisenchage && t.prixprisenchager) {
          return sum + t.prixprisenchager;
        }
        return sum + parseFloat(t.prix);
      }, 0);

    const productsTotal = stocks
      .filter(s => selectedProducts.includes(s.id))
      .reduce((sum, s) => sum + parseFloat(s.prix), 0);

    return treatmentsTotal + productsTotal;
  };

// ⚙️ Assure-toi que ton logo est au format Base64
// Exemple : const logoBase64 = 'data:image/png;base64,...'

const handleDownloadConsultationPDF = () => {
  if (!lastConsultation) return;

  const doc = new jsPDF();

  // Logo
  const logoBase64 = 'data:image/webp;base64,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';
  doc.addImage(logoBase64, 'PNG', 10, 10, 40, 20);

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Fiche Consultation', 105, 20, { align: 'center' });
  doc.setDrawColor(0);
  doc.line(10, 35, 200, 35);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Data extraction
  const patient =
    lastConsultation.patient ||
    lastConsultation.consultation?.patient ||
    lastConsultation.consultation?.patient_id ||
    {};
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const docteur = lastConsultation.docteur || lastConsultation.consultation?.docteur || currentUser || {};

  const prenom = patient.prenom || '';
  const nom = patient.name || '';
  const dateConsult =
    lastConsultation.date_consultation ||
    lastConsultation.consultation?.date_consultation ||
    '';
  const nbSeances =
    lastConsultation.nb_seances ||
    lastConsultation.consultation?.nb_seances ||
    '';
  const observation =
    lastConsultation.observation ||
    lastConsultation.consultation?.observation ||
    '';
  const temperature =
    lastConsultation.temperature ||
    lastConsultation.consultation?.temperature ||
    '';
  const tension =
    lastConsultation.tension ||
    lastConsultation.consultation?.tension ||
    '';

  // Patient + Doctor info table
  autoTable(doc, {
    startY: 42,
    head: [['Champ', 'Valeur']],
    body: [
      ['Docteur', `Dr. ${(docteur?.prenom || '')} ${(docteur?.name || '')}`.trim()],
      ['Spécialité', `${docteur?.specialité || ''}`],
      ['Patient', `${prenom} ${nom}`.trim()],
      ['Date consultation', `${dateConsult}`],
      ['Nombre de séances', `${nbSeances}`],
      ['Température', `${temperature}`],
      ['Tension', `${tension}`],
    ],
    styles: { font: 'helvetica', fontSize: 11 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'striped',
    margin: { left: 10, right: 10 },
  });

  let y = (doc as any).lastAutoTable.finalY + 6 || 48;

  // Observation block
  autoTable(doc, {
    startY: y,
    head: [['Observation']],
    body: [[observation || '']],
    styles: { cellWidth: 'wrap' },
    columnStyles: { 0: { cellWidth: 190 } },
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    theme: 'grid',
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Antécédents table
  const antecedents =
    lastConsultation.antecedents ||
    lastConsultation.consultation?.antecedents ||
    [];
  if (antecedents && antecedents.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Titre', 'Description']],
      body: antecedents.map((a: any) => [a.titre || '', a.description || '']),
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      theme: 'striped',
      margin: { left: 10, right: 10 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Traitements table
  const traitements =
    lastConsultation.traitements ||
    lastConsultation.consultation?.traitements ||
    [];
  if (traitements && traitements.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Traitement', 'Prix']],
      body: traitements.map((t: any) => [
        t.nom || t.titre || '',
        (t.prixprisenchager != null && (patient?.numerodossierprisenchage))
          ? `${Number(t.prixprisenchager).toFixed(2)} Ar`
          : `${Number(t.prix).toFixed(2)} Ar`
      ]),
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      theme: 'striped',
      margin: { left: 10, right: 10 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Produits table
  const produits =
    lastConsultation.produits ||
    lastConsultation.consultation?.produits ||
    [];
  if (produits && produits.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Médicament', 'Prix']],
      body: produits.map((p: any) => [p.nom || '', `${Number(p.prix || 0).toFixed(2)} Ar`]),
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      theme: 'striped',
      margin: { left: 10, right: 10 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Footer
  doc.setFontSize(10);
  doc.text(`Document généré le ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
  doc.save(`Fiche_Consultation_${prenom}_${nom}.pdf`);
};


 const handleDownloadFacturePDF = () => {
  if (!lastConsultation) return;

  const doc = new jsPDF();

  // Logo
  const logoBase64 = 'data:image/webp;base64,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';
  doc.addImage(logoBase64, 'PNG', 10, 10, 40, 20);

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Facture de Paiement', 105, 20, { align: 'center' });
  doc.setDrawColor(0);
  doc.line(10, 35, 200, 35);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Data extraction
  const patient =
    lastConsultation.patient ||
    lastConsultation.consultation?.patient ||
    lastConsultation.consultation?.patient_id ||
    {};
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const docteur = lastConsultation.docteur || lastConsultation.consultation?.docteur || currentUser || {};

  const prenom = patient.prenom || '';
  const nom = patient.name || '';
  const dateConsult =
    lastConsultation.date_consultation ||
    lastConsultation.consultation?.date_consultation ||
    '';

  // Header info table
  autoTable(doc, {
    startY: 42,
    head: [['Champ', 'Valeur']],
    body: [
      ['Docteur', `Dr. ${(docteur?.prenom || '')} ${(docteur?.name || '')}`.trim()],
      ['Spécialité', `${docteur?.specialité || ''}`],
      ['Patient', `${prenom} ${nom}`.trim()],
      ['Date consultation', `${dateConsult}`],
    ],
    styles: { font: 'helvetica', fontSize: 11 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'striped',
    margin: { left: 10, right: 10 },
  });

  let y = (doc as any).lastAutoTable.finalY + 8;

  // Paiements table
  const paiements =
    lastConsultation.paiements ||
    lastConsultation.consultation?.paiements ||
    [];

  if (paiements && paiements.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Type', 'Montant (Ar)', 'Date']],
      body: paiements.map((p: any) => [
        p.type || '',
        `${Number(p.montant || 0).toFixed(2)}`,
        p.date_paiement || p.date || ''
      ]),
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      theme: 'striped',
      margin: { left: 10, right: 10 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    autoTable(doc, {
      startY: y,
      body: [['Aucun paiement enregistré.']],
      styles: { halign: 'left' },
      theme: 'plain',
      margin: { left: 10, right: 10 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Totals table
  const computedTotal =
    lastConsultation.total ||
    lastConsultation.consultation?.total ||
    0;
  const totalPaid = Array.isArray(paiements)
    ? paiements.reduce((s: number, p: any) => s + Number(p.montant || 0), 0)
    : 0;
  const remaining = Number(computedTotal) - Number(totalPaid);

  autoTable(doc, {
    startY: y,
    head: [['Intitulé', 'Montant (Ar)']],
    body: [
      ['Total', `${Number(computedTotal || 0).toFixed(2)}`],
      ['Payé', `${Number(totalPaid).toFixed(2)}`],
      ['Reste', `${Number(remaining).toFixed(2)}`],
    ],
    styles: { font: 'helvetica', fontSize: 12 },
    headStyles: { fillColor: [234, 88, 12], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } },
    theme: 'grid',
    margin: { left: 10, right: 10 },
  });

  // Footer
  doc.setFontSize(10);
  doc.text(`Document généré le ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
  doc.save(`Facture_${prenom}_${nom}.pdf`);
};


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="max-w- mx-auto">
        
          <h1 className="text-2xl font-bold text-gray-700 mb-6">
            Nouvelle Consultation
          </h1>

          {/* Recherche de patient */}
          <div className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  name="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un patient (nom, prénom, téléphone, email...)"
                  label="Recherche Patient"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={resetSearch}
                  className="mb-4"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* Indicateur de recherche */}
            {isSearching && (
              <div className="text-blue-600 text-sm">
                Recherche en cours...
              </div>
            )}
          </div>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Patients trouvés ({searchResults.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectPatient(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {patient.prenom} {patient.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {patient.email} • {patient.numeroTelephone}
                        </p>
                        {patient.date_naissance && (
                          <p className="text-sm text-gray-500">
                            Né(e) le: {new Date(patient.date_naissance).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Sélectionner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient sélectionné */}
          {selectedPatient && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Patient sélectionné
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p><strong>Nom:</strong> {selectedPatient.prenom} {selectedPatient.name}</p>
                  <p><strong>Email:</strong> {selectedPatient.email}</p>
                  <p><strong>Téléphone:</strong> {selectedPatient.numeroTelephone}</p>
                  {selectedPatient.date_naissance && (
                    <p><strong>Date de naissance:</strong> {new Date(selectedPatient.date_naissance).toLocaleDateString()}</p>
                  )}
                </div>
                <div>
                  {selectedPatient.adresse && (
                    <p><strong>Adresse:</strong> {selectedPatient.adresse}</p>
                  )}
                  {selectedPatient.emploi && (
                    <p><strong>Emploi:</strong> {selectedPatient.emploi}</p>
                  )}
                  {selectedPatient.organisme && (
                    <p><strong>Organisme:</strong> {selectedPatient.organisme}</p>
                  )}
                  {selectedPatient.numerodossierprisenchage && (
                    <p><strong>N° Dossier:</strong> {selectedPatient.numerodossierprisenchage}</p>
                  )}
                </div>
              </div>

              {/* Antécédents avec vérification null */}
              {selectedPatient.antecedents && selectedPatient.antecedents.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Antécédents:</h4>
                  <div className="space-y-2">
                    {selectedPatient.antecedents.map((antecedent) => (
                      <div key={antecedent.id} className="p-2 bg-white rounded border text-gray-700">
                        <p className="font-medium">{antecedent.titre}</p>
                        {antecedent.description && (
                          <p className="text-sm text-gray-600">{antecedent.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulaire d'ajout de nouveau patient */}
          {showAddForm && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Ajouter un nouveau patient
              </h3>

              <form onSubmit={createPatient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="name"
                    value={newPatient.name}
                    onChange={handleNewPatientChange}
                    label="Nom"
                    required
                  />
                  <Input
                    type="text"
                    name="prenom"
                    value={newPatient.prenom}
                    onChange={handleNewPatientChange}
                    label="Prénom"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    name="email"
                    value={newPatient.email}
                    onChange={handleNewPatientChange}
                    label="Email"
                    required
                  />
                  <Input
                    type="tel"
                    name="numeroTelephone"
                    value={newPatient.numeroTelephone}
                    onChange={handleNewPatientChange}
                    label="Numéro de téléphone"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    name="date_naissance"
                    value={newPatient.date_naissance}
                    onChange={handleNewPatientChange}
                    label="Date de naissance"
                  />
                  <Input
                    type="text"
                    name="emploi"
                    value={newPatient.emploi}
                    onChange={handleNewPatientChange}
                    label="Emploi"
                  />
                </div>

                <Input
                  type="textarea"
                  name="adresse"
                  value={newPatient.adresse}
                  onChange={handleNewPatientChange}
                  label="Adresse"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="specialité"
                    value={newPatient.specialité}
                    onChange={handleNewPatientChange}
                    label="Spécialité"
                  />
                  <Input
                    type="text"
                    name="organisme"
                    value={newPatient.organisme}
                    onChange={handleNewPatientChange}
                    label="Organisme"
                  />
                </div>

                <Input
                  type="text"
                  name="numerodossierprisenchage"
                  value={newPatient.numerodossierprisenchage}
                  onChange={handleNewPatientChange}
                  label="Numéro de dossier prise en charge"
                />

                {/* Section Antécédents */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Antécédents médicaux</h4>
                  
                  {/* Formulaire d'ajout d'antécédent */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Input
                      type="text"
                      name="titre"
                      value={newAntecedent.titre}
                      onChange={(e) => setNewAntecedent(prev => ({
                        ...prev,
                        titre: e.target.value
                      }))}
                      label="Titre de l'antécédent"
                      placeholder="Ex: Hypertension, Diabète..."
                    />
                    <Input
                      type="text"
                      name="description"
                      value={newAntecedent.description}
                      onChange={(e) => setNewAntecedent(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      label="Description"
                      placeholder="Description optionnelle"
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addAntecedent}
                        className="mb-4"
                        disabled={!newAntecedent.titre.trim()}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Liste des antécédents ajoutés */}
                  {newPatient.antecedents.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h5 className="text-sm font-medium text-gray-600">
                        Antécédents ajoutés:
                      </h5>
                      {newPatient.antecedents.map((antecedent, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {antecedent.titre}
                            </p>
                            {antecedent.description && (
                              <p className="text-sm text-gray-600">
                                {antecedent.description}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeAntecedent(index)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>



                {/* Boutons d'action */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isCreating}
                    disabled={!newPatient.name || !newPatient.prenom || !newPatient.email || !newPatient.numeroTelephone}
                  >
                    {isCreating ? 'Création en cours...' : 'Créer le patient'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewPatient({
                        name: '',
                        prenom: '',
                        email: '',
                        numeroTelephone: '',
                        date_naissance: '',
                        adresse: '',
                        specialité: '',
                        emploi: '',
                        organisme: '',
                        numerodossierprisenchage: '',
                        antecedents: [],
                        etatGeneral: '',
                        observations: ''
                      });
                      setNewAntecedent({ titre: '', description: '' });
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Message si aucun résultat et pas de formulaire d'ajout */}
          {searchTerm && !isSearching && searchResults.length === 0 && !showAddForm && !selectedPatient && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Aucun patient trouvé pour "{searchTerm}"
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setShowAddForm(true);
                  setNewPatient(prev => ({
                    ...prev,
                    name: searchTerm
                  }));
                }}
              >
                Créer un nouveau patient
              </Button>
            </div>
          )}

          {/* Instructions initiales */}
          {!searchTerm && !selectedPatient && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">
                Commencez par rechercher un patient
              </div>
              <div className="text-sm">
                Tapez le nom, prénom, email ou numéro de téléphone du patient
              </div>
            </div>
          )}
                        {/* Section État Général et Observations */}
                <div className="pt-4 mt-6 bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Informations Consultation</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Date de consultation
                        </label>
                        <input
                          type="date"
                          name="date_consultation"
                          value={consultationForm.date_consultation}
                          onChange={(e) => setConsultationForm(prev => ({
                            ...prev,
                            date_consultation: e.target.value
                          }))}
                          className="mt-1 block w-full rounded-md border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Nombre de séances
                        </label>
                        <input
                          type="number"
                          name="nb_seances"
                          min="1"
                          value={consultationForm.nb_seances}
                          onChange={handleConsultationChange}
                          className="mt-1 block w-full rounded-md border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tension artérielle
                        </label>
                        <input
                          type="text"
                          name="tension"
                          placeholder="Ex: 120/80"
                          value={consultationForm.tension}
                          onChange={(e) => setConsultationForm(prev => ({
                            ...prev,
                            tension: e.target.value
                          }))}
                          className="mt-1 block w-full rounded-md border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Température (°C)
                      </label>
                      <input
                        type="number"
                        name="temperature"
                        step="0.1"
                        min="35"
                        max="42"
                        value={consultationForm.temperature}
                        onChange={handleConsultationChange}
                        className="text-gray-700 mt-1 block w-full rounded-md border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Observations
                      </label>
                      <textarea
                        name="observation"
                        value={consultationForm.observation}
                        onChange={(e) => setConsultationForm(prev => ({
                          ...prev,
                          observation: e.target.value
                        }))}
                        placeholder="Notez vos observations..."
                        rows={4}
                        className="text-gray-700 mt-1 block w-full rounded-md border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-2 resize-none"
                      />
                    </div>
                  </div>
                </div>

        {/* Section suivante - Formulaire de consultation (à développer) */}
        {selectedPatient && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Informations de consultation
            </h2>
            <div className="text-gray-600">
              {/* Ici vous pouvez ajouter le formulaire de consultation */}
              <p>Formulaire de consultation à développer...</p>
              <p className="text-sm mt-2">
                Patient sélectionné: {selectedPatient.prenom} {selectedPatient.name}
              </p>
            </div>
          </div>
        )}

        {/* Add this after the Observations textarea in the consultation form */}
        <div className="space-y-4 mt-6">
          <h2 className="text-2xl font-medium text-gray-700">Traitements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            {treatments.map(treatment => (
              <div 
                key={treatment.id}
                className={`p-4 rounded-lg border-2 ${
                  selectedTreatments.includes(treatment.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                } cursor-pointer hover:border-blue-300`}
                onClick={() => handleTreatmentSelection(treatment.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-800">{treatment.nom}</h5>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-600">
                        Prix: {parseFloat(treatment.prix).toFixed(2)} Ar
                      </p>
                      {treatment.prixprisenchager !== null && selectedPatient?.numerodossierprisenchage && (
                        <p className="text-sm text-green-600">
                          Prix avec prise en charge: {treatment.prixprisenchager.toFixed(2)} Ar
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {treatment.services.map(service => (
                        <span 
                          key={service.id}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs rounded"
                        >
                          {service.icone} {service.nom}
                        </span>
                      ))}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTreatments.includes(treatment.id)}
                    onChange={() => handleTreatmentSelection(treatment.id)}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Médicaments */}
        <div className="space-y-4 mt-6">
          <h2 className="text-2xl font-medium text-gray-700">Médicaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stocks.map(stock => (
              <div 
                key={stock.id}
                className={`p-4 rounded-lg border-2 ${
                  selectedProducts.includes(stock.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                } cursor-pointer hover:border-blue-300`}
                onClick={() => handleProductSelection(stock.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-800">{stock.nom}</h5>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-600">
                        Prix unitaire: {parseFloat(stock.prix).toFixed(2)} Ar
                      </p>
                      <p className="text-sm text-gray-600">
                        Stock disponible: {stock.quantite_total} unités
                      </p>
                      {stock.quantite_carton > 0 && (
                        <p className="text-sm text-gray-600">
                          Cartons: {stock.quantite_carton}
                        </p>
                      )}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(stock.id)}
                    onChange={() => handleProductSelection(stock.id)}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Paiement */}
        <div className="space-y-4 mt-6">
          <h2 className="text-2xl font-medium text-gray-700">Mode de Paiement</h2>
          <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
            <div className="mb-4">
              <p className="text-lg font-medium text-gray-800">
                Total à payer: {calculateTotal().toFixed(2)} Ar
              </p>
            </div>

            {selectedPatient?.numerodossierprisenchage ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">
                  Patient avec prise en charge - N° Dossier: {selectedPatient.numerodossierprisenchage}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Le paiement sera traité automatiquement via la prise en charge
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Type de paiement
                    </label>
                    <select
                      name="type"
                      value={paymentForm.type}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        type: e.target.value as PaymentForm['type']
                      }))}
                      className="mt-1 block w-full rounded-md border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-2"
                    >
                      <option value="espece">Espèces</option>
                      <option value="mobilemoney">Mobile Money</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Montant
                    </label>
                    <input
                      type="number"
                      name="montant"
                      value={paymentForm.montant}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        montant: e.target.value
                      }))}
                      placeholder="Montant à payer"
                      className="mt-1 block w-full rounded-md border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Date de paiement
                    </label>
                    <input
                      type="date"
                      name="date_paiement"
                      value={paymentForm.date_paiement}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        date_paiement: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-2"
                    />
                  </div>
                </div>

                {paymentForm.montant && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-blue-700">
                        Reste à payer: {(calculateTotal() - parseFloat(paymentForm.montant)).toFixed(2)} Ar
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Button to submit consultation */}
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmitConsultation}
            isLoading={isSubmittingConsultation}
            disabled={
              !selectedPatient || 
              !consultationForm.date_consultation || 
              !consultationForm.nb_seances ||
              selectedTreatments.length === 0 ||
              (!selectedPatient.numerodossierprisenchage && !paymentForm.montant)
            }
          >
            {isSubmittingConsultation ? 'Création en cours...' : 'Créer la consultation'}
          </Button>
        </div>

        {/* Bouton unique de téléchargement PDF après création consultation */}
        {lastConsultation && (
          <div className="relative flex gap-4 mt-6 text-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPdfMenu(true)}
            >
              Télécharger PDF
            </Button>
            {showPdfMenu && (
              <div className="fixed inset-0 bg-black/25 z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
                  {/* Petit X en haut à droite */}
                  <button
                    onClick={() => setShowPdfMenu(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
                    aria-label="Fermer"
                    type="button"
                    style={{ lineHeight: 1 }}
                  >
                    &times;
                  </button>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Choisissez le type de PDF à télécharger</h3>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          handleDownloadConsultationPDF();
                          setShowPdfMenu(false);
                        }}
                        className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center space-x-2"
                      >
                        <span>Fiche consultation</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDownloadFacturePDF();
                          setShowPdfMenu(false);
                        }}
                        className="cursor-pointer px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center space-x-2"
                      >
                        <span>Facture</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationAjoutPage;
