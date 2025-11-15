import React, { useState } from 'react';
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
  Mail,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
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

import type { Page } from '../types/Page';
interface SecretaryAppointmentsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient: string;
  phone: string;
  email: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  duration: number;
  notes?: string;
}

export function SecretaryAppointments({ onNavigate, onLogout }: SecretaryAppointmentsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - remplacer par Supabase plus tard
  const appointments: Appointment[] = [
    {
      id: '1',
      date: '2025-10-02',
      time: '09:00',
      patient: 'Marie Dubois',
      phone: '06 12 34 56 78',
      email: 'marie.dubois@email.com',
      type: 'Consultation de suivi',
      status: 'confirmed',
      duration: 30
    },
    {
      id: '2',
      date: '2025-10-02',
      time: '09:30',
      patient: 'Pierre Martin',
      phone: '06 23 45 67 89',
      email: 'pierre.martin@email.com',
      type: 'Contrôle tension',
      status: 'confirmed',
      duration: 20
    },
    {
      id: '3',
      date: '2025-10-02',
      time: '10:15',
      patient: 'Sophie Lambert',
      phone: '06 34 56 78 90',
      email: 'sophie.lambert@email.com',
      type: 'Consultation générale',
      status: 'pending',
      duration: 30
    },
    {
      id: '4',
      date: '2025-10-02',
      time: '11:00',
      patient: 'Jean Dupont',
      phone: '06 45 67 89 01',
      email: 'jean.dupont@email.com',
      type: 'Résultats analyses',
      status: 'confirmed',
      duration: 25
    },
    {
      id: '5',
      date: '2025-10-02',
      time: '14:00',
      patient: 'Anne Moreau',
      phone: '06 56 78 90 12',
      email: 'anne.moreau@email.com',
      type: 'Première consultation',
      status: 'confirmed',
      duration: 45
    },
    {
      id: '6',
      date: '2025-10-02',
      time: '15:30',
      patient: 'Paul Leclerc',
      phone: '06 67 89 01 23',
      email: 'paul.leclerc@email.com',
      type: 'Suivi traitement',
      status: 'pending',
      duration: 30
    }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
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
      apt.time === time && 
      apt.date === selectedDate.toISOString().split('T')[0]
    );
  };

  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  );

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length;

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
                  <Label htmlFor="patient-name">Patient</Label>
                  <Input id="patient-name" placeholder="Nom du patient" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-phone">Téléphone</Label>
                  <Input id="patient-phone" placeholder="06 12 34 56 78" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Date</Label>
                  <Input id="appointment-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-time">Heure</Label>
                  <Input id="appointment-time" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-type">Type de consultation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation générale</SelectItem>
                      <SelectItem value="suivi">Consultation de suivi</SelectItem>
                      <SelectItem value="controle">Contrôle</SelectItem>
                      <SelectItem value="urgence">Urgence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
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
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Créer le rendez-vous
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
                      <SelectItem value="confirmed">Confirmés</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="cancelled">Annulés</SelectItem>
                      <SelectItem value="completed">Terminés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full">
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
                  <Button size="sm" variant="outline">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                                <h4 className="text-slate-800">{appointment.patient}</h4>
                                {getStatusBadge(appointment.status)}
                              </div>
                              <p className="text-sm text-slate-600 mb-1">{appointment.type}</p>
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <span className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {appointment.phone}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}