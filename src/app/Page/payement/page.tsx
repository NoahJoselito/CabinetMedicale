"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFilter, FiSearch, FiCalendar } from 'react-icons/fi';

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
        Chargement du payement...
      </motion.div>
      <div className="mt-2 text-gray-600">Préparation de votre espace médical</div>
    </motion.div>
  </div>
);

export default function DossierMedical() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [employees, setEmployees] = useState([
    { id: 1, name: "Jean Dupont", role: "Médecin", month: "Janvier 2025", amount: 3500, paid: true, pdfUrl: "/fiches-paie/jan2023-dupont.pdf" },
    { id: 2, name: "Marie Martin", role: "Infirmière", month: "Janvier 2025", amount: 2200, paid: true, pdfUrl: "/fiches-paie/jan2023-martin.pdf" },
    { id: 3, name: "Pierre Durand", role: "Secrétaire", month: "Janvier 2025", amount: 1800, paid: true, pdfUrl: "/fiches-paie/jan2023-durand.pdf" },
    { id: 4, name: "Sophie Lefebvre", role: "Aide-soignante", month: "Janvier 2025", amount: 1900, paid: true, pdfUrl: "/fiches-paie/jan2023-lefebvre.pdf" },
    { id: 5, name: "Jean Dupont", role: "Médecin", month: "Février 2025", amount: 3500, paid: true, pdfUrl: "/fiches-paie/fev2023-dupont.pdf" },
    { id: 6, name: "Marie Martin", role: "Infirmière", month: "Février 2025", amount: 2200, paid: true, pdfUrl: "/fiches-paie/fev2023-martin.pdf" },
    { id: 7, name: "Pierre Durand", role: "Secrétaire", month: "Février 2025", amount: 1800, paid: true, pdfUrl: "/fiches-paie/fev2023-durand.pdf" },
    { id: 8, name: "Sophie Lefebvre", role: "Aide-soignante", month: "Février 2025", amount: 1900, paid: true, pdfUrl: "/fiches-paie/fev2023-lefebvre.pdf" },
  ]);

  const months = [...new Set(employees.map(emp => emp.month))];

  const handlePayment = (id: number) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, paid: true } : emp
    ));
  };
  // Fonction pour marquer tous les paiements comme payés
  const markAllAsPaid = () => {
    // Si un filtre est appliqué, ne marquer comme payés que les employés filtrés
    if (filterStatus !== 'all' || selectedMonth || searchTerm) {
      setEmployees(employees.map(emp => {
        // Vérifier si cet employé fait partie des résultats filtrés
        const isFiltered = filteredEmployees.some(filtered => filtered.id === emp.id);
        // Si oui et qu'il n'est pas déjà payé, le marquer comme payé
        return (isFiltered && !emp.paid) ? { ...emp, paid: true } : emp;
      }));
    } else {
      // Si aucun filtre, marquer tous les employés comme payés
      setEmployees(employees.map(emp => ({ ...emp, paid: true })));
    }
  };

  const downloadPayslip = (pdfUrl: string, employeeName: string, month: string) => {
    try {
      // Vérifier si nous sommes en environnement de développement
      if (process.env.NODE_ENV === 'development' || true) { // Force à utiliser jsPDF pour la démo
        // En développement, créer un PDF factice avec jsPDF
        import('jspdf').then(({ default: jsPDF }) => {
          const doc = new jsPDF();
          
          // Ajouter du contenu au PDF
          doc.setFontSize(22);
          doc.text('Fiche de paie', 105, 20, { align: 'center' });
          
          doc.setFontSize(16);
          doc.text(`Employé: ${employeeName}`, 20, 40);
          doc.text(`Mois: ${month}`, 20, 50);
          
          // Trouver les détails de l'employé
          const employeeData = employees.find(emp => 
            emp.name === employeeName && emp.month === month
          );
          
          if (employeeData) {
            doc.text(`Poste: ${employeeData.role}`, 20, 60);
            doc.text(`Montant: ${employeeData.amount.toLocaleString()} Ar`, 20, 70);
            doc.text(`Statut: ${employeeData.paid ? 'Payé' : 'En attente'}`, 20, 80);
          }
          
          // Ajouter un pied de page
          doc.setFontSize(10);
          doc.text('Cabinet Médical - Document généré automatiquement', 105, 280, { align: 'center' });
          
          // Télécharger le PDF
          doc.save(`Fiche_de_paie_${employeeName.replace(/\s+/g, '_')}_${month.replace(/\s+/g, '_')}.pdf`);
        }).catch(err => {
          console.error("Erreur lors du chargement de jsPDF:", err);
          alert("Impossible de générer le PDF. Veuillez réessayer plus tard.");
        });
      } else {
        // En production, essayer de télécharger le fichier réel
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Fiche_de_paie_${employeeName.replace(/\s+/g, '_')}_${month.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Impossible de télécharger la fiche de paie. Veuillez réessayer plus tard.");
    }
  };

  // Fonction pour télécharger toutes les fiches de paie
  const downloadAllPayslips = () => {
    // Si des filtres sont appliqués, ne télécharger que les fiches des employés filtrés
    const employeesToDownload = filteredEmployees.length > 0 ? filteredEmployees : employees;
    
    console.log(`Téléchargement de ${employeesToDownload.length} fiches de paie`);
    
    // Pour cette démonstration, nous téléchargeons les fiches une par une avec un délai
    employeesToDownload.forEach((emp, index) => {
      setTimeout(() => {
        downloadPayslip(emp.pdfUrl, emp.name, emp.month);
      }, index * 1000); // Délai de 1000ms entre chaque téléchargement pour éviter les blocages
    });
  };

  const filteredEmployees = employees
    .filter(emp => {
      // Filtre par statut
      if (filterStatus === 'paid' && !emp.paid) return false;
      if (filterStatus === 'unpaid' && emp.paid) return false;
      
      // Filtre par mois
      if (selectedMonth && emp.month !== selectedMonth) return false;
      
      // Filtre par recherche
      return emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  
  if (loading) { return <Loading />;}
    return (
      <div className="p-6 min-h-screen bg-gray-100">
        <h1 className="text-gray-600 text-2xl font-bold mb-6">Payement</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-xl font-semibold mb-4">Suivi des payements mensuels</h2>
          
          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher un employé..." 
                className="text-gray-700 w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  className="text-gray-500 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="paid">Payés</option>
                  <option value="unpaid">Non payés</option>
                </select>
              </div>
              
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  className="text-gray-500 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">Tous les mois</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Employé</th>
                  <th className="py-3 px-6 text-left">Poste</th>
                  <th className="py-3 px-6 text-left">Mois</th>
                  <th className="py-3 px-6 text-right">Montant</th>
                  <th className="py-3 px-6 text-center">Statut</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{employee.name}</td>
                      <td className="py-3 px-6 text-left">{employee.role}</td>
                      <td className="py-3 px-6 text-left">{employee.month}</td>
                      <td className="py-3 px-6 text-right">{employee.amount.toLocaleString()} Ar</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`py-1 px-3 rounded-full text-xs ${employee.paid ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                          {employee.paid ? 'Payé' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          
                          <button 
                            onClick={() => downloadPayslip(employee.pdfUrl, employee.name, employee.month)}
                            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded text-xs transition duration-300"
                            title="Télécharger la fiche de paie"
                          >
                            <FiDownload size={14} />
                            <span className="hidden sm:inline">Fiche de paie</span>
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Aucun résultat trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Résumé des paiements</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600 text-xs">Total des payements en attente: </span>
                  <span className="text-gray-500 font-bold">{filteredEmployees.filter(e => !e.paid).reduce((sum, emp) => sum + emp.amount, 0).toLocaleString()}Ar</span>
                </div>
                <div>
                  <span className="text-gray-600 text-xs">Nombre de payements en attente: </span>
                  <span className="text-gray-500 font-bold">{filteredEmployees.filter(e => !e.paid).length}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-xs">Total des payements effectués: </span>
                  <span className="text-gray-500 font-bold">{filteredEmployees.filter(e => e.paid).reduce((sum, emp) => sum + emp.amount, 0).toLocaleString()}Ar</span>
                </div>
                <div>
                  <span className="text-gray-600 text-xs">Nombre de payements effectués: </span>
                  <span className="text-gray-500 font-bold">{filteredEmployees.filter(e => e.paid).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

