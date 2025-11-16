import  { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
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
  Shield
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Données simulées pour la démo
  const stats = {
    totalUsers: 1247,
    totalDoctors: 18,
    totalSecretaries: 12,
    totalPatients: 1217,
    todayAppointments: 45,
    pendingAppointments: 12,
    completedAppointments: 33,
    activeSessions: 23,
    systemHealth: 98.5
  };

  const recentActivity = [
    {
      id: 1,
      type: 'login',
      user: 'Dr. Martin Dubois',
      action: 'Connexion au système',
      timestamp: 'Il y a 5 min',
      status: 'success'
    },
    {
      id: 2,
      type: 'appointment',
      user: 'Marie Secrétaire',
      action: 'Nouveau RDV programmé',
      timestamp: 'Il y a 12 min',
      status: 'info'
    },
    {
      id: 3,
      type: 'prescription',
      user: 'Dr. Sophie Laurent',
      action: 'Prescription créée',
      timestamp: 'Il y a 18 min',
      status: 'success'
    },
    {
      id: 4,
      type: 'alert',
      user: 'Système',
      action: 'Tentative de connexion échouée',
      timestamp: 'Il y a 25 min',
      status: 'warning'
    },
    {
      id: 5,
      type: 'user',
      user: 'Admin',
      action: 'Nouveau médecin ajouté',
      timestamp: 'Il y a 1h',
      status: 'success'
    }
  ];

  const systemMetrics = [
    { label: 'CPU', value: 45, status: 'good' },
    { label: 'Mémoire', value: 62, status: 'warning' },
    { label: 'Stockage', value: 78, status: 'warning' },
    { label: 'Réseau', value: 23, status: 'good' }
  ];

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

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="admin-dashboard" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme médicale</p>
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
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Excellent
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
                    <Badge variant="secondary">1.4%</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Secrétaires</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{stats.totalSecretaries}</span>
                    <Badge variant="secondary">1.0%</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Patients</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{stats.totalPatients}</span>
                    <Badge variant="secondary">97.6%</Badge>
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
                      <span className="text-sm text-gray-500">{metric.value}%</span>
                    </div>
                    <Progress 
                      value={metric.value} 
                      className="h-2"
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