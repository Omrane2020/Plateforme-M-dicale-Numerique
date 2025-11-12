import { useState, useEffect } from 'react';
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
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
//@ts-ignore  
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

import type { Page } from '../types/Page';

interface SecretaryPatientManagementProps {
  onNavigate: (page: Page, params?: Record<string, any>) => void;
  onLogout: () => void;
}


interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'other';
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  blood_type: string;
  status: 'active' | 'inactive';
  created_at: string;
  last_visit?: string;
  next_appointment?: string;
}

export function SecretaryPatientManagement({ onNavigate, onLogout }: SecretaryPatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;

      // Charger les prochains rendez-vous pour chaque patient
      const patientsWithAppointments = await Promise.all(
        (data || []).map(async (patient:Patient) => {
          const { data: appointment } = await supabase
            .from('appointments')
            .select('appointment_date, appointment_time')
            .eq('patient_id', patient.id)
            .gte('appointment_date', new Date().toISOString().split('T')[0])
            .order('appointment_date', { ascending: true })
            .limit(1)
            .single();

          return {
            ...patient,
            next_appointment: appointment ? appointment.appointment_date : undefined
          };
        })
      );

      setPatients(patientsWithAppointments);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      toast.error('Erreur lors du chargement des patients');
    } finally {
      setIsLoading(false);
    }
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

  const getFullAddress = (patient: Patient) => {
    return `${patient.address}, ${patient.postal_code} ${patient.city}`;
  };

  const formatLastVisit = (lastVisit?: string) => {
    if (!lastVisit) return 'Jamais';
    return new Date(lastVisit).toLocaleDateString('fr-FR');
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const activePatients = patients.filter(p => p.status === 'active').length;
  
  const recentPatients = patients.filter(p => {
    if (!p.last_visit) return false;
    const lastVisit = new Date(p.last_visit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastVisit >= thirtyDaysAgo;
  }).length;

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsDialog(true);
  };

  const exportPatients = async () => {
    try {
      const csvContent = [
        ['Nom', 'Prénom', 'Email', 'Téléphone', 'Adresse', 'Groupe sanguin', 'Statut'],
        ...patients.map(patient => [
          patient.last_name,
          patient.first_name,
          patient.email,
          patient.phone,
          getFullAddress(patient),
          patient.blood_type || 'Non renseigné',
          patient.status === 'active' ? 'Actif' : 'Inactif'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Liste des patients exportée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <SecretarySidebar 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          currentPage="secretary-patient-management"
        />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Chargement des patients...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadPatients}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button 
              onClick={() => onNavigate('add-patient')}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau Patient
            </Button>
          </div>
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
                  <p className="text-sm text-slate-600 mb-1">Nouveaux (30j)</p>
                  <p className="text-2xl text-slate-800">
                    {patients.filter(p => {
                      const created = new Date(p.created_at);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return created >= thirtyDaysAgo;
                    }).length}
                  </p>
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
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={exportPatients}
              >
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
              {filteredPatients.map((patient) => {
                const age = calculateAge(patient.date_of_birth);
                const fullName = `${patient.first_name} ${patient.last_name}`;
                
                return (
                  <div 
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-slate-800">{fullName}</h3>
                          <span className="text-slate-600 text-sm">{age} ans</span>
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
                            {patient.phone || 'Non renseigné'}
                          </span>
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {patient.email}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Dernière visite: {formatLastVisit(patient.last_visit)}
                          </span>
                        </div>
                        
                        {patient.next_appointment && (
                          <div className="mt-1 text-xs text-green-600">
                            Prochain RDV: {new Date(patient.next_appointment).toLocaleDateString('fr-FR')}
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
                        onClick={() => onNavigate('edit-patient', { patientId: patient.id })}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                        onClick={() => onNavigate('secretary-appointments', { patientId: patient.id })}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        RDV
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg text-slate-600 mb-2">
                  {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient'}
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm 
                    ? 'Aucun patient ne correspond à votre recherche'
                    : 'Commencez par ajouter votre premier patient'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => onNavigate('add-patient')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un patient
                  </Button>
                )}
              </div>
            )}
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
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                    {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl text-slate-800">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </h3>
                    <p className="text-slate-600">
                      {calculateAge(selectedPatient.date_of_birth)} ans • 
                      {selectedPatient.gender === 'M' ? ' Homme' : 
                       selectedPatient.gender === 'F' ? ' Femme' : ' Autre'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Téléphone</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-slate-500" />
                        <p className="text-slate-800">{selectedPatient.phone || 'Non renseigné'}</p>
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
                        <p className="text-slate-800">{getFullAddress(selectedPatient)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 mb-1">Date de naissance</p>
                      <p className="text-slate-800">
                        {new Date(selectedPatient.date_of_birth).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Groupe sanguin</p>
                      <p className="text-slate-800">{selectedPatient.blood_type || 'Non renseigné'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Dernière visite</p>
                      <p className="text-slate-800">{formatLastVisit(selectedPatient.last_visit)}</p>
                    </div>
                    
                    {selectedPatient.next_appointment && (
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Prochain rendez-vous</p>
                        <p className="text-green-600">
                          {new Date(selectedPatient.next_appointment).toLocaleDateString('fr-FR')}
                        </p>
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
                    onClick={() => {
                      setShowDetailsDialog(false);
                      onNavigate('edit-patient', { patientId: selectedPatient.id });
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier les informations
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      onNavigate('secretary-appointments', { patientId: selectedPatient.id });
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