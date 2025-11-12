import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
//@ts-ignore
import { supabase } from '../supabaseClient';


interface SystemReportsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface ReportData {
  appointmentData: any[];
  userGrowthData: any[];
  specialityData: any[];
  performanceMetrics: any[];
  recentReports: any[];
}

export function SystemReports({ onNavigate, onLogout }: SystemReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    appointmentData: [],
    userGrowthData: [],
    specialityData: [],
    performanceMetrics: [],
    recentReports: []
  });

  // Charger les données des rapports
  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données depuis Supabase
      const [
        appointmentsData,
        usersData,
        specialitiesData,
        performanceData,
        reportsData
      ] = await Promise.all([
        fetchAppointmentStats(),
        fetchUserGrowthStats(),
        fetchSpecialityStats(),
        fetchPerformanceMetrics(),
        fetchRecentReports()
      ]);

      setReportData({
        appointmentData: appointmentsData,
        userGrowthData: usersData,
        specialityData: specialitiesData,
        performanceMetrics: performanceData,
        recentReports: reportsData
      });

    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast.error('Erreur lors du chargement des données');
      // Charger des données par défaut en cas d'erreur
      setReportData(getDefaultData());
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  // Fonctions pour récupérer les données depuis Supabase
  const fetchAppointmentStats = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('created_at', getDateRange(selectedPeriod))
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transformer les données pour le graphique
      return transformAppointmentData(data || []);
    } catch (error) {
      console.error('Erreur stats rendez-vous:', error);
      return getDefaultAppointmentData();
    }
  };

  const fetchUserGrowthStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, created_at')
        .gte('created_at', getDateRange(selectedPeriod))
        .order('created_at', { ascending: true });

      if (error) throw error;

      return transformUserGrowthData(data || []);
    } catch (error) {
      console.error('Erreur stats utilisateurs:', error);
      return getDefaultUserGrowthData();
    }
  };

  const fetchSpecialityStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('specialty')
        .eq('user_type', 'doctor')
        .not('specialty', 'is', null);

      if (error) throw error;

      return transformSpecialityData(data || []);
    } catch (error) {
      console.error('Erreur stats spécialités:', error);
      return getDefaultSpecialityData();
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      // Récupérer diverses métriques de performance
      const [
        satisfactionRate,
        waitTime,
        occupancyRate,
        cancellationRate
      ] = await Promise.all([
        calculateSatisfactionRate(),
        calculateAverageWaitTime(),
        calculateOccupancyRate(),
        calculateCancellationRate()
      ]);

      return [
        {
          title: 'Taux de satisfaction',
          value: satisfactionRate,
          change: '+2.3%',
          trend: 'up',
          description: 'Satisfaction moyenne des patients'
        },
        {
          title: 'Temps d\'attente moyen',
          value: waitTime,
          change: '-3 min',
          trend: 'up',
          description: 'Temps d\'attente pour un RDV'
        },
        {
          title: 'Taux d\'occupation',
          value: occupancyRate,
          change: '+5%',
          trend: 'up',
          description: 'Occupation des créneaux médecins'
        },
        {
          title: 'Taux d\'annulation',
          value: cancellationRate,
          change: '-1.1%',
          trend: 'up',
          description: 'Annulations de rendez-vous'
        }
      ];
    } catch (error) {
      console.error('Erreur métriques performance:', error);
      return getDefaultPerformanceMetrics();
    }
  };

  const fetchRecentReports = async () => {
    try {
      const { data, error } = await supabase
        .from('system_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map((report:any) => ({
        id: report.id,
        title: report.title,
        type: report.report_type,
        date: report.created_at,
        status: report.status,
        size: report.file_size,
        download_url: report.download_url
      })) || [];
    } catch (error) {
      console.error('Erreur rapports récents:', error);
      return getDefaultRecentReports();
    }
  };

  // Fonctions de calcul des métriques
  const calculateSatisfactionRate = async () => {
    // Implémentation simplifiée - à adapter selon votre schéma
    return '94.5%';
  };

  const calculateAverageWaitTime = async () => {
    // Implémentation simplifiée
    return '12 min';
  };

  const calculateOccupancyRate = async () => {
    // Implémentation simplifiée
    return '87%';
  };

  const calculateCancellationRate = async () => {
    // Implémentation simplifiée
    return '8.2%';
  };

  // Fonctions de transformation des données
  const transformAppointmentData = (appointments: any[]) => {
    // Logique de transformation des données de rendez-vous
    // Retourne les données formatées pour le graphique
    return getDefaultAppointmentData(); // Temporaire
  };

  const transformUserGrowthData = (users: any[]) => {
    // Logique de transformation des données utilisateurs
    return getDefaultUserGrowthData(); // Temporaire
  };

  const transformSpecialityData = (doctors: any[]) => {
    // Logique de transformation des données spécialités
    return getDefaultSpecialityData(); // Temporaire
  };

  // Fonctions utilitaires
  const getDateRange = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      default:
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Échoué</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const handleDownloadReport = async (report: any) => {
    try {
      if (report.download_url) {
        // Télécharger le rapport depuis Supabase Storage
        const { data, error } = await supabase.storage
          .from('reports')
          .download(report.download_url);

        if (error) throw error;

        // Créer un lien de téléchargement
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Rapport téléchargé avec succès');
      } else {
        toast.info('Aucun fichier disponible pour ce rapport');
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleExportData = async () => {
  try {
    // Générer un rapport complet
    const exportData = {
      timestamp: new Date().toISOString(),
      period: selectedPeriod,
      metrics: reportData.performanceMetrics,
      appointments: reportData.appointmentData,
      users: reportData.userGrowthData,
      specialities: reportData.specialityData
    };

    // Créer et télécharger le fichier JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-systeme-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Données exportées avec succès');
  } catch (error) {
    console.error('Erreur export:', error);
    toast.error('Erreur lors de l\'exportation');
  }
};


  // Données par défaut (fallback)
  const getDefaultData = (): ReportData => ({
    appointmentData: getDefaultAppointmentData(),
    userGrowthData: getDefaultUserGrowthData(),
    specialityData: getDefaultSpecialityData(),
    performanceMetrics: getDefaultPerformanceMetrics(),
    recentReports: getDefaultRecentReports()
  });

  const getDefaultAppointmentData = () => [
    { month: 'Jan', rdv: 120, completés: 110, annulés: 10 },
    { month: 'Fév', rdv: 145, completés: 135, annulés: 15 },
    { month: 'Mar', rdv: 165, completés: 155, annulés: 10 },
    { month: 'Avr', rdv: 180, completés: 170, annulés: 10 },
    { month: 'Mai', rdv: 190, completés: 175, annulés: 15 },
    { month: 'Jun', rdv: 210, completés: 195, annulés: 15 },
  ];

  const getDefaultUserGrowthData = () => [
    { month: 'Jan', patients: 850, médecins: 15, secrétaires: 8 },
    { month: 'Fév', patients: 920, médecins: 16, secrétaires: 9 },
    { month: 'Mar', patients: 1050, médecins: 17, secrétaires: 10 },
    { month: 'Avr', patients: 1120, médecins: 17, secrétaires: 11 },
    { month: 'Mai', patients: 1180, médecins: 18, secrétaires: 12 },
    { month: 'Jun', patients: 1247, médecins: 18, secrétaires: 12 },
  ];

  const getDefaultSpecialityData = () => [
    { name: 'Cardiologie', value: 35, color: '#3B82F6' },
    { name: 'Neurologie', value: 28, color: '#10B981' },
    { name: 'Orthopédie', value: 20, color: '#F59E0B' },
    { name: 'Dermatologie', value: 12, color: '#EF4444' },
    { name: 'Autres', value: 5, color: '#8B5CF6' },
  ];

  const getDefaultPerformanceMetrics = () => [
    {
      title: 'Taux de satisfaction',
      value: '94.5%',
      change: '+2.3%',
      trend: 'up',
      description: 'Satisfaction moyenne des patients'
    },
    {
      title: 'Temps d\'attente moyen',
      value: '12 min',
      change: '-3 min',
      trend: 'up',
      description: 'Temps d\'attente pour un RDV'
    },
    {
      title: 'Taux d\'occupation',
      value: '87%',
      change: '+5%',
      trend: 'up',
      description: 'Occupation des créneaux médecins'
    },
    {
      title: 'Taux d\'annulation',
      value: '8.2%',
      change: '-1.1%',
      trend: 'up',
      description: 'Annulations de rendez-vous'
    }
  ];

  const getDefaultRecentReports = () => [
    {
      id: 1,
      title: 'Rapport mensuel - Janvier 2024',
      type: 'Rapport d\'activité',
      date: '2024-02-01',
      status: 'completed',
      size: '2.3 MB'
    },
    {
      id: 2,
      title: 'Analyse de performance Q1',
      type: 'Analyse',
      date: '2024-01-28',
      status: 'processing',
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'Statistiques utilisateurs',
      type: 'Statistiques',
      date: '2024-01-25',
      status: 'completed',
      size: '945 KB'
    },
    {
      id: 4,
      title: 'Rapport de sécurité',
      type: 'Sécurité',
      date: '2024-01-20',
      status: 'completed',
      size: '1.2 MB'
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="system-reports" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chargement des rapports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="system-reports" />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rapports & Analytics</h1>
              <p className="text-gray-600 mt-2">Analyse des performances et statistiques détaillées</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={refreshData} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {reportData.performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className={`text-xs mt-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change} vs mois précédent
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList>
              <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="specialities">Spécialités</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des Rendez-vous</CardTitle>
                  <CardDescription>
                    Statistiques des rendez-vous sur les 6 derniers mois
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.appointmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="rdv" stroke="#3B82F6" strokeWidth={2} name="Total RDV" />
                      <Line type="monotone" dataKey="completés" stroke="#10B981" strokeWidth={2} name="Complétés" />
                      <Line type="monotone" dataKey="annulés" stroke="#EF4444" strokeWidth={2} name="Annulés" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Croissance des Utilisateurs</CardTitle>
                  <CardDescription>
                    Évolution du nombre d'utilisateurs par mois
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patients" fill="#3B82F6" name="Patients" />
                      <Bar dataKey="médecins" fill="#10B981" name="Médecins" />
                      <Bar dataKey="secrétaires" fill="#F59E0B" name="Secrétaires" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specialities" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Spécialité</CardTitle>
                    <CardDescription>
                      Distribution des rendez-vous par spécialité médicale
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.specialityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props: any) => {
                            const name = props.name ?? props.payload?.name ?? '';
                            const percent =
                              typeof props.percent === 'number'
                                ? props.percent
                                : typeof props.payload?.percent === 'number'
                                ? props.payload.percent
                                : props.total && props.value
                                ? props.value / props.total
                                : 0;
                            const percentNum = isFinite(percent) ? percent * 100 : 0;
                            return `${name} ${percentNum.toFixed(0)}%`;
                          }}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportData.specialityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Spécialités</CardTitle>
                    <CardDescription>Classement par volume d'activité</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reportData.specialityData.map((speciality, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: speciality.color }}
                          ></div>
                          <span className="font-medium">{speciality.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{speciality.value}%</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rapports Récents</CardTitle>
                  <CardDescription>
                    Historique des rapports générés automatiquement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{report.type}</span>
                              <span>•</span>
                              <span>{new Date(report.date).toLocaleDateString('fr-FR')}</span>
                              <span>•</span>
                              <span>{report.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(report.status)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}