"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUser, FaCog, FaChevronDown } from 'react-icons/fa';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 ">
      
      <div className="relative ml-auto z-10" ref={menuRef}>
        <button 
          onClick={toggleMenu}
          className="cursor-pointer flex items-center space-x-2 bg-blue-100 hover:bg-blue-300 transition-colors px-4 py-2 rounded-lg"
        >
          <FaUser className="text-blue-600" />
          <span className="text-gray-700 font-medium">Mon Profil</span>
          <FaChevronDown className={`text-gray-500 transition-transform ${menuOpen ? 'transform rotate-180' : ''}`} />
        </button>
        
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200"
          >
            <Link href="/Page/profil" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50">
              <FaUser className="mr-3 text-blue-500" />
              <span>Mon Profil</span>
            </Link>
            <Link href="/Page/parametre" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50">
              <FaCog className="mr-3 text-blue-500" />
              <span>Paramètres</span>
            </Link>
            <div className="border-t border-gray-200 my-1"></div>
          </motion.div>
        )}
      </div>
    </header>
    </>
  );
};

export default Header;
