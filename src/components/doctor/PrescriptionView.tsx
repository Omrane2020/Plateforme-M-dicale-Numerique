import React, { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, User } from 'lucide-react';
import API from '../../services/api';
import type { Page } from '../../types/Page';

interface PrescriptionViewProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  doctorId: number;
  condition?: string;
  prescription?: string;
}

export function PrescriptionView({ onNavigate, onLogout }: PrescriptionViewProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescriptionText, setPrescriptionText] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get('/patients');
        const filteredPatients = res.data
          .filter((p: any) => p.doctorId === user.id)
          .map((p: any) => ({
            id: p.id,
            firstName: p.user?.firstName || '',
            lastName: p.user?.lastName || '',
            age: p.age,
            doctorId: p.doctorId,
            condition: p.condition,
            prescription: '', // default
          }));

        // Fetch latest prescription for each patient
        const patientsWithPrescriptions = await Promise.all(
          filteredPatients.map(async (patient: Patient) => {
            try {
              const presRes = await API.get(`/prescriptions/patient/${patient.id}`);
              patient.prescription = presRes.data?.[0]?.content || '';
            } catch (err) {
              console.error(`Error fetching prescription for patient ${patient.id}`, err);
              patient.prescription = '';
            }
            return patient;
          })
        );

        setPatients(patientsWithPrescriptions);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError("Impossible de récupérer vos patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user.id]);

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const nameMatch = fullName.includes(searchTerm.toLowerCase());
    const conditionMatch = patient.condition?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || conditionMatch;
  });

  const handlePrescribeClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setPrescriptionText(patient.prescription || '');
  };

  const handleSubmitPrescription = async () => {
    if (!selectedPatient) return;

    try {
      await API.post('/prescriptions', {
        patientId: selectedPatient.id,
        doctorId: user.id,
        content: prescriptionText,
      });

      alert('Prescription enregistrée !');

      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedPatient.id ? { ...p, prescription: prescriptionText } : p
        )
      );
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la prescription', err);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSelectedPatient(null);
      setPrescriptionText('');
    }
  };

  if (selectedPatient) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar onNavigate={onNavigate} onLogout={onLogout} currentPage="prescription" />
        <div className="flex-1 p-8">
          <Button
            variant="outline"
            onClick={() => setSelectedPatient(null)}
            className="mb-4"
          >
            ← Retour à la liste des patients
          </Button>

          <h1 className="text-2xl text-slate-800 mb-4">
            Prescription pour {selectedPatient.firstName} {selectedPatient.lastName}
          </h1>

          {selectedPatient.condition && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 mb-4">
              {selectedPatient.condition}
            </Badge>
          )}

          <textarea
            placeholder="Écrire la prescription ici..."
            value={prescriptionText}
            onChange={(e) => setPrescriptionText(e.target.value)}
            className="w-full h-40 p-4 border rounded-lg mb-4 resize-none"
          />

          <Button
            onClick={handleSubmitPrescription}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enregistrer la prescription
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar onNavigate={onNavigate} onLogout={onLogout} currentPage="prescription" />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl text-slate-800 mb-2">Mes Patients</h1>
          <p className="text-slate-600">Liste des patients qui vous sont assignés</p>
        </div>

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

        {loading ? (
          <p>Chargement des patients...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filteredPatients.length === 0 ? (
          <p>Aucun patient assigné à vous</p>
        ) : (
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
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg text-slate-800">{patient.firstName} {patient.lastName}</h3>
                            <span className="text-sm text-slate-600">{patient.age} ans</span>
                          </div>
                          {patient.condition && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {patient.condition}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handlePrescribeClick(patient)}
                      >
                        Prescrire
                      </Button>
                    </div>
                    <div className="pl-16 text-slate-600 text-sm">
                      {patient.prescription
                        ? `Prescription: ${patient.prescription}`
                        : 'Aucune prescription'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
