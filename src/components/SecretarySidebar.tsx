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
import { useEffect, useState } from 'react';
//@ts-ignore
import { supabase } from '../supabaseClient';
import type { Page } from '../types/Page';

interface SecretarySidebarProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
}

export function SecretarySidebar({ onNavigate, onLogout, currentPage }: SecretarySidebarProps) {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);

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

  // Charger les données statistiques
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupérer le nombre total de patients
      const { count: patientsCount, error: patientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      if (!patientsError && patientsCount !== null) {
        setPatientsCount(patientsCount);
      }

      // Récupérer les rendez-vous d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { count: appointmentsCount, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)
        .eq('status', 'scheduled');

      if (!appointmentsError && appointmentsCount !== null) {
        setTodayAppointments(appointmentsCount);
      }

      // Récupérer les notifications non lues
      const { count: notificationsCount, error: notificationsError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('user_role', 'secretary');

      if (!notificationsError && notificationsCount !== null) {
        setUnreadNotifications(notificationsCount);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

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
        
        {/* Statistiques rapides */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 p-2 rounded">
            <p className="font-semibold text-blue-700">{patientsCount}</p>
            <p className="text-blue-600">Patients</p>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <p className="font-semibold text-green-700">{todayAppointments}</p>
            <p className="text-green-600">RDV Auj.</p>
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
                  <div className="ml-auto flex items-center">
                    {unreadNotifications > 0 && (
                      <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mr-1">
                        {unreadNotifications}
                      </span>
                    )}
                    <Bell className="h-4 w-4 text-orange-500" />
                  </div>
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