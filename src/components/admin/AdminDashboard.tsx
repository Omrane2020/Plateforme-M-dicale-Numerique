import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import API from '../../services/api';
import {
  Users,
  Calendar,
  FileText,
  Activity,
  AlertTriangle,
  Clock,
  UserCheck,
  Server,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [stats, setStats] = useState<any>({
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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsRes = await API.get('/admin/dashboard/stats', { params: { period: selectedPeriod } });
      const recentRes = await API.get('/admin/dashboard/recent-activity', { params: { period: selectedPeriod, t: Date.now() } });
      const metricsRes = await API.get('/admin/dashboard/system-metrics');

      setStats(statsRes.data);
      setRecentActivity(recentRes.data);
      setSystemMetrics(metricsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

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
                  {period === 'today' ? "Aujourd'hui" :
                    period === 'week' ? 'Cette semaine' : 'Ce mois'}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading / Error */}
          {loading && <p className="text-gray-500">Chargement des données...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers?.toLocaleString() ?? 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RDV Aujourd'hui</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.todayAppointments ?? 0}</div>
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
                    <div className="text-2xl font-bold">{stats.activeSessions ?? 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Santé Système</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.systemHealth ?? 0}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <Card>
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
                              {activity.User ? `${activity.User.firstName} ${activity.User.lastName}` : 'Système'}
                            </p>

                            <p className="text-sm text-gray-500 truncate">{activity.action}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : '-'}
                            </p>                          </div>
                        </div>
                      ))}


                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
