import React, { useState } from 'react';
import { Header } from './Header';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Stethoscope, User, Eye, EyeOff, CheckCircle } from 'lucide-react';

type Page = 'home' | 'login' | 'signup' | 'doctor-dashboard' | 'doctor-profile' | 'patient-management' | 'appointments' | 'patient-dashboard' | 'contact' | 'subscription-plans';
type UserType = 'doctor' | 'patient' | null;

interface SignupProps {
  onNavigate: (page: Page) => void;
  onLogin: (userType: UserType) => void;
}

export function Signup({ onNavigate, onLogin }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSignup = (userType: UserType) => {
    if (formData.email && formData.password && formData.password === formData.confirmPassword && formData.acceptTerms) {
      if (userType === 'doctor') {
        // Rediriger vers les plans d'abonnement pour les médecins
        onNavigate('subscription-plans');
      } else {
        // Connecter directement les patients
        onLogin(userType);
      }
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
                          Inscription Médecin - Abonnement Requis
                        </h4>
                        <p className="text-sm text-blue-700">
                          Pour créer votre compte médecin, vous devrez choisir et souscrire à un plan d'abonnement. 
                          Profitez de <strong>14 jours d'essai gratuit</strong> pour découvrir toutes nos fonctionnalités.
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
                        />
                      </div>

                      <div>
                        <Label htmlFor="specialty">Spécialité</Label>
                        <Select onValueChange={handleSelectChange}>
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
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
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
                        />
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
                        />
                        <Label htmlFor="acceptTerms" className="text-sm leading-5">
                          J'accepte les{' '}
                          <button type="button" className="text-blue-600 hover:text-blue-800">
                            conditions d'utilisation
                          </button>{' '}
                          et la{' '}
                          <button type="button" className="text-blue-600 hover:text-blue-800">
                            politique de confidentialité
                          </button>
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!formData.acceptTerms || formData.password !== formData.confirmPassword}
                      >
                        Choisir un abonnement
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
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
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
                        />
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
                        />
                        <Label htmlFor="patient-acceptTerms" className="text-sm leading-5">
                          J'accepte les{' '}
                          <button type="button" className="text-blue-600 hover:text-blue-800">
                            conditions d'utilisation
                          </button>{' '}
                          et la{' '}
                          <button type="button" className="text-blue-600 hover:text-blue-800">
                            politique de confidentialité
                          </button>
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!formData.acceptTerms || formData.password !== formData.confirmPassword}
                      >
                        Créer un compte patient
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
