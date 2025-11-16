import React, { useState } from 'react';
import { Header } from './Header';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Stethoscope, User, Eye, EyeOff, UserCog, Shield } from 'lucide-react';
import {login} from '../../services/authService'
import type { UserType } from '../../types/UserType';
import type { Page } from '../../types/Page';
interface LoginProps {
  onNavigate: (page: Page) => void;
  onLogin: (userType: UserType) => void;
}

export function Login({ onNavigate, onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

const handleLogin = async (userType: UserType) => {
  try {
    const response = await login(formData.email, formData.password);

    // Save token
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    alert("Connexion réussie !");
    onLogin(userType);
  } catch (error: any) {
    alert(error.message || "Erreur de connexion");
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

          <Card className="shadow-lg border-0  border-cyan-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-slate-800">
                Choisissez votre type de compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="doctor" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6  hover border-blue-800">
                  <TabsTrigger value="doctor" className="
  flex items-center space-x-2
  data-[state=active]:border 
  data-[state=active]:border-blue-600 
  data-[state=active]:bg-blue-50 
  data-[state=active]:text-blue-600
"
                  >
                    <Stethoscope className="h-4 w-4" />
                    <span>Médecin</span>
                  </TabsTrigger>
                  <TabsTrigger value="secretary" className="
  flex items-center space-x-2
  data-[state=active]:border 
  data-[state=active]:border-purple-600 
  data-[state=active]:bg-purple-50 
  data-[state=active]:text-purple-600
"
                  >
                    <UserCog className="h-4 w-4" />
                    <span>Secrétaire</span>
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="
  flex items-center space-x-2
  data-[state=active]:border 
  data-[state=active]:border-green-600 
  data-[state=active]:bg-green-50 
  data-[state=active]:text-green-600
"
                  >
                    <User className="h-4 w-4" />
                    <span>Patient</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="
 flex items-center space-x-2
  data-[state=active]:border 
  data-[state=active]:border-red-600 
  data-[state=active]:bg-red-50 
  data-[state=active]:text-red-600

"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="doctor">
                  <form onSubmit={(e) => { e.preventDefault(); handleLogin('doctor'); }}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="doctor-email">Adresse email</Label>
                        <Input
                          id="doctor-email"
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
                        <Label htmlFor="doctor-password">Mot de passe</Label>
                        <div className="relative mt-1">
                          <Input
                            id="doctor-password"
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

                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-600">Se souvenir de moi</span>
                        </label>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        Se connecter comme médecin
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="secretary">
                  <form onSubmit={(e) => { e.preventDefault(); handleLogin('secretary'); }}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="secretary-email">Adresse email</Label>
                        <Input
                          id="secretary-email"
                          name="email"
                          type="email"
                          placeholder="sarah.dubois@cabinet.fr"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="secretary-password">Mot de passe</Label>
                        <div className="relative mt-1">
                          <Input
                            id="secretary-password"
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

                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-600">Se souvenir de moi</span>
                        </label>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Se connecter comme secrétaire
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="patient">
                  <form onSubmit={(e) => { e.preventDefault(); handleLogin('patient'); }}>
                    <div className="space-y-4">
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

                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-600">Se souvenir de moi</span>
                        </label>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        Se connecter comme patient
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="admin">
                  <form onSubmit={(e) => { e.preventDefault(); handleLogin('admin'); }}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-email">Adresse email</Label>
                        <Input
                          id="admin-email"
                          name="email"
                          type="email"
                          placeholder="admin@system.fr"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="admin-password">Mot de passe</Label>
                        <div className="relative mt-1">
                          <Input
                            id="admin-password"
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

                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-600">Se souvenir de moi</span>
                        </label>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        Se connecter comme administrateur
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

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

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">Comptes de démonstration :</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>Médecin :</strong> doctor@demo.com / demo123</p>
                  <p><strong>Secrétaire :</strong> secretary@demo.com / demo123</p>
                  <p><strong>Patient :</strong> patient@demo.com / demo123</p>
                  <p><strong>Admin :</strong> admin@demo.com / admin123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}