import { useState, useEffect } from "react";
import API from "../../services/api";
import { AdminSidebar } from "./AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Search,
  Download,
  RefreshCw,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  LogIn,
  LogOut,
  UserPlus,
  Settings,
  Database,
} from "lucide-react";

interface ActivityLogsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ActivityLogs({ onNavigate, onLogout }: ActivityLogsProps) {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedDate, setSelectedDate] = useState("today");
const fetchLogs = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await API.get("/admin/activity-logs", {
      params: {
        user: selectedUser,
        action: selectedAction,
        date: selectedDate, 
        search: searchTerm
      }
    });
    setActivityLogs(res.data);
  } catch (err: any) {
    setError(err.response?.data?.message || err.message || "Erreur lors de la récupération des logs");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login": return <LogIn className="w-4 h-4" />;
      case "logout": return <LogOut className="w-4 h-4" />;
      case "failed_login": return <XCircle className="w-4 h-4" />;
      case "user_creation": return <UserPlus className="w-4 h-4" />;
      case "create_appointment": return <Calendar className="w-4 h-4" />;
      case "prescription_create": return <Edit className="w-4 h-4" />;
      case "patient_view": return <Eye className="w-4 h-4" />;
      case "profile_update": return <User className="w-4 h-4" />;
      case "settings_update": return <Settings className="w-4 h-4" />;
      case "backup": return <Database className="w-4 h-4" />;
      case "database_error": return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error": return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      case "warning": return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
      case "info": return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      default: return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "doctor": return <Badge className="bg-blue-100 text-blue-800">Médecin</Badge>;
      case "secretary": return <Badge className="bg-green-100 text-green-800">Secrétaire</Badge>;
      case "admin": return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case "patient": return <Badge className="bg-purple-100 text-purple-800">Patient</Badge>;
      case "system": return <Badge className="bg-gray-100 text-gray-800">Système</Badge>;
      default: return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      login: "Connexion",
      logout: "Déconnexion",
      failed_login: "Échec connexion",
      user_creation: "Création utilisateur",
      create_appointment: "Création RDV",
      prescription_create: "Création prescription",
      patient_view: "Consultation patient",
      profile_update: "Mise à jour profil",
      settings_update: "Modification paramètres",
      backup: "Sauvegarde",
      database_error: "Erreur base de données"
    };
    return labels[action] || action;
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = searchTerm === "" ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === "all" || log.userRole === selectedUser;
    const matchesAction = selectedAction === "all" || log.action === selectedAction;
    return matchesSearch && matchesUser && matchesAction;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="activity-logs" />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Logs d'Activité</h1>
              <p className="text-gray-600 mt-2">Historique détaillé des actions système</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchLogs}>
                <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
              </Button>
              <Button onClick={() => alert("Fonction Export à implémenter")}>
                <Download className="w-4 h-4 mr-2" /> Exporter
              </Button>
            </div>
          </div>

          {/* Filtres */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger><SelectValue placeholder="Type d'utilisateur" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    <SelectItem value="doctor">Médecins</SelectItem>
                    <SelectItem value="secretary">Secrétaires</SelectItem>
                    <SelectItem value="admin">Administrateurs</SelectItem>
                    <SelectItem value="patient">Patients</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger><SelectValue placeholder="Type d'action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    <SelectItem value="login">Connexions</SelectItem>
                    <SelectItem value="failed_login">Échecs connexion</SelectItem>
                    <SelectItem value="user_creation">Créations utilisateur</SelectItem>
                    <SelectItem value="create_appointment">Créations RDV</SelectItem>
                    <SelectItem value="prescription_create">Prescriptions</SelectItem>
                    <SelectItem value="settings_update">Modifications paramètres</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger><SelectValue placeholder="Période" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading && <p className="text-gray-500">Chargement des logs...</p>}
          {error && <p className="text-red-600">Erreur: {error}</p>}

          {!loading && !error && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des Activités</CardTitle>
                <CardDescription>{filteredLogs.length} entrée(s) trouvée(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="p-2 bg-gray-100 rounded-lg">{getActionIcon(log.action)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{getActionLabel(log.action)}</h3>
                              {getRoleBadge(log.userRole)}
                              {getSeverityBadge(log.severity)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1"><User className="w-3 h-3" /><span>{log.user}</span></span>
                              <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{formatTimestamp(log.timestamp)}</span></span>
                              <span>IP: {log.ipAddress}</span>
                              <span>{log.userAgent}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
