// src/components/doctor/AppointmentManagement.tsx
import { useEffect, useState } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Page } from '../../types/Page';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from 'axios';

interface Appointment {
  id: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  patient: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  duration: number;
  phone?: string;
  email?: string;
  notes?: string;
}

interface AppointmentManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}



export function AppointmentManagement({ onNavigate, onLogout }: AppointmentManagementProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    date: '',
    time: '',
    type: '',
    duration: 30,
    notes: ''
  });

  // Add this state to hold patients
const [patients, setPatients] = useState<{ id: number; firstName: string; lastName: string }[]>([]);

// Fetch patients dynamically from API
const fetchPatients = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/patients', {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    // Map to a simple structure
    setPatients(res.data.map((p: any) => ({
      id: p.id,
      firstName: p.user?.firstName || p.firstName,
      lastName: p.user?.lastName || p.lastName
    })));
  } catch (err) {
    console.error('Erreur lors de la récupération des patients', err);
  }
};

// Fetch patients on mount
useEffect(() => {
  fetchAppointments();
  fetchPatients();
}, []);


  const timeSlots = [
    '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
    '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00','17:30'
  ];

  // ----------------------------
  // API calls
  // ----------------------------
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur lors de la récupération des rendez-vous', err);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      if (!newAppointment.patient || !newAppointment.date || !newAppointment.time) {
        return alert('Remplissez patient, date et heure.');
      }

      const token = localStorage.getItem('token');
      const body = {
        patient: newAppointment.patient,
        date: newAppointment.date,
        time: newAppointment.time,
        type: newAppointment.type,
        duration: Number(newAppointment.duration),
        notes: newAppointment.notes,
        status: 'upcoming'
      };

      const res = await axios.post('http://localhost:5000/api/appointments', body, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      if (res.data && res.data.id) {
        setAppointments(prev => [...prev, res.data]);
      } else {
        await fetchAppointments();
      }

      setShowNewAppointmentDialog(false);
      setNewAppointment({
        patient: '',
        date: '',
        time: '',
        type: '',
        duration: 30,
        notes: ''
      });
    } catch (err) {
      console.error('Erreur lors de la création du rendez-vous', err);
      alert('Erreur lors de la création du rendez-vous');
    }
  };

  // ----------------------------
  // Helpers
  // ----------------------------
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'upcoming':
        return <Badge className="bg-orange-100 text-orange-800">À venir</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const getAppointmentForTimeSlot = (time: string) => {
    const isoDate = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
    return appointments.find(apt => apt.time === time && apt.date === isoDate);
  };


  const todayIso = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter(apt => apt.date === todayIso);
  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming').length;
  const completedToday = appointments.filter(apt => apt.date === todayIso && apt.status === 'completed').length;

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ----------------------------
  // JSX
  // ----------------------------
  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentPage="appointments"
      />

      <div className="flex-1 p-8">
        <h1 className="text-3xl text-slate-800 mb-2">Gestion des Rendez-vous</h1>
        <p className="text-slate-600 mb-8">Gérez votre planning et vos consultations</p>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600 mb-1">Aujourd'hui</p>
                <p className="text-2xl text-slate-800">{todayAppointments.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600 mb-1">À venir</p>
                <p className="text-2xl text-slate-800">{upcomingAppointments}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600 mb-1">Terminés aujourd'hui</p>
                <p className="text-2xl text-slate-800">{completedToday}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600 mb-1">Temps moyen</p>
                <p className="text-2xl text-slate-800">25 min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Calendar + Actions */}
          <div className="lg:col-span-1 space-y-6">
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

            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Nouveau RDV button moved here */}
                <Button
                  onClick={() => setShowNewAppointmentDialog(true)}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau RDV
                </Button>

                <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Voir la semaine
                </Button>

                <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer par type
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Daily Schedule */}
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
                  <Button size="sm" variant="outline" onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d);
                  }}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d);
                  }}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {timeSlots.map(time => {
                    const appointment = getAppointmentForTimeSlot(time);
                    return (
                      <div
                        key={time}
                        className={`flex items-center p-3 rounded-lg border-l-4 ${
                          appointment
                            ? appointment.status === 'in-progress'
                              ? 'bg-blue-50 border-blue-600'
                              : appointment.status === 'completed'
                                ? 'bg-green-50 border-green-600'
                                : 'bg-orange-50 border-orange-600'
                            : 'bg-slate-50 border-slate-300 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        <div className="w-16 text-sm text-slate-600">{time}</div>
                        {appointment ? (
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <h4 className="text-slate-800">{appointment.patient}</h4>
                              <p className="text-sm text-slate-600">{appointment.type}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {appointment.duration} min
                                </span>
                                {appointment.phone && (
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {appointment.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(appointment.status)}
                              <Button size="sm" variant="outline" onClick={() => onNavigate('patient-management')}>
                                <User className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 text-slate-500">
                            <span className="text-sm">Créneaux disponible</span>
                            <span className="ml-2 text-xs text-slate-400">(Géré par secrétaire)</span>
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

        {/* Daily Summary */}
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
                      .filter(apt => apt.status === 'upcoming')
                      .slice(0, 3)
                      .map((apt, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-blue-600">{apt.time}</span> - {apt.patient}
                        </div>
                      ))}
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
                          <span className="text-green-600">{apt.time}</span> - {apt.patient}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="text-orange-800 mb-2">Notifications</h4>
                  <div className="space-y-2 text-sm text-orange-700">
                    <p>• Rappel: RDV Pierre Martin à 14h00</p>
                    <p>• Nouveau: Demande de RDV en attente</p>
                    <p>• Info: Résultats analyses disponibles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog for creating new appointment */}
        <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
          <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">
            <DialogHeader className="border-b pb-2">
              <DialogTitle className="text-xl font-semibold text-gray-800">Créer un nouveau rendez-vous</DialogTitle>
              <DialogDescription className="text-gray-500">
                Remplissez les informations pour créer un rendez-vous
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient-select">Patient</Label>
                <Select value={newAppointment.patient} onValueChange={(v: string) => setNewAppointment({...newAppointment, patient: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={`${p.firstName} ${p.lastName}`}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rdv-date">Date</Label>
                <Input
                  id="rdv-date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rdv-time">Heure</Label>
                <Input
                  id="rdv-time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rdv-type">Type de consultation</Label>
                <Select value={newAppointment.type} onValueChange={(v: string) => setNewAppointment({...newAppointment, type: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation générale">Consultation générale</SelectItem>
                    <SelectItem value="Consultation de suivi">Consultation de suivi</SelectItem>
                    <SelectItem value="Contrôle">Contrôle</SelectItem>
                    <SelectItem value="Urgence">Urgence</SelectItem>
                    <SelectItem value="Téléconsultation">Téléconsultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rdv-duration">Durée (minutes)</Label>
                <Input
                  id="rdv-duration"
                  type="number"
                  value={newAppointment.duration}
                  onChange={(e) => setNewAppointment({...newAppointment, duration: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rdv-notes">Notes</Label>
                <Input
                  id="rdv-notes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  placeholder="Notes supplémentaires"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>Annuler</Button>
                <Button onClick={handleCreateAppointment}>Créer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
