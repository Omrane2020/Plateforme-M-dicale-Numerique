import { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  User, 
  Phone, 
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader
} from 'lucide-react';
//@ts-ignore
import { supabase } from '../supabaseClient';
import type { Page } from '../types/Page'; 

interface PatientManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  lastVisit: string;
  nextVisit?: string;
  condition: string;
  priority: 'low' | 'normal' | 'high';
  status: 'active' | 'inactive';
}

export function PatientManagement({ onNavigate, onLogout }: PatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    highPriority: 0,
    upcomingAppointments: 0
  });

  useEffect(() => {
    fetchPatientsData();
  }, []);

  const fetchPatientsData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onLogout();
        return;
      }

      // Récupérer l'ID du docteur
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError) throw doctorError;

      // Récupérer les patients du docteur avec leurs informations
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('doctor_patient_relationships')
        .select(`
          patient:patients (
            id,
            name,
            date_of_birth,
            email,
            phone,
            blood_type,
            emergency_contact,
            created_at
          ),
          patient_conditions (condition_name, severity, status),
          patient_priorities (priority_level),
          appointments (appointment_date, status)
        `)
        .eq('doctor_id', doctorData.id)
        .eq('status', 'active');

      if (relationshipsError) throw relationshipsError;

      // Transformer les données
      const formattedPatients: Patient[] = (relationshipsData || []).map((rel:any) => {
        const patient = rel.patient;
        const conditions = rel.patient_conditions || [];
        const priorities = rel.patient_priorities || [];
        const appointments = rel.appointments || [];

        // Calculer l'âge
        const age = patient.date_of_birth 
          ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
          : 0;

        // Trouver la dernière visite et la prochaine
        const sortedAppointments = appointments
          .filter((apt: any) => apt.appointment_date)
          .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
        
        const lastVisit = sortedAppointments[0]?.appointment_date || patient.created_at;
        const upcomingAppointments = appointments
          .filter((apt: any) => apt.status === 'scheduled' && new Date(apt.appointment_date) >= new Date())
          .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
        
        const nextVisit = upcomingAppointments[0]?.appointment_date;

        // Déterminer la priorité
        const currentPriority = priorities[0]?.priority_level as 'low' | 'normal' | 'high' || 'normal';

        // Condition principale
        const mainCondition = conditions.find((cond: any) => cond.status === 'active')?.condition_name || 'Aucune condition';

        return {
          id: patient.id,
          name: patient.name,
          age,
          email: patient.email,
          phone: patient.phone,
          lastVisit,
          nextVisit,
          condition: mainCondition,
          priority: currentPriority,
          status: 'active' as const
        };
      });

      setPatients(formattedPatients);

      // Calculer les statistiques
      const totalPatients = formattedPatients.length;
      const activePatients = formattedPatients.filter(p => p.status === 'active').length;
      const highPriority = formattedPatients.filter(p => p.priority === 'high').length;
      const upcomingAppointments = formattedPatients.filter(p => p.nextVisit).length;

      setStats({
        totalPatients,
        activePatients,
        highPriority,
        upcomingAppointments
      });

    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'active') return matchesSearch && patient.status === 'active';
    if (selectedFilter === 'high-priority') return matchesSearch && patient.priority === 'high';
    
    return matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'high' ? 
      <AlertCircle className="h-4 w-4" /> : 
      <CheckCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleAddPatient = () => {
    // Navigation vers la page d'ajout de patient
    onNavigate('add-patient');
  };

  const handleViewPatientDetails = (patientId: string) => {
    onNavigate('patient-details');
    // Vous pouvez passer l'ID du patient via le state de navigation
  };

  const handleScheduleAppointment = (patientId: string) => {
    onNavigate('schedule-appointment');
    // Vous pouvez passer l'ID du patient via le state de navigation
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          currentPage="patient-management"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-slate-600">Chargement des patients...</p>
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
        currentPage="patient-management"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Gestion des Patients</h1>
            <p className="text-slate-600">
              Gérez vos patients et leurs dossiers médicaux
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAddPatient}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Patient
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Patients</p>
                  <p className="text-2xl text-slate-800">{stats.totalPatients}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Patients Actifs</p>
                  <p className="text-2xl text-slate-800">{stats.activePatients}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Priorité Élevée</p>
                  <p className="text-2xl text-slate-800">{stats.highPriority}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">RDV à venir</p>
                  <p className="text-2xl text-slate-800">{stats.upcomingAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-sm border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('all')}
                  className={selectedFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Tous
                </Button>
                <Button
                  variant={selectedFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('active')}
                  className={selectedFilter === 'active' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Actifs
                </Button>
                <Button
                  variant={selectedFilter === 'high-priority' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('high-priority')}
                  className={selectedFilter === 'high-priority' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Priorité élevée
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">
              Liste des patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleViewPatientDetails(patient.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg text-slate-800">{patient.name}</h3>
                        <span className="text-sm text-slate-600">{patient.age} ans</span>
                        <Badge 
                          variant="secondary" 
                          className={getPriorityColor(patient.priority)}
                        >
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(patient.priority)}
                            <span className="capitalize">
                              {patient.priority === 'high' ? 'Élevée' : 
                               patient.priority === 'normal' ? 'Normale' : 'Faible'}
                            </span>
                          </div>
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-2">{patient.condition}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {patient.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <p className="text-slate-600">Dernière visite:</p>
                      <p className="text-slate-800">{formatDate(patient.lastVisit)}</p>
                      {patient.nextVisit && (
                        <>
                          <p className="text-slate-600 mt-1">Prochaine visite:</p>
                          <p className="text-blue-600">{formatDate(patient.nextVisit)}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPatientDetails(patient.id);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-green-600 text-green-600 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScheduleAppointment(patient.id);
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg text-slate-600 mb-2">
                  {searchTerm ? "Aucun patient trouvé" : "Aucun patient enregistré"}
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm 
                    ? "Aucun patient ne correspond à votre recherche" 
                    : "Commencez par ajouter votre premier patient"
                  }
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddPatient}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un patient
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}