"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/tools/Sidebar";
import Header from "../components/tools/header";

// Fonction debounce pour limiter les appels de handleResize
function debounce(func: Function, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleResize = useCallback(
    debounce(() => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Cache la sidebar par défaut sur mobile
    }, 150),
    []
  );

  useEffect(() => {
    handleResize(); // Vérifier la taille de l'écran au chargement
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <div className="flex bg-gray-200 min-h-screen">
      {/* Sidebar - Visible sur desktop, toggle sur mobile */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <Sidebar />

      </aside>

      {/* Overlay sur mobile pour fermer la sidebar quand on clique ailleurs */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <main
        className={`flex-1 bg-gray-100 transition-all duration-300 ${
          sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header avec bouton hamburger sur mobile */}
        <header className="h-12 flex items-center px-4 bg-gray-100">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-700"
              aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {sidebarOpen ? "✖" : "☰"}
            </button>
          )}
          <Header />
        </header>

        {/* Contenu principal */}
        <section className="p-4">{children}
        </section>
      </main>
    </div>
  );
}
