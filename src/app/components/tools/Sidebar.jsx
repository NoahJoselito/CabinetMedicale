"use client"
import { div } from "framer-motion/client";
import { LayoutDashboard, User, Folder, FileText, Package, Settings, LogOut, CalendarDays, Stethoscope, CalendarCheck, CreditCard, Pill, Sliders} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from "react";
import { checkUser } from "../../../services/checkService";

const sidebarItems = [
  { icon: LayoutDashboard, title: "Tableau de bord", href: "/Page", key: "dashboard" },
  { icon: Stethoscope, title: "Service", href: "/Page/service", key: "service" },
  { icon: Package, title: "Stocks", href: "/Page/stocks", key: "stocks" },
  { icon: Pill, title: "Traitement", href: "/Page/traitement", key: "traitement" },
  { icon: User, title: "Docteur", href: "/Page/docteur", key: "docteur" },
  { icon: Folder, title: "Patient", href: "/Page/patient", key: "patient" },
  { icon: CalendarCheck, title: "Consultation", href: "/Page/consultation", key: "consultation" },
  { icon: FileText, title: "Dossier Médical", href: "/Page/dossier", key: "dossierMedical" },
  { icon: CalendarDays, title: "Rendez-vous", href: "/Page/rendez_vous", key: "rendezVous" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [allowedMenus, setAllowedMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await checkUser();
        setUser(userData.user);
        setAllowedMenus(userData.allowedMenus);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
        window.location.href = '/Formulaire/login';
      }
    };

    if (pathname !== '/login' && pathname !== '/Formulaire/login') {
      fetchUserData();
    }
  }, [pathname]);

  // Fonction pour déterminer si un menu doit être affiché selon le rôle
  const isMenuAllowed = (menuKey) => {
    if (!user) return false;
    
    switch (user.role_id) {
      case 1: // Admin - peut tout voir
        return true;
      case 2: // Docteur - peut voir Patient et Dossier Médical
        return [ 'patient', 'dossierMedical', 'consultation'].includes(menuKey);
      case 3: // Assistant
        return ['rendezVous'].includes(menuKey);
      case 4: // Patient
        return [ 'rendezVous', 'dossierMedical'].includes(menuKey);
      default:
        return false;
    }
  };

  if (pathname === '/login' || pathname === '/Formulaire/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Aucun token trouvé');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la déconnexion');
      }

      localStorage.removeItem('token');
      localStorage.clear();
      window.location.href = '/Formulaire/login';
      
    } catch (err) {
      console.error('Détails de l\'erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de la déconnexion');
    }
  };

  // Filtrer les éléments du sidebar selon les permissions
  const filteredSidebarItems = sidebarItems.filter(item => isMenuAllowed(item.key));

  return (
    <>
      <div className="w-full h-screen text-gray-800 bg-gray-100 shadow-lg flex flex-col justify-between p-4">
        <Link href={"/Page"}>
          <div className="flex items-center space-x-2 py-4">
            <Image src="/img/logo.jpg" width={40} height={40} alt="Cabinet Médical Logo" className="rounded-full" />
            <span className="text-blue-500 text-lg font-bold">Cabinet Médicale</span>
          </div>
        </Link>

        <nav className="mt-6 flex-1 overflow-y-auto">
          <ul className="space-y-2 pr-4">
            {filteredSidebarItems.map((item) => (
              <SidebarItem key={item.title} icon={item.icon} title={item.title} href={item.href} />
            ))}
          </ul>
        </nav>

        <div>
          <ul className="mt-4 space-y-2">
            <button 
              onClick={handleLogout}
              className="w-full"
            >
              <li className="flex items-center space-x-3 p-2 rounded-md hover:bg-red-100 text-red-500 cursor-pointer">
                <LogOut size={20} />
                <span>Déconnexion</span>
              </li>
            </button>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

const SidebarItem = ({ icon: Icon, title, href }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <li className={`flex items-center space-x-3 p-2 rounded-md hover:bg-blue-100 hover:text-blue-400 cursor-pointer ${isActive ? 'bg-blue-100 text-blue-400' : ''}`}>
        <Icon size={20} />
        <span>{title}</span>
      </li>
    </Link>
  );
};

export default Sidebar;
