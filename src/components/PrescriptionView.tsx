import  { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { PrescriptionModule } from './PrescriptionModule';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Search, 
  FileText, 
  User, 
  Calendar,
  Plus,
  Loader,
  AlertCircle
} from 'lucide-react';
//@ts-ignore
import { supabase } from '../supabaseClient';
import type { Page } from '../types/Page';

interface PrescriptionViewProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  currentMedications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  allergies: string[];
  conditions: string[];
  lastVisit: string;
}

export function PrescriptionView({ onNavigate, onLogout }: PrescriptionViewProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescriptionModule, setShowPrescriptionModule] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string>('');

  useEffect(() => {
    fetchDoctorAndPatients();
  }, []);

  const fetchDoctorAndPatients = async () => {
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
      setDoctorId(doctorData.id);

      // Récupérer les patients du docteur
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('doctor_patient_relationships')
        .select(`
          patient:patients (
            id,
            name,
            date_of_birth,
            allergies,
            emergency_contact,
            created_at
          ),
          patient_conditions (condition_name, status),
          prescription_medications (medication_name, dosage, frequency, duration, instructions),
          appointments (appointment_date, status)
        `)
        .eq('doctor_id', doctorData.id)
        .eq('status', 'active');

      if (relationshipsError) throw relationshipsError;

      // Transformer les données des patients
      const formattedPatients: Patient[] = (relationshipsData || []).map((rel:any ) => {
        const patient = rel.patient;
        
        // Calculer l'âge
        const age = patient.date_of_birth 
          ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
          : 0;

        // Conditions actuelles
        const conditions = (rel.patient_conditions || [])
          .filter((cond: any) => cond.status === 'active')
          .map((cond: any) => cond.condition_name);

        // Médicaments actuels
        const currentMedications = (rel.prescription_medications || []).map((med: any, index: number) => ({
          id: index.toString(),
          name: med.medication_name,
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || ''
        }));

        // Dernière visite
        const appointments = (rel.appointments || [])
          .filter((apt: any) => apt.status === 'completed')
          .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
        
        const lastVisit = appointments[0]?.appointment_date || patient.created_at;

        // Allergies
        const allergies = patient.allergies || [];

        return {
          id: patient.id,
          name: patient.name,
          age,
          currentMedications,
          allergies,
          conditions,
          lastVisit
        };
      });

      setPatients(formattedPatients);

      // Enregistrer la vue de prescription pour les statistiques
      await supabase
        .from('prescription_views')
        .insert({
          doctor_id: doctorData.id,
          view_date: new Date().toISOString().split('T')[0]
        });

    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.conditions.some(condition => 
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handlePatientSelect = async (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionModule(true);

    // Enregistrer la vue détaillée du patient
    try {
      await supabase
        .from('prescription_views')
        .insert({
          doctor_id: doctorId,
          patient_id: patient.id,
          view_date: new Date().toISOString().split('T')[0]
        });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la vue:', error);
    }
  };

  const handleClosePrescription = () => {
    setShowPrescriptionModule(false);
    setSelectedPatient(null);
  };

  if (showPrescriptionModule && selectedPatient) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          currentPage="prescription"
        />
        
        <div className="flex-1 p-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={handleClosePrescription}
              className="mb-4"
            >
              ← Retour à la liste des patients
            </Button>
            <h1 className="text-3xl text-slate-800 mb-2">Module de Prescription</h1>
            <p className="text-slate-600">
              Rédigez une prescription avec vérification IA des interactions
            </p>
          </div>
          
          <PrescriptionModule 
            selectedPatient={selectedPatient}
            onClose={handleClosePrescription}
            doctorId={doctorId}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          currentPage="prescription"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-slate-600">Chargement des patients...</p>
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
        currentPage="prescription"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-slate-800 mb-2">Prescriptions</h1>
          <p className="text-slate-600">
            Sélectionnez un patient pour créer une prescription
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Patients total</p>
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
                  <p className="text-sm text-slate-600 mb-1">Sous traitement</p>
                  <p className="text-2xl text-slate-800">
                    {patients.filter(p => p.currentMedications.length > 0).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avec allergies</p>
                  <p className="text-2xl text-slate-800">
                    {patients.filter(p => p.allergies.length > 0).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="shadow-sm border-0 mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher un patient par nom ou condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg text-slate-800">{patient.name}</h3>
                        <span className="text-sm text-slate-600">{patient.age} ans</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {patient.conditions.map((condition, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                      
                      {patient.currentMedications.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-slate-600">Traitements actuels: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.currentMedications.map((med, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                {med.name} {med.dosage}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {patient.allergies.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-red-600">Allergies: </span>
                          <span className="text-sm text-red-700">{patient.allergies.join(', ')}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePatientSelect(patient);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Prescrire
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                {patients.length === 0 ? (
                  <>
                    <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg text-slate-600 mb-2">Aucun patient enregistré</h3>
                    <p className="text-slate-500 mb-4">
                      Commencez par ajouter vos premiers patients
                    </p>
                    <Button 
                      onClick={() => onNavigate('patient-management')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Gérer les patients
                    </Button>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg text-slate-600 mb-2">Aucun patient trouvé</h3>
                    <p className="text-slate-500 mb-4">
                      Aucun patient ne correspond à votre recherche
                    </p>
                    <Button 
                      onClick={() => setSearchTerm('')}
                      variant="outline"
                    >
                      Effacer la recherche
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}