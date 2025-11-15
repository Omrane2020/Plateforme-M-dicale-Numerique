
import { 
  LayoutDashboard, 
  Calendar,
  Users, 
  UserPlus,
  LogOut,
  ClipboardList,
  Bell
} from 'lucide-react';
import { Button } from './ui/button';

import type { Page } from '../types/Page';
interface SecretarySidebarProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
}

export function SecretarySidebar({ onNavigate, onLogout, currentPage }: SecretarySidebarProps) {
  const menuItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Tableau de bord',
      page: 'secretary-dashboard' as const,
      color: 'text-blue-600'
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Gestion des RDV',
      page: 'secretary-appointments' as const,
      color: 'text-green-600'
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Gestion patients',
      page: 'secretary-patient-management' as const,
      color: 'text-purple-600'
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      label: 'Nouveau patient',
      page: 'add-patient' as const,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-slate-800">Secrétaire</h2>
            <p className="text-sm text-slate-500">Interface Opérationnelle</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.page}>
              <Button
                variant={currentPage === item.page ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  currentPage === item.page 
                    ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => onNavigate(item.page)}
              >
                <span className={currentPage === item.page ? item.color : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span className="ml-3">{item.label}</span>
                {item.page === 'secretary-dashboard' && currentPage === item.page && (
                  <Bell className="h-4 w-4 ml-auto text-orange-500" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Déconnexion</span>
        </Button>
      </div>
    </div>
  );
}