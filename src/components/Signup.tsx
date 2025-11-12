import React, { useState } from 'react';
import { Header } from './Header';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Stethoscope, User, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
//@ts-ignore
import { supabase } from '../supabaseClient';
import type { Page } from '../types/Page';
import type { UserType } from '../types/UserType';

interface SignupProps {
  onNavigate: (page: Page) => void;
  onLogin: (userType: UserType) => void;
}

export function Signup({ onNavigate, onLogin }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    phone: '',
    acceptTerms: false
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

  const handleSignup = async (userType: UserType) => {
    if (!formData.acceptTerms) {
      toast.error('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Inscription avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_type: userType,
            phone: formData.phone,
            specialty: userType === 'doctor' ? formData.specialty : null
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Créer le profil utilisateur dans la table profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            user_type: userType,
            specialty: userType === 'doctor' ? formData.specialty : null,
            is_active: userType === 'patient', // Les patients sont actifs immédiatement
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
          // On continue quand même car l'utilisateur est créé dans Auth
        }

        if (userType === 'doctor') {
          // Pour les médecins, créer un enregistrement en attente de paiement
          const { error: doctorError } = await supabase
            .from('doctor_registrations')
            .insert({
              user_id: authData.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              specialty: formData.specialty,
              status: 'pending_payment',
              created_at: new Date().toISOString()
            });

          if (doctorError) {
            console.error('Erreur création registration docteur:', doctorError);
          }

          toast.success('Compte créé ! Redirection vers les plans d\'abonnement...');
          setTimeout(() => onNavigate('subscription-plans'), 2000);
        } else {
          // Pour les patients, connexion directe
          toast.success('Compte patient créé avec succès !');
          onLogin(userType);
        }
      }

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      
      if (error.message.includes('User already registered')) {
        toast.error('Un compte avec cet email existe déjà');
      } else if (error.message.includes('Invalid email')) {
        toast.error('Adresse email invalide');
      } else {
        toast.error('Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      specialty: value
    });
  };

  const isFormValid = (userType: UserType) => {
    const baseValid = formData.firstName && 
                     formData.lastName && 
                     formData.email && 
                     formData.password && 
                     formData.password === formData.confirmPassword && 
                     formData.password.length >= 6 &&
                     formData.acceptTerms;

    if (userType === 'doctor') {
      return baseValid && formData.specialty;
    }
    
    return baseValid;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onNavigate={onNavigate} 
        isAuthenticated={false} 
        userType={null} 
        onLogout={() => {}} 
      />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl text-slate-800 mb-2">Inscription</h1>
            <p className="text-slate-600">
              Créez votre compte en quelques minutes
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-slate-800">
                Choisissez votre type de compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="doctor" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="doctor" className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>Médecin</span>
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Patient</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="doctor">
                  {/* Information importante pour les médecins */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                          Inscription Médecin - Paiement Western Union
                        </h4>
                        <p className="text-sm text-blue-700">
                          <strong>Étape 1 :</strong> Inscrivez-vous en remplissant ce formulaire<br />
                          <strong>Étape 2 :</strong> Choisissez votre plan d'abonnement<br />
                          <strong>Étape 3 :</strong> Effectuez le paiement via Western Union<br />
                          <strong>Étape 4 :</strong> Votre compte sera activé sous 24-48h après vérification
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleSignup('doctor'); }}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="Pierre"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="mt-1"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nom</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Martin"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="mt-1"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Adresse email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="dr.martin@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="specialty">Spécialité</Label>
                        <Select onValueChange={handleSelectChange} disabled={loading}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionnez votre spécialité" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+33 1 23 45 67 89"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-1"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="password">Mot de passe</Label>
                        <div className="relative mt-1">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="pr-10"
                            disabled={loading}
                            minLength={6}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          disabled={loading}
                        />
                        {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                        )}
                      </div>

                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          required
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={loading}
                        />
                        <Label htmlFor="acceptTerms" className="text-sm leading-5">
                          J'accepte les{' '}
                          <button 
                            type="button" 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => onNavigate('terms')}
                          >
                            conditions d'utilisation
                          </button>{' '}
                          et la{' '}
                          <button 
                            type="button" 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => onNavigate('privacy')}
                          >
                            politique de confidentialité
                          </button>
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!isFormValid('doctor') || loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Création du compte...
                          </>
                        ) : (
                          'S\'inscrire et choisir un plan'
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="patient">
                  <form onSubmit={(e) => { e.preventDefault(); handleSignup('patient'); }}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="patient-firstName">Prénom</Label>
                          <Input
                            id="patient-firstName"
                            name="firstName"
                            type="text"
                            placeholder="Marie"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="mt-1"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="patient-lastName">Nom</Label>
                          <Input
                            id="patient-lastName"
                            name="lastName"
                            type="text"
                            placeholder="Dupont"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="mt-1"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="patient-email">Adresse email</Label>
                        <Input
                          id="patient-email"
                          name="email"
                          type="email"
                          placeholder="marie.dupont@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="patient-phone">Téléphone</Label>
                        <Input
                          id="patient-phone"
                          name="phone"
                          type="tel"
                          placeholder="+33 1 23 45 67 89"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-1"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="patient-password">Mot de passe</Label>
                        <div className="relative mt-1">
                          <Input
                            id="patient-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="pr-10"
                            disabled={loading}
                            minLength={6}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                      </div>

                      <div>
                        <Label htmlFor="patient-confirmPassword">Confirmer le mot de passe</Label>
                        <Input
                          id="patient-confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          disabled={loading}
                        />
                        {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                        )}
                      </div>

                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="patient-acceptTerms"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          required
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={loading}
                        />
                        <Label htmlFor="patient-acceptTerms" className="text-sm leading-5">
                          J'accepte les{' '}
                          <button 
                            type="button" 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => onNavigate('terms')}
                          >
                            conditions d'utilisation
                          </button>{' '}
                          et la{' '}
                          <button 
                            type="button" 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => onNavigate('privacy')}
                          >
                            politique de confidentialité
                          </button>
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!isFormValid('patient') || loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Création du compte...
                          </>
                        ) : (
                          'Créer un compte patient'
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-slate-600">
                  Déjà inscrit ?{' '}
                  <button 
                    onClick={() => onNavigate('login')}
                    className="text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    Se connecter
                  </button>
                </p>
              </div>

              {/* Security notice */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p><strong>Sécurisé et confidentiel</strong></p>
                  <p>Vos données sont protégées selon les normes RGPD et de sécurité médicale.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}