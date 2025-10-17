import { useState } from 'react';
import type {Page } from "../index";
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
  Phone
  // Supprimé : Mail (inutilisé)
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

interface AppointmentManagementProps {
  onNavigate: (page: Page) => void; // Utilisation du type Page
  onLogout: () => void;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  duration: number;
  phone?: string;
  email?: string;
  notes?: string;
}

export function AppointmentManagement({ onNavigate, onLogout }: AppointmentManagementProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Supprimé : viewMode et setViewMode (inutilisés)
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);

  const appointments: Appointment[] = [
    {
      id: '1',
      date: '2024-01-18',
      time: '09:00',
      patient: 'Marie Dubois',
      type: 'Consultation de suivi',
      status: 'upcoming',
      duration: 30,
      phone: '+33 1 23 45 67 89',
      email: 'marie.dubois@email.com'
    },
    {
      id: '2',
      date: '2024-01-18',
      time: '09:30',
      patient: 'Pierre Martin',
      type: 'Contrôle tension',
      status: 'upcoming',
      duration: 20,
      phone: '+33 1 34 56 78 90',
      email: 'pierre.martin@email.com'
    },
    {
      id: '3',
      date: '2024-01-18',
      time: '10:15',
      patient: 'Sophie Lambert',
      type: 'Consultation générale',
      status: 'in-progress',
      duration: 30,
      phone: '+33 1 45 67 89 01',
      email: 'sophie.lambert@email.com'
    },
    {
      id: '4',
      date: '2024-01-18',
      time: '11:00',
      patient: 'Jean Dupont',
      type: 'Résultats analyses',
      status: 'upcoming',
      duration: 25,
      phone: '+33 1 56 78 90 12',
      email: 'jean.dupont@email.com'
    },
    {
      id: '5',
      date: '2024-01-18',
      time: '14:00',
      patient: 'Anne Moreau',
      type: 'Première consultation',
      status: 'upcoming',
      duration: 45,
      phone: '+33 1 67 89 01 23',
      email: 'anne.moreau@email.com'
    },
    {
      id: '6',
      date: '2024-01-18',
      time: '15:30',
      patient: 'Paul Leclerc',
      type: 'Suivi traitement',
      status: 'upcoming',
      duration: 30,
      phone: '+33 1 78 90 12 34',
      email: 'paul.leclerc@email.com'
    }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">À venir</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getAppointmentForTimeSlot = (time: string) => {
    return appointments.find(apt => apt.time === time && apt.date === selectedDate.toISOString().split('T')[0]);
  };

  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  );

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming').length;
  const completedToday = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0] && apt.status === 'completed'
  ).length;

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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouveau rendez-vous</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer un rendez-vous
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-select">Patient</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marie">Marie Dubois</SelectItem>
                      <SelectItem value="pierre">Pierre Martin</SelectItem>
                      <SelectItem value="sophie">Sophie Lambert</SelectItem>
                      <SelectItem value="jean">Jean Dupont</SelectItem>
                      <SelectItem value="anne">Anne Moreau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-date">Date</Label>
                  <Input id="rdv-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-time">Heure</Label>
                  <Input id="rdv-time" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-type">Type de consultation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation générale</SelectItem>
                      <SelectItem value="suivi">Consultation de suivi</SelectItem>
                      <SelectItem value="controle">Contrôle</SelectItem>
                      <SelectItem value="urgence">Urgence</SelectItem>
                      <SelectItem value="premiere">Première consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdv-duration">Durée (minutes)</Label>
                  <Select>
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
                  <Input id="rdv-notes" placeholder="Notes pour le rendez-vous..." />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Créer le rendez-vous
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
                  <p className="text-2xl text-slate-800">25 min</p>
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
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Voir la semaine
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
                  <Button size="sm" variant="outline">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
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
                        <div className="w-16 text-sm text-slate-600">
                          {time}
                        </div>
                        
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
                              <Button size="sm" variant="outline">
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
                      .filter(apt => apt.status === 'upcoming')
                      .slice(0, 3)
                      .map((apt, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-blue-600">{apt.time}</span> - {apt.patient}
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
                          <span className="text-green-600">{apt.time}</span> - {apt.patient}
                        </div>
                      ))
                    }
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
      </div>
    </div>
  );
}