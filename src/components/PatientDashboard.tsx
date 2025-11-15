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

} from 'lucide-react';

import type { Page } from '../types/Page';
interface PatientDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function PatientDashboard({ onNavigate, onLogout }: PatientDashboardProps) {
  const patientInfo = {
    name: 'Marie Dubois',
    age: 45,
    email: 'marie.dubois@email.com',
    phone: '+33 1 23 45 67 89',
    address: '12 rue de la Paix, 75001 Paris',
    bloodType: 'A+',
    allergies: ['Pénicilline', 'Arachides']
  };

  const appointments = [
    {
      id: '1',
      date: '2024-01-22',
      time: '14:00',
      doctor: 'Dr. Pierre Martin',
      specialty: 'Cardiologie',
      type: 'Suivi traitement',
      status: 'upcoming' as const,
      location: 'Cabinet médical - 15 rue de la Santé'
    },
    {
      id: '2',
      date: '2024-02-15',
      time: '10:30',
      doctor: 'Dr. Sophie Lambert',
      specialty: 'Médecine générale',
      type: 'Consultation de routine',
      status: 'upcoming' as const,
      location: 'Clinique des Champs'
    },
    {
      id: '3',
      date: '2024-01-15',
      time: '09:00',
      doctor: 'Dr. Pierre Martin',
      specialty: 'Cardiologie',
      type: 'Contrôle tension',
      status: 'completed' as const,
      location: 'Cabinet médical - 15 rue de la Santé'
    }
  ];

  const medicalHistory = [
    {
      date: '2024-01-15',
      doctor: 'Dr. Pierre Martin',
      type: 'Consultation',
      description: 'Contrôle de la tension artérielle - Résultats normaux',
      prescription: 'Continuer le traitement actuel'
    },
    {
      date: '2023-12-20',
      doctor: 'Dr. Sophie Lambert',
      type: 'Bilan sanguin',
      description: 'Analyses complètes - Cholestérol légèrement élevé',
      prescription: 'Régime alimentaire adapté'
    },
    {
      date: '2023-11-10',
      doctor: 'Dr. Pierre Martin',
      type: 'Consultation',
      description: 'Suivi traitement hypertension',
      prescription: 'Ajustement posologie'
    }
  ];

  const currentMedications = [
    { name: 'Amlodipine', dosage: '5mg', frequency: '1 fois/jour', duration: 'Traitement continu' },
    { name: 'Lisinopril', dosage: '10mg', frequency: '1 fois/jour', duration: 'Traitement continu' },
    { name: 'Aspirine', dosage: '75mg', frequency: '1 fois/jour', duration: 'Traitement continu' }
  ];

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

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');

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
                  <p className="text-2xl text-slate-800">2</p>
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
                  <p className="text-2xl text-slate-800">3j</p>
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
                  <p className="text-slate-600">{patientInfo.age} ans</p>
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
                      <p><span className="text-slate-600">Groupe sanguin :</span> {patientInfo.bloodType}</p>
                      <p><span className="text-slate-600">Allergies :</span> {patientInfo.allergies.join(', ')}</p>
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
                  {upcomingAppointments.map((appointment) => (
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
                  ))}
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
                  {currentMedications.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
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
                  ))}
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
                  {medicalHistory.slice(0, 3).map((record, index) => (
                    <div key={index} className="p-4 border-l-4 border-blue-600 bg-blue-50 rounded-r-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-slate-800">{record.type}</h4>
                        <span className="text-sm text-slate-600">
                          {new Date(record.date).toLocaleDateString('fr-FR')}
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
                  ))}
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