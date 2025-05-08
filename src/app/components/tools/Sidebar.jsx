"use client"
import { div } from "framer-motion/client";
import { LayoutDashboard, User, Folder, FileText, Package, Settings, LogOut, CalendarDays, Stethoscope, CalendarCheck, CreditCard, Pill, Sliders} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from "react";

const sidebarItems = [
  { icon: LayoutDashboard, title: "Tableau de bord", href: "/Page" },
  { icon: Stethoscope, title: "Service", href: "/Page/service" },
  { icon: Pill, title: "Traitement", href: "/Page/traitement" },
  { icon: User, title: "Docteur", href: "/Page/docteur" },
  { icon: Folder, title: "Patient", href: "/Page/patient" },
  { icon: FileText, title: "Dossier Médical", href: "/Page/dossier" },
  { icon: CalendarCheck, title: "Consultation", href: "/Page/consultation" },
  { icon: CreditCard, title: "Salaire employé", href: "/Page/payement" },
  { icon: Package, title: "Stocks", href: "/Page/stocks" },
  { icon: CalendarDays, title: "Rendez-vous", href: "/Page/rendez_vous" },
];

const Sidebar = () => {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

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
            {sidebarItems.map((item) => (
              <SidebarItem key={item.title} icon={item.icon} title={item.title} href={item.href} />
            ))}
          </ul>
        </nav>

        <div>
          <ul className="mt-4 space-y-2">
            <Link href="/Formulaire/login">
              <li className="flex items-center space-x-3 p-2 rounded-md hover:bg-red-100 text-red-500 cursor-pointer">
                <LogOut size={20} />
                <span>Déconnexion</span>
              </li>
            </Link>
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
