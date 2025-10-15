'use client';

import { useState } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.svg" alt="Manny Express" className="w-20 h-20 sm:w-28 sm:h-28" />
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                MANNY EXPRESS
              </div>
              <div className="text-xs text-gray-500 -mt-1 hidden sm:block">
                Entreprise de déménagement
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#accueil"
              className="text-gray-900 font-medium transition relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[rgb(30,125,187)] hover:after:w-full after:transition-all hover:opacity-90"
            >
              Accueil
            </a>
            <a
              href="#services"
              className="text-gray-600 font-medium transition hover:opacity-90"
            >
              Services
            </a>
            <a
              href="#temoignages"
              className="text-gray-600 font-medium transition hover:opacity-90"
            >
              Témoignages
            </a>
            <a
              href="#contact"
              className="text-gray-600 font-medium transition hover:opacity-90"
            >
              Contact
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://forms.gle/VPC2LoDKGrWDvHaH8"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-block text-gray-900 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:opacity-90 text-sm sm:text-base"
              style={{ backgroundColor: "rgb(245, 186, 83)" }}
            >
              Obtenir un devis
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a
                href="#accueil"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-900 font-medium py-2 hover:opacity-90"
                style={{ color: 'rgb(30, 125, 187)' }}
              >
                Accueil
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 font-medium py-2 hover:opacity-90"
              >
                Services
              </a>
              <a
                href="#temoignages"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 font-medium py-2 hover:opacity-90"
              >
                Témoignages
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 font-medium py-2 hover:opacity-90"
              >
                Contact
              </a>
              <a
                href="https://forms.gle/VPC2LoDKGrWDvHaH8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 px-6 py-3 rounded-lg font-semibold transition shadow-md text-center"
                style={{ backgroundColor: "rgb(245, 186, 83)" }}
              >
                Obtenir un devis
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
