import { useState } from 'react';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  Phone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface UserManagementProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function UserManagement({ onNavigate, onLogout }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Données simulées
  const doctors = [
    {
      id: 1,
      name: 'Dr. Martin Dubois',
      email: 'martin.dubois@hopital.fr',
      phone: '+33 1 23 45 67 89',
      speciality: 'Cardiologie',
      status: 'active',
      patients: 156,
      lastLogin: '2024-01-15 14:30',
      joinDate: '2023-06-15'
    },
    {
      id: 2,
      name: 'Dr. Sophie Laurent',
      email: 'sophie.laurent@hopital.fr',
      phone: '+33 1 23 45 67 90',
      speciality: 'Neurologie',
      status: 'active',
      patients: 142,
      lastLogin: '2024-01-15 09:15',
      joinDate: '2023-08-20'
    },
    {
      id: 3,
      name: 'Dr. Pierre Martin',
      email: 'pierre.martin@hopital.fr',
      phone: '+33 1 23 45 67 91',
      speciality: 'Orthopédie',
      status: 'inactive',
      patients: 98,
      lastLogin: '2024-01-10 16:45',
      joinDate: '2023-09-10'
    }
  ];

  const secretaries = [
    {
      id: 1,
      name: 'Marie Secrétaire',
      email: 'marie.secretaire@hopital.fr',
      phone: '+33 1 23 45 67 92',
      department: 'Accueil',
      status: 'active',
      assignedDoctors: 3,
      lastLogin: '2024-01-15 08:00',
      joinDate: '2023-05-10'
    },
    {
      id: 2,
      name: 'Julie Assistant',
      email: 'julie.assistant@hopital.fr',
      phone: '+33 1 23 45 67 93',
      department: 'Cardiologie',
      status: 'active',
      assignedDoctors: 2,
      lastLogin: '2024-01-15 07:45',
      joinDate: '2023-07-22'
    }
  ];

  const patients = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.fr',
      phone: '+33 6 12 34 56 78',
      age: 45,
      status: 'active',
      lastVisit: '2024-01-10',
      totalVisits: 8,
      joinDate: '2023-03-15'
    },
    {
      id: 2,
      name: 'Marie Durand',
      email: 'marie.durand@email.fr',
      phone: '+33 6 12 34 56 79',
      age: 32,
      status: 'active',
      lastVisit: '2024-01-12',
      totalVisits: 15,
      joinDate: '2022-11-20'
    },
    {
      id: 3,
      name: 'Paul Moreau',
      email: 'paul.moreau@email.fr',
      phone: '+33 6 12 34 56 80',
      age: 58,
      status: 'inactive',
      lastVisit: '2023-12-15',
      totalVisits: 3,
      joinDate: '2023-08-05'
    }
  ];

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge variant="secondary">Inactif</Badge>
    );
  };

  const UserCard = ({ user, type }: { user: any, type: 'doctor' | 'secretary' | 'patient' }) => (
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
              <div className="flex items-center space-x-2 mt-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{user.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(user.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir le profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem>
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
                <DropdownMenuItem className="text-red-600">
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
                <p className="font-medium">{user.speciality}</p>
              </div>
              <div>
                <span className="text-gray-500">Patients:</span>
                <p className="font-medium">{user.patients}</p>
              </div>
            </>
          )}
          {type === 'secretary' && (
            <>
              <div>
                <span className="text-gray-500">Département:</span>
                <p className="font-medium">{user.department}</p>
              </div>
              <div>
                <span className="text-gray-500">Médecins assignés:</span>
                <p className="font-medium">{user.assignedDoctors}</p>
              </div>
            </>
          )}
          {type === 'patient' && (
            <>
              <div>
                <span className="text-gray-500">Âge:</span>
                <p className="font-medium">{user.age} ans</p>
              </div>
              <div>
                <span className="text-gray-500">Visites:</span>
                <p className="font-medium">{user.totalVisits}</p>
              </div>
            </>
          )}
          <div>
            <span className="text-gray-500">Dernière connexion:</span>
            <p className="font-medium">{user.lastLogin || user.lastVisit}</p>
          </div>
          <div>
            <span className="text-gray-500">Inscription:</span>
            <p className="font-medium">{new Date(user.joinDate).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
            <Button onClick={() => onNavigate('add-user')}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </div>

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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {doctors.map((doctor) => (
                  <UserCard key={doctor.id} user={doctor} type="doctor" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="secretaries" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {secretaries.map((secretary) => (
                  <UserCard key={secretary.id} user={secretary} type="secretary" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="patients" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {patients.map((patient) => (
                  <UserCard key={patient.id} user={patient} type="patient" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}