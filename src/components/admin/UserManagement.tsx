import { useState, useEffect } from 'react';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { userService } from '../../services/userService';
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
  X,
  Save
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import Swal from 'sweetalert2';

interface UserManagementProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'doctor' | 'secretary' | 'patient' | 'admin';
  status: 'active' | 'inactive';
  speciality?: string;
  department?: string;
  age?: number;
  patients?: number;
  assignedDoctors?: number;
  assignedDoctorsNames?: string[];
  totalVisits?: number;
  lastLogin?: string;
  lastVisit?: string;
  joinDate: string;
}

export function UserManagement({ onNavigate, onLogout }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient' as 'patient' | 'doctor' | 'secretary' | 'admin'
  });
  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'patient' as 'patient' | 'doctor' | 'secretary' | 'admin',
    speciality: '',
    department: '',
    age: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Fonction pour afficher les alertes de succès
  const showSuccessAlert = (title: string, message: string) => {
    Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true
    });
  };

  // Fonction pour afficher les alertes d'erreur
  const showErrorAlert = (title: string, message: string) => {
    Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK'
    });
  };

  // Fonction pour afficher les confirmations
  const showConfirmDialog = (title: string, text: string, confirmButtonText: string = 'Confirmer') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText: 'Annuler'
    });
  };

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
      console.log("IDs utilisateurs :", response.data.map((u: User) => u.id));
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  const handleAddUserSubmit = async () => {
    try {
      console.log("Nouvel utilisateur AVANT validation:", newUser);

      if (!newUser.firstName?.trim()) {
        showErrorAlert('Champ manquant', 'Le prénom est obligatoire');
        return;
      }

      if (!newUser.lastName?.trim()) {
        showErrorAlert('Champ manquant', 'Le nom est obligatoire');
        return;
      }

      const userDataToSend = {
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        phone: newUser.phone?.trim() || '',
        role: newUser.role
      };

      console.log("Données envoyées au backend:", userDataToSend);

      const response = await userService.createUser(userDataToSend);
      console.log("Réponse backend:", response);

      showSuccessAlert('Succès', 'Utilisateur ajouté avec succès');
      setShowAddUserModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'patient' });
      loadUsers();
    } catch (err: any) {
      console.error('Erreur complète:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création';
      showErrorAlert('Erreur', errorMessage);
    }
  };

  const handleEditUserSubmit = async () => {
    if (!editingUser) return;

    try {
      console.log("Modification utilisateur:", editingUser.id, editUser);

      // Préparer les données de mise à jour
      const updateData: any = {
        firstName: editUser.firstName.trim(),
        lastName: editUser.lastName.trim(),
        email: editUser.email.trim(),
        phone: editUser.phone?.trim() || '',
        role: editUser.role,
        status: editUser.status
      };

      // Ajouter les champs spécifiques au rôle
      if (editUser.role === 'doctor') {
        updateData.speciality = editUser.speciality;
      }
      if (editUser.role === 'secretary') {
        updateData.department = editUser.department;
      }
      if (editUser.role === 'patient') {
        updateData.age = editUser.age ? parseInt(editUser.age) : undefined;
      }

      console.log("Données de mise à jour:", updateData);

      await userService.updateUser(editingUser.id, updateData);

      showSuccessAlert('Succès', 'Utilisateur modifié avec succès');
      setShowEditUserModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      console.error('Erreur lors de la modification:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la modification';
      showErrorAlert('Erreur', errorMessage);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      speciality: user.speciality || '',
      department: user.department || '',
      age: user.age?.toString() || '',
      status: user.status
    });
    setShowEditUserModal(true);
  };

  const openViewModal = (user: User) => {
    console.log("Voir le profil clicked for user:", user.id);
    setEditingUser(user);
    setEditUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      speciality: user.speciality || '',
      department: user.department || '',
      age: user.age?.toString() || '',
      status: user.status
    });
    setShowEditUserModal(true);
  };

  // Filtrer les utilisateurs par rôle et terme de recherche
  const filteredUsers = {
    doctors: users.filter(user => {
      if (user.role !== 'doctor') return false;

      const searchLower = searchTerm.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();

      return (
        fullName.includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
        (user.speciality && user.speciality.toLowerCase().includes(searchLower))
      );
    }),

    secretaries: users.filter(user => {
      if (user.role !== 'secretary') return false;

      const searchLower = searchTerm.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();

      return (
        fullName.includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
        (user.department && user.department.toLowerCase().includes(searchLower))
      );
    }),

    patients: users.filter(user => {
      if (user.role !== 'patient') return false;

      const searchLower = searchTerm.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();

      return (
        fullName.includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    })
  };

  const handleStatusToggle = async (userId: number, currentStatus: string, userRole: string) => {
    if (userRole !== 'secretary') {
      showErrorAlert('Action non autorisée', 'Seuls les secrétaires peuvent être désactivés');
      return;
    }

    const action = currentStatus === 'active' ? 'désactiver' : 'activer';
    const result = await showConfirmDialog(
      `Confirmer la ${action}`,
      `Êtes-vous sûr de vouloir ${action} ce secrétaire ?`,
      `Oui, ${action}`
    );

    if (result.isConfirmed) {
      try {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await userService.toggleUserStatus(userId, newStatus);

        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        ));

        showSuccessAlert(
          'Statut modifié',
          `Le secrétaire a été ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`
        );
      } catch (err: any) {
        if (err.response?.status === 400) {
          showErrorAlert('Erreur', err.response.data.message);
        } else {
          showErrorAlert('Erreur', 'Erreur lors de la modification du statut');
        }
        console.error('Error toggling user status:', err);
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const userToDelete = users.find(user => user.id === userId);
    const userName = userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : 'cet utilisateur';

    const result = await showConfirmDialog(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ${userName} ? Cette action est irréversible.`,
      'Oui, supprimer'
    );

    if (result.isConfirmed) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        showSuccessAlert('Supprimé', 'Utilisateur supprimé avec succès');
      } catch (err: any) {
        console.error('Erreur lors de la suppression:', err);
        const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
        showErrorAlert('Erreur', errorMessage);
      }
    }
  };

  const getStatusBadge = (status: 'active' | 'inactive') => (
    <Badge className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
      {status === 'active' ? 'Actif' : 'Inactif'}
    </Badge>
  );

  const UserCard = ({ user, type }: { user: User, type: 'doctor' | 'secretary' | 'patient' }) => (
    <Card key={user.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {`${user.firstName} ${user.lastName}`.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold text-gray-900">{`${user.firstName} ${user.lastName}`}</h3>

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

              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
                {getStatusBadge(user.status)}
              </div>
            </div>
          </div>

          {/* Actions avec icones visibles */}
          <div className="flex items-center space-x-2">
            {getStatusBadge(user.status)}
            
            {/* Boutons d'action visibles */}
            <div className="flex items-center space-x-1">
              {/* Bouton Voir */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openViewModal(user)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                title="Voir le profil"
              >
                <Eye className="w-4 h-4" />
              </Button>

              {/* Bouton Modifier */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditModal(user)}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                title="Modifier l'utilisateur"
              >
                <Edit className="w-4 h-4" />
              </Button>

              {/* Bouton Activer/Désactiver (seulement pour secrétaires) */}
              {user.role === 'secretary' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusToggle(user.id, user.status, user.role)}
                  className={`h-8 w-8 p-0 ${
                    user.status === 'active' 
                      ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                      : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                  }`}
                  title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                >
                  {user.status === 'active' ? (
                    <UserX className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </Button>
              )}

              {/* Bouton Supprimer */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                title="Supprimer l'utilisateur"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              {/* Menu déroulant pour actions supplémentaires */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    title="Plus d'actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions supplémentaires</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => openViewModal(user)}>
                    <Eye className="w-4 h-4 mr-2" /> 
                    Voir le profil complet
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => openEditModal(user)}>
                    <Edit className="w-4 h-4 mr-2" /> 
                    Modifier les détails
                  </DropdownMenuItem>

                  {user.role === 'secretary' && (
                    <DropdownMenuItem onClick={() => handleStatusToggle(user.id, user.status, user.role)}>
                      {user.status === 'active' ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" /> 
                          Désactiver le compte
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" /> 
                          Activer le compte
                        </>
                      )}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> 
                    Supprimer définitivement
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {type === 'doctor' && (
            <>
              <div>
                <span className="text-gray-500">Spécialité:</span>
                <p className="font-medium">{user.speciality || 'Non spécifiée'}</p>
              </div>
              <div>
                <span className="text-gray-500">Patients:</span>
                <p className="font-medium">{user.patients || 0}</p>
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
                <p className="font-medium">{user.assignedDoctors || 0}</p>

                {Array.isArray(user.assignedDoctorsNames) && user.assignedDoctorsNames.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {user.assignedDoctorsNames.join(', ')}
                  </p>
                )}
              </div>
            </>
          )}

          {type === 'patient' && (
            <>
              <div>
                <span className="text-gray-500">Âge:</span>
                <p className="font-medium">{user.age || 'Non spécifié'}</p>
              </div>
              <div>
                <span className="text-gray-500">Visites:</span>
                <p className="font-medium">{user.totalVisits || 0}</p>
              </div>
            </>
          )}

          <div>
            <span className="text-gray-500">Dernière connexion:</span>
            <p className="font-medium">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
            </p>
          </div>

          <div>
            <span className="text-gray-500">Inscription:</span>
            <p className="font-medium">
              {new Date(user.joinDate).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="user-management" />
        <div className="flex-1 flex items-center justify-center">
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="user-management" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">
            <p>{error}</p>
            <Button onClick={loadUsers} className="mt-4">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="user-management" />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              <p className="text-gray-600 mt-2">Gérez tous les utilisateurs de la plateforme</p>
            </div>
            <Button onClick={() => setShowAddUserModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
            </Button>
          </div>

          {/* Modal d'ajout d'utilisateur */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out">
              <Card className="w-full max-w-md mx-auto shadow-2xl rounded-xl bg-white/90 backdrop-blur-sm transform transition-transform duration-300 ease-out scale-95 animate-fadeIn">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Ajouter un Utilisateur</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddUserModal(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Prénom"
                          value={newUser.firstName}
                          onChange={handleAddUserChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Nom"
                          value={newUser.lastName}
                          onChange={handleAddUserChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@exemple.com"
                        value={newUser.email}
                        onChange={handleAddUserChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mot de passe"
                        value={newUser.password}
                        onChange={handleAddUserChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+33 1 23 45 67 89"
                        value={newUser.phone}
                        onChange={handleAddUserChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <select
                        id="role"
                        name="role"
                        value={newUser.role}
                        onChange={handleAddUserChange}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Médecin</option>
                        <option value="secretary">Secrétaire</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddUserModal(false)}
                      className="border-gray-300"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleAddUserSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password}
                    >
                      Ajouter l'utilisateur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modal de modification d'utilisateur */}
          {showEditUserModal && editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out">
              <Card className="w-full max-w-md mx-auto shadow-2xl rounded-xl bg-white/90 backdrop-blur-sm transform transition-transform duration-300 ease-out scale-95 animate-fadeIn">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Modifier l'Utilisateur</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditUserModal(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-firstName">Prénom</Label>
                        <Input
                          id="edit-firstName"
                          name="firstName"
                          placeholder="Prénom"
                          value={editUser.firstName}
                          onChange={handleEditUserChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-lastName">Nom</Label>
                        <Input
                          id="edit-lastName"
                          name="lastName"
                          placeholder="Nom"
                          value={editUser.lastName}
                          onChange={handleEditUserChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        name="email"
                        type="email"
                        placeholder="email@exemple.com"
                        value={editUser.email}
                        onChange={handleEditUserChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Téléphone</Label>
                      <Input
                        id="edit-phone"
                        name="phone"
                        placeholder="+33 1 23 45 67 89"
                        value={editUser.phone}
                        onChange={handleEditUserChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Rôle</Label>
                      <select
                        id="edit-role"
                        name="role"
                        value={editUser.role}
                        onChange={handleEditUserChange}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Médecin</option>
                        <option value="secretary">Secrétaire</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Statut</Label>
                      <select
                        id="edit-status"
                        name="status"
                        value={editUser.status}
                        onChange={handleEditUserChange}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                      </select>
                    </div>

                    {editUser.role === 'doctor' && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-speciality">Spécialité</Label>
                        <Input
                          id="edit-speciality"
                          name="speciality"
                          placeholder="Spécialité médicale"
                          value={editUser.speciality}
                          onChange={handleEditUserChange}
                        />
                      </div>
                    )}

                    {editUser.role === 'secretary' && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-department">Département</Label>
                        <Input
                          id="edit-department"
                          name="department"
                          placeholder="Département"
                          value={editUser.department}
                          onChange={handleEditUserChange}
                        />
                      </div>
                    )}

                    {editUser.role === 'patient' && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-age">Âge</Label>
                        <Input
                          id="edit-age"
                          name="age"
                          type="number"
                          placeholder="Âge"
                          value={editUser.age}
                          onChange={handleEditUserChange}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditUserModal(false)}
                      className="border-gray-300"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleEditUserSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!editUser.firstName || !editUser.lastName || !editUser.email}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="doctors" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="doctors" className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4" />
                <span>Médecins ({filteredUsers.doctors.length})</span>
              </TabsTrigger>
              <TabsTrigger value="secretaries" className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>Secrétaires ({filteredUsers.secretaries.length})</span>
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Patients ({filteredUsers.patients.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="doctors" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUsers.doctors.map((doctor) => (
                  <UserCard key={`doctor-${doctor.id}`} user={doctor} type="doctor" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="secretaries" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUsers.secretaries.map((secretary) => (
                  <UserCard key={`secretary-${secretary.id}`} user={secretary} type="secretary" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="patients" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUsers.patients.map((patient) => (
                  <UserCard key={`patient-${patient.id}`} user={patient} type="patient" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}