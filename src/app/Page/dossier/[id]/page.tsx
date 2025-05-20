"use client";
import { useEffect, useState, use } from "react";
import { Folder, ArrowLeft, User, FileText, Stethoscope } from "lucide-react";
import Link from "next/link";
import { dossierService, PatientDetail } from "@/services/dossierService";

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

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const data = await dossierService.getPatientDetails(resolvedParams.id);
        setPatient(data);
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

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
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
                  { label: "Date de naissance", value: patientData.date_naissance || 'Non renseigné' },
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
                    <h3 className="text-lg font-semibold text-blue-600">
                      Consultation du {new Date(consultation.date_consultation).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>
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
    </div>
  );
};

export default DossierPage;
