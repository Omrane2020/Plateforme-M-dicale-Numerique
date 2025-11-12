import { Header } from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar, 
  User, 
  FileText, 
  Heart, 
  Phone, 
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  MessageSquare,
  History,
  Loader
} from 'lucide-react';
import { useState, useEffect } from 'react';
//@ts-ignore
import { supabase } from '../supabaseClient';
import type { Page } from '../types/Page';

interface PatientDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Patient {
  id: string;
  name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  allergies: string[];
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: string;
}

interface MedicalRecord {
  id: string;
  visit_date: string;
  doctor: string;
  type: string;
  description: string;
  prescription: string;
}

export function PatientDashboard({ onNavigate, onLogout }: PatientDashboardProps) {
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [currentMedications, setCurrentMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Récupérer les rendez-vous
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (name, specialty)
        `)
        .eq('patient_id', patientData.id)
        .order('appointment_date', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      const formattedAppointments: Appointment[] = appointmentsData?.map((apt: any )=> ({
        id: apt.id,
        date: apt.appointment_date,
        time: apt.appointment_time,
        doctor: apt.doctors.name,
        specialty: apt.doctors.specialty,
        type: apt.type,
        status: apt.status as 'upcoming' | 'completed' | 'cancelled',
        location: apt.location
      })) || [];

      setAppointments(formattedAppointments);

      // Récupérer l'historique médical
      const { data: historyData, error: historyError } = await supabase
        .from('medical_history')
        .select(`
          *,
          doctors (name),
          prescriptions (notes)
        `)
        .eq('patient_id', patientData.id)
        .order('visit_date', { ascending: false })
        .limit(3);

      if (historyError) throw historyError;

      const formattedHistory: MedicalRecord[] = historyData?.map((record: any )=> ({
        id: record.id,
        visit_date: record.visit_date,
        doctor: record.doctors.name,
        type: record.type,
        description: record.description,
        prescription: record.prescriptions?.notes || ''
      })) || [];

      setMedicalHistory(formattedHistory);

      // Récupérer les médicaments actuels
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          medications (name)
        `)
        .eq('patient_id', patientData.id)
        .eq('status', 'active');

      if (medicationsError) throw medicationsError;

      const formattedMedications: Medication[] = medicationsData?.map((prescription:any )=> ({
        id: prescription.id,
        name: prescription.medications.name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration || 'Traitement continu',
        status: prescription.status
      })) || [];

      setCurrentMedications(formattedMedications);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">À venir</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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

  const upcomingAppointments = appointments.filter((apt:Appointment) => apt.status === 'upcoming');
  const recentAppointments = appointments.filter((apt: Appointment) => apt.status === 'completed').slice(0, 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-slate-600">Chargement de vos données...</p>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onNavigate={onNavigate} 
        isAuthenticated={true} 
        userType="patient" 
        onLogout={onLogout} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-slate-800 mb-2">Mon Espace Patient</h1>
          <p className="text-slate-600">
            Bonjour {patientInfo.name}, voici un aperçu de vos informations médicales
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Prochains RDV</p>
                  <p className="text-2xl text-slate-800">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Médecins traitants</p>
                  <p className="text-2xl text-slate-800">
                    {[...new Set(appointments.map(apt => apt.doctor))].length}
                  </p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Traitements actifs</p>
                  <p className="text-2xl text-slate-800">{currentMedications.length}</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Dernière visite</p>
                  <p className="text-2xl text-slate-800">
                    {recentAppointments.length > 0 ? 'Récente' : 'Aucune'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Patient Profile */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Mon Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl text-slate-800 mb-1">{patientInfo.name}</h3>
                  <p className="text-slate-600">{patientAge} ans</p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-slate-600 mr-2" />
                    <span className="text-slate-800">{patientInfo.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-slate-600 mr-2" />
                    <span className="text-slate-800">{patientInfo.phone}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-slate-600 mb-2">Informations médicales :</p>
                    <div className="space-y-1">
                      <p><span className="text-slate-600">Groupe sanguin :</span> {patientInfo.blood_type}</p>
                      <p><span className="text-slate-600">Allergies :</span> {patientInfo.allergies?.join(', ') || 'Aucune connue'}</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Modifier mon profil
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => onNavigate('request-appointment')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Demander un rendez-vous
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 justify-start"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter mon médecin
                  </Button>
                  <Button 
                    onClick={() => onNavigate('patient-history')}
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 justify-start"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Mon historique
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Appointments */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Mes prochains rendez-vous
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onNavigate('request-appointment')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Demander RDV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-slate-800 mb-1">{appointment.doctor}</h4>
                            <p className="text-sm text-slate-600 mb-1">{appointment.specialty} • {appointment.type}</p>
                            <p className="text-sm text-slate-500">
                              {formatDate(appointment.date)} à {appointment.time}
                            </p>
                            <p className="text-xs text-slate-500">{appointment.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(appointment.status)}
                          <div className="mt-2 flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">Aucun rendez-vous à venir</p>
                      <Button 
                        onClick={() => onNavigate('request-appointment')}
                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                      >
                        Prendre un rendez-vous
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Mes traitements actuels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMedications.length > 0 ? (
                    currentMedications.map((medication) => (
                      <div key={medication.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <h4 className="text-slate-800 mb-1">{medication.name}</h4>
                          <p className="text-sm text-slate-600">
                            {medication.dosage} • {medication.frequency}
                          </p>
                          <p className="text-xs text-slate-500">{medication.duration}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <Button size="sm" variant="outline">
                            <AlertCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">Aucun traitement actif</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Historique médical récent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalHistory.length > 0 ? (
                    medicalHistory.map((record) => (
                      <div key={record.id} className="p-4 border-l-4 border-blue-600 bg-blue-50 rounded-r-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-slate-800">{record.type}</h4>
                          <span className="text-sm text-slate-600">
                            {new Date(record.visit_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{record.doctor}</p>
                        <p className="text-slate-700 mb-2">{record.description}</p>
                        {record.prescription && (
                          <p className="text-sm text-blue-800">
                            <strong>Prescription :</strong> {record.prescription}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">Aucun historique médical</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Button 
                    onClick={() => onNavigate('patient-history')}
                    variant="outline" 
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Voir tout l'historique
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}