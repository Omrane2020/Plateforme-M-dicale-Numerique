import React, { useState, useEffect } from 'react';
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
  FileText,
  RefreshCw
} from 'lucide-react';
//@ts-ignore
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

import type { Page } from '../types/Page';

interface SecretaryManagementProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Secretary {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  permissions: {
    patientManagement: boolean;
    appointmentManagement: boolean;
    patientView: boolean;
    notifications: boolean;
  };
  created_at: string;
  last_login?: string;
}

interface NewSecretaryForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  permissions: {
    patientManagement: boolean;
    appointmentManagement: boolean;
    patientView: boolean;
    notifications: boolean;
  };
}

export function SecretaryManagement({ onNavigate, onLogout }: SecretaryManagementProps) {
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [isAddingSecretary, setIsAddingSecretary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newSecretary, setNewSecretary] = useState<NewSecretaryForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    permissions: {
      patientManagement: true,
      appointmentManagement: true,
      patientView: true,
      notifications: true
    }
  });

  useEffect(() => {
    loadSecretaries();
  }, []);

  const loadSecretaries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('secretaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSecretaries(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des secrétaires:', error);
      toast.error('Erreur lors du chargement des secrétaires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSecretary = async () => {
    try {
      setIsCreating(true);

      // Validation
      if (!newSecretary.first_name || !newSecretary.last_name || !newSecretary.email) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Vérifier si l'email existe déjà
      const { data: existingSecretary } = await supabase
        .from('secretaries')
        .select('id')
        .eq('email', newSecretary.email)
        .single();

      if (existingSecretary) {
        toast.error('Un secrétaire avec cet email existe déjà');
        return;
      }

      // Créer le compte utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newSecretary.email,
        email_confirm: true,
        user_metadata: {
          first_name: newSecretary.first_name,
          last_name: newSecretary.last_name,
          role: 'secretary'
        }
      });

      if (authError) throw authError;

      // Créer le secrétaire dans la table secretaries
      const { data: secretary, error: secretaryError } = await supabase
        .from('secretaries')
        .insert({
          user_id: authData.user.id,
          first_name: newSecretary.first_name,
          last_name: newSecretary.last_name,
          email: newSecretary.email,
          phone: newSecretary.phone,
          permissions: newSecretary.permissions,
          status: 'active'
        })
        .select()
        .single();

      if (secretaryError) throw secretaryError;

      // Logger l'action
      await logActivity(secretary.id, 'SECRETARY_CREATED', {
        created_by: 'doctor',
        permissions: newSecretary.permissions
      });

      toast.success('Secrétaire créé avec succès');
      setIsAddingSecretary(false);
      setNewSecretary({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        permissions: {
          patientManagement: true,
          appointmentManagement: true,
          patientView: true,
          notifications: true
        }
      });
      
      loadSecretaries();
    } catch (error) {
      console.error('Erreur lors de la création du secrétaire:', error);
      toast.error('Erreur lors de la création du secrétaire');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (secretary: Secretary) => {
    try {
      const newStatus = secretary.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('secretaries')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', secretary.id);

      if (error) throw error;

      // Logger l'action
      await logActivity(secretary.id, 'STATUS_CHANGED', {
        previous_status: secretary.status,
        new_status: newStatus
      });

      toast.success(`Secrétaire ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`);
      loadSecretaries();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleUpdatePermissions = async (secretaryId: string, permission: keyof Secretary['permissions'], value: boolean) => {
    try {
      const secretary = secretaries.find(s => s.id === secretaryId);
      if (!secretary) return;

      const updatedPermissions = {
        ...secretary.permissions,
        [permission]: value
      };

      const { error } = await supabase
        .from('secretaries')
        .update({ 
          permissions: updatedPermissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', secretaryId);

      if (error) throw error;

      // Logger l'action
      await logActivity(secretaryId, 'PERMISSIONS_UPDATED', {
        permission_changed: permission,
        new_value: value,
        all_permissions: updatedPermissions
      });

      toast.success('Permissions mises à jour avec succès');
      loadSecretaries();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      toast.error('Erreur lors de la mise à jour des permissions');
    }
  };

  const handleDeleteSecretary = async (secretary: Secretary) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${secretary.first_name} ${secretary.last_name} ?`)) {
      return;
    }

    try {
      // Supprimer le secrétaire de la table secretaries
      const { error: secretaryError } = await supabase
        .from('secretaries')
        .delete()
        .eq('id', secretary.id);

      if (secretaryError) throw secretaryError;

      // Supprimer le compte utilisateur Auth si exists
      if (secretary.user_id) {
        const { error: authError } = await supabase.auth.admin.deleteUser(secretary.user_id);
        if (authError) {
          console.warn('Impossible de supprimer le compte Auth:', authError);
        }
      }

      toast.success('Secrétaire supprimé avec succès');
      loadSecretaries();
    } catch (error) {
      console.error('Erreur lors de la suppression du secrétaire:', error);
      toast.error('Erreur lors de la suppression du secrétaire');
    }
  };

  const logActivity = async (secretaryId: string, action: string, details: any) => {
    try {
      await supabase
        .from('secretary_activity_logs')
        .insert({
          secretary_id: secretaryId,
          action,
          details
        });
    } catch (error) {
      console.error('Erreur lors du log d\'activité:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-800">Inactif</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Jamais connecté';
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - loginDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    
    return formatDate(lastLogin);
  };

  const activeSecretaries = secretaries.filter(s => s.status === 'active').length;
  const inactiveSecretaries = secretaries.filter(s => s.status === 'inactive').length;
  const fullPermissionSecretaries = secretaries.filter(s => 
    Object.values(s.permissions).every(p => p)
  ).length;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <DoctorSidebar 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          currentPage="secretary-management"
        />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Chargement des secrétaires...</p>
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
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadSecretaries}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Prénom *</Label>
                      <Input
                        id="first_name"
                        value={newSecretary.first_name}
                        onChange={(e) => setNewSecretary({...newSecretary, first_name: e.target.value})}
                        placeholder="ex: Sarah"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nom *</Label>
                      <Input
                        id="last_name"
                        value={newSecretary.last_name}
                        onChange={(e) => setNewSecretary({...newSecretary, last_name: e.target.value})}
                        placeholder="ex: Dubois"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
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
                    <Button 
                      onClick={handleAddSecretary}
                      disabled={isCreating || !newSecretary.first_name || !newSecretary.last_name || !newSecretary.email}
                    >
                      {isCreating ? 'Création...' : 'Créer le compte'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                  <p className="text-2xl text-slate-800">{activeSecretaries}</p>
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
                  <p className="text-2xl text-slate-800">{inactiveSecretaries}</p>
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
                  <p className="text-2xl text-slate-800">{fullPermissionSecretaries}</p>
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
                          <h3 className="text-lg text-slate-800">
                            {secretary.first_name} {secretary.last_name}
                          </h3>
                          {getStatusBadge(secretary.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{secretary.email}</span>
                          </div>
                          {secretary.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{secretary.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(secretary)}
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
                        onClick={() => handleDeleteSecretary(secretary)}
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
                        <div>Créé le: {formatDate(secretary.created_at)}</div>
                        <div>Dernière connexion: {formatLastLogin(secretary.last_login)}</div>
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