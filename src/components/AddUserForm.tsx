import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  ArrowLeft,
  User,
  Stethoscope,
  UserCog,
  Shield,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
//@ts-ignore
import { supabase } from "../supabaseClient";

interface AddUserFormProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AddUserForm({ onNavigate, onLogout }: AddUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    dateOfBirth: '',
    gender: '',
    
    // Informations de connexion
    password: '',
    confirmPassword: '',
    
    // Spécifique médecin
    speciality: '',
    licenseNumber: '',
    experience: '',
    
    // Spécifique secrétaire
    department: '',
    assignedDoctors: [] as string[],
    
    // Permissions
    permissions: {
      canViewPatients: false,
      canEditPatients: false,
      canManageAppointments: false,
      canViewReports: false,
      canManageUsers: false,
      canAccessSettings: false
    }
  });

  const specialities = [
    'Cardiologie',
    'Neurologie',
    'Orthopédie',
    'Dermatologie',
    'Pédiatrie',
    'Gynécologie',
    'Ophtalmologie',
    'Psychiatrie',
    'Radiologie',
    'Anesthésie'
  ];

  const departments = [
    'Accueil',
    'Cardiologie',
    'Neurologie',
    'Orthopédie',
    'Dermatologie',
    'Urgences',
    'Administration'
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (!selectedRole) {
      toast.error('Veuillez sélectionner un rôle');
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'doctor' && !formData.speciality) {
      toast.error('Veuillez sélectionner une spécialité pour le médecin');
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'secretary' && !formData.department) {
      toast.error('Veuillez sélectionner un département pour la secrétaire');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Créer l'utilisateur dans la table users
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email: formData.email,
            password_hash: formData.password, // Dans un cas réel, il faudrait hasher le mot de passe
            role: selectedRole,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            date_of_birth: formData.dateOfBirth || null,
            gender: formData.gender || null,
            is_active: true
          }
        ])
        .select()
        .single();

      if (userError) throw userError;

      const userId = user.id;

      // 2. Créer les permissions
      const { error: permissionsError } = await supabase
        .from('user_permissions')
        .insert([
          {
            user_id: userId,
            can_view_patients: formData.permissions.canViewPatients,
            can_edit_patients: formData.permissions.canEditPatients,
            can_manage_appointments: formData.permissions.canManageAppointments,
            can_view_reports: formData.permissions.canViewReports,
            can_manage_users: formData.permissions.canManageUsers,
            can_access_settings: formData.permissions.canAccessSettings
          }
        ]);

      if (permissionsError) throw permissionsError;

      // 3. Créer l'entrée spécifique selon le rôle
      if (selectedRole === 'doctor') {
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert([
            {
              user_id: userId,
              speciality: formData.speciality,
              license_number: formData.licenseNumber || null,
              experience_years: formData.experience ? parseInt(formData.experience) : null
            }
          ]);

        if (doctorError) throw doctorError;
      }

      if (selectedRole === 'secretary') {
        const { error: secretaryError } = await supabase
          .from('secretaries')
          .insert([
            {
              user_id: userId,
              department: formData.department,
              assigned_doctors: formData.assignedDoctors
            }
          ]);

        if (secretaryError) throw secretaryError;
      }

      toast.success('Utilisateur créé avec succès');
      onNavigate('user-management');

    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      
      if (error.code === '23505') {
        toast.error('Un utilisateur avec cet email existe déjà');
      } else {
        toast.error('Erreur lors de la création de l\'utilisateur');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor': return <Stethoscope className="w-5 h-5" />;
      case 'secretary': return <UserCog className="w-5 h-5" />;
      case 'admin': return <Shield className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'doctor': return 'Médecin';
      case 'secretary': return 'Secrétaire';
      case 'admin': return 'Administrateur';
      default: return 'Utilisateur';
    }
  };

  // Fonction pour récupérer la liste des médecins (pour l'assignation aux secrétaires)
  const [doctors, setDoctors] = useState<any[]>([]);
  
  React.useEffect(() => {
    const fetchDoctors = async () => {
      if (selectedRole === 'secretary') {
        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            first_name,
            last_name,
            doctors!inner (speciality)
          `)
          .eq('role', 'doctor')
          .eq('is_active', true);

        if (!error && data) {
          setDoctors(data);
        }
      }
    };

    fetchDoctors();
  }, [selectedRole]);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate('user-management')}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nouvel Utilisateur</h1>
                <p className="text-gray-600 mt-2">Créer un compte utilisateur dans le système</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sélection du rôle */}
            <Card>
              <CardHeader>
                <CardTitle>Type de compte</CardTitle>
                <CardDescription>Sélectionnez le rôle de l'utilisateur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['doctor', 'secretary', 'admin'].map((role) => (
                    <div
                      key={role}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRole === role
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isLoading && setSelectedRole(role)}
                    >
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(role)}
                        <div>
                          <h3 className="font-semibold">{getRoleLabel(role)}</h3>
                          <p className="text-sm text-gray-500">
                            {role === 'doctor' && 'Accès complet aux dossiers patients'}
                            {role === 'secretary' && 'Gestion des rendez-vous et patients'}
                            {role === 'admin' && 'Administration complète du système'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations de connexion */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de connexion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        required
                        className="pr-10"
                        disabled={isLoading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>

                  {/* Champs spécifiques selon le rôle */}
                  {selectedRole === 'doctor' && (
                    <>
                      <div>
                        <Label htmlFor="speciality">Spécialité *</Label>
                        <Select 
                          value={formData.speciality} 
                          onValueChange={(value) => handleChange('speciality', value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une spécialité" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialities.map((spec) => (
                              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="licenseNumber">Numéro d'ordre</Label>
                        <Input
                          id="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={(e) => handleChange('licenseNumber', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="experience">Années d'expérience</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={formData.experience}
                          onChange={(e) => handleChange('experience', e.target.value)}
                          disabled={isLoading}
                          min="0"
                          max="50"
                        />
                      </div>
                    </>
                  )}

                  {selectedRole === 'secretary' && (
                    <div>
                      <Label htmlFor="department">Département *</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(value) => handleChange('department', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Permissions */}
            {selectedRole && (
              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>Définir les autorisations pour cet utilisateur</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canViewPatients"
                        checked={formData.permissions.canViewPatients}
                        onCheckedChange={(checked) => handlePermissionChange('canViewPatients', checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="canViewPatients">Voir les patients</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canEditPatients"
                        checked={formData.permissions.canEditPatients}
                        onCheckedChange={(checked) => handlePermissionChange('canEditPatients', checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="canEditPatients">Modifier les patients</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canManageAppointments"
                        checked={formData.permissions.canManageAppointments}
                        onCheckedChange={(checked) => handlePermissionChange('canManageAppointments', checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="canManageAppointments">Gérer les RDV</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canViewReports"
                        checked={formData.permissions.canViewReports}
                        onCheckedChange={(checked) => handlePermissionChange('canViewReports', checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="canViewReports">Voir les rapports</Label>
                    </div>

                    {selectedRole === 'admin' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="canManageUsers"
                            checked={formData.permissions.canManageUsers}
                            onCheckedChange={(checked) => handlePermissionChange('canManageUsers', checked as boolean)}
                            disabled={isLoading}
                          />
                          <Label htmlFor="canManageUsers">Gérer les utilisateurs</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="canAccessSettings"
                            checked={formData.permissions.canAccessSettings}
                            onCheckedChange={(checked) => handlePermissionChange('canAccessSettings', checked as boolean)}
                            disabled={isLoading}
                          />
                          <Label htmlFor="canAccessSettings">Accès aux paramètres</Label>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => onNavigate('user-management')}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Création...' : 'Créer l\'utilisateur'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}