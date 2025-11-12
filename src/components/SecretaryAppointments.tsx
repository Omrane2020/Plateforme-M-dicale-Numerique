import  { useState, useEffect } from 'react';
import { SecretarySidebar } from './SecretarySidebar';
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
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  CheckCircle,
  XCircle,
  Edit,
  Filter,
  Download
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
//@ts-ignore
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

import type { Page } from '../types/Page';

interface SecretaryAppointmentsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'scheduled';
  duration: number;
  reason?: string;
  notes?: string;
  doctor_id: string;
}

interface NewAppointmentForm {
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  duration: number;
  reason: string;
  notes: string;
}

export function SecretaryAppointments({ onNavigate, onLogout }: SecretaryAppointmentsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newAppointment, setNewAppointment] = useState<NewAppointmentForm>({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    type: 'consultation',
    duration: 30,
    reason: '',
    notes: ''
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation générale', duration: 30 },
    { value: 'suivi', label: 'Consultation de suivi', duration: 20 },
    { value: 'controle', label: 'Contrôle tension', duration: 15 },
    { value: 'analyse', label: 'Résultats d\'analyses', duration: 20 },
    { value: 'urgence', label: 'Urgence', duration: 45 },
    { value: 'prevention', label: 'Médecine préventive', duration: 45 }
  ];

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', selectedDate.toISOString().split('T')[0])
        .order('appointment_time');

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      setIsCreating(true);

      // Récupérer un médecin par défaut
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      if (!doctor) {
        toast.error('Aucun médecin trouvé');
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...newAppointment,
          doctor_id: doctor.id,
          status: 'scheduled',
          patient_name: newAppointment.patient_name,
          patient_phone: newAppointment.patient_phone,
          patient_email: newAppointment.patient_email
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Rendez-vous créé avec succès');
      setShowNewAppointmentDialog(false);
      setNewAppointment({
        patient_name: '',
        patient_phone: '',
        patient_email: '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '09:00',
        type: 'consultation',
        duration: 30,
        reason: '',
        notes: ''
      });
      
      loadAppointments();
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      toast.error('Erreur lors de la création du rendez-vous');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success('Statut mis à jour avec succès');
      loadAppointments();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success('Rendez-vous supprimé avec succès');
      loadAppointments();
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      toast.error('Erreur lors de la suppression du rendez-vous');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmé</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">En attente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Annulé</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Terminé</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const getAppointmentForTimeSlot = (time: string) => {
    return appointments.find(apt => 
      apt.appointment_time === time
    );
  };

  const todayAppointments = appointments.filter(apt => 
    apt.appointment_date === new Date().toISOString().split('T')[0]
  );

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
  const confirmedAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'scheduled'
  ).length;

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.patient_phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportSchedule = () => {
    const csvContent = [
      ['Date', 'Heure', 'Patient', 'Téléphone', 'Email', 'Type', 'Statut', 'Durée'],
      ...appointments.map(apt => [
        apt.appointment_date,
        apt.appointment_time,
        apt.patient_name,
        apt.patient_phone,
        apt.patient_email,
        apt.type,
        apt.status,
        `${apt.duration} min`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning-${selectedDate.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SecretarySidebar 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        currentPage="secretary-appointments"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Gestion des Rendez-vous</h1>
            <p className="text-slate-600">
              Interface opérationnelle pour la gestion et coordination des rendez-vous
            </p>
          </div>
          <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouveau rendez-vous</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer un rendez-vous
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Patient *</Label>
                  <Input 
                    id="patient-name" 
                    placeholder="Nom du patient"
                    value={newAppointment.patient_name}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      patient_name: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-phone">Téléphone *</Label>
                  <Input 
                    id="patient-phone" 
                    placeholder="06 12 34 56 78"
                    value={newAppointment.patient_phone}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      patient_phone: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email *</Label>
                  <Input 
                    id="patient-email" 
                    type="email"
                    placeholder="patient@email.com"
                    value={newAppointment.patient_email}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      patient_email: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Date *</Label>
                  <Input 
                    id="appointment-date" 
                    type="date"
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      appointment_date: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-time">Heure *</Label>
                  <Select 
                    value={newAppointment.appointment_time}
                    onValueChange={(value) => setNewAppointment(prev => ({
                      ...prev,
                      appointment_time: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-type">Type de consultation *</Label>
                  <Select 
                    value={newAppointment.type}
                    onValueChange={(value) => {
                      const type = appointmentTypes.find(t => t.value === value);
                      setNewAppointment(prev => ({
                        ...prev,
                        type: value,
                        duration: type?.duration || 30
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes) *</Label>
                  <Select 
                    value={newAppointment.duration.toString()}
                    onValueChange={(value) => setNewAppointment(prev => ({
                      ...prev,
                      duration: parseInt(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="reason">Motif</Label>
                  <Input 
                    id="reason" 
                    placeholder="Motif de la consultation"
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                  />
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCreateAppointment}
                  disabled={isCreating || !newAppointment.patient_name || !newAppointment.patient_phone}
                >
                  {isCreating ? 'Création...' : 'Créer le rendez-vous'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-0 bg-white">
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
          
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">En attente</p>
                  <p className="text-2xl text-slate-800">{pendingAppointments}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Confirmés</p>
                  <p className="text-2xl text-slate-800">{confirmedAppointments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total</p>
                  <p className="text-2xl text-slate-800">{appointments.length}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar */}
            <Card className="shadow-sm border-0 bg-white">
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

            {/* Filters & Search */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-slate-600" />
                  Recherche & Filtres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Rechercher un patient</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Nom ou téléphone..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status-filter">Statut</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="scheduled">Confirmés</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="cancelled">Annulés</SelectItem>
                      <SelectItem value="completed">Terminés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full" onClick={exportSchedule}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le planning
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Daily Schedule */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
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
                      const prevDay = new Date(selectedDate);
                      prevDay.setDate(prevDay.getDate() - 1);
                      setSelectedDate(prevDay);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
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
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {timeSlots.map((time) => {
                      const appointment = getAppointmentForTimeSlot(time);
                      
                      return (
                        <div 
                          key={time}
                          className={`flex items-center p-4 border rounded-lg transition-all ${
                            appointment 
                              ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-20 flex-shrink-0">
                            <div className="flex items-center text-slate-700">
                              <Clock className="h-4 w-4 mr-2 text-slate-500" />
                              <span>{time}</span>
                            </div>
                          </div>
                          
                          {appointment ? (
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-slate-800">{appointment.patient_name}</h4>
                                  {getStatusBadge(appointment.status)}
                                </div>
                                <p className="text-sm text-slate-600 mb-1">{appointment.type}</p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {appointment.patient_phone}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {appointment.duration} min
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {appointment.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleUpdateStatus(appointment.id, 'scheduled')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Confirmer
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-red-600 text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 text-center">
                              <span className="text-slate-400 text-sm">Créneau disponible</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}