import React, { useState } from 'react';
import { Header } from './Header';
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
  Heart,
  Activity,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

type Page = 'home' | 'login' | 'signup' | 'doctor-dashboard' | 'doctor-profile' | 'patient-management' | 'appointments' | 'patient-dashboard' | 'contact' | 'prescription' | 'secretary-dashboard' | 'secretary-management' | 'add-patient' | 'doctor-history' | 'patient-history' | 'request-appointment';

interface PatientHistoryProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface MedicalRecord {
  id: string;
  date: string;
  time: string;
  doctor: string;
  type: 'consultation' | 'prescription' | 'analysis' | 'surgery' | 'follow-up';
  diagnosis: string;
  treatment: string;
  notes: string;
  prescriptions: string[];
  nextAppointment?: string;
  status: 'completed' | 'cancelled' | 'no-show';
  documents: string[];
}

export function PatientHistory({ onNavigate, onLogout }: PatientHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Mock patient data
  const patientInfo = {
    name: 'Marie Dubois',
    age: 45,
    email: 'marie.dubois@email.com',
    phone: '06 12 34 56 78',
    address: '123 Rue de la Santé, 75014 Paris',
    bloodType: 'A+',
    allergies: ['Pénicilline', 'Arachides'],
    emergencyContact: 'Pierre Dubois - 06 23 45 67 89'
  };

  // Mock medical history data
  const medicalRecords: MedicalRecord[] = [
    {
      id: '1',
      date: '2024-01-18',
      time: '09:30',
      doctor: 'Dr. Martin',
      type: 'consultation',
      diagnosis: 'Hypertension artérielle légère',
      treatment: 'Modification du mode de vie, surveillance tensionnelle',
      notes: 'Tension stable. Continuer les mesures hygiéno-diététiques.',
      prescriptions: ['Amlodipine 5mg - 1cp/jour', 'Surveillance tensionnelle quotidienne'],
      nextAppointment: '2024-04-18',
      status: 'completed',
      documents: ['Ordonnance', 'Recommandations diététiques']
    },
    {
      id: '2',
      date: '2024-01-05',
      time: '14:00',
      doctor: 'Dr. Martin',
      type: 'analysis',
      diagnosis: 'Bilan sanguin de routine',
      treatment: 'Prise de sang, analyses biologiques',
      notes: 'Résultats dans les normes. Légère carence en vitamine D.',
      prescriptions: ['Vitamine D3 - 1 ampoule/mois'],
      status: 'completed',
      documents: ['Résultats analyses', 'Ordonnance vitamine D']
    },
    {
      id: '3',
      date: '2023-12-20',
      time: '10:15',
      doctor: 'Dr. Martin',
      type: 'consultation',
      diagnosis: 'Grippe saisonnière',
      treatment: 'Repos, hydratation, antipyrétiques',
      notes: 'Symptômes grippaux classiques. Évolution favorable.',
      prescriptions: ['Paracétamol 1g - 3 fois/jour', 'Repos pendant 5 jours'],
      status: 'completed',
      documents: ['Arrêt de travail', 'Ordonnance']
    },
    {
      id: '4',
      date: '2023-12-01',
      time: '11:30',
      doctor: 'Dr. Martin',
      type: 'follow-up',
      diagnosis: 'Suivi hypertension',
      treatment: 'Contrôle tensionnel, ajustement traitement',
      notes: 'Bonne observance du traitement. Tension bien contrôlée.',
      prescriptions: ['Continuation traitement actuel'],
      nextAppointment: '2024-01-18',
      status: 'completed',
      documents: ['Carnet de tension']
    },
    {
      id: '5',
      date: '2023-11-15',
      time: '16:00',
      doctor: 'Dr. Martin',
      type: 'consultation',
      diagnosis: 'Consultation préventive',
      treatment: 'Examen clinique complet, recommandations',
      notes: 'Bon état général. Recommandations préventives données.',
      prescriptions: [],
      nextAppointment: '2024-05-15',
      status: 'completed',
      documents: ['Fiche prévention']
    }
  ];

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || record.type === filterType;
    
    let matchesDate = true;
    if (filterDate === 'recent') {
      matchesDate = new Date(record.date) >= new Date('2024-01-01');
    } else if (filterDate === 'year') {
      matchesDate = new Date(record.date) >= new Date('2023-01-01');
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

  const stats = [
    {
      title: "Consultations totales",
      value: medicalRecords.length.toString(),
      icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
      change: "Depuis 2023"
    },
    {
      title: "Dernière visite",
      value: "18 Jan 2024",
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      change: "Dr. Martin"
    },
    {
      title: "Prescriptions actives",
      value: "2",
      icon: <Pill className="h-6 w-6 text-purple-600" />,
      change: "En cours"
    },
    {
      title: "Prochain RDV",
      value: "18 Avr 2024",
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      change: "Programmé"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onNavigate={onNavigate} 
        isAuthenticated={true} 
        userType="patient" 
        onLogout={onLogout} 
      />
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl text-slate-800 mb-2 flex items-center">
                <History className="h-8 w-8 mr-3 text-blue-600" />
                Mon Historique Médical
              </h1>
              <p className="text-slate-600">
                Consultez votre historique médical complet et vos documents
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => onNavigate('patient-dashboard')}>
                ← Retour Dashboard
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </div>

          {/* Patient Info Card */}
          <Card className="shadow-sm border-0 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Mes informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Nom complet</p>
                      <p className="text-slate-800">{patientInfo.name}, {patientInfo.age} ans</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-slate-600">Groupe sanguin</p>
                      <p className="text-slate-800">{patientInfo.bloodType}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-600">Téléphone</p>
                      <p className="text-slate-800">{patientInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="text-slate-800">{patientInfo.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Allergies connues</p>
                    <div className="flex flex-wrap gap-2">
                      {patientInfo.allergies.map((allergy, index) => (
                        <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Contact d'urgence</p>
                    <p className="text-slate-800 text-sm">{patientInfo.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  placeholder="Rechercher dans votre historique..."
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
              </SelectContent>
            </Select>
            
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute la période</SelectItem>
                <SelectItem value="recent">Récent (2024)</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Medical Records */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Mes consultations ({filteredRecords.length})
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
                              <h3 className="text-slate-800">{record.doctor}</h3>
                              {getTypeBadge(record.type)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                              <span>{record.time}</span>
                            </div>
                          </div>
                        </div>
                        <Eye className="h-4 w-4 text-slate-400" />
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-slate-600 mb-1">Diagnostic:</p>
                        <p className="text-slate-800 mb-3">{record.diagnosis}</p>
                        <p className="text-slate-600 mb-1">Traitement:</p>
                        <p className="text-slate-800">{record.treatment}</p>
                      </div>
                      
                      {record.prescriptions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-slate-600 text-sm mb-2">Prescriptions:</p>
                          <div className="space-y-1">
                            {record.prescriptions.map((prescription, index) => (
                              <div key={index} className="text-sm bg-green-50 text-green-800 p-2 rounded">
                                {prescription}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.documents.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-slate-600 text-sm mb-2">Documents disponibles:</p>
                          <div className="flex flex-wrap gap-2">
                            {record.documents.map((doc, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                <FileText className="h-3 w-3 mr-1" />
                                {doc}
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
                    <h4 className="text-slate-700 mb-2">Médecin</h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-800">{selectedRecord.doctor}</p>
                      <p className="text-sm text-slate-600">Cardiologue</p>
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
                    <h4 className="text-slate-700 mb-2">Notes du médecin</h4>
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

                  {selectedRecord.documents.length > 0 && (
                    <div>
                      <h4 className="text-slate-700 mb-2">Documents</h4>
                      <div className="space-y-2">
                        {selectedRecord.documents.map((doc, index) => (
                          <Button key={index} variant="outline" size="sm" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Télécharger {doc}
                          </Button>
                        ))}
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
