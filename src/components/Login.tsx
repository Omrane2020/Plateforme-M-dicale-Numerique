import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs,  TabsList, TabsTrigger } from './ui/tabs';
import {
  Stethoscope,
  User,
  Eye,
  EyeOff,
  UserCog,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { UserType } from '../types/UserType';
import type { Page } from '../types/Page';
//@ts-ignore
import { supabase } from '../supabaseClient';

interface LoginProps {
  onNavigate: (page: Page) => void;
  onLogin: (userType: UserType) => void;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function Login({ onNavigate, onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserType>('doctor');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loginState, setLoginState] = useState<LoginState>({
    isLoading: false,
    error: null,
    success: false
  });

  // Comptes de démonstration pré-remplis
  const demoAccounts = {
    doctor: { email: 'doctor@demo.com', password: 'demo123' },
    secretary: { email: 'secretary@demo.com', password: 'demo123' },
    patient: { email: 'patient@demo.com', password: 'demo123' },
    admin: { email: 'admin@demo.com', password: 'admin123' }
  };
  

  // Remplir automatiquement avec les comptes de démonstration
  const fillDemoCredentials = (role: UserType) => {
if (!selectedRole) return;
setFormData({
  email: demoAccounts[selectedRole].email,
  password: demoAccounts[selectedRole].password,
  rememberMe: false,
});

  setSelectedRole(role);
};


  // Gérer le changement d'onglet
  const handleTabChange = (value: string) => {
    setSelectedRole(value as UserType);
    setLoginState({ isLoading: false, error: null, success: false });

    // Remplir avec les credentials de démonstration pour le nouvel onglet
    fillDemoCredentials(value as UserType);
  };

  // Gérer les changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Effacer les erreurs quand l'utilisateur tape
    if (loginState.error) {
      setLoginState(prev => ({ ...prev, error: null }));
    }
  };

  // Fonction de connexion principale
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setLoginState({
        isLoading: false,
        error: 'Veuillez remplir tous les champs',
        success: false
      });
      return;
    }

    setLoginState({ isLoading: true, error: null, success: false });

    try {
      // Tentative de connexion avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur trouvé');
      }

      // Récupérer les informations supplémentaires de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, is_active, email_verified')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        throw new Error('Erreur lors de la récupération du profil utilisateur');
      }

      // Vérifier si l'utilisateur est actif
      if (!userData.is_active) {
        throw new Error('Votre compte est désactivé. Veuillez contacter l\'administrateur.');
      }

      // Vérifier si l'email est vérifié
      if (!userData.email_verified) {
        throw new Error('Veuillez vérifier votre adresse email avant de vous connecter.');
      }

      // Vérifier que le rôle correspond à l'onglet sélectionné
      if (userData.role !== selectedRole) {
        throw new Error(`Ce compte n'est pas un compte ${getRoleLabel(selectedRole)}. Veuillez utiliser l'onglet approprié.`);
      }

      // Enregistrer la session si "Se souvenir de moi" est coché
      if (formData.rememberMe) {
        // Supabase gère automatiquement la persistance de session
        // Cette option est principalement pour le stockage local si nécessaire
        localStorage.setItem('rememberMe', 'true');
      }

      // Mettre à jour le dernier login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      // Journaliser la tentative de connexion réussie
      await logLoginAttempt(formData.email, true);

      // Connexion réussie
      setLoginState({
        isLoading: false,
        error: null,
        success: true
      });

      // Rediriger après un court délai
      setTimeout(() => {
        onLogin(selectedRole);
      }, 1000);

    } catch (error: any) {
      console.error('Erreur de connexion:', error);

      // Journaliser la tentative de connexion échouée
      await logLoginAttempt(formData.email, false);

      setLoginState({
        isLoading: false,
        error: error.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.',
        success: false
      });
    }
  };

  // Journaliser les tentatives de connexion
  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase
        .from('login_attempts')
        .insert([
          {
            email,
            success,
            attempt_time: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Erreur lors du journal de connexion:', error);
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const handlePasswordReset = async () => {
    if (!formData.email) {
      setLoginState({
        isLoading: false,
        error: 'Veuillez entrer votre adresse email pour réinitialiser votre mot de passe',
        success: false
      });
      return;
    }

    setLoginState({ isLoading: true, error: null, success: false });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setLoginState({
        isLoading: false,
        error: null,
        success: true
      });

    } catch (error: any) {
      setLoginState({
        isLoading: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation',
        success: false
      });
    }
  };

  // Obtenir le libellé du rôle
  const getRoleLabel = (role: UserType): string => {
    switch (role) {
      case 'doctor': return 'médecin';
      case 'secretary': return 'secrétaire';
      case 'patient': return 'patient';
      case 'admin': return 'administrateur';
      default: return 'utilisateur';
    }
  };

  // Remplir les démos au chargement initial
  useEffect(() => {
    fillDemoCredentials('doctor');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onNavigate={onNavigate}
        isAuthenticated={false}
        userType={null}
        onLogout={() => { }}
      />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl text-slate-800 mb-2">Connexion</h1>
            <p className="text-slate-600">
              Accédez à votre espace personnel
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-slate-800">
                Choisissez votre type de compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedRole ?? 'doctor'} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="doctor" className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>Médecin</span>
                  </TabsTrigger>
                  <TabsTrigger value="secretary" className="flex items-center space-x-2">
                    <UserCog className="h-4 w-4" />
                    <span>Secrétaire</span>
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Patient</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </TabsTrigger>
                </TabsList>

                {/* Messages d'état */}
                {loginState.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-700 text-sm">{loginState.error}</span>
                  </div>
                )}

                {loginState.success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 text-sm">
                      Connexion réussie ! Redirection en cours...
                    </span>
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={`exemple@${selectedRole}.com`}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loginState.isLoading}
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
                          disabled={loginState.isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loginState.isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          disabled={loginState.isLoading}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-600">Se souvenir de moi</span>
                      </label>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={loginState.isLoading}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={loginState.isLoading}
                      className={`w-full ${selectedRole === 'admin'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                        } text-white disabled:opacity-50`}
                    >
                      {loginState.isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        `Se connecter comme ${getRoleLabel(selectedRole)}`
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-slate-600">
                    Pas encore de compte ?{' '}
                    <button
                      onClick={() => onNavigate('signup')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      S'inscrire
                    </button>
                  </p>
                </div>

                {/* Comptes de démonstration */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2 font-medium">
                    Comptes de démonstration (cliquez sur les onglets) :
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><strong>Médecin :</strong> doctor@demo.com / demo123</p>
                    <p><strong>Secrétaire :</strong> secretary@demo.com / demo123</p>
                    <p><strong>Patient :</strong> patient@demo.com / demo123</p>
                    <p><strong>Admin :</strong> admin@demo.com / admin123</p>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}