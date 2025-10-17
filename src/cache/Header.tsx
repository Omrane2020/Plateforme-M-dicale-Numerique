import React from 'react';
import { Button } from './ui/button';
import { Stethoscope, Menu, X } from 'lucide-react';
import type { UserType } from "../types";

type Page = 'home' | 'login' | 'signup' | 'doctor-dashboard' | 'doctor-profile' | 'patient-management' | 'appointments' | 'patient-dashboard' | 'contact' | 'subscription-plans';


interface HeaderProps {
  onNavigate: (page: Page) => void;
  isAuthenticated: boolean;
  userType: UserType;
  onLogout: () => void;
}

export function Header({ onNavigate, isAuthenticated, userType, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl text-slate-800">MedPlatform</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('home')}
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Accueil
            </button>
            <button 
              onClick={() => onNavigate('subscription-plans')}
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Tarifs
            </button>
            <button 
              onClick={() => onNavigate('contact')}
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('login')}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Se connecter
                </Button>
                <Button 
                  onClick={() => onNavigate('signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Commencer
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-slate-600">
                  {userType === 'doctor' ? 'Dr.' : 'Patient'} Connecté
                </span>
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Déconnexion
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => {
                  onNavigate('home');
                  setIsMenuOpen(false);
                }}
                className="text-slate-600 hover:text-blue-600 text-left transition-colors"
              >
                Accueil
              </button>
              <button 
                onClick={() => {
                  onNavigate('subscription-plans');
                  setIsMenuOpen(false);
                }}
                className="text-slate-600 hover:text-blue-600 text-left transition-colors"
              >
                Tarifs
              </button>
              <button 
                onClick={() => {
                  onNavigate('contact');
                  setIsMenuOpen(false);
                }}
                className="text-slate-600 hover:text-blue-600 text-left transition-colors"
              >
                Contact
              </button>
              
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onNavigate('login');
                      setIsMenuOpen(false);
                    }}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Se connecter
                  </Button>
                  <Button 
                    onClick={() => {
                      onNavigate('signup');
                      setIsMenuOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Commencer
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4">
                  <span className="text-slate-600">
                    {userType === 'doctor' ? 'Dr.' : 'Patient'} Connecté
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Déconnexion
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
