import  { useState } from 'react';
import { SecretarySidebar } from './SecretarySidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Users, 
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Eye,
  UserPlus,
  Filter,
  Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import type { Page } from '../types/Page';
interface SecretaryPatientManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  lastVisit: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
}

export function SecretaryPatientManagement({ onNavigate, onLogout }: SecretaryPatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Mock data - remplacer par Supabase plus tard
  const patients: Patient[] = [
    {
      id: '1',
      name: 'Marie Dubois',
      age: 45,
      gender: 'F',
      phone: '06 12 34 56 78',
      email: 'marie.dubois@email.com',
      address: '15 Rue de la Paix, 75001 Paris',
      bloodType: 'A+',
      lastVisit: '2025-09-15',
      nextAppointment: '2025-10-10',
      status: 'active'
    },
    {
      id: '2',
      name: 'Pierre Martin',
      age: 52,
      gender: 'M',
      phone: '06 23 45 67 89',
      email: 'pierre.martin@email.com',
      address: '28 Avenue des Champs, 75008 Paris',
      bloodType: 'O+',
      lastVisit: '2025-09-20',
      nextAppointment: '2025-10-05',
      status: 'active'
    },
    {
      id: '3',
      name: 'Sophie Lambert',
      age: 38,
      gender: 'F',
      phone: '06 34 56 78 90',
      email: 'sophie.lambert@email.com',
      address: '7 Boulevard Voltaire, 75011 Paris',
      bloodType: 'B+',
      lastVisit: '2025-09-25',
      status: 'active'
    },
    {
      id: '4',
      name: 'Jean Dupont',
      age: 61,
      gender: 'M',
      phone: '06 45 67 89 01',
      email: 'jean.dupont@email.com',
      address: '42 Rue du Faubourg, 75010 Paris',
      bloodType: 'AB+',
      lastVisit: '2025-08-30',
      nextAppointment: '2025-10-15',
      status: 'active'
    },
    {
      id: '5',
      name: 'Anne Moreau',
      age: 29,
      gender: 'F',
      phone: '06 56 78 90 12',
      email: 'anne.moreau@email.com',
      address: '33 Place de la République, 75003 Paris',
      bloodType: 'A-',
      lastVisit: '2025-09-28',
      nextAppointment: '2025-10-12',
      status: 'active'
    },
    {
      id: '6',
      name: 'Paul Leclerc',
      age: 67,
      gender: 'M',
      phone: '06 67 89 01 23',
      email: 'paul.leclerc@email.com',
      address: '19 Rue de Rivoli, 75004 Paris',
      bloodType: 'O-',
      lastVisit: '2025-07-15',
      status: 'inactive'
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePatients = patients.filter(p => p.status === 'active').length;
  const recentPatients = patients.filter(p => {
    const lastVisit = new Date(p.lastVisit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastVisit >= thirtyDaysAgo;
  }).length;

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsDialog(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SecretarySidebar 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        currentPage="secretary-patient-management"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Gestion des Patients</h1>
            <p className="text-slate-600">
              Gérez les informations et coordonnées des patients
            </p>
          </div>
          <Button 
            onClick={() => onNavigate('add-patient')}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nouveau Patient
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Patients</p>
                  <p className="text-2xl text-slate-800">{patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Patients actifs</p>
                  <p className="text-2xl text-slate-800">{activePatients}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Vus ce mois</p>
                  <p className="text-2xl text-slate-800">{recentPatients}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Nouveaux</p>
                  <p className="text-2xl text-slate-800">8</p>
                </div>
                <UserPlus className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-sm border-0 bg-white mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un patient (nom, téléphone, email)..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">
              Liste des patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-slate-800">{patient.name}</h3>
                        <Badge variant="secondary" className={
                          patient.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {patient.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {patient.email}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      {patient.nextAppointment && (
                        <div className="mt-1 text-xs text-green-600">
                          Prochain RDV: {new Date(patient.nextAppointment).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleViewDetails(patient)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                      onClick={() => onNavigate('secretary-appointments')}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      RDV
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du patient</DialogTitle>
              <DialogDescription>
                Informations complètes du patient
              </DialogDescription>
            </DialogHeader>
            
            {selectedPatient && (
              <div className="space-y-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                    {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-2xl text-slate-800">{selectedPatient.name}</h3>
                    <p className="text-slate-600">{selectedPatient.age} ans • {selectedPatient.gender === 'M' ? 'Homme' : 'Femme'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Téléphone</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-slate-500" />
                        <p className="text-slate-800">{selectedPatient.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Email</p>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-slate-500" />
                        <p className="text-slate-800">{selectedPatient.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Adresse</p>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-slate-500 mt-0.5" />
                        <p className="text-slate-800">{selectedPatient.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Groupe sanguin</p>
                      <p className="text-slate-800">{selectedPatient.bloodType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Dernière visite</p>
                      <p className="text-slate-800">{new Date(selectedPatient.lastVisit).toLocaleDateString('fr-FR')}</p>
                    </div>
                    
                    {selectedPatient.nextAppointment && (
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Prochain rendez-vous</p>
                        <p className="text-green-600">{new Date(selectedPatient.nextAppointment).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Statut</p>
                      <Badge className={
                        selectedPatient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {selectedPatient.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier les informations
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      onNavigate('secretary-appointments');
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Gérer les RDV
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
