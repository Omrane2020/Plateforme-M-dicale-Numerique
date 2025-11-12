import { useState, useEffect } from 'react';
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
  History,
  Loader2
} from 'lucide-react';
import type { Page } from '../types/Page';
// @ts-ignore
import { supabase } from "../supabaseClient";



interface DoctorSidebarProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
}

interface QuickStats {
  totalPatients: number;
  todayAppointments: number;
  weeklyAppointments: number;
}

interface DoctorInfo {
  firstName: string;
  lastName: string;
  specialty: string;
}

export function DoctorSidebar({ onNavigate, onLogout, currentPage }: DoctorSidebarProps) {
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo>({
    firstName: 'Dr.',
    lastName: 'Martin',
    specialty: 'Cardiologue'
  });
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalPatients: 0,
    todayAppointments: 0,
    weeklyAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

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

  // Récupérer les informations du médecin et les statistiques
  const fetchDoctorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les informations du médecin
      const { data: doctorData } = await supabase
        .from('users')
        .select(`
          first_name,
          last_name,
          doctor_profiles!inner (
            specialty
          )
        `)
        .eq('id', user.id)
        .single();

      if (doctorData) {
        setDoctorInfo({
          firstName: doctorData.first_name || 'Dr.',
          lastName: doctorData.last_name || 'Martin',
          specialty: doctorData.doctor_profiles.specialty || 'Médecin'
        });
      }

      // Récupérer les statistiques rapides
      await fetchQuickStats(user.id);

    } catch (error) {
      console.error('Erreur lors du chargement des données du médecin:', error);
      // Données par défaut en cas d'erreur
      setQuickStats({
        totalPatients: 127,
        todayAppointments: 8,
        weeklyAppointments: 42
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les statistiques rapides
  const fetchQuickStats = async (doctorId: string) => {
    try {
      // Compter le nombre total de patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId);

      // Récupérer les rendez-vous d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('appointment_date', today)
        .in('status', ['scheduled', 'confirmed']);

      // Récupérer les rendez-vous de la semaine
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

      const { count: weeklyAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('appointment_date', startOfWeekStr)
        .lte('appointment_date', endOfWeekStr)
        .in('status', ['scheduled', 'confirmed']);

      setQuickStats({
        totalPatients: totalPatients || 0,
        todayAppointments: todayAppointments || 0,
        weeklyAppointments: weeklyAppointments || 0
      });

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      throw error;
    }
  };

  // Fonction pour suivre les pages visitées (optionnel)
  const trackPageVisit = async (page: Page) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mettre à jour les pages récentes dans les préférences
      const { data: existingPrefs } = await supabase
        .from('doctor_navigation_preferences')
        .select('recent_pages')
        .eq('doctor_id', user.id)
        .single();

      let recentPages: string[] = [];
      
      if (existingPrefs?.recent_pages) {
        // Garder seulement les 5 pages les plus récentes
        recentPages = [page, ...existingPrefs.recent_pages.filter((p:string) => p !== page)].slice(0, 5);
      } else {
        recentPages = [page];
      }

      // Upsert des préférences
      await supabase
        .from('doctor_navigation_preferences')
        .upsert({
          doctor_id: user.id,
          recent_pages: recentPages,
          updated_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Erreur lors du suivi de la navigation:', error);
    }
  };

  // Gérer la navigation avec suivi
  const handleNavigation = (page: Page) => {
    trackPageVisit(page);
    onNavigate(page);
  };

  useEffect(() => {
    fetchDoctorData();

    // Rafraîchir les statistiques toutes les 5 minutes
    const interval = setInterval(() => {
      const { data: { user } } = supabase.auth.getUser();
      if (user) {
        fetchQuickStats(user.id);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm border-r border-slate-200 w-64 min-h-screen flex flex-col">
        {/* Header Squelette */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Navigation Squelette */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <li key={i}>
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                </div>
              </li>
            ))}
          </ul>

          {/* Statistiques Squelette */}
          <div className="border-t border-slate-200 mt-6 pt-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-8 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer Squelette */}
        <div className="p-4 border-t border-slate-200 mt-auto space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-3 px-3 py-2">
              <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-r border-slate-200 w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg text-slate-800">
              {doctorInfo.firstName} {doctorInfo.lastName}
            </h2>
            <p className="text-sm text-slate-600">{doctorInfo.specialty}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => handleNavigation(item.page)}
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
                <span className="text-slate-800">
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    quickStats.totalPatients
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">RDV aujourd'hui</span>
                <span className="text-slate-800">
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    quickStats.todayAppointments
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">RDV cette semaine</span>
                <span className="text-slate-800">
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    quickStats.weeklyAppointments
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 mt-auto">
        <div className="space-y-2">
          <button 
            onClick={() => handleNavigation('settings' as Page)}
            className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
          >
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