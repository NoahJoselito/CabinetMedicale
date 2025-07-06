'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { consultService, Patient, Treatment } from '@/services/consultService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

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

        total: (total: any) => total
      };

      const createdConsultation = await consultService.createConsultation(consultationData);
      setLastConsultation(createdConsultation); // Stocker la consultation pour impression
      
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

  // Fonction pour générer le PDF de la fiche consultation (hors paiement)
  const handleDownloadConsultationPDF = () => {
    if (!lastConsultation) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Fiche Consultation', 10, 15);
    doc.setFontSize(12);

    // Sécurisation de l'accès aux données patient
    const patient =
      lastConsultation.patient ||
      lastConsultation.consultation?.patient ||
      lastConsultation.consultation?.patient_id ||
      {};

    const prenom = patient.prenom || '';
    const nom = patient.name || '';
    const dateConsult = lastConsultation.date_consultation || lastConsultation.consultation?.date_consultation || '';
    const nbSeances = lastConsultation.nb_seances || lastConsultation.consultation?.nb_seances || '';
    const observation = lastConsultation.observation || lastConsultation.consultation?.observation || '';
    const temperature = lastConsultation.temperature || lastConsultation.consultation?.temperature || '';
    const tension = lastConsultation.tension || lastConsultation.consultation?.tension || '';

    doc.text(`Patient: ${prenom} ${nom}`, 10, 30);
    doc.text(`Date consultation: ${dateConsult}`, 10, 40);
    doc.text(`Nombre de séances: ${nbSeances}`, 10, 50);
    doc.text(`Observation: ${observation}`, 10, 60);
    doc.text(`Température: ${temperature}`, 10, 70);
    doc.text(`Tension: ${tension}`, 10, 80);

    // Antécédents
    let y = 90;
    const antecedents =
      lastConsultation.antecedents ||
      lastConsultation.consultation?.antecedents ||
      [];
    if (antecedents && antecedents.length > 0) {
      doc.text('Antécédents:', 10, y);
      y += 8;
      antecedents.forEach((ant: any) => {
        doc.text(`- ${ant.titre}${ant.description ? ' : ' + ant.description : ''}`, 12, y);
        y += 8;
      });
    }
    // Traitements
    const traitements =
      lastConsultation.traitements ||
      lastConsultation.consultation?.traitements ||
      [];
    if (traitements && traitements.length > 0) {
      doc.text('Traitements:', 10, y);
      y += 8;
      traitements.forEach((t: any) => {
        doc.text(`- ${t.nom || t.titre || ''}`, 12, y);
        y += 8;
      });
    }
    // Produits
    const produits =
      lastConsultation.produits ||
      lastConsultation.consultation?.produits ||
      [];
    if (produits && produits.length > 0) {
      doc.text('Médicaments:', 10, y);
      y += 8;
      produits.forEach((p: any) => {
        doc.text(`- ${p.nom || ''}`, 12, y);
        y += 8;
      });
    }
    doc.save('fiche_consultation.pdf');
  };

  // Fonction pour générer le PDF de la facture de paiement
  const handleDownloadFacturePDF = () => {
    if (!lastConsultation) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Facture de Paiement', 10, 15);
    doc.setFontSize(12);

    // Sécurisation de l'accès aux données patient
    const patient =
      lastConsultation.patient ||
      lastConsultation.consultation?.patient ||
      lastConsultation.consultation?.patient_id ||
      {};

    const prenom = patient.prenom || '';
    const nom = patient.name || '';
    const dateConsult = lastConsultation.date_consultation || lastConsultation.consultation?.date_consultation || '';

    doc.text(`Patient: ${prenom} ${nom}`, 10, 30);
    doc.text(`Date consultation: ${dateConsult}`, 10, 40);

    // Paiements
    let y = 50;
    const paiements =
      lastConsultation.paiements ||
      lastConsultation.consultation?.paiements ||
      [];
    if (paiements && paiements.length > 0) {
      doc.text('Paiements:', 10, y);
      y += 8;
      paiements.forEach((pay: any) => {
        doc.text(
          `- ${pay.type || ''} : ${pay.montant || ''} Ar le ${pay.date_paiement || pay.date || ''}`,
          12,
          y
        );
        y += 8;
      });
    } else {
      doc.text('Aucun paiement enregistré.', 10, y);
      y += 8;
    }
    const total =
      lastConsultation.total ||
      lastConsultation.consultation?.total ||
      '';
    doc.text(`Total: ${total} Ar`, 10, y + 8);
    doc.save('facture_consultation.pdf');
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
