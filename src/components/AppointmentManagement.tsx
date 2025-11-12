import { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
// @ts-ignore
import { supabase } from "../supabaseClient";
import type { Page } from '../types/Page';

interface AppointmentManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface AppointmentPatient {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  id?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  patient: AppointmentPatient;
  type: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  duration_minutes: number;
  notes?: string;
}

interface NewAppointmentData {
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  duration_minutes: number;
  notes?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

interface AppointmentType {
  id: string;
  name: string;
  description: string;
  default_duration: number;
  color: string;
}

interface DoctorPatientRelationship {
  patient: Patient;
}

export function AppointmentManagement({ onNavigate, onLogout }: AppointmentManagementProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  
  const [newAppointment, setNewAppointment] = useState<NewAppointmentData>({
    patient_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    type: '',
    duration_minutes: 30,
    notes: ''
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Récupérer les rendez-vous
  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name, phone, email)
        `)
        .eq('doctor_id', user.id)
        .eq('appointment_date', selectedDateStr)
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer la liste des patients
  const fetchPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les patients du docteur via les relations
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('doctor_patient_relationships')
        .select(`
          patient:patients(id, first_name, last_name, phone, email)
        `)
        .eq('doctor_id', user.id)
        .eq('status', 'active');

      if (relationshipsError) throw relationshipsError;

      const patientsData = (relationshipsData || []).map((rel: DoctorPatientRelationship) => rel.patient);
      setPatients(patientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    }
  };

  // Récupérer les types de consultation
  const fetchAppointmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_types')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setAppointmentTypes(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des types de consultation:', error);
    }
  };

  // Créer un nouveau rendez-vous
  const createAppointment = async () => {
    if (!newAppointment.patient_id || !newAppointment.type) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            ...newAppointment,
            doctor_id: user.id,
            status: 'scheduled',
            created_by: user.id
          }
        ]);

      if (error) throw error;

      // Réinitialiser le formulaire
      setNewAppointment({
        patient_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '09:00',
        type: '',
        duration_minutes: 30,
        notes: ''
      });

      setShowNewAppointmentDialog(false);
      fetchAppointments(); // Recharger les rendez-vous
      
      alert('Rendez-vous créé avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      alert('Erreur lors de la création du rendez-vous: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Mettre à jour le statut d'un rendez-vous
  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      fetchAppointments(); // Recharger les rendez-vous
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    if (showNewAppointmentDialog) {
      fetchPatients();
      fetchAppointmentTypes();
    }
  }, [showNewAppointmentDialog]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'scheduled':
      case 'confirmed':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">À venir</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Annulé</Badge>;
      case 'no-show':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Absent</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getAppointmentForTimeSlot = (time: string) => {
    return appointments.find(apt => 
      apt.appointment_time.substring(0, 5) === time && 
      apt.appointment_date === selectedDate.toISOString().split('T')[0]
    );
  };

  const todayAppointments = appointments.filter(apt =>
    apt.appointment_date === new Date().toISOString().split('T')[0]
  );

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' || apt.status === 'confirmed'
  ).length;

  const completedToday = appointments.filter(apt =>
    apt.appointment_date === new Date().toISOString().split('T')[0] && 
    apt.status === 'completed'
  ).length;

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getPatientFullName = (patient: AppointmentPatient | Patient) => {
    return `${patient.first_name} ${patient.last_name}`;
  };

  // Fonction pour naviguer vers les détails du patient
  const handleViewPatientDetails = () => {
    onNavigate('patient-management' as Page);
  };

  // Fonction pour naviguer vers les rapports
  const handleViewReports = () => {
    onNavigate('doctor-dashboard' as Page);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar onNavigate={onNavigate} onLogout={onLogout} currentPage="appointments" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Chargement des rendez-vous...</p>
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
        currentPage="appointments"
      />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Gestion des Rendez-vous</h1>
            <p className="text-slate-600">
              Gérez votre planning et vos consultations
            </p>
          </div>
          <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">
              <DialogHeader className="border-b pb-2">
                <DialogTitle className="text-xl font-semibold text-gray-800">Créer un nouveau rendez-vous</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Remplissez les informations pour créer un rendez-vous
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-select">Patient *</Label>
                  <Select 
                    value={newAppointment.patient_id} 
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, patient_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {getPatientFullName(patient)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-date">Date *</Label>
                  <Input 
                    id="rdv-date" 
                    type="date" 
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-time">Heure *</Label>
                  <Input 
                    id="rdv-time" 
                    type="time" 
                    value={newAppointment.appointment_time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-type">Type de consultation *</Label>
                  <Select 
                    value={newAppointment.type} 
                    onValueChange={(value) => {
                      const selectedType = appointmentTypes.find(type => type.name === value);
                      setNewAppointment(prev => ({ 
                        ...prev, 
                        type: value,
                        duration_minutes: selectedType?.default_duration || 30
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name} ({type.default_duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-duration">Durée (minutes) *</Label>
                  <Select 
                    value={newAppointment.duration_minutes.toString()} 
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration_minutes: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-notes">Notes médicales (optionnel)</Label>
                  <Input 
                    id="rdv-notes" 
                    placeholder="Notes pour le rendez-vous..." 
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={createAppointment}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer le rendez-vous'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Aujourd'hui</p>
                  <p className="text-2xl text-slate-800">{todayAppointments.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">À venir</p>
                  <p className="text-2xl text-slate-800">{upcomingAppointments}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Terminés aujourd'hui</p>
                  <p className="text-2xl text-slate-800">{completedToday}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Temps moyen</p>
                  <p className="text-2xl text-slate-800">
                    {appointments.length > 0 
                      ? Math.round(appointments.reduce((acc, apt) => acc + apt.duration_minutes, 0) / appointments.length)
                      : 0
                    } min
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Calendrier</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm border-0 mt-6">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowNewAppointmentDialog(true)}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau RDV
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 justify-start"
                    onClick={() => {
                      const firstAppointment = appointments.find(apt => apt.status === 'scheduled');
                      if (firstAppointment) {
                        updateAppointmentStatus(firstAppointment.id, 'in-progress');
                      }
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Commencer consultation
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 justify-start"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer par type
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Schedule */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-slate-800">
                  Planning du {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const previousDay = new Date(selectedDate);
                      previousDay.setDate(previousDay.getDate() - 1);
                      setSelectedDate(previousDay);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Aujourd'hui
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const nextDay = new Date(selectedDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setSelectedDate(nextDay);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const appointment = getAppointmentForTimeSlot(time);

                    return (
                      <div
                        key={time}
                        className={`flex items-center p-3 rounded-lg border-l-4 ${appointment
                            ? appointment.status === 'in-progress'
                              ? 'bg-blue-50 border-blue-600'
                              : appointment.status === 'completed'
                                ? 'bg-green-50 border-green-600'
                                : 'bg-orange-50 border-orange-600'
                            : 'bg-slate-50 border-slate-300 hover:bg-slate-100 cursor-pointer'
                          }`}
                      >
                        <div className="w-16 text-sm text-slate-600">
                          {time}
                        </div>

                        {appointment ? (
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <h4 className="text-slate-800">
                                {getPatientFullName(appointment.patient)}
                              </h4>
                              <p className="text-sm text-slate-600">{appointment.type}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {appointment.duration_minutes} min
                                </span>
                                {appointment.patient.phone && (
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {appointment.patient.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(appointment.status)}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={handleViewPatientDetails}
                              >
                                <User className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 text-slate-500">
                            <span className="text-sm">Créneaux disponible</span>
                            <span className="ml-2 text-xs text-slate-400">
                              (Géré par secrétaire)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="mt-8">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Résumé de la journée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-blue-800 mb-2">Prochains rendez-vous</h4>
                  <div className="space-y-2">
                    {appointments
                      .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
                      .slice(0, 3)
                      .map((apt, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-blue-600">{formatTime(apt.appointment_time)}</span> - {getPatientFullName(apt.patient)}
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-green-800 mb-2">Consultations terminées</h4>
                  <div className="space-y-2">
                    {appointments
                      .filter(apt => apt.status === 'completed')
                      .slice(0, 3)
                      .map((apt, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-green-600">{formatTime(apt.appointment_time)}</span> - {getPatientFullName(apt.patient)}
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="text-orange-800 mb-2">Actions</h4>
                  <div className="space-y-2 text-sm">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-orange-700"
                      onClick={() => setShowNewAppointmentDialog(true)}
                    >
                      • Créer un nouveau rendez-vous
                    </Button>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-orange-700"
                      onClick={() => onNavigate('patient-management' as Page)}
                    >
                      • Voir la liste des patients
                    </Button>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-orange-700"
                      onClick={handleViewReports}
                    >
                      • Générer un rapport
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}