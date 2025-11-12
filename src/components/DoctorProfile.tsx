import { useState, useEffect } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
  Camera,
  Loader2
} from 'lucide-react';
import type { Page } from '../types/Page';
// @ts-ignore
import { supabase } from "../supabaseClient";


interface DoctorProfileProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  address: string;
  licenseNumber: string;
  experience: string;
  about: string;
  profilePicture?: string;
}

interface Certificate {
  id: string;
  name: string;
  institution: string;
  year: string;
  is_verified: boolean;
}

interface Statistics {
  totalPatients: number;
  averageRating: number;
  monthlyConsultations: number;
  totalExperienceYears: number;
}

export function DoctorProfile({ onNavigate, onLogout }: DoctorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    address: '',
    licenseNumber: '',
    experience: '',
    about: ''
  });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalPatients: 0,
    averageRating: 0,
    monthlyConsultations: 0,
    totalExperienceYears: 0
  });

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

  // Récupérer les données du profil
  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les informations de base de l'utilisateur
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name, email, phone')
        .eq('id', user.id)
        .single();

      // Récupérer le profil médecin
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Récupérer les certifications
      const { data: certifications } = await supabase
        .from('doctor_certifications')
        .select('*')
        .eq('doctor_id', doctorProfile?.id);

      // Récupérer les statistiques
      const { data: stats } = await supabase
        .from('doctor_statistics')
        .select('*')
        .eq('doctor_id', doctorProfile?.id)
        .order('period_date', { ascending: false })
        .limit(1)
        .single();

      if (userData && doctorProfile) {
        setProfileData({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || doctorProfile.phone || '',
          specialty: doctorProfile.specialty || '',
          address: doctorProfile.address || '',
          licenseNumber: doctorProfile.license_number || '',
          experience: doctorProfile.experience_years?.toString() || '',
          about: doctorProfile.about || '',
          profilePicture: doctorProfile.profile_picture_url
        });
      }

      if (certifications) {
        setCertificates(certifications.map((cert :Certificate) => ({
          id: cert.id,
          name: cert.name,
          institution: cert.institution,
          year: cert.year.toString(),
          is_verified: cert.is_verified
        })));
      }

      if (stats) {
        setStatistics({
          totalPatients: stats.total_patients || 0,
          averageRating: stats.average_rating || 0,
          monthlyConsultations: stats.monthly_consultations || 0,
          totalExperienceYears: stats.total_experience_years || 0
        });
      } else {
        // Statistiques par défaut
        setStatistics({
          totalPatients: 127,
          averageRating: 4.8,
          monthlyConsultations: 84,
          totalExperienceYears: parseInt(doctorProfile?.experience_years) || 12
        });
      }

    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      // Données par défaut en cas d'erreur
      setProfileData(getDefaultProfileData());
      setCertificates(getDefaultCertificates());
      setStatistics(getDefaultStatistics());
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Mettre à jour les informations de base de l'utilisateur
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Mettre à jour le profil médecin
      const { error: profileError } = await supabase
        .from('doctor_profiles')
        .update({
          specialty: profileData.specialty,
          license_number: profileData.licenseNumber,
          experience_years: parseInt(profileData.experience) || 0,
          about: profileData.about,
          address: profileData.address,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      setIsEditing(false);
      // Recharger les données pour s'assurer de la cohérence
      fetchProfileData();

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des modifications: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer le changement de photo de profil
  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Uploader l'image vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('doctor-profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('doctor-profiles')
        .getPublicUrl(fileName);

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('doctor_profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, profilePicture: publicUrl }));

    } catch (error) {
      console.error('Erreur lors du changement de photo:', error);
      alert('Erreur lors du changement de photo de profil');
    }
  };

  // Données par défaut
  const getDefaultProfileData = (): ProfileData => ({
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'dr.martin@medplatform.com',
    phone: '+33 1 23 45 67 89',
    specialty: 'Cardiologie',
    address: '15 rue de la Santé, 75014 Paris',
    licenseNumber: '75001234567',
    experience: '12',
    about: 'Cardiologue expérimenté avec plus de 12 ans de pratique. Spécialisé dans les maladies cardiovasculaires et la prévention. Diplômé de la faculté de médecine Paris Descartes.'
  });

  const getDefaultCertificates = (): Certificate[] => [
    { id: '1', name: 'Diplôme de Docteur en Médecine', institution: 'Université Paris Descartes', year: '2012', is_verified: true },
    { id: '2', name: 'Spécialisation en Cardiologie', institution: 'Hôpital Saint-Louis', year: '2015', is_verified: true },
    { id: '3', name: 'Formation en Échographie Cardiaque', institution: 'ESC', year: '2018', is_verified: true },
    { id: '4', name: 'Certification en Réanimation Cardiopulmonaire', institution: 'AHA', year: '2023', is_verified: true }
  ];

  const getDefaultStatistics = (): Statistics => ({
    totalPatients: 127,
    averageRating: 4.8,
    monthlyConsultations: 84,
    totalExperienceYears: 12
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar onNavigate={onNavigate} onLogout={onLogout} currentPage="doctor-profile" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Chargement du profil...</p>
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
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : isEditing ? (
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
                    src={profileData.profilePicture || "https://images.unsplash.com/photo-1589104759909-e355f8999f7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGhlYWx0aGNhcmUlMjBwcm9mZXNzaW9uYWxzfGVufDF8fHx8MTc1ODE3OTg2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
                    alt={`Dr. ${profileData.firstName} ${profileData.lastName}`}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                  />
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="profile-picture"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile-picture"
                        className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 cursor-pointer"
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                    </>
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

            {/* Quick Stats */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Patients suivis</span>
                    <span className="text-slate-800">{statistics.totalPatients}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Années d'expérience</span>
                    <span className="text-slate-800">{statistics.totalExperienceYears}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Note moyenne</span>
                    <span className="text-slate-800">{statistics.averageRating}/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Consultations ce mois</span>
                    <span className="text-slate-800">{statistics.monthlyConsultations}</span>
                  </div>
                </div>
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
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-slate-50 rounded-md flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-slate-600" />
                        {profileData.address}
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
                    <Label htmlFor="licenseNumber">Numéro d'ordre</Label>
                    {isEditing ? (
                      <Input
                        id="licenseNumber"
                        value={profileData.licenseNumber}
                        onChange={(e) => handleChange('licenseNumber', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-slate-50 rounded-md">{profileData.licenseNumber}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="about">Présentation</Label>
                    {isEditing ? (
                      <Textarea
                        id="about"
                        value={profileData.about}
                        onChange={(e) => handleChange('about', e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-3 bg-slate-50 rounded-md leading-relaxed">
                        {profileData.about}
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
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="text-slate-800">{cert.name}</h4>
                        <p className="text-sm text-slate-600">{cert.institution} • {cert.year}</p>
                      </div>
                      <Badge variant="secondary" className={cert.is_verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {cert.is_verified ? 'Certifié' : 'En attente'}
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