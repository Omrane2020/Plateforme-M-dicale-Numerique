import { useState, useEffect } from 'react';
import { SecretarySidebar } from './SecretarySidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  Calendar, 
  Clock, 
  Bell,
  CheckCircle,
  XCircle,
  User,
  Phone,
  UserPlus,
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
//@ts-ignore
import { supabase } from '../supabaseClient';
import type { Page } from '../types/Page';

interface SecretaryDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  priority: 'high' | 'normal' | 'low';
  doctor_id: string;
  patient_id: string;
  created_at: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  last_visit: string;
  next_appointment: string;
}

interface Notification {
  id: string;
  type: 'appointment' | 'patient' | 'reminder' | 'system';
  message: string;
  created_at: string;
  is_read: boolean;
  priority: 'high' | 'normal' | 'low';
}

export function SecretaryDashboard({ onNavigate, onLogout }: SecretaryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // États pour les données
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    unreadNotifications: 0
  });

  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Charger les données du dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        fetchStats(),
        fetchPendingAppointments(),
        fetchRecentPatients(),
        fetchNotifications()
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
      // Récupérer le nombre total de patients
      const { count: patientsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'patient');

      // Récupérer les rendez-vous en attente
      const { count: pendingCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Récupérer les rendez-vous d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)
        .eq('status', 'confirmed');

      // Récupérer les notifications non lues
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('user_role', 'secretary');

      setStats({
        totalPatients: patientsCount || 0,
        pendingAppointments: pendingCount || 0,
        todayAppointments: todayCount || 0,
        unreadNotifications: notificationsCount || 0
      });

    } catch (error) {
      console.error('Erreur stats:', error);
      throw error;
    }
  };

  const fetchPendingAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients:profiles!appointments_patient_id_fkey(first_name, last_name, phone),
          doctors:profiles!appointments_doctor_id_fkey(first_name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedAppointments = data?.map((apt:any) => ({
        id: apt.id,
        patient_name: `${apt.patients?.first_name} ${apt.patients?.last_name}`,
        patient_phone: apt.patients?.phone || 'Non renseigné',
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        type: apt.reason || 'Consultation',
        status: apt.status as 'pending',
        priority: apt.priority as 'high' | 'normal' | 'low',
        doctor_id: apt.doctor_id,
        patient_id: apt.patient_id,
        created_at: apt.created_at
      })) || [];

      setPendingAppointments(formattedAppointments);

    } catch (error) {
      console.error('Erreur rendez-vous:', error);
      throw error;
    }
  };

  const fetchRecentPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'patient')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Pour chaque patient, récupérer le dernier rendez-vous
      const patientsWithAppointments = await Promise.all(
        data?.map(async (patient:any) => {
          const { data: lastAppointment } = await supabase
            .from('appointments')
            .select('appointment_date')
            .eq('patient_id', patient.id)
            .order('appointment_date', { ascending: false })
            .limit(1);

          const { data: nextAppointment } = await supabase
            .from('appointments')
            .select('appointment_date')
            .eq('patient_id', patient.id)
            .eq('status', 'confirmed')
            .gte('appointment_date', new Date().toISOString().split('T')[0])
            .order('appointment_date', { ascending: true })
            .limit(1);

          return {
            id: patient.id,
            name: `${patient.first_name} ${patient.last_name}`,
            age: patient.age || 0,
            phone: patient.phone || 'Non renseigné',
            last_visit: lastAppointment?.[0]?.appointment_date || 'Jamais',
            next_appointment: nextAppointment?.[0]?.appointment_date || 'Aucun'
          };
        }) || []
      );

      setRecentPatients(patientsWithAppointments);

    } catch (error) {
      console.error('Erreur patients:', error);
      throw error;
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_role', 'secretary')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedNotifications = data?.map((notif:any) => ({
        id: notif.id,
        type: notif.type as 'appointment' | 'patient' | 'reminder' | 'system',
        message: notif.message,
        created_at: notif.created_at,
        is_read: notif.is_read,
        priority: notif.priority as 'high' | 'normal' | 'low'
      })) || [];

      setNotifications(formattedNotifications);

    } catch (error) {
      console.error('Erreur notifications:', error);
      throw error;
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'reject') => {
    try {
      setActionLoading(appointmentId);
      
      const newStatus = action === 'accept' ? 'confirmed' : 'cancelled';
      
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Mettre à jour l'état local
      setPendingAppointments(prev => 
        prev.filter(apt => apt.id !== appointmentId)
      );

      // Mettre à jour les statistiques
      setStats(prev => ({
        ...prev,
        pendingAppointments: prev.pendingAppointments - 1
      }));

      // Créer une notification
      await supabase
        .from('notifications')
        .insert({
          type: 'appointment',
          message: `Rendez-vous ${action === 'accept' ? 'confirmé' : 'refusé'}`,
          user_role: 'secretary',
          priority: 'normal',
          metadata: { appointment_id: appointmentId, action }
        });

      toast.success(`Rendez-vous ${action === 'accept' ? 'accepté' : 'refusé'} avec succès`);

    } catch (error) {
      console.error('Erreur action rendez-vous:', error);
      toast.error('Erreur lors du traitement du rendez-vous');
    } finally {
      setActionLoading(null);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );

      setStats(prev => ({
        ...prev,
        unreadNotifications: Math.max(0, prev.unreadNotifications - 1)
      }));

    } catch (error) {
      console.error('Erreur marquer notification:', error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'normal':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Normal</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Faible</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'patient':
        return <User className="h-4 w-4 text-green-600" />;
      case 'reminder':
        return <Bell className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
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
      totalPatients: 89,
      pendingAppointments: 15,
      todayAppointments: 12,
      unreadNotifications: 8
    });

    setPendingAppointments([
      {
        id: '1',
        patient_name: "Marie Dubois",
        patient_phone: "06 12 34 56 78",
        appointment_date: "2024-01-20",
        appointment_time: "14:00",
        type: "Consultation générale",
        status: "pending",
        priority: "normal",
        doctor_id: '1',
        patient_id: '1',
        created_at: new Date().toISOString()
      }
    ]);

    setRecentPatients([
      {
        id: '1',
        name: "Marie Dubois",
        age: 45,
        phone: "06 12 34 56 78",
        last_visit: "2024-01-15",
        next_appointment: "2024-01-25"
      }
    ]);

    setNotifications([
      {
        id: '1',
        type: "appointment",
        message: "Nouvelle demande de RDV de Marie Dubois",
        created_at: new Date().toISOString(),
        is_read: false,
        priority: "high"
      }
    ]);
  };

  const statsCards = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Patients gérés",
      value: stats.totalPatients.toString(),
      change: "+12 ce mois",
      changeType: "positive" 
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      title: "RDV à traiter",
      value: stats.pendingAppointments.toString(),
      change: `${pendingAppointments.length} en attente`,
      changeType: "neutral" 
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "RDV aujourd'hui",
      value: stats.todayAppointments.toString(),
      change: "À confirmer",
      changeType: "neutral" 
    },
    {
      icon: <Bell className="h-6 w-6 text-purple-600" />,
      title: "Notifications",
      value: stats.unreadNotifications.toString(),
      change: "Non lues",
      changeType: "positive" 
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <SecretarySidebar 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          currentPage="secretary-dashboard"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SecretarySidebar 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        currentPage="secretary-dashboard"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl text-slate-800">Dashboard Secrétaire</h1>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button 
                onClick={() => onNavigate('secretary-appointments')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Gérer les RDV
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
          <p className="text-slate-600">
            Bonjour Sarah, gérez les patients et rendez-vous du Dr. Martin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          {statsCards.map((stat, index) => (
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Appointments */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-slate-800">Demandes de rendez-vous</CardTitle>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {pendingAppointments.length} en attente
                </Badge>
              </CardHeader>
              <CardContent>
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune demande de rendez-vous en attente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-slate-800">{appointment.patient_name}</h3>
                              {getPriorityBadge(appointment.priority)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{appointment.patient_phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(appointment.appointment_date).toLocaleDateString('fr-FR')} à {appointment.appointment_time}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-700">{appointment.type}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === appointment.id}
                            >
                              {actionLoading === appointment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accepter
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                              disabled={actionLoading === appointment.id}
                            >
                              {actionLoading === appointment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Refuser
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications et Patients récents */}
          <div>
            <Card className="shadow-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Aucune notification</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.is_read ? 'bg-slate-50' : 'bg-blue-50 border border-blue-200'
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-white p-2 rounded-full">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-800 mb-1">{notification.message}</p>
                            <p className="text-xs text-slate-500">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Patients */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Patients récents</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPatients.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Aucun patient récent</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-800">{patient.name}</p>
                            <p className="text-xs text-slate-600">
                              {patient.age} ans • {patient.phone}
                            </p>
                            <p className="text-xs text-slate-500">
                              Prochain RDV: {patient.next_appointment === 'Aucun' ? 'Aucun' : new Date(patient.next_appointment).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              <div className="grid md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => onNavigate('add-patient')}
                  className="h-20 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <UserPlus className="h-6 w-6" />
                  <span>Nouveau Patient</span>
                </Button>
                <Button 
                  onClick={() => onNavigate('secretary-appointments')}
                  className="h-20 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Calendar className="h-6 w-6" />
                  <span>Gérer RDV</span>
                </Button>
                <Button 
                  onClick={() => onNavigate('secretary-patient-management')}
                  className="h-20 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Users className="h-6 w-6" />
                  <span>Liste Patients</span>
                </Button>
                <Button 
                  className="h-20 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 flex flex-col items-center justify-center space-y-2" 
                  variant="outline"
                  onClick={() => onNavigate('secretary-notifications')}
                >
                  <Bell className="h-6 w-6" />
                  <span>Notifications</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}