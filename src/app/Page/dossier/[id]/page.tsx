"use client";
import { useEffect, useState, use } from "react";
import { Folder, ArrowLeft, User, FileText, Stethoscope } from "lucide-react";
import Link from "next/link";

const dossiers = [
  { 
    id: "0043", 
    name: "ANDRIAMANANA Nadia Holihainitra", 
    matricule: "0043",
    age: 32,
    sexe: "Féminin",
    dateNaissance: "12 Mars 1992",
    groupeSanguin: "O+",
    antecedents: "Hypertension, Allergie aux antibiotiques",
    consultations: [
      { date: "15/02/2024", motif: "Fièvre persistante", traitement: "Paracétamol 500mg" },
      { date: "10/01/2024", motif: "Douleurs abdominales", traitement: "Antispasmodique" },
    ],
  },
  { 
    id: "0038", 
    name: "BARTHELEMY Raffaello Laurenz", 
    matricule: "0038",
    age: 40,
    sexe: "Masculin",
    dateNaissance: "8 Juillet 1984",
    groupeSanguin: "A-",
    antecedents: "Diabète de type 2",
    consultations: [
      { date: "05/03/2024", motif: "Contrôle diabète", traitement: "Insuline" },
    ],
  },
];

const DossierPage = ({ params }: { params: Promise<{ id: string }> }) => {
    // Récupérer params avec use()
    const { id } = use(params);
  
    const [dossier, setDossier] = useState<{
        id: string;
        name: string;
        matricule: string;
        age: number;
        sexe: string;
        dateNaissance: string;
        groupeSanguin: string;
        antecedents: string;
        consultations: { date: string; motif: string; traitement: string }[];
    } | null>(null);
  
    useEffect(() => {
      const foundDossier = dossiers.find((d) => d.id === id) || null;
      setDossier(foundDossier);
    }, [id]);  

    if (!dossier) {
      return (
            <div className="h-screen flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-red-500">Dossier introuvable</h2>
            <Link href="/Page/dossier">
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">Retour</button>
            </Link>
            </div>

      );
    }

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Bouton retour */}
        <Link href="/Page/dossier" className="flex items-center text-blue-500 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à la liste
        </Link>

        {/* Carte du dossier */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Folder className="w-12 h-12 text-gray-500" />
            <h1 className="text-2xl font-bold text-gray-800">{dossier.name}</h1>
          </div>

          {/* Informations du patient */}
          <div className="bg-gray-50 p-4 rounded-md shadow">
            <h2 className="text-lg font-semibold flex items-center text-gray-700">
              <User className="w-5 h-5 mr-2 text-blue-500" /> Informations personnelles
            </h2>
            <table className="mt-2 w-full text-left border-collapse text-gray-500">
              <tbody>
                <tr>
                  <td className="font-semibold">Matricule :</td>
                  <td>{dossier.matricule}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Âge :</td>
                  <td>{dossier.age} ans</td>
                </tr>
                <tr>
                  <td className="font-semibold">Sexe :</td>
                  <td>{dossier.sexe}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Date de naissance :</td>
                  <td>{dossier.dateNaissance}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Groupe sanguin :</td>
                  <td>{dossier.groupeSanguin}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Antécédents médicaux */}
          <div className="bg-gray-50 p-4 mt-4 rounded-md shadow">
            <h2 className="text-lg font-semibold flex items-center text-gray-700">
              <FileText className="w-5 h-5 mr-2 text-blue-500" /> Antécédents médicaux
            </h2>
            <p className="mt-2 text-gray-700 ">{dossier.antecedents}</p>
          </div>

          {/* Historique des consultations */}
          <div className="bg-gray-50 p-4 mt-4 rounded-md shadow">
            <h2 className="text-lg font-semibold flex items-center text-gray-500">
              <Stethoscope className="w-5 h-5 mr-2 text-blue-500" /> Historique des consultations
            </h2>
            <table className="mt-2 w-full text-left border-collapse text-gray-500">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Date</th>
                  <th className="p-2">Motif</th>
                  <th className="p-2">Traitement</th>
                </tr>
              </thead>
              <tbody>
                {dossier.consultations.map((consult, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{consult.date}</td>
                    <td className="p-2">{consult.motif}</td>
                    <td className="p-2">{consult.traitement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    );
};

export default DossierPage;
