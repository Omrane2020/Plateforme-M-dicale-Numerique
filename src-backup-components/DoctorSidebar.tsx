import React from 'react';
import { 
  LayoutDashboard, 
  User, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Stethoscope,
  FileText,
  UserCog,
  History
} from 'lucide-react';

type Page = 'home' | 'login' | 'signup' | 'doctor-dashboard' | 'doctor-profile' | 'patient-management' | 'appointments' | 'patient-dashboard' | 'contact' | 'prescription' | 'secretary-dashboard' | 'secretary-management' | 'add-patient' | 'doctor-history' | 'patient-history' | 'request-appointment';

interface DoctorSidebarProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
}

export function DoctorSidebar({ onNavigate, onLogout, currentPage }: DoctorSidebarProps) {
  const menuItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Tableau de bord',
      page: 'doctor-dashboard' as Page,
      active: currentPage === 'doctor-dashboard'
    },
    {
      icon: <User className="h-5 w-5" />,
      label: 'Mon Profil',
      page: 'doctor-profile' as Page,
      active: currentPage === 'doctor-profile'
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Patients',
      page: 'patient-management' as Page,
      active: currentPage === 'patient-management'
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Rendez-vous',
      page: 'appointments' as Page,
      active: currentPage === 'appointments'
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Prescriptions',
      page: 'prescription' as Page,
      active: currentPage === 'prescription'
    },
    {
      icon: <UserCog className="h-5 w-5" />,
      label: 'Secrétaires',
      page: 'secretary-management' as Page,
      active: currentPage === 'secretary-management'
    },
    {
      icon: <History className="h-5 w-5" />,
      label: 'Historique',
      page: 'doctor-history' as Page,
      active: currentPage === 'doctor-history'
    }
  ];

  return (
    <div className="bg-white shadow-sm border-r border-slate-200 w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg text-slate-800">Dr. Martin</h2>
            <p className="text-sm text-slate-600">Cardiologue</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Statistics Quick View */}
        <div className="border-t border-slate-200 mt-6 pt-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              <span className="text-sm text-slate-700">Statistiques rapides</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Patients suivis</span>
                <span className="text-slate-800">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">RDV aujourd'hui</span>
                <span className="text-slate-800">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">RDV cette semaine</span>
                <span className="text-slate-800">42</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 mt-auto">
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
            <span>Paramètres</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
