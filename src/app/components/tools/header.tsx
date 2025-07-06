"use client";

import React from 'react';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';

const Header = () => {
  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 ">
      <div className="relative ml-auto z-10">
        <Link 
          href="../Page/profil"
          className="cursor-pointer flex items-center space-x-2 bg-blue-100 hover:bg-blue-300 transition-colors px-4 py-2 rounded-lg"
        >
          <FaUser className="text-blue-600" />
          <span className="text-gray-700 font-medium">Mon Profil</span>
        </Link>
      </div>
    </header>
    </>
  );
};


    export default Header; 