import { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  BookOpen,
  Edit,
  Save,
  Camera
} from 'lucide-react';

import type { Page } from '../../types/Page';

interface DoctorProfileProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function DoctorProfile({ onNavigate, onLogout }: DoctorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    address: '',
    licenseNumber: '',
    experience: '',
    about: '',
    certificates: [] as { name: string; institution: string; year: string }[]
  });

  const certificates = [
    { name: 'Diplôme de Docteur en Médecine', institution: 'Université Paris Descartes', year: '2012' },
    { name: 'Spécialisation en Cardiologie', institution: 'Hôpital Saint-Louis', year: '2015' },
    { name: 'Formation en Échographie Cardiaque', institution: 'ESC', year: '2018' },
    { name: 'Certification en Réanimation Cardiopulmonaire', institution: 'AHA', year: '2023' }
  ];

  const specialties = [
    'Médecine générale',
    'Cardiologie',
    'Dermatologie',
    'Endocrinologie',
    'Gastroentérologie',
    'Gynécologie',
    'Neurologie',
    'Ophtalmologie',
    'Orthopédie',
    'Pédiatrie',
    'Psychiatrie',
    'Radiologie',
    'Urgences'
  ];

  const generalDoctorPresentation = 
  "Médecin expérimenté et passionné, dédié à fournir les meilleurs soins à ses patients. " +
  "Spécialisé dans son domaine, avec plusieurs années d'expérience et une approche professionnelle " +
  "alliant expertise et attention personnalisée. Toujours à jour avec les dernières avancées médicales " +
  "et engagé dans la prévention et le bien-être de ses patients.";

  useEffect(() => {
    // Load dynamic data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        specialty: user.specialty || '',
        address: user.address || '',
        licenseNumber: user.licenseNumber || '',
        experience: user.experience || '',
        about: user.about || '',
        certificates: user.certificates || []
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you can send updated data to backend or update localStorage
    localStorage.setItem('user', JSON.stringify(profileData));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        currentPage="doctor-profile"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Mon Profil</h1>
            <p className="text-slate-600">
              Gérez vos informations personnelles et professionnelles
            </p>
          </div>
          <Button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border-0 mb-6">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1589104759909-e355f8999f7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg"
                    alt={`Dr. ${profileData.firstName}`}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                  />
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="text-xl text-slate-800 mb-1">
                  Dr. {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-slate-600 mb-4">{profileData.specialty}</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Compte vérifié
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-slate-50 rounded-md">{profileData.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-slate-50 rounded-md">{profileData.lastName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-slate-50 rounded-md flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-slate-600" />
                        {profileData.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-slate-50 rounded-md flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-slate-600" />
                        {profileData.phone}
                      </p>
                    )}
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Informations professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="specialty">Spécialité</Label>
                    {isEditing ? (
                      <Select 
                        value={profileData.specialty} 
                        onValueChange={(value) => handleChange('specialty', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 p-2 bg-slate-50 rounded-md">{profileData.specialty}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="experience">Années d'expérience</Label>
                    {isEditing ? (
                      <Input
                        id="experience"
                        type="number"
                        value={profileData.experience}
                        onChange={(e) => handleChange('experience', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-slate-50 rounded-md flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-600" />
                        {profileData.experience} ans
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="about">Présentation</Label>
                    {isEditing ? (
                      <Textarea
                        id="about"
                        value={generalDoctorPresentation}
                        onChange={(e) => handleChange('about', e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-3 bg-slate-50 rounded-md leading-relaxed">
                        {generalDoctorPresentation}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diplomas & Certifications */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Diplômes et Certifications
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      Ajouter
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificates.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="text-slate-800">{cert.name}</h4>
                        <p className="text-sm text-slate-600">{cert.institution} • {cert.year}</p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Certifié
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
