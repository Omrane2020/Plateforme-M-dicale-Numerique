import React, { useState } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  UserCheck,
  UserX,
  Settings,
  Mail,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';

import type { Page } from '../types/Page';
interface SecretaryManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Secretary {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  permissions: {
    patientManagement: boolean;
    appointmentManagement: boolean;
    patientView: boolean;
    notifications: boolean;
  };
  createdDate: string;
  lastLogin: string;
}

export function SecretaryManagement({ onNavigate, onLogout }: SecretaryManagementProps) {
  const [secretaries, setSecretaries] = useState<Secretary[]>([
    {
      id: '1',
      name: 'Sarah Dubois',
      email: 'sarah.dubois@cabinet.fr',
      phone: '06 12 34 56 78',
      status: 'active',
      permissions: {
        patientManagement: true,
        appointmentManagement: true,
        patientView: true,
        notifications: true
      },
      createdDate: '2024-01-10',
      lastLogin: '2024-01-18'
    },
    {
      id: '2',
      name: 'Marine Lambert',
      email: 'marine.lambert@cabinet.fr',
      phone: '06 23 45 67 89',
      status: 'active',
      permissions: {
        patientManagement: false,
        appointmentManagement: true,
        patientView: true,
        notifications: true
      },
      createdDate: '2024-01-05',
      lastLogin: '2024-01-17'
    },
    {
      id: '3',
      name: 'Julie Martin',
      email: 'julie.martin@cabinet.fr',
      phone: '06 34 56 78 90',
      status: 'inactive',
      permissions: {
        patientManagement: true,
        appointmentManagement: true,
        patientView: true,
        notifications: false
      },
      createdDate: '2023-12-15',
      lastLogin: '2024-01-10'
    }
  ]);

  const [isAddingSecretary, setIsAddingSecretary] = useState(false);
  const [newSecretary, setNewSecretary] = useState({
    name: '',
    email: '',
    phone: '',
    permissions: {
      patientManagement: true,
      appointmentManagement: true,
      patientView: true,
      notifications: true
    }
  });

  const handleAddSecretary = () => {
    const secretary: Secretary = {
      id: Date.now().toString(),
      ...newSecretary,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Jamais connecté'
    };

    setSecretaries([...secretaries, secretary]);
    setNewSecretary({
      name: '',
      email: '',
      phone: '',
      permissions: {
        patientManagement: true,
        appointmentManagement: true,
        patientView: true,
        notifications: true
      }
    });
    setIsAddingSecretary(false);
  };

  const handleToggleStatus = (id: string) => {
    setSecretaries(secretaries.map(secretary =>
      secretary.id === id
        ? { ...secretary, status: secretary.status === 'active' ? 'inactive' : 'active' }
        : secretary
    ));
  };

  const handleUpdatePermissions = (id: string, permission: keyof Secretary['permissions'], value: boolean) => {
    setSecretaries(secretaries.map(secretary =>
      secretary.id === id
        ? {
            ...secretary,
            permissions: { ...secretary.permissions, [permission]: value }
          }
        : secretary
    ));
  };

  const handleDeleteSecretary = (id: string) => {
    setSecretaries(secretaries.filter(secretary => secretary.id !== id));
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-800">Inactif</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        currentPage="secretary-management"
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-slate-800 mb-2">Gestion des Secrétaires</h1>
            <p className="text-slate-600">
              Gérez les comptes et permissions de vos secrétaires
            </p>
          </div>
          
          <Dialog open={isAddingSecretary} onOpenChange={setIsAddingSecretary}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Secrétaire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter une secrétaire</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={newSecretary.name}
                    onChange={(e) => setNewSecretary({...newSecretary, name: e.target.value})}
                    placeholder="ex: Sarah Dubois"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSecretary.email}
                    onChange={(e) => setNewSecretary({...newSecretary, email: e.target.value})}
                    placeholder="ex: sarah@cabinet.fr"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={newSecretary.phone}
                    onChange={(e) => setNewSecretary({...newSecretary, phone: e.target.value})}
                    placeholder="ex: 06 12 34 56 78"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    {Object.entries(newSecretary.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">
                          {key === 'patientManagement' && 'Gestion des patients'}
                          {key === 'appointmentManagement' && 'Gestion des rendez-vous'}
                          {key === 'patientView' && 'Consultation des dossiers'}
                          {key === 'notifications' && 'Notifications'}
                        </span>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setNewSecretary({
                              ...newSecretary,
                              permissions: { ...newSecretary.permissions, [key]: checked }
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsAddingSecretary(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddSecretary}>
                    Créer le compte
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Secrétaires</p>
                  <p className="text-2xl text-slate-800">{secretaries.length}</p>
                </div>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Actifs</p>
                  <p className="text-2xl text-slate-800">
                    {secretaries.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Inactifs</p>
                  <p className="text-2xl text-slate-800">
                    {secretaries.filter(s => s.status === 'inactive').length}
                  </p>
                </div>
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Permissions complètes</p>
                  <p className="text-2xl text-slate-800">
                    {secretaries.filter(s => 
                      Object.values(s.permissions).every(p => p)
                    ).length}
                  </p>
                </div>
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secretaries List */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">Liste des secrétaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {secretaries.map((secretary) => (
                <div key={secretary.id} className="p-6 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg text-slate-800">{secretary.name}</h3>
                          {getStatusBadge(secretary.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{secretary.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{secretary.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(secretary.id)}
                        className={secretary.status === 'active' 
                          ? 'border-red-600 text-red-600 hover:bg-red-50'
                          : 'border-green-600 text-green-600 hover:bg-green-50'
                        }
                      >
                        {secretary.status === 'active' ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSecretary(secretary.id)}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm text-slate-700 mb-3">Informations</h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div>Créé le: {new Date(secretary.createdDate).toLocaleDateString('fr-FR')}</div>
                        <div>Dernière connexion: {secretary.lastLogin}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-slate-700 mb-3">Permissions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(secretary.permissions).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                              {key === 'patientManagement' && (
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>Patients</span>
                                </div>
                              )}
                              {key === 'appointmentManagement' && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>RDV</span>
                                </div>
                              )}
                              {key === 'patientView' && (
                                <div className="flex items-center space-x-1">
                                  <FileText className="h-3 w-3" />
                                  <span>Dossiers</span>
                                </div>
                              )}
                              {key === 'notifications' && (
                                <div className="flex items-center space-x-1">
                                  <Settings className="h-3 w-3" />
                                  <span>Notifs</span>
                                </div>
                              )}
                            </span>
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) => 
                                handleUpdatePermissions(secretary.id, key as keyof Secretary['permissions'], checked)
                              }
                              disabled={secretary.status === 'inactive'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {secretaries.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg text-slate-600 mb-2">Aucune secrétaire</h3>
                <p className="text-slate-500 mb-4">
                  Ajoutez votre première secrétaire pour commencer
                </p>
                <Button onClick={() => setIsAddingSecretary(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Secrétaire
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}