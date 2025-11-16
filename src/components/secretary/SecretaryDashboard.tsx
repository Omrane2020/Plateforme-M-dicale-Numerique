import React, { useState } from 'react';
import { SecretarySidebar } from '../secretary/SecretarySidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Search,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  ArrowRight
} from 'lucide-react';

import type { Page } from '../../types/Page';
interface SecretaryDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function SecretaryDashboard({ onNavigate, onLogout }: SecretaryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for secretary dashboard
  const stats = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Patients gérés",
      value: "89",
      change: "+12 ce mois",
      changeType: "positive" 
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      title: "RDV à traiter",
      value: "15",
      change: "5 en attente",
      changeType: "neutral" 
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "RDV aujourd'hui",
      value: "12",
      change: "3 à confirmer",
      changeType: "neutral" 
    },
    {
      icon: <Bell className="h-6 w-6 text-purple-600" />,
      title: "Notifications",
      value: "8",
      change: "Nouvelles demandes",
      changeType: "positive" 
    }
  ];

  const pendingAppointments = [
    {
      id: 1,
      patient: "Marie Dubois",
      phone: "06 12 34 56 78",
      requestedDate: "2024-01-20",
      requestedTime: "14:00",
      type: "Consultation générale",
      status: "pending" as const,
      priority: "normal" as const
    },
    {
      id: 2,
      patient: "Jean Dupont",
      phone: "06 23 45 67 89",
      requestedDate: "2024-01-22",
      requestedTime: "09:30",
      type: "Contrôle de routine",
      status: "pending" as const,
      priority: "low" as const
    },
    {
      id: 3,
      patient: "Sophie Martin",
      phone: "06 34 56 78 90",
      requestedDate: "2024-01-21",
      requestedTime: "16:15",
      type: "Suivi traitement",
      status: "pending" as const,
      priority: "high" as const
    },
    {
      id: 4,
      patient: "Pierre Lambert",
      phone: "06 45 67 89 01",
      requestedDate: "2024-01-23",
      requestedTime: "11:00",
      type: "Résultats analyses",
      status: "pending" as const,
      priority: "high" as const
    }
  ];

  const recentPatients = [
    {
      name: "Marie Dubois",
      age: 45,
      phone: "06 12 34 56 78",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-01-25"
    },
    {
      name: "Jean Dupont",
      age: 52,
      phone: "06 23 45 67 89",
      lastVisit: "2024-01-10",
      nextAppointment: "2024-01-22"
    },
    {
      name: "Sophie Martin",
      age: 38,
      phone: "06 34 56 78 90",
      lastVisit: "2024-01-12",
      nextAppointment: "2024-01-26"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "appointment" as const,
      message: "Nouvelle demande de RDV de Marie Dubois",
      time: "Il y a 5 min",
      priority: "high" as const
    },
    {
      id: 2,
      type: "patient" as const,
      message: "Informations patient mises à jour - Jean Dupont",
      time: "Il y a 30 min",
      priority: "normal" as const
    },
    {
      id: 3,
      type: "reminder" as const,
      message: "Rappel: Confirmer RDV de Sophie Martin",
      time: "Il y a 1h",
      priority: "normal" as const
    }
  ];

  const handleAppointmentAction = (id: number, action: 'accept' | 'reject') => {
    console.log(`Appointment ${id} ${action}ed`);
    // Implementation for handling appointment actions
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'normal':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Normal</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Faible</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'patient':
        return <User className="h-4 w-4 text-green-600" />;
      case 'reminder':
        return <Bell className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SecretarySidebar 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        currentPage="secretary-dashboard"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl text-slate-800">Dashboard Secrétaire</h1>
            <Button 
              onClick={() => onNavigate('secretary-appointments')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Gérer les RDV
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <p className="text-slate-600">
            Bonjour Sarah, gérez les patients et rendez-vous du Dr. Martin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-2xl text-slate-800 mb-1">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-full">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending Appointments */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-slate-800">Demandes de rendez-vous</CardTitle>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {pendingAppointments.length} en attente
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-slate-800">{appointment.patient}</h3>
                          {getPriorityBadge(appointment.priority)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(appointment.requestedDate).toLocaleDateString('fr-FR')} à {appointment.requestedTime}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">{appointment.type}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div>
          <Card className="shadow-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="bg-white p-2 rounded-full">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800 mb-1">{notification.message}</p>
                        <p className="text-xs text-slate-500">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Patients récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPatients.map((patient, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">{patient.name}</p>
                        <p className="text-xs text-slate-600">{patient.age} ans • {patient.phone}</p>
                        <p className="text-xs text-slate-500">Prochain RDV: {new Date(patient.nextAppointment).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button 
                onClick={() => onNavigate('add-patient')}
                className="h-20 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex flex-col items-center justify-center space-y-2"
                variant="outline"
              >
                <UserPlus className="h-6 w-6" />
                <span>Nouveau Patient</span>
              </Button>
              <Button 
                onClick={() => onNavigate('secretary-appointments')}
                className="h-20 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 flex flex-col items-center justify-center space-y-2"
                variant="outline"
              >
                <Calendar className="h-6 w-6" />
                <span>Gérer RDV</span>
              </Button>
              <Button 
                onClick={() => onNavigate('secretary-patient-management')}
                className="h-20 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 flex flex-col items-center justify-center space-y-2"
                variant="outline"
              >
                <Users className="h-6 w-6" />
                <span>Liste Patients</span>
              </Button>
              <Button className="h-20 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 flex flex-col items-center justify-center space-y-2" variant="outline">
                <Bell className="h-6 w-6" />
                <span>Notifications</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}