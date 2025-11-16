import { useState } from 'react';
import { DoctorSidebar } from '../doctor/DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  User, 
  Save, 
  Camera, 
  Phone, 
  Heart,
  Plus,
  X
} from 'lucide-react';
import type { Page } from '../../types/Page';
import type { UserType } from '../../types/UserType';
interface AddPatientFormProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userType: UserType;

}

interface PatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  bloodType: string;
  insurance: string;
  doctorNotes: string;
}

export function AddPatientForm({ onNavigate, onLogout, userType }: AddPatientFormProps) {
  const [patientData, setPatientData] = useState<PatientData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: [],
    allergies: [],
    currentMedications: [],
    bloodType: '',
    insurance: '',
    doctorNotes: ''
  });

  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: 'medicalHistory' | 'allergies' | 'currentMedications', value: string) => {
    if (value.trim()) {
      setPatientData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeFromArray = (field: 'medicalHistory' | 'allergies' | 'currentMedications', index: number) => {
    setPatientData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSavePatient = () => {
    // Validation
    if (!patientData.firstName || !patientData.lastName || !patientData.dateOfBirth) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    console.log('Patient data saved:', patientData);
    
    // Navigate back based on user type
    if (userType === 'secretary') {
      onNavigate('secretary-dashboard');
    } else {
      onNavigate('patient-management');
    }
  };

  const isSecretary = userType === 'secretary';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {!isSecretary && (
        <DoctorSidebar 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          currentPage="add-patient"
        />
      )}
      
      <div className={`flex-1 p-8 ${isSecretary ? 'max-w-4xl mx-auto' : ''}`}>
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Nouveau Patient</h1>
            <p className="text-slate-600">
              Ajoutez un nouveau patient à la base de données
            </p>
          </div>
          {isSecretary && (
            <Button variant="outline" onClick={() => onNavigate('secretary-dashboard')}>
              ← Retour Dashboard
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={patientData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Prénom du patient"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={patientData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Nom du patient"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={patientData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Sexe</Label>
                    <Select onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le sexe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homme">Homme</SelectItem>
                        <SelectItem value="femme">Femme</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType">Groupe sanguin</Label>
                    <Select onValueChange={(value) => handleInputChange('bloodType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Groupe sanguin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="insurance">Assurance</Label>
                    <Input
                      id="insurance"
                      value={patientData.insurance}
                      onChange={(e) => handleInputChange('insurance', e.target.value)}
                      placeholder="Nom de l'assurance"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={patientData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Adresse complète"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={patientData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Ville"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      value={patientData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="Code postal"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={patientData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                    <Input
                      id="emergencyContact"
                      value={patientData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="Nom du contact d'urgence"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Téléphone d'urgence</Label>
                    <Input
                      id="emergencyPhone"
                      value={patientData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Informations médicales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Medical History */}
                <div>
                  <Label>Antécédents médicaux</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Ajouter un antécédent médical"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('medicalHistory', newCondition);
                          setNewCondition('');
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        addToArray('medicalHistory', newCondition);
                        setNewCondition('');
                      }}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patientData.medicalHistory.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {condition}
                        <button
                          onClick={() => removeFromArray('medicalHistory', index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <Label>Allergies</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Ajouter une allergie"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('allergies', newAllergy);
                          setNewAllergy('');
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        addToArray('allergies', newAllergy);
                        setNewAllergy('');
                      }}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patientData.allergies.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                        {allergy}
                        <button
                          onClick={() => removeFromArray('allergies', index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <Label>Traitements en cours</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Ajouter un médicament"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('currentMedications', newMedication);
                          setNewMedication('');
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        addToArray('currentMedications', newMedication);
                        setNewMedication('');
                      }}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patientData.currentMedications.map((medication, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {medication}
                        <button
                          onClick={() => removeFromArray('currentMedications', index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Doctor Notes */}
                {!isSecretary && (
                  <div>
                    <Label htmlFor="doctorNotes">Notes du médecin</Label>
                    <Textarea
                      id="doctorNotes"
                      value={patientData.doctorNotes}
                      onChange={(e) => handleInputChange('doctorNotes', e.target.value)}
                      placeholder="Notes personnelles du médecin..."
                      rows={4}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Photo */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Photo (optionnel)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-slate-600 mb-2">Cliquez pour ajouter une photo</p>
                  <Button variant="outline" size="sm">
                    Parcourir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Antécédents:</span>
                  <span className="text-slate-800">{patientData.medicalHistory.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Allergies:</span>
                  <span className="text-slate-800">{patientData.allergies.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Médicaments:</span>
                  <span className="text-slate-800">{patientData.currentMedications.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-sm border-0">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleSavePatient}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer le patient
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => isSecretary ? onNavigate('secretary-dashboard') : onNavigate('patient-management')}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}