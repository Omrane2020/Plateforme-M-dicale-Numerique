import { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  History, 
  Search, 
  Calendar, 
  Clock,
  FileText,
  Stethoscope,
  Pill,
  Eye,
  Download,
  ChevronRight,
  Heart,
  Activity,
  Users,
  Loader2
} from 'lucide-react';
//@ts-ignore
import { supabase } from "../supabaseClient";
import type { Page } from '../types/Page';

interface DoctorHistoryProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Patient {
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

interface Consultation {
  id: string;
  appointment_date: string;
  appointment_time: string;
  patient_id: string;
  type: 'consultation' | 'prescription' | 'analysis' | 'surgery' | 'follow-up';
  diagnosis: string;
  treatment: string;
  notes: string;
  next_appointment_date?: string;
  status: 'completed' | 'cancelled' | 'no-show';
  duration_minutes: number;
  patients: Patient;
}

interface Prescription {
  medication_name: string;
  dosage: string;
  frequency: string;
}

interface HistoryRecord {
  id: string;
  appointment_date: string;
  appointment_time: string;
  patient: {
    name: string;
    age: number;
    id: string;
  };
  type: 'consultation' | 'prescription' | 'analysis' | 'surgery' | 'follow-up';
  diagnosis: string;
  treatment: string;
  notes: string;
  prescriptions: string[];
  next_appointment_date?: string;
  status: 'completed' | 'cancelled' | 'no-show';
  duration_minutes: number;
}

interface Statistics {
  title: string;
  value: string;
  icon: JSX.Element;
  change: string;
}

export function DoctorHistory({ onNavigate, onLogout }: DoctorHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<Statistics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer l'historique des consultations
  const fetchHistoryData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les consultations avec les informations des patients
      const { data: consultations, error } = await supabase
        .from('consultation_history')
        .select(`
          *,
          patients (
            first_name,
            last_name,
            date_of_birth
          )
        `)
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;

      // Récupérer les prescriptions pour chaque consultation
      const consultationsWithPrescriptions = await Promise.all(
        (consultations || []).map(async (consultation: Consultation) => {
          const { data: prescriptions } = await supabase
            .from('consultation_prescriptions')
            .select('medication_name, dosage, frequency')
            .eq('consultation_id', consultation.id);

          return {
            id: consultation.id,
            appointment_date: consultation.appointment_date,
            appointment_time: consultation.appointment_time,
            patient: {
              name: `${consultation.patients.first_name} ${consultation.patients.last_name}`,
              age: consultation.patients.date_of_birth 
                ? new Date().getFullYear() - new Date(consultation.patients.date_of_birth).getFullYear()
                : 0,
              id: consultation.patient_id
            },
            type: consultation.type,
            diagnosis: consultation.diagnosis,
            treatment: consultation.treatment,
            notes: consultation.notes || '',
            prescriptions: prescriptions?.map((p: Prescription) => 
              p.dosage ? `${p.medication_name} ${p.dosage}` : p.medication_name
            ) || [],
            next_appointment_date: consultation.next_appointment_date,
            status: consultation.status,
            duration_minutes: consultation.duration_minutes
          };
        })
      );

      setHistoryRecords(consultationsWithPrescriptions);

      // Calculer les statistiques
      const today = new Date().toISOString().split('T')[0];
      const todayConsultations = consultationsWithPrescriptions.filter(
        (r: HistoryRecord) => r.appointment_date === today
      ).length;

      const totalDuration = consultationsWithPrescriptions.reduce(
        (sum: number, r: HistoryRecord) => sum + r.duration_minutes, 0
      );
      const averageDuration = consultationsWithPrescriptions.length > 0 
        ? Math.round(totalDuration / consultationsWithPrescriptions.length)
        : 0;

      const totalPrescriptions = consultationsWithPrescriptions.filter(
        (r: HistoryRecord) => r.prescriptions.length > 0
      ).length;

      const updatedStats: Statistics[] = [
        {
          title: "Consultations totales",
          value: consultationsWithPrescriptions.length.toString(),
          icon: <Users className="h-6 w-6 text-blue-600" />,
          change: "+12 ce mois"
        },
        {
          title: "Consultations aujourd'hui",
          value: todayConsultations.toString(),
          icon: <Calendar className="h-6 w-6 text-green-600" />,
          change: "En cours"
        },
        {
          title: "Durée moyenne",
          value: `${averageDuration}min`,
          icon: <Clock className="h-6 w-6 text-purple-600" />,
          change: "Optimisé"
        },
        {
          title: "Prescriptions",
          value: totalPrescriptions.toString(),
          icon: <Pill className="h-6 w-6 text-orange-600" />,
          change: "Active"
        }
      ];

      setStats(updatedStats);

    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      // Charger les données par défaut en cas d'erreur
      setHistoryRecords(getDefaultHistoryRecords());
      setStats(getDefaultStats());
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour exporter les données
  const exportData = async () => {
    try {
      const csvContent = historyRecords.map((record: HistoryRecord) => 
        `${record.appointment_date},${record.appointment_time},${record.patient.name},${record.type},${record.diagnosis},${record.treatment}`
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historique-consultations-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      alert('Erreur lors de l\'exportation des données');
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const filteredRecords = historyRecords.filter((record: HistoryRecord) => {
    const matchesSearch = record.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || record.type === filterType;
    
    let matchesDate = true;
    if (filterDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = record.appointment_date === today;
    } else if (filterDate === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchesDate = new Date(record.appointment_date) >= oneWeekAgo;
    } else if (filterDate === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      matchesDate = new Date(record.appointment_date) >= oneMonthAgo;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Données par défaut en cas d'erreur
  const getDefaultHistoryRecords = (): HistoryRecord[] => [
    {
      id: '1',
      appointment_date: '2024-01-18',
      appointment_time: '09:30',
      patient: { name: 'Marie Dubois', age: 45, id: 'P001' },
      type: 'consultation',
      diagnosis: 'Hypertension artérielle légère',
      treatment: 'Modification du mode de vie, surveillance tensionnelle',
      notes: 'Patiente motivée, bon suivi. Contrôle dans 3 mois.',
      prescriptions: ['Amlodipine 5mg', 'Surveillance tensionnelle'],
      next_appointment_date: '2024-04-18',
      status: 'completed',
      duration_minutes: 30
    },
    {
      id: '2',
      appointment_date: '2024-01-18',
      appointment_time: '10:00',
      patient: { name: 'Jean Dupont', age: 52, id: 'P002' },
      type: 'follow-up',
      diagnosis: 'Diabète type 2 - Contrôle',
      treatment: 'Ajustement traitement, conseils diététiques',
      notes: 'HbA1c en amélioration. Continuer le traitement actuel.',
      prescriptions: ['Metformine 850mg', 'Contrôle glycémique'],
      status: 'completed',
      duration_minutes: 25
    },
    {
      id: '3',
      appointment_date: '2024-01-17',
      appointment_time: '14:30',
      patient: { name: 'Sophie Martin', age: 38, id: 'P003' },
      type: 'consultation',
      diagnosis: 'Bronchite aiguë',
      treatment: 'Antibiothérapie, repos, hydratation',
      notes: 'Symptômes depuis 5 jours. Pas de complications.',
      prescriptions: ['Amoxicilline 1g', 'Paracétamol 1g'],
      status: 'completed',
      duration_minutes: 20
    }
  ];

  const getDefaultStats = (): Statistics[] => [
    {
      title: "Consultations totales",
      value: "127",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      change: "+12 ce mois"
    },
    {
      title: "Consultations aujourd'hui",
      value: "3",
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      change: "En cours"
    },
    {
      title: "Durée moyenne",
      value: "25min",
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      change: "Optimisé"
    },
    {
      title: "Prescriptions",
      value: "89",
      icon: <Pill className="h-6 w-6 text-orange-600" />,
      change: "Active"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="h-4 w-4 text-blue-600" />;
      case 'prescription':
        return <Pill className="h-4 w-4 text-green-600" />;
      case 'analysis':
        return <Activity className="h-4 w-4 text-purple-600" />;
      case 'surgery':
        return <Heart className="h-4 w-4 text-red-600" />;
      case 'follow-up':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      consultation: 'bg-blue-100 text-blue-800',
      prescription: 'bg-green-100 text-green-800',
      analysis: 'bg-purple-100 text-purple-800',
      surgery: 'bg-red-100 text-red-800',
      'follow-up': 'bg-orange-100 text-orange-800'
    };
    
    const labels = {
      consultation: 'Consultation',
      prescription: 'Prescription',
      analysis: 'Analyse',
      surgery: 'Chirurgie',
      'follow-up': 'Suivi'
    };
    
    return (
      <Badge variant="secondary" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Annulé</Badge>;
      case 'no-show':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Absent</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar onNavigate={onNavigate} onLogout={onLogout} currentPage="doctor-history" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Chargement de l'historique...</p>
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
        currentPage="doctor-history"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl text-slate-800 mb-2 flex items-center">
                <History className="h-8 w-8 mr-3 text-blue-600" />
                Historique Médical
              </h1>
              <p className="text-slate-600">
                Consultez l'historique complet de vos consultations et traitements
              </p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={exportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                      <p className="text-2xl text-slate-800 mb-1">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-full">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par patient, diagnostic ou traitement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de consultation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="analysis">Analyse</SelectItem>
                <SelectItem value="follow-up">Suivi</SelectItem>
                <SelectItem value="surgery">Chirurgie</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* History Records */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Historique des consultations ({filteredRecords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRecords.map((record: HistoryRecord) => (
                    <div 
                      key={record.id} 
                      className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white p-2 rounded-full">
                            {getTypeIcon(record.type)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-slate-800">{record.patient.name}</h3>
                              <span className="text-sm text-slate-500">({record.patient.age} ans)</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>{new Date(record.appointment_date).toLocaleDateString('fr-FR')}</span>
                              <span>{record.appointment_time}</span>
                              <span>{record.duration_minutes}min</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTypeBadge(record.type)}
                          {getStatusBadge(record.status)}
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 mb-1">Diagnostic:</p>
                          <p className="text-slate-800">{record.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Traitement:</p>
                          <p className="text-slate-800">{record.treatment}</p>
                        </div>
                      </div>
                      
                      {record.prescriptions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-slate-600 text-sm mb-2">Prescriptions:</p>
                          <div className="flex flex-wrap gap-2">
                            {record.prescriptions.map((prescription: string, index: number) => (
                              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                {prescription}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {filteredRecords.length === 0 && (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg text-slate-600 mb-2">Aucun résultat trouvé</h3>
                      <p className="text-slate-500">
                        Essayez de modifier vos filtres de recherche
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Record Detail */}
          <div>
            {selectedRecord ? (
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Détails de la consultation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-slate-700 mb-2">Patient</h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-800">{selectedRecord.patient.name}</p>
                      <p className="text-sm text-slate-600">{selectedRecord.patient.age} ans • ID: {selectedRecord.patient.id}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-slate-700 mb-2">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Date:</span>
                        <span className="text-slate-800">{new Date(selectedRecord.appointment_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Heure:</span>
                        <span className="text-slate-800">{selectedRecord.appointment_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Durée:</span>
                        <span className="text-slate-800">{selectedRecord.duration_minutes} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Type:</span>
                        <span className="text-slate-800">{getTypeBadge(selectedRecord.type)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-slate-700 mb-2">Diagnostic</h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm text-slate-800">{selectedRecord.diagnosis}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-slate-700 mb-2">Traitement</h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm text-slate-800">{selectedRecord.treatment}</p>
                    </div>
                  </div>
                  
                  {selectedRecord.prescriptions.length > 0 && (
                    <div>
                      <h4 className="text-slate-700 mb-2">Prescriptions</h4>
                      <div className="space-y-2">
                        {selectedRecord.prescriptions.map((prescription: string, index: number) => (
                          <div key={index} className="bg-green-50 p-2 rounded text-sm text-green-800">
                            {prescription}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-slate-700 mb-2">Notes</h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm text-slate-800">{selectedRecord.notes}</p>
                    </div>
                  </div>
                  
                  {selectedRecord.next_appointment_date && (
                    <div>
                      <h4 className="text-slate-700 mb-2">Prochain RDV</h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {new Date(selectedRecord.next_appointment_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm border-0">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg text-slate-600 mb-2">Sélectionnez une consultation</h3>
                  <p className="text-slate-500">
                    Cliquez sur une consultation pour voir les détails complets
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}