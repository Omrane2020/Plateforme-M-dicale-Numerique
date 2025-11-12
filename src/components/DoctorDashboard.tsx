import { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Heart, 
  AlertCircle,
  CheckCircle,
  Plus,
  FileText,
  Activity,
  Pill,
  Brain,
  UserCog,
  UserCheck,
  Loader2
} from 'lucide-react';
//@ts-ignore  
import { supabase } from "../supabaseClient";
import type { Page } from '../types/Page';

interface DoctorDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface DashboardStats {
  icon: JSX.Element;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

interface Appointment {
  time: string;
  patient: string;
  type: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface RecentPatient {
  name: string;
  age: number;
  lastVisit: string;
  condition: string;
  priority: 'normal' | 'high';
}

interface SecretaryInfo {
  name: string;
  status: 'online' | 'offline';
}

interface SupabaseAppointment {
  appointment_time: string;
  patient_first_name?: string;
  patient_last_name?: string;
  type: string;
  status: string;
}

interface SupabasePatient {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  medical_conditions?: string[];
  updated_at: string;
}

interface SupabaseSecretary {
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export function DoctorDashboard({ onNavigate, onLogout }: DoctorDashboardProps) {
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [secretaries, setSecretaries] = useState<SecretaryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('Dr. Martin');

  // Récupérer les données du dashboard
  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer le nom du médecin
      const { data: doctorData } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (doctorData) {
        setDoctorName(`Dr. ${doctorData.first_name} ${doctorData.last_name}`);
      }

      // Récupérer les statistiques
      const today = new Date().toISOString().split('T')[0];
      
      // Récupérer le nombre total de patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id);

      // Récupérer les rendez-vous du jour
      const { data: todayAppts, count: todayAppointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('doctor_id', user.id)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      // Récupérer les rendez-vous à venir
      const { data: upcomingAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .eq('appointment_date', today)
        .in('status', ['scheduled', 'confirmed'])
        .gte('appointment_time', new Date().toLocaleTimeString('en-US', { hour12: false }));

      // Récupérer les prescriptions du mois
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const { count: monthlyPrescriptions } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .gte('created_at', startOfMonth);

      // Récupérer les interactions médicamenteuses
      const { count: detectedInteractions } = await supabase
        .from('drug_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .eq('resolved', false);

      // Récupérer les secrétaires actives
      const { data: secretariesData } = await supabase
        .from('users')
        .select('first_name, last_name, is_active')
        .eq('role', 'secretary')
        .eq('is_active', true);

      // Mettre à jour les statistiques
      const updatedStats: DashboardStats[] = [
        {
          icon: <Users className="h-6 w-6 text-blue-600" />,
          title: "Patients suivis",
          value: totalPatients?.toString() || "127",
          change: "+5 ce mois",
          changeType: "positive"
        },
        {
          icon: <Calendar className="h-6 w-6 text-green-600" />,
          title: "RDV aujourd'hui",
          value: todayAppointmentsCount?.toString() || "8",
          change: `${upcomingAppts?.length || 2} à venir`,
          changeType: "neutral"
        },
        {
          icon: <Clock className="h-6 w-6 text-orange-600" />,
          title: "Temps moyen/consultation",
          value: "22 min",
          change: "-3 min vs mois dernier",
          changeType: "positive"
        },
        {
          icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
          title: "Taux de satisfaction",
          value: "4.8/5",
          change: "+0.2 ce mois",
          changeType: "positive"
        },
        {
          icon: <FileText className="h-6 w-6 text-green-600" />,
          title: "Prescriptions ce mois",
          value: monthlyPrescriptions?.toString() || "34",
          change: "+8 vs mois dernier",
          changeType: "positive"
        },
        {
          icon: <Pill className="h-6 w-6 text-blue-600" />,
          title: "Interactions détectées",
          value: detectedInteractions?.toString() || "2",
          change: "IA activée",
          changeType: "neutral"
        },
        {
          icon: <UserCog className="h-6 w-6 text-purple-600" />,
          title: "Secrétaires actives",
          value: secretariesData?.length?.toString() || "2",
          change: `${secretariesData?.length || 3} total`,
          changeType: "neutral"
        }
      ];

      setStats(updatedStats);

      // Mettre à jour les rendez-vous du jour
      if (todayAppts) {
        const appointments: Appointment[] = todayAppts.slice(0, 6).map((apt: SupabaseAppointment) => ({
          time: apt.appointment_time.substring(0, 5),
          patient: `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim() || 'Patient',
          type: apt.type,
          status: apt.status as 'completed' | 'in-progress' | 'upcoming'
        }));
        setTodayAppointments(appointments);
      } else {
        setTodayAppointments(getDefaultAppointments());
      }

      // Mettre à jour les patients récents
      const { data: recentPatientsData } = await supabase
        .from('patients')
        .select('first_name, last_name, date_of_birth, medical_conditions, updated_at')
        .eq('doctor_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(4);

      if (recentPatientsData) {
        const patients: RecentPatient[] = recentPatientsData.map((patient: SupabasePatient) => ({
          name: `${patient.first_name} ${patient.last_name}`,
          age: patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 0,
          lastVisit: formatLastVisit(patient.updated_at),
          condition: patient.medical_conditions?.[0] || 'Consultation générale',
          priority: Math.random() > 0.8 ? 'high' : 'normal'
        }));
        setRecentPatients(patients);
      } else {
        setRecentPatients(getDefaultPatients());
      }

      // Mettre à jour les secrétaires
      if (secretariesData) {
        const secretariesList: SecretaryInfo[] = secretariesData.map((sec: SupabaseSecretary) => ({
          name: `${sec.first_name} ${sec.last_name}`,
          status: 'online'
        }));
        setSecretaries(secretariesList);
      } else {
        setSecretaries(getDefaultSecretaries());
      }

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      // Charger les données par défaut en cas d'erreur
      setStats(getDefaultStats());
      setTodayAppointments(getDefaultAppointments());
      setRecentPatients(getDefaultPatients());
      setSecretaries(getDefaultSecretaries());
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour formater la dernière visite
  const formatLastVisit = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return 'Aujourd\'hui';
    if (diffInHours < 48) return 'Hier';
    return `Il y a ${Math.floor(diffInHours / 24)} jours`;
  };

  // Données par défaut
  const getDefaultStats = (): DashboardStats[] => [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Patients suivis",
      value: "127",
      change: "+5 ce mois",
      changeType: "positive"
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      title: "RDV aujourd'hui",
      value: "8",
      change: "2 à venir",
      changeType: "neutral"
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "Temps moyen/consultation",
      value: "22 min",
      change: "-3 min vs mois dernier",
      changeType: "positive"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      title: "Taux de satisfaction",
      value: "4.8/5",
      change: "+0.2 ce mois",
      changeType: "positive"
    },
    {
      icon: <FileText className="h-6 w-6 text-green-600" />,
      title: "Prescriptions ce mois",
      value: "34",
      change: "+8 vs mois dernier",
      changeType: "positive"
    },
    {
      icon: <Pill className="h-6 w-6 text-blue-600" />,
      title: "Interactions détectées",
      value: "2",
      change: "IA activée",
      changeType: "neutral"
    },
    {
      icon: <UserCog className="h-6 w-6 text-purple-600" />,
      title: "Secrétaires actives",
      value: "2",
      change: "3 total",
      changeType: "neutral"
    }
  ];

  const getDefaultAppointments = (): Appointment[] => [
    {
      time: "09:00",
      patient: "Marie Dubois",
      type: "Consultation de suivi",
      status: "completed"
    },
    {
      time: "09:30",
      patient: "Pierre Martin",
      type: "Contrôle tension",
      status: "completed"
    },
    {
      time: "10:15",
      patient: "Sophie Lambert",
      type: "Consultation générale",
      status: "in-progress"
    },
    {
      time: "11:00",
      patient: "Jean Dupont",
      type: "Résultats analyses",
      status: "upcoming"
    },
    {
      time: "14:00",
      patient: "Anne Moreau",
      type: "Première consultation",
      status: "upcoming"
    },
    {
      time: "15:30",
      patient: "Paul Leclerc",
      type: "Suivi traitement",
      status: "upcoming"
    }
  ];

  const getDefaultPatients = (): RecentPatient[] => [
    {
      name: "Marie Dubois",
      age: 45,
      lastVisit: "Aujourd'hui",
      condition: "Hypertension",
      priority: "normal"
    },
    {
      name: "Pierre Martin",
      age: 67,
      lastVisit: "Aujourd'hui",
      condition: "Diabète type 2",
      priority: "high"
    },
    {
      name: "Sophie Lambert",
      age: 34,
      lastVisit: "Hier",
      condition: "Contrôle grossesse",
      priority: "normal"
    },
    {
      name: "Jean Dupont",
      age: 52,
      lastVisit: "Il y a 3 jours",
      condition: "Cholestérol",
      priority: "normal"
    }
  ];

  const getDefaultSecretaries = (): SecretaryInfo[] => [
    {
      name: "Sarah Dubois",
      status: "online"
    },
    {
      name: "Marine Lambert",
      status: "online"
    },
    {
      name: "Julie Martin",
      status: "offline"
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">À venir</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'high' ? 
      <AlertCircle className="h-4 w-4 text-red-600" /> : 
      <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar onNavigate={onNavigate} onLogout={onLogout} currentPage="doctor-dashboard" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        currentPage="doctor-dashboard"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-slate-800 mb-2">Tableau de bord</h1>
          <p className="text-slate-600">
            Bonjour {doctorName}, voici un aperçu de votre activité
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid lg:grid-cols-3 xl:grid-cols-7 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl text-slate-800 mb-1">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-full">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-slate-800">Rendez-vous du jour</CardTitle>
                <Button 
                  onClick={() => onNavigate('appointments')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau RDV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm text-slate-600">Heure</p>
                          <p className="text-slate-800">{appointment.time}</p>
                        </div>
                        <div>
                          <p className="text-slate-800">{appointment.patient}</p>
                          <p className="text-sm text-slate-600">{appointment.type}</p>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('appointments')}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Voir tous les rendez-vous
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Patients */}
          <div>
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Patients récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPatients.map((patient, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => onNavigate('patient-management')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Heart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-slate-800">{patient.name}</p>
                          <p className="text-sm text-slate-600">{patient.age} ans • {patient.condition}</p>
                          <p className="text-xs text-slate-500">{patient.lastVisit}</p>
                        </div>
                      </div>
                      <div>
                        {getPriorityIcon(patient.priority)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('patient-management')}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Gérer les patients
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Prescription Assistant */}
          <div>
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Assistant IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-800">IA Active</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      L'IA surveille automatiquement les interactions médicamenteuses
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Analyses ce mois</span>
                      <span className="text-slate-800">47</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Interactions évitées</span>
                      <span className="text-green-600">12</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Alertes émises</span>
                      <span className="text-orange-600">5</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => onNavigate('prescription')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Prescrire avec IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secretary Management */}
          <div>
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <UserCog className="h-5 w-5 mr-2 text-indigo-600" />
                  Secrétaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserCheck className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm text-indigo-800">Équipe active</span>
                    </div>
                    <p className="text-sm text-indigo-700">
                      Vos secrétaires gèrent les patients et RDV
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {secretaries.map((secretary, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{secretary.name}</span>
                        <span className={secretary.status === 'online' ? 'text-green-600' : 'text-slate-400'}>
                          {secretary.status === 'online' ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-600">Patients ajoutés aujourd'hui</span>
                      <span className="text-slate-800">5</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">RDV traités</span>
                      <span className="text-slate-800">23</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => onNavigate('secretary-management')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Gérer les secrétaires
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Button 
                  onClick={() => onNavigate('appointments')}
                  className="h-20 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Calendar className="h-6 w-6" />
                  <span>Nouveau RDV</span>
                </Button>
                <Button 
                  onClick={() => onNavigate('patient-management')}
                  className="h-20 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Plus className="h-6 w-6" />
                  <span>Nouveau Patient</span>
                </Button>
                <Button className="h-20 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 flex flex-col items-center justify-center space-y-2" variant="outline">
                  <TrendingUp className="h-6 w-6" />
                  <span>Statistiques</span>
                </Button>
                <Button 
                  onClick={() => onNavigate('prescription')}
                  className="h-20 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <FileText className="h-6 w-6" />
                  <span>Prescription IA</span>
                </Button>
                <Button 
                  onClick={() => onNavigate('secretary-management')}
                  className="h-20 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <UserCog className="h-6 w-6" />
                  <span>Secrétaires</span>
                </Button>
                <Button 
                  onClick={() => onNavigate('doctor-profile')}
                  className="h-20 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Users className="h-6 w-6" />
                  <span>Mon Profil</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}