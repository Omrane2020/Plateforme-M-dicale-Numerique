import { useEffect, useState } from "react";
import { DoctorSidebar } from "./DoctorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Users, Calendar, Clock, TrendingUp, Heart, AlertCircle, CheckCircle,
  Plus, FileText, Activity, Brain, UserCog, UserCheck
} from "lucide-react";
import API from "../../services/api";
import axios from "axios";
import type { Page } from "../../types/Page";

interface DoctorDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

// Logged-in user
const user = JSON.parse(localStorage.getItem("user") || "{}");

export function DoctorDashboard({ onNavigate, onLogout }: DoctorDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // -------------------- FETCH DATA --------------------
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des rendez-vous", err);
      setAppointments([]);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await API.get("/patients");
      const formatted = res.data.map((p: any) => ({
        id: p.id,
        age: p.age,
        status: p.status,
        lastVisit: p.lastVisit,
        nextAppointment: p.nextAppointment,
        firstName: p.user?.firstName || "",
        lastName: p.user?.lastName || "",
        email: p.user?.email || "",
        phone: p.user?.phone || "",
        gender: p.gender,
        bloodType: p.bloodType,
        medicalHistory: p.medicalHistory,
        allergies: p.allergies,
        currentMedications: p.currentMedications,
        condition: p.condition,
        priority: p.priority,
      }));
      setPatients(formatted);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchAppointments(), fetchPatients()]);
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-600 text-xl">Chargement...</div>;

  // -------------------- UTILS --------------------
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case "in-progress": return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      case "upcoming": return <Badge className="bg-orange-100 text-orange-800">À venir</Badge>;
      default: return <Badge>Inconnu</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => priority === "high" ? 
    <AlertCircle className="h-4 w-4 text-red-600" /> : 
    <CheckCircle className="h-4 w-4 text-green-600" />;

  // Today's appointments
  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(a => a.date === today);

  // Next appointment
  const nextAppointment = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar onNavigate={onNavigate} onLogout={onLogout} currentPage="doctor-dashboard" />

      <div className="flex-1 p-8 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-semibold">Bonjour Dr. {user.firstName} {user.lastName}</h1>
          <p className="text-slate-600">Voici un aperçu de votre activité</p>
        </div>

        {/* Stats */}
        <div className="grid lg:grid-cols-3 xl:grid-cols-7 md:grid-cols-2 gap-6">
          {[
            { icon: <Users className="h-6 w-6 text-blue-600" />, title: "Patients suivis", value: patients.length, change: "+5 ce mois", changeType: "positive" },
            { icon: <Calendar className="h-6 w-6 text-green-600" />, title: "RDV aujourd'hui", value: todaysAppointments.length, change: "À venir", changeType: "neutral" },
            { icon: <Clock className="h-6 w-6 text-orange-600" />, title: "Temps moyen/consultation", value: "22 min", change: "-3 min vs mois dernier", changeType: "positive" },
            { icon: <TrendingUp className="h-6 w-6 text-purple-600" />, title: "Taux de satisfaction", value: "4.8/5", change: "+0.2 ce mois", changeType: "positive" },
            { icon: <FileText className="h-6 w-6 text-green-600" />, title: "Prescriptions ce mois", value: "34", change: "+8 vs mois dernier", changeType: "positive" },
            { icon: <Brain className="h-6 w-6 text-purple-600" />, title: "Interactions détectées", value: "2", change: "IA activée", changeType: "neutral" },
            { icon: <UserCog className="h-6 w-6 text-indigo-600" />, title: "Secrétaires actives", value: "2", change: "3 total", changeType: "neutral" }
          ].map((stat, index) => (
            <Card key={index} className="shadow-sm border-0">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-2xl text-slate-800 mb-1">{stat.value}</p>
                  <p className={`text-sm ${stat.changeType === "positive" ? "text-green-600" : stat.changeType === "negative" ? "text-red-600" : "text-slate-600"}`}>{stat.change}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-full">{stat.icon}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main dashboard grid */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Today's appointments */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Rendez-vous du jour</CardTitle>
                <Button onClick={() => onNavigate("appointments")} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Nouveau RDV
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysAppointments.map((a, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-slate-800 font-medium">{a.patient}</p>
                      <p className="text-sm text-slate-600">{a.time} — {a.type}</p>
                    </div>
                    <div>{getStatusBadge(a.status)}</div>
                  </div>
                ))}
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => onNavigate("appointments")} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    Voir tous les rendez-vous
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Patients */}
          <div>
            <Card className="shadow-sm border-0">
              <CardHeader><CardTitle>Patients récents</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {patients.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <div>
                      <p className="text-slate-800">{p.firstName} {p.lastName}</p>
                      <p className="text-sm text-slate-600">{p.age} ans • {p.condition}</p>
                      <p className="text-xs text-slate-500">Dernière visite: {p.lastVisit || "N/A"}</p>
                    </div>
                    <div>{getPriorityIcon(p.priority)}</div>
                  </div>
                ))}
                <Button onClick={() => onNavigate("patient-management")} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                  Gérer les patients
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant */}
          <div>
            <Card className="shadow-sm border-0">
              <CardHeader><CardTitle className="flex items-center"><Brain className="mr-2 h-5 w-5 text-purple-600" />Assistant IA</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-purple-700 text-sm">L'IA surveille automatiquement les interactions médicamenteuses</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Analyses ce mois</span><span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Interactions évitées</span><span className="font-semibold text-green-600">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Alertes émises</span><span className="font-semibold text-orange-600">5</span>
                  </div>
                  <Button onClick={() => onNavigate("prescription")} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center">
                    <Brain className="mr-2 h-4 w-4" /> Prescrire avec IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secretary Management */}
          <div>
            <Card className="shadow-sm border-0">
              <CardHeader><CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5 text-indigo-600" />Secrétaires</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["Sarah Dubois", "Marine Lambert", "Julie Martin"].map((s, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{s}</span>
                      <span className={i < 2 ? "text-green-600" : "text-slate-400"}>{i < 2 ? "En ligne" : "Hors ligne"}</span>
                    </div>
                  ))}
                  <Button onClick={() => onNavigate("secretary-management")} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center">
                    <UserCog className="mr-2 h-4 w-4" /> Gérer les secrétaires
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-sm border-0">
          <CardHeader><CardTitle>Actions rapides</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { title: "Nouveau RDV", icon: <Calendar />, color: "blue", onClick: () => onNavigate("appointments") },
              { title: "Nouveau Patient", icon: <Plus />, color: "green", onClick: () => onNavigate("patient-management") },
              { title: "Statistiques", icon: <TrendingUp />, color: "indigo", onClick: () => onNavigate("statistics") },
              { title: "Prescription IA", icon: <FileText />, color: "purple", onClick: () => onNavigate("prescription") },
              { title: "Secrétaires", icon: <UserCog />, color: "indigo", onClick: () => onNavigate("secretary-management") },
              { title: "Mon Profil", icon: <Users />, color: "orange", onClick: () => onNavigate("doctor-profile") }
            ].map((action, i) => (
              <Button key={i} onClick={action.onClick} className={`h-20 bg-${action.color}-50 hover:bg-${action.color}-100 text-${action.color}-700 border-${action.color}-200 flex flex-col items-center justify-center space-y-2`} variant="outline">
                {action.icon}
                <span>{action.title}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
