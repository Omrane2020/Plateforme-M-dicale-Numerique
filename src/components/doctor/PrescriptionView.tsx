import React, { useState } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { PrescriptionModule } from './PrescriptionModule';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  FileText, 
  User, 
  Calendar,
  Plus
} from 'lucide-react';

import type { Page } from '../../types/Page';
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

  // Mock patients data
  const patients: Patient[] = [
    {
      id: '1',
      name: 'Marie Dubois',
      age: 45,
      currentMedications: [
        {
          id: '1',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: '1x/jour',
          duration: 'Traitement continu',
          instructions: 'Le matin'
        },
        {
          id: '2',
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: '1x/jour',
          duration: 'Traitement continu',
          instructions: 'Le soir'
        }
      ],
      allergies: ['Pénicilline'],
      conditions: ['Hypertension'],
      lastVisit: '2024-01-15'
    },
    {
      id: '2',
      name: 'Pierre Martin',
      age: 67,
      currentMedications: [
        {
          id: '3',
          name: 'Metformine',
          dosage: '500mg',
          frequency: '2x/jour',
          duration: 'Traitement continu',
          instructions: 'Pendant les repas'
        }
      ],
      allergies: ['Sulfamides'],
      conditions: ['Diabète type 2', 'Hypertension'],
      lastVisit: '2024-01-14'
    },
    {
      id: '3',
      name: 'Sophie Lambert',
      age: 34,
      currentMedications: [],
      allergies: [],
      conditions: ['Grossesse - 2ème trimestre'],
      lastVisit: '2024-01-13'
    },
    {
      id: '4',
      name: 'Jean Dupont',
      age: 52,
      currentMedications: [
        {
          id: '4',
          name: 'Atorvastatine',
          dosage: '20mg',
          frequency: '1x/jour',
          duration: 'Traitement continu',
          instructions: 'Le soir'
        }
      ],
      allergies: [],
      conditions: ['Hypercholestérolémie'],
      lastVisit: '2024-01-10'
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.conditions.some(condition => 
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionModule(true);
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
          />
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

        {/* Search */}
        <Card className="shadow-sm border-0 mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher un patient..."
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
                <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg text-slate-600 mb-2">Aucun patient trouvé</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm 
                    ? "Aucun patient ne correspond à votre recherche" 
                    : "Aucun patient disponible pour prescription"
                  }
                </p>
                <Button 
                  onClick={() => onNavigate('patient-management')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Gérer les patients
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}