import { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  MoreHorizontal, 
  User, 
  Phone, 
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

import API from "../../services/api";  // API instance
import type { Page } from '../../types/Page'; 
import { useNavigate } from 'react-router-dom';

interface PatientManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email?: string;
  phone?: string;
  lastVisit?: string;
  nextAppointment?: string;
  condition?: string;
  priority?: 'low' | 'normal' | 'high';
  status: 'active' | 'inactive';
  gender?: string;
  bloodType?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
}

export function PatientManagement({ onNavigate, onLogout }: PatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const navigate = useNavigate();

  const openPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const closePatientDetails = () => {
    setSelectedPatient(null);
  };

  // Fetch patients from backend
  useEffect(() => {
    API.get("/patients")
      .then((res) => {
        const formatted = res.data.map((p: any) => ({
          id: p.id,
          age: p.age,
          status: p.status,
          lastVisit: p.lastVisit,
          nextAppointment: p.nextAppointment,
          firstName: p.user?.firstName || "",
          lastName: p.user?.lastName || "",
          email: p.user?.email || "",
          phone: p.user?.phone || "",
          gender: p.gender,
          bloodType: p.bloodType,
          medicalHistory: p.medicalHistory,
          allergies: p.allergies,
          currentMedications: p.currentMedications,
          condition: p.condition,
          priority: p.priority
        }));
        setPatients(formatted);
        console.log(formatted);
        
      })
      .catch((err) => {
        console.error("Error fetching patients:", err);
        setPatients([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center text-slate-600">
        Chargement des patients...
      </div>
    );
  }

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'active') return matchesSearch && patient.status === 'active';
    if (selectedFilter === 'high-priority') return matchesSearch && patient.priority === 'high';

    return matchesSearch;
  });

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    return priority === 'high'
      ? <AlertCircle className="h-4 w-4" />
      : <CheckCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        currentPage="patient-management"
      />

      <div className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Gestion des Patients</h1>
            <p className="text-slate-600">
              Gérez vos patients et leurs dossiers médicaux
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Patient
          </Button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Patients</p>
                  <p className="text-2xl text-slate-800">{patients.length}</p>
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
                  <p className="text-2xl text-slate-800">
                    {patients.filter(p => p.status === 'active').length}
                  </p>
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
                  <p className="text-2xl text-slate-800">
                    {patients.filter(p => p.priority === 'high').length}
                  </p>
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
                  <p className="text-2xl text-slate-800">
                    {patients.filter(p => p.nextAppointment).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PATIENT LIST */}
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
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg text-slate-800">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <span className="text-sm text-slate-600">{patient.age} ans</span>

                        <Badge 
                          variant="secondary" 
                          className={getPriorityColor(patient.priority)}
                        >
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(patient.priority)}
                            <span className="capitalize">
                              {patient.priority === "high" ? "Élevée" : patient.priority === "normal" ? "Normale" : "Faible"}
                            </span>
                          </div>
                        </Badge>
                      </div>

                      <p className="text-slate-600 mb-2">{patient.condition || "—"}</p>

                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {patient.email || "—"}
                        </span>

                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={() => openPatientDetails(patient)}>
                      <FileText className="h-4 w-4" />
                    </Button>

                    <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => navigate("/doctor/appointments")}>
                      <Calendar className="h-4 w-4" />
                    </Button>

                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PATIENT DETAILS MODAL */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-[450px]">
              <h2 className="text-xl font-semibold mb-4">
                Dossier médical – {selectedPatient.firstName} {selectedPatient.lastName}
              </h2>

              <div className="space-y-2 text-sm">
                <p><strong>Âge:</strong> {selectedPatient.age || "—"}</p>
                <p><strong>Sexe:</strong> {selectedPatient.gender || "—"}</p>
                <p><strong>Groupe sanguin:</strong> {selectedPatient.bloodType || "—"}</p>

                <p><strong>Antécédents médicaux:</strong><br /> 
                  {selectedPatient.medicalHistory || "Aucun"}
                </p>

                <p><strong>Allergies:</strong><br />
                  {selectedPatient.allergies || "Aucune"}
                </p>

                <p><strong>Médicaments actuels:</strong><br />
                  {selectedPatient.currentMedications || "Aucun"}
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={closePatientDetails}>Fermer</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
