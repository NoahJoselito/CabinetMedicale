"use client";
import { useEffect, useState, use } from "react";
import { Folder, ArrowLeft, User, FileText, Stethoscope, Camera, Upload, X, Calendar, Image as ImageIcon, ZoomIn } from "lucide-react";
import Link from "next/link";
import { dossierService, PatientDetail } from "@/services/dossierService";
import { medicalPhotoService, MedicalPhoto } from "@/services/medicalPhotoService";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center space-y-6">
      {/* Spinner animation */}
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <div className="w-full h-full border-4 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img src="/img/laod.png" alt="Loading" className="w-16 h-16 rounded-full" />
        </div>
      </div>
      
      {/* Pulse effect for text */}
      <div className="space-y-3 text-center">
        <h3 className="text-xl font-semibold text-gray-800 animate-pulse">
          Chargement du dossier...
        </h3>
        <p className="text-gray-500">
          Veuillez patienter pendant le chargement des données
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-loading-progress"></div>
      </div>
    </div>
  </div>
);

const DossierPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [photos, setPhotos] = useState<MedicalPhoto[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState("");
  const [photoDescription, setPhotoDescription] = useState("");
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPhoto, setSelectedPhoto] = useState<MedicalPhoto | null>(null);

  useEffect(() => {
    // Récupérer l'utilisateur connecté pour fallback docteur
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(user);
    } catch (_) {
      setCurrentUser(null);
    }

    const fetchPatientDetails = async () => {
      try {
        const data = await dossierService.getPatientDetails(resolvedParams.id);
        setPatient(data);
        
        // Charger les photos du patient
        const patientPhotos = await medicalPhotoService.getPatientPhotos(data.patient.id);
        setPhotos(patientPhotos);
      } catch (err) {
        setError('Erreur lors du chargement des données du patient');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [resolvedParams.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!patient?.patient) return <div>Patient non trouvé</div>;

  const patientData = patient.patient;
  const formatDateString = (input: string): string => {
    if (!input) return 'Non renseigné';
    const isoMatch = /^\d{4}-\d{2}-\d{2}/.test(input);
    if (isoMatch) return input.slice(0, 10);
    const parsed = new Date(input);
    if (isNaN(parsed.getTime())) return input;
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const photoTypes = [
    "Radiographie",
    "Échographie", 
    "Scanner",
    "IRM",
    "Photo clinique",
    "Photo de blessure",
    "Photo de cicatrice",
    "Autre"
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !photoType || !patient) return;

    setUploading(true);
    try {
      const uploadData = {
        patient_id: patient.patient.id,
        photo_type: photoType,
        photo: selectedFile,
        description: photoDescription,
        upload_date: uploadDate
      };

      const newPhoto = await medicalPhotoService.uploadPhoto(uploadData);
      setPhotos(prev => [newPhoto, ...prev]);
      
      // Reset form
      setSelectedFile(null);
      setPhotoType("");
      setPhotoDescription("");
      setUploadDate(new Date().toISOString().split('T')[0]);
      setShowUploadForm(false);
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      try {
        await medicalPhotoService.deletePhoto(photoId);
        setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de la photo');
      }
    }
  };

  const handlePhotoClick = (photo: MedicalPhoto) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  // Déterminer le médecin traitant (du dossier):
  // 1) docteur de la consultation la plus récente s'il existe
  // 2) sinon utilisateur connecté comme fallback
  const treatingDoctor = (() => {
    const consultations = patient?.patient?.consultations || [];
    const sorted = Array.isArray(consultations)
      ? [...consultations].sort((a: any, b: any) => new Date(b.date_consultation).getTime() - new Date(a.date_consultation).getTime())
      : [];
    const fromConsult = sorted.find((c: any) => !!c?.docteur)?.docteur;
    return fromConsult || currentUser || null;
  })();

  return (
    <div className="p-6  from-gray-50 to-gray-100 min-h-screen">
      {/* Back button */}
      <Link href="/Page/dossier" 
            className="inline-flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour à la liste
      </Link>

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center space-x-4 p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="p-3 bg-white rounded-full shadow-md">
            <Folder className="w-12 h-12 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {`${patientData.name} ${patientData.prenom}`}
            </h1>
            <p className="text-gray-500">Dossier médical</p>
            {treatingDoctor && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Médecin traitant :</span> Dr. {treatingDoctor?.prenom || ''} {treatingDoctor?.name || ''}
                {treatingDoctor?.specialité && (
                  <span className="text-gray-500"> - {treatingDoctor.specialité}</span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold flex items-center text-gray-800">
                <User className="w-6 h-6 mr-3 text-blue-500" /> 
                Informations personnelles
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4">
                {[
                  { label: "Email", value: patientData.email },
                  { label: "Téléphone", value: patientData.numeroTelephone },
                  { label: "Date de naissance", value: patientData.date_naissance ? formatDateString(patientData.date_naissance as unknown as string) : 'Non renseigné' },
                  { label: "Adresse", value: patientData.adresse || 'Non renseignée' },
                  { label: "Emploi", value: patientData.emploi || 'Non renseigné' }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="font-medium text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold flex items-center text-gray-800">
                <FileText className="w-6 h-6 mr-3 text-blue-500" /> 
                Antécédents médicaux
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {patientData.antecedents?.map((antecedent) => (
                  <div key={antecedent.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-600">{antecedent.titre}</h3>
                    <p className="text-gray-600 mt-1">{antecedent.description || 'Aucune description'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Medical Photos Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-800">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <Camera className="w-6 h-6 mr-3 text-blue-500" /> 
              Photos médicales
            </h2>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Ajouter une photo
            </button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de photo *
                  </label>
                  <select
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value)}
                    className="cursor-pointer w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un type</option>
                    {photoTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'upload
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                    placeholder="Description de la photo..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner une photo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {selectedFile ? (
                        <div className="space-y-2">
                          <ImageIcon className="w-12 h-12 mx-auto text-blue-500" />
                          <p className="text-sm text-gray-600">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Cliquez pour sélectionner une image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG jusqu'à 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 flex space-x-3">
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !photoType || uploading}
                    className="cursor-pointer flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? 'Upload en cours...' : 'Uploader la photo'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadForm(false);
                      setSelectedFile(null);
                      setPhotoType("");
                      setPhotoDescription("");
                      setUploadDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="cursor-pointer px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Photos Grid */}
          <div className="p-6">
            {!Array.isArray(photos) || photos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Aucune photo médicale disponible</p>
                <p className="text-sm">Ajoutez la première photo en cliquant sur "Ajouter une photo"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative group">
                      <img
                        src={photo.photo_path}
                        alt={`Photo médicale - ${photo.photo_type}`}
                        className="w-full h-48 object-cover cursor-pointer transition-transform group-hover:scale-105"
                        onClick={() => handlePhotoClick(photo)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/img/placeholder-medical.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-blue-600 mb-2">{photo.photo_type}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(photo.upload_date).toLocaleDateString('fr-FR')}
                      </p>
                      {photo.description && (
                        <p className="text-sm text-gray-500">{photo.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Consultations */}
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-800">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <Stethoscope className="w-6 h-6 mr-3 text-blue-500" /> 
              Historique des consultations
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {patientData.consultations?.map((consultation) => (
                <div key={consultation.id} 
                     className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600">
                        Consultation du {new Date(consultation.date_consultation).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      {(() => {
                        const doc = consultation.docteur || treatingDoctor;
                        return doc ? (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Docteur :</span> Dr. {doc.prenom || ''} {doc.name || ''}
                            {doc.specialité && (
                              <span className="text-gray-500"> - {doc.specialité}</span>
                            )}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      { label: "Température", value: `${consultation.temperature}°C`, color: "blue" },
                      { label: "Tension", value: consultation.tension, color: "blue" },
                      { label: "Séances", value: consultation.nb_seances, color: "blue" },
                    ].map((item, index) => (
                      <div key={index} className={`bg-${item.color}-50 p-4 rounded-lg`}>
                        <p className={`text-sm text-${item.color}-600 mb-1`}>{item.label}</p>
                        <p className="font-semibold text-lg">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-2"><span className="font-semibold">Observation:</span> {consultation.observation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedPhoto.photo_type}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedPhoto.upload_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors "
              >
                <X className="w-6 h-6 cursor-pointer" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedPhoto.photo_path}
                alt={`Photo médicale - ${selectedPhoto.photo_type}`}
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/img/placeholder-medical.svg';
                }}
              />
              {selectedPhoto.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Description :</h4>
                  <p className="text-gray-600">{selectedPhoto.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DossierPage;
