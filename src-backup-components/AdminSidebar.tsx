import React from 'react';
import { 
  Users, 
  Activity, 
  BarChart3, 
  Settings, 
  Shield, 
  FileText, 
  Calendar,
  Stethoscope,
  UserPlus,
  Database,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';

interface AdminSidebarProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  activePage?: string;
}

export function AdminSidebar({ onNavigate, onLogout, activePage }: AdminSidebarProps) {
  const menuItems = [
    { id: 'admin-dashboard', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'user-management', label: 'Gestion Utilisateurs', icon: Users },
    { id: 'system-reports', label: 'Rapports & Analytics', icon: FileText },
    { id: 'system-settings', label: 'Configuration', icon: Settings },
    { id: 'activity-logs', label: 'Logs d\'activité', icon: Activity },
    { id: 'security-center', label: 'Centre Sécurité', icon: Shield },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Système de gestion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Statut Système</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Serveur</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-600">En ligne</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de données</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-600">Actif</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sauvegardes</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-yellow-600">En cours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
