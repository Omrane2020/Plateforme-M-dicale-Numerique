import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Users, 
  Calendar, 
  FileText, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Stethoscope,
  UserCheck,
  Database,
  Server,
  Shield,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
//@ts-ignore
import { supabase } from '../supabaseClient';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalSecretaries: number;
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  activeSessions: number;
  systemHealth: number;
}

interface RecentActivity {
  id: string;
  type: 'login' | 'appointment' | 'prescription' | 'alert' | 'user' | 'system';
  user: string;
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface SystemMetric {
  label: string;
  value: number;
  status: 'good' | 'warning' | 'error';
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour les données
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalSecretaries: 0,
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    activeSessions: 0,
    systemHealth: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);

  // Charger les données du dashboard
  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        fetchStats(),
        fetchRecentActivity(),
        fetchSystemMetrics()
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      toast.error('Erreur lors du chargement des données');
      // Charger des données par défaut en cas d'erreur
      setDefaultData();
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  const fetchStats = async () => {
    try {
      // Récupérer les statistiques utilisateurs
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalDoctors } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'doctor');

      const { count: totalSecretaries } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'secretary');

      const { count: totalPatients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'patient');

      // Récupérer les statistiques rendez-vous
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      const { count: pendingAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: completedAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Récupérer les sessions actives (approximation basée sur last_login récent)
      const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
      const { count: activeSessions } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', twentyMinutesAgo);

      // Santé système (calcul basé sur diverses métriques)
      const systemHealth = await calculateSystemHealth();

      setStats({
        totalUsers: totalUsers || 0,
        totalDoctors: totalDoctors || 0,
        totalSecretaries: totalSecretaries || 0,
        totalPatients: totalPatients || 0,
        todayAppointments: todayAppointments || 0,
        pendingAppointments: pendingAppointments || 0,
        completedAppointments: completedAppointments || 0,
        activeSessions: activeSessions || 0,
        systemHealth
      });

    } catch (error) {
      console.error('Erreur stats:', error);
      throw error;
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Récupérer les activités récentes depuis différentes sources
      const [loginsData, appointmentsData, systemData] = await Promise.all([
        // Connexions récentes
        supabase
          .from('profiles')
          .select('first_name, last_name, last_login')
          .not('last_login', 'is', null)
          .order('last_login', { ascending: false })
          .limit(5),

        // Rendez-vous récents
        supabase
          .from('appointments')
          .select('created_at, patients:profiles!appointments_patient_id_fkey(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(5),

        // Notifications système
        supabase
          .from('system_events')
          .select('event_type, description, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const activities: RecentActivity[] = [];

      // Ajouter les connexions
      loginsData.data?.forEach((login:any) => {
        activities.push({
          id: `login-${login.last_login}`,
          type: 'login',
          user: `${login.first_name} ${login.last_name}`,
          action: 'Connexion au système',
          timestamp: formatTimeAgo(login.last_login!),
          status: 'success'
        });
      });

      // Ajouter les rendez-vous
      appointmentsData.data?.forEach((apt:any) => {
        activities.push({
          id: `appointment-${apt.created_at}`,
          type: 'appointment',
          user: `${apt.patients?.first_name} ${apt.patients?.last_name}`,
          action: 'Nouveau RDV programmé',
          timestamp: formatTimeAgo(apt.created_at),
          status: 'info'
        });
      });

      // Ajouter les événements système
      systemData.data?.forEach((event:any) => {
        activities.push({
          id: `system-${event.created_at}`,
          type: 'system',
          user: 'Système',
          action: event.description,
          timestamp: formatTimeAgo(event.created_at),
          status: event.event_type.includes('error') ? 'warning' : 'info'
        });
      });

      // Trier par timestamp et prendre les 5 plus récents
      setRecentActivity(activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5));

    } catch (error) {
      console.error('Erreur activités:', error);
      throw error;
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      // Métriques simulées - dans un vrai projet, ces données viendraient d'un monitoring système
      const metrics: SystemMetric[] = [
        { label: 'CPU', value: Math.floor(Math.random() * 30) + 20, status: 'good' },
        { label: 'Mémoire', value: Math.floor(Math.random() * 40) + 40, status: 'warning' },
        { label: 'Stockage', value: Math.floor(Math.random() * 30) + 60, status: 'warning' },
        { label: 'Réseau', value: Math.floor(Math.random() * 20) + 10, status: 'good' }
      ];

      setSystemMetrics(metrics);

    } catch (error) {
      console.error('Erreur métriques:', error);
      throw error;
    }
  };

  const calculateSystemHealth = async (): Promise<number> => {
    try {
      // Vérifier la santé de différentes composantes du système
      const checks = await Promise.all([
        // Vérifier la connexion à la base de données
        supabase.from('profiles').select('count').limit(1),
        // Vérifier les tables essentielles
        supabase.from('appointments').select('count').limit(1),
        // Vérifier l'authentification
        supabase.auth.getSession()
      ]);

      // Compter les vérifications réussies
      const successfulChecks = checks.filter((check:any) => !check.error).length;
      const healthPercentage = (successfulChecks / checks.length) * 100;

      return Math.round(healthPercentage);

    } catch (error) {
      console.error('Erreur calcul santé système:', error);
      return 0;
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  // Fonction pour les données par défaut en cas d'erreur
  const setDefaultData = () => {
    setStats({
      totalUsers: 1247,
      totalDoctors: 18,
      totalSecretaries: 12,
      totalPatients: 1217,
      todayAppointments: 45,
      pendingAppointments: 12,
      completedAppointments: 33,
      activeSessions: 23,
      systemHealth: 98.5
    });

    setRecentActivity([
      {
        id: '1',
        type: 'login',
        user: 'Dr. Martin Dubois',
        action: 'Connexion au système',
        timestamp: 'Il y a 5 min',
        status: 'success'
      }
    ]);

    setSystemMetrics([
      { label: 'CPU', value: 45, status: 'good' },
      { label: 'Mémoire', value: 62, status: 'warning' },
      { label: 'Stockage', value: 78, status: 'warning' },
      { label: 'Réseau', value: 23, status: 'good' }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="w-4 h-4" />;
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'prescription': return <FileText className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="admin-dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chargement du dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="admin-dashboard" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
              <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme médicale</p>
            </div>
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {/* Period Selector */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {['today', 'week', 'month'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === 'today' ? 'Aujourd\'hui' : 
                   period === 'week' ? 'Cette semaine' : 'Ce mois'}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% ce mois
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RDV Aujourd'hui</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                <div className="flex items-center text-xs text-blue-600 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {stats.pendingAppointments} en attente
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions Actives</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSessions}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Tous connectés
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Santé Système</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.systemHealth}%</div>
                <div className={`flex items-center text-xs ${
                  stats.systemHealth >= 90 ? 'text-green-600' :
                  stats.systemHealth >= 70 ? 'text-yellow-600' : 'text-red-600'
                } mt-1`}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {stats.systemHealth >= 90 ? 'Excellent' :
                   stats.systemHealth >= 70 ? 'Bon' : 'Critique'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Distribution */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Répartition Utilisateurs</CardTitle>
                <CardDescription>Distribution des rôles dans le système</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Médecins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{stats.totalDoctors}</span>
                    <Badge variant="secondary">
                      {stats.totalUsers > 0 ? ((stats.totalDoctors / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Secrétaires</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{stats.totalSecretaries}</span>
                    <Badge variant="secondary">
                      {stats.totalUsers > 0 ? ((stats.totalSecretaries / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Patients</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{stats.totalPatients}</span>
                    <Badge variant="secondary">
                      {stats.totalUsers > 0 ? ((stats.totalPatients / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Metrics */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Métriques Système</CardTitle>
                <CardDescription>Performance des ressources serveur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className={`text-sm ${
                        metric.value < 70 ? 'text-green-600' :
                        metric.value < 85 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metric.value}%
                      </span>
                    </div>
                    <Progress 
                      value={metric.value} 
                      className={`h-2 ${
                        metric.value < 70 ? 'bg-green-100' :
                        metric.value < 85 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>Dernières actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune activité récente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                          {getStatusIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.user}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>Accès direct aux fonctionnalités administratives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => onNavigate('user-management')}
                >
                  <Users className="w-6 h-6" />
                  <span>Gestion Utilisateurs</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => onNavigate('system-reports')}
                >
                  <FileText className="w-6 h-6" />
                  <span>Rapports</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => onNavigate('security-center')}
                >
                  <Shield className="w-6 h-6" />
                  <span>Sécurité</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => onNavigate('system-settings')}
                >
                  <Database className="w-6 h-6" />
                  <span>Configuration</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}