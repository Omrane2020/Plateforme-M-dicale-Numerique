import { useState, useEffect } from 'react';
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
  Loader,
  AlertCircle
} from 'lucide-react';
//@ts-ignore
import { supabase } from '../supabaseClient';
import type { Page } from '../types/Page';

interface PatientHistoryProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface MedicalRecord {
  id: string;
  visit_date: string;
  visit_time: string;
  doctor: string;
  doctor_specialty: string;
  type: 'consultation' | 'prescription' | 'analysis' | 'surgery' | 'follow-up';
  diagnosis: string;
  treatment: string;
  notes: string;
  prescriptions: string[];
  next_appointment_date?: string;
  status: 'completed' | 'cancelled' | 'no-show';
  documents: string[];
}

interface PatientInfo {
  id: string;
  name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  allergies: string[];
  emergency_contact?: string;
}

export function PatientHistory({ onNavigate, onLogout }: PatientHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConsultations: 0,
    lastVisit: '',
    activePrescriptions: 0,
    nextAppointment: ''
  });

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onLogout();
        return;
      }

      // Récupérer les informations du patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;
      setPatientInfo(patientData);

      // Récupérer l'historique médical avec les données du médecin
      const { data: historyData, error: historyError } = await supabase
        .from('medical_history')
        .select(`
          *,
          doctors (name, specialty)
        `)
        .eq('patient_id', patientData.id)
        .order('visit_date', { ascending: false });

      if (historyError) throw historyError;

      // Récupérer les prescriptions pour chaque enregistrement
      const recordsWithPrescriptions = await Promise.all(
        (historyData || []).map(async (record:any) => {
          const { data: prescriptionsData } = await supabase
            .from('medical_prescriptions')
            .select('*')
            .eq('medical_history_id', record.id);

          const prescriptions = prescriptionsData?.map((prescription:any) => 
            `${prescription.medication_name} ${prescription.dosage} - ${prescription.frequency}`
          ) || [];

          // Récupérer les documents
          const { data: documentsData } = await supabase
            .from('medical_documents')
            .select('document_name')
            .eq('medical_history_id', record.id);

          const documents = documentsData?.map((doc:any) => doc.document_name) || [];

          return {
            id: record.id,
            visit_date: record.visit_date,
            visit_time: record.visit_time,
            doctor: record.doctors.name,
            doctor_specialty: record.doctors.specialty,
            type: record.type as 'consultation' | 'prescription' | 'analysis' | 'surgery' | 'follow-up',
            diagnosis: record.diagnosis || '',
            treatment: record.treatment || '',
            notes: record.notes || '',
            prescriptions,
            next_appointment_date: record.next_appointment_date,
            status: record.status as 'completed' | 'cancelled' | 'no-show',
            documents
          };
        })
      );

      setMedicalRecords(recordsWithPrescriptions);

      // Calculer les statistiques
      const totalConsultations = recordsWithPrescriptions.length;
      const lastVisit = recordsWithPrescriptions[0]?.visit_date || '';
      const activePrescriptions = recordsWithPrescriptions.reduce((count :any, record:any) => 
        count + record.prescriptions.length, 0
      );
      
      // Trouver le prochain rendez-vous
      const today = new Date().toISOString().split('T')[0];
      const nextAppointmentRecord = recordsWithPrescriptions
        .filter((record:any) => record.next_appointment_date && record.next_appointment_date >= today)
        .sort((a:any, b:any) => new Date(a.next_appointment_date!).getTime() - new Date(b.next_appointment_date!).getTime())[0];

      setStats({
        totalConsultations,
        lastVisit,
        activePrescriptions,
        nextAppointment: nextAppointmentRecord?.next_appointment_date || ''
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || record.type === filterType;
    
    let matchesDate = true;
    if (filterDate === 'recent') {
      const currentYear = new Date().getFullYear();
      matchesDate = new Date(record.visit_date).getFullYear() === currentYear;
    } else if (filterDate === 'year') {
      const lastYear = new Date().getFullYear() - 1;
      matchesDate = new Date(record.visit_date).getFullYear() >= lastYear;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-slate-600">Chargement de votre historique...</p>
        </div>
      </div>
    );
  }

  if (!patientInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-slate-800 mb-2">Profil non trouvé</h2>
          <p className="text-slate-600 mb-4">Veuillez contacter l'administrateur</p>
          <Button onClick={onLogout}>Se déconnecter</Button>
        </div>
      </div>
    );
  }

  const patientAge = calculateAge(patientInfo.date_of_birth);

  const displayStats = [
    {
      title: "Consultations totales",
      value: stats.totalConsultations.toString(),
      icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
      change: "Depuis le début"
    },
    {
      title: "Dernière visite",
      value: stats.lastVisit ? formatDate(stats.lastVisit) : "Aucune",
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      change: stats.lastVisit ? "Dernier suivi" : "Pas de visite"
    },
    {
      title: "Prescriptions actives",
      value: stats.activePrescriptions.toString(),
      icon: <Pill className="h-6 w-6 text-purple-600" />,
      change: "En cours"
    },
    {
      title: "Prochain RDV",
      value: stats.nextAppointment ? formatDate(stats.nextAppointment) : "Aucun",
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      change: stats.nextAppointment ? "Programmé" : "À planifier"
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
                      <p className="text-slate-800">{patientInfo.name}, {patientAge} ans</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-slate-600">Groupe sanguin</p>
                      <p className="text-slate-800">{patientInfo.blood_type}</p>
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
                      {patientInfo.allergies && patientInfo.allergies.length > 0 ? (
                        patientInfo.allergies.map((allergy, index) => (
                          <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-600 text-sm">Aucune allergie connue</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Contact d'urgence</p>
                    <p className="text-slate-800 text-sm">{patientInfo.emergency_contact || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {displayStats.map((stat, index) => (
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
                <SelectItem value="recent">Récent (cette année)</SelectItem>
                <SelectItem value="year">Cette année et dernière</SelectItem>
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
                              <span>{formatDate(record.visit_date)}</span>
                              <span>{record.visit_time}</span>
                            </div>
                          </div>
                        </div>
                        <Eye className="h-4 w-4 text-slate-400" />
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-slate-600 mb-1">Diagnostic:</p>
                        <p className="text-slate-800 mb-3">{record.diagnosis || 'Non spécifié'}</p>
                        <p className="text-slate-600 mb-1">Traitement:</p>
                        <p className="text-slate-800">{record.treatment || 'Non spécifié'}</p>
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
                      <p className="text-sm text-slate-600">{selectedRecord.doctor_specialty}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-slate-700 mb-2">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Date:</span>
                        <span className="text-slate-800">{formatDate(selectedRecord.visit_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Heure:</span>
                        <span className="text-slate-800">{selectedRecord.visit_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Type:</span>
                        <span>{getTypeBadge(selectedRecord.type)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-slate-700 mb-2">Diagnostic</h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm text-slate-800">{selectedRecord.diagnosis || 'Non spécifié'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-slate-700 mb-2">Traitement</h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm text-slate-800">{selectedRecord.treatment || 'Non spécifié'}</p>
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
                      <p className="text-sm text-slate-800">{selectedRecord.notes || 'Aucune note'}</p>
                    </div>
                  </div>
                  
                  {selectedRecord.next_appointment_date && (
                    <div>
                      <h4 className="text-slate-700 mb-2">Prochain RDV</h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {formatDate(selectedRecord.next_appointment_date)}
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