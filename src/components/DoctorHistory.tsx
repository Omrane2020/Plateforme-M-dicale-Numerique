import { useState } from 'react';
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
  Users
} from 'lucide-react';

import type { Page } from '../types/Page';
interface DoctorHistoryProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface HistoryRecord {
  id: string;
  date: string;
  time: string;
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
  nextAppointment?: string;
  status: 'completed' | 'cancelled' | 'no-show';
  duration: number; // en minutes
}

export function DoctorHistory({ onNavigate, onLogout }: DoctorHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  // Mock data for medical history
  const historyRecords: HistoryRecord[] = [
    {
      id: '1',
      date: '2024-01-18',
      time: '09:30',
      patient: { name: 'Marie Dubois', age: 45, id: 'P001' },
      type: 'consultation',
      diagnosis: 'Hypertension artérielle légère',
      treatment: 'Modification du mode de vie, surveillance tensionnelle',
      notes: 'Patiente motivée, bon suivi. Contrôle dans 3 mois.',
      prescriptions: ['Amlodipine 5mg', 'Surveillance tensionnelle'],
      nextAppointment: '2024-04-18',
      status: 'completed',
      duration: 30
    },
    {
      id: '2',
      date: '2024-01-18',
      time: '10:00',
      patient: { name: 'Jean Dupont', age: 52, id: 'P002' },
      type: 'follow-up',
      diagnosis: 'Diabète type 2 - Contrôle',
      treatment: 'Ajustement traitement, conseils diététiques',
      notes: 'HbA1c en amélioration. Continuer le traitement actuel.',
      prescriptions: ['Metformine 850mg', 'Contrôle glycémique'],
      status: 'completed',
      duration: 25
    },
    {
      id: '3',
      date: '2024-01-17',
      time: '14:30',
      patient: { name: 'Sophie Martin', age: 38, id: 'P003' },
      type: 'consultation',
      diagnosis: 'Bronchite aiguë',
      treatment: 'Antibiothérapie, repos, hydratation',
      notes: 'Symptômes depuis 5 jours. Pas de complications.',
      prescriptions: ['Amoxicilline 1g', 'Paracétamol 1g'],
      status: 'completed',
      duration: 20
    },
    {
      id: '4',
      date: '2024-01-17',
      time: '11:00',
      patient: { name: 'Pierre Lambert', age: 65, id: 'P004' },
      type: 'analysis',
      diagnosis: 'Bilan cardiaque de routine',
      treatment: 'ECG, échographie cardiaque',
      notes: 'Résultats normaux. Bonne fonction cardiaque.',
      prescriptions: [],
      nextAppointment: '2024-07-17',
      status: 'completed',
      duration: 45
    },
    {
      id: '5',
      date: '2024-01-16',
      time: '15:00',
      patient: { name: 'Anne Moreau', age: 29, id: 'P005' },
      type: 'prescription',
      diagnosis: 'Renouvellement contraception',
      treatment: 'Prescription contraceptive',
      notes: 'Pas d\'effets secondaires. Patiente satisfaite.',
      prescriptions: ['Pilule contraceptive'],
      nextAppointment: '2024-07-16',
      status: 'completed',
      duration: 15
    },
    {
      id: '6',
      date: '2024-01-16',
      time: '09:00',
      patient: { name: 'Robert Durand', age: 58, id: 'P006' },
      type: 'consultation',
      diagnosis: 'Douleurs lombaires chroniques',
      treatment: 'Kinésithérapie, anti-inflammatoires',
      notes: 'Amélioration depuis dernière consultation.',
      prescriptions: ['Ibuprofène 400mg', 'Séances kinésithérapie'],
      status: 'completed',
      duration: 35
    }
  ];

  const filteredRecords = historyRecords.filter(record => {
    const matchesSearch = record.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || record.type === filterType;
    
    let matchesDate = true;
    if (filterDate === 'today') {
      matchesDate = record.date === '2024-01-18';
    } else if (filterDate === 'week') {
      matchesDate = new Date(record.date) >= new Date('2024-01-12');
    } else if (filterDate === 'month') {
      matchesDate = new Date(record.date) >= new Date('2024-01-01');
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

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

  const stats = [
    {
      title: "Consultations totales",
      value: historyRecords.length.toString(),
      icon: <Users className="h-6 w-6 text-blue-600" />,
      change: "+12 ce mois"
    },
    {
      title: "Consultations aujourd'hui",
      value: historyRecords.filter(r => r.date === '2024-01-18').length.toString(),
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      change: "En cours"
    },
    {
      title: "Durée moyenne",
      value: `${Math.round(historyRecords.reduce((sum, r) => sum + r.duration, 0) / historyRecords.length)}min`,
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      change: "Optimisé"
    },
    {
      title: "Prescriptions",
      value: historyRecords.filter(r => r.prescriptions.length > 0).length.toString(),
      icon: <Pill className="h-6 w-6 text-orange-600" />,
      change: "Active"
    }
  ];

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
            <Button className="bg-blue-600 hover:bg-blue-700">
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
                  {filteredRecords.map((record) => (
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
                              <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                              <span>{record.time}</span>
                              <span>{record.duration}min</span>
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
                            {record.prescriptions.map((prescription, index) => (
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
                        <span className="text-slate-800">{new Date(selectedRecord.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Heure:</span>
                        <span className="text-slate-800">{selectedRecord.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Durée:</span>
                        <span className="text-slate-800">{selectedRecord.duration} minutes</span>
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
                        {selectedRecord.prescriptions.map((prescription, index) => (
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
                  
                  {selectedRecord.nextAppointment && (
                    <div>
                      <h4 className="text-slate-700 mb-2">Prochain RDV</h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {new Date(selectedRecord.nextAppointment).toLocaleDateString('fr-FR')}
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