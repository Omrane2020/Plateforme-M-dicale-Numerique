import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Stethoscope,
  Users,
  Mail,
  Phone,
  Loader2,
  RefreshCw,
  Import
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
//@ts-ignore
import {supabase} from '../supabaseClient';

interface UserManagementProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  user_type: 'doctor' | 'secretary' | 'patient' | 'admin';
  status: 'active' | 'inactive';
  last_login: string | null;
  created_at: string;
  // Champs spécifiques aux médecins
  specialty?: string;
  patient_count?: number;
  // Champs spécifiques aux secrétaires
  department?: string;
  assigned_doctors_count?: number;
  // Champs spécifiques aux patients
  age?: number;
  total_visits?: number;
  last_visit?: string;
}

export function UserManagement({ onNavigate, onLogout }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Charger les utilisateurs depuis Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les profils utilisateurs
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Pour les médecins, récupérer le nombre de patients
      const doctors = profiles?.filter((p:any) => p.user_type === 'doctor') || [];
      const doctorsWithStats = await Promise.all(
        doctors.map(async (doctor:any) => {
          const { count } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('doctor_id', doctor.id);
          
          return {
            ...doctor,
            patient_count: count || 0
          };
        })
      );

      // Pour les patients, récupérer le nombre de visites
      const patients = profiles?.filter((p:any) => p.user_type === 'patient') || [];
      const patientsWithStats = await Promise.all(
        patients.map(async (patient:any) => {
          const { count } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', patient.id);
          
          const { data: lastAppointment } = await supabase
            .from('appointments')
            .select('appointment_date')
            .eq('patient_id', patient.id)
            .order('appointment_date', { ascending: false })
            .limit(1);
          
          return {
            ...patient,
            total_visits: count || 0,
            last_visit: lastAppointment?.[0]?.appointment_date || null
          };
        })
      );

      // Pour les secrétaires, récupérer le nombre de médecins assignés
      const secretaries = profiles?.filter((p:any) => p.user_type === 'secretary') || [];
      const secretariesWithStats = await Promise.all(
        secretaries.map(async (secretary:any) => {
          const { count } = await supabase
            .from('secretary_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('secretary_id', secretary.id);
          
          return {
            ...secretary,
            assigned_doctors_count: count || 0
          };
        })
      );

      // Combiner tous les utilisateurs avec leurs statistiques
      const allUsers = [
        ...doctorsWithStats,
        ...secretariesWithStats,
        ...patientsWithStats,
        ...(profiles?.filter((p:any) => p.user_type === 'admin') || [])
      ];

      setUsers(allUsers);

    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
      // Charger des données simulées en cas d'erreur
      setUsers(getDefaultUsers());
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast.success('Liste des utilisateurs actualisée');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = (type: 'doctor' | 'secretary' | 'patient') => {
    return users
      .filter(user => user.user_type === type)
      .filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      );
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      setActionLoading(userId);
      
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Mettre à jour l'état local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus as 'active' | 'inactive' } : user
      ));

      toast.success(`Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`);

      // Si c'est un médecin, mettre à jour aussi dans la table auth
      if (users.find(u => u.id === userId)?.user_type === 'doctor') {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          { user_metadata: { is_active: newStatus === 'active' } }
        );
        
        if (authError) {
          console.error('Erreur mise à jour auth:', authError);
        }
      }

    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast.error('Erreur lors du changement de statut');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setActionLoading(userId);
      
      // Supprimer d'abord les données liées dans les autres tables
      const userType = users.find(u => u.id === userId)?.user_type;
      
      if (userType === 'doctor') {
        // Supprimer les rendez-vous associés
        await supabase
          .from('appointments')
          .delete()
          .eq('doctor_id', userId);
      } else if (userType === 'patient') {
        // Supprimer les rendez-vous associés
        await supabase
          .from('appointments')
          .delete()
          .eq('patient_id', userId);
      }

      // Supprimer le profil
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Mettre à jour l'état local
      setUsers(prev => prev.filter(user => user.id !== userId));

      toast.success('Utilisateur supprimé avec succès');

    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge variant="secondary">Inactif</Badge>
    );
  };

  const UserCard = ({ user, type }: { user: User, type: 'doctor' | 'secretary' | 'patient' }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{user.phone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(user.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={actionLoading === user.id}>
                  {actionLoading === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate(`user-profile/${user.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir le profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate(`edit-user/${user.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleToggleStatus(user.id, user.status)}
                  disabled={actionLoading === user.id}
                >
                  {user.status === 'active' ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activer
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  disabled={actionLoading === user.id}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {type === 'doctor' && (
            <>
              <div>
                <span className="text-gray-500">Spécialité:</span>
                <p className="font-medium">{user.specialty || 'Non spécifiée'}</p>
              </div>
              <div>
                <span className="text-gray-500">Patients:</span>
                <p className="font-medium">{user.patient_count || 0}</p>
              </div>
            </>
          )}
          {type === 'secretary' && (
            <>
              <div>
                <span className="text-gray-500">Département:</span>
                <p className="font-medium">{user.department || 'Non spécifié'}</p>
              </div>
              <div>
                <span className="text-gray-500">Médecins assignés:</span>
                <p className="font-medium">{user.assigned_doctors_count || 0}</p>
              </div>
            </>
          )}
          {type === 'patient' && (
            <>
              <div>
                <span className="text-gray-500">Âge:</span>
                <p className="font-medium">{user.age ? `${user.age} ans` : 'Non spécifié'}</p>
              </div>
              <div>
                <span className="text-gray-500">Visites:</span>
                <p className="font-medium">{user.total_visits || 0}</p>
              </div>
            </>
          )}
          <div>
            <span className="text-gray-500">Dernière connexion:</span>
            <p className="font-medium">
              {user.last_login 
                ? new Date(user.last_login).toLocaleDateString('fr-FR') 
                : 'Jamais'
              }
            </p>
          </div>
          <div>
            <span className="text-gray-500">Inscription:</span>
            <p className="font-medium">{new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Fonction pour obtenir des utilisateurs par défaut en cas d'erreur
  const getDefaultUsers = (): User[] => {
    return [
      {
        id: '1',
        name: 'Dr. Martin Dubois',
        email: 'martin.dubois@hopital.fr',
        phone: '+33 1 23 45 67 89',
        user_type: 'doctor',
        specialty: 'Cardiologie',
        status: 'active',
        patient_count: 156,
        last_login: '2024-01-15T14:30:00Z',
        created_at: '2023-06-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Marie Secrétaire',
        email: 'marie.secretaire@hopital.fr',
        phone: '+33 1 23 45 67 92',
        user_type: 'secretary',
        department: 'Accueil',
        status: 'active',
        assigned_doctors_count: 3,
        last_login: '2024-01-15T08:00:00Z',
        created_at: '2023-05-10T00:00:00Z'
      },
      {
        id: '3',
        name: 'Jean Dupont',
        email: 'jean.dupont@email.fr',
        phone: '+33 6 12 34 56 78',
        user_type: 'patient',
        age: 45,
        status: 'active',
        total_visits: 8,
        last_visit: '2024-01-10',
        last_login: '2024-01-14T10:30:00Z',
        created_at: '2023-03-15T00:00:00Z'
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="user-management" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  const doctors = filteredUsers('doctor');
  const secretaries = filteredUsers('secretary');
  const patients = filteredUsers('patient');

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="user-management" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              <p className="text-gray-600 mt-2">
                {users.length} utilisateur{users.length > 1 ? 's' : ''} sur la plateforme
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={refreshUsers} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button onClick={() => onNavigate('add-user')}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Médecins</p>
                    <p className="text-2xl font-bold text-blue-600">{doctors.length}</p>
                  </div>
                  <Stethoscope className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Secrétaires</p>
                    <p className="text-2xl font-bold text-green-600">{secretaries.length}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patients</p>
                    <p className="text-2xl font-bold text-purple-600">{patients.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="doctors" className="space-y-6">
            <TabsList>
              <TabsTrigger value="doctors" className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4" />
                <span>Médecins ({doctors.length})</span>
              </TabsTrigger>
              <TabsTrigger value="secretaries" className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>Secrétaires ({secretaries.length})</span>
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Patients ({patients.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="doctors" className="space-y-4">
              {doctors.length === 0 ? (
                <div className="text-center py-12">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun médecin trouvé</p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {doctors.map((doctor) => (
                    <UserCard key={doctor.id} user={doctor} type="doctor" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="secretaries" className="space-y-4">
              {secretaries.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune secrétaire trouvée</p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {secretaries.map((secretary) => (
                    <UserCard key={secretary.id} user={secretary} type="secretary" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="patients" className="space-y-4">
              {patients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun patient trouvé</p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {patients.map((patient) => (
                    <UserCard key={patient.id} user={patient} type="patient" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}