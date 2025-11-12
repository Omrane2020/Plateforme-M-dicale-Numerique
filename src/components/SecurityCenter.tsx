import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Activity,
  Globe,
  User,
  Clock,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
//@ts-ignore
import { supabase } from '../supabaseClient';

interface SecurityCenterProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface SecurityThreat {
  id: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  details: string;
  status: 'blocked' | 'investigating' | 'monitored' | 'resolved';
  country: string;
  ip_address?: string;
}

interface Vulnerability {
  id: number;
  title: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
  status: 'open' | 'resolved';
}

interface ActiveSession {
  id: number;
  user: string;
  role: string;
  ip_address: string;
  location: string;
  device: string;
  last_activity: string;
  status: 'active' | 'inactive';
}

export function SecurityCenter({ onNavigate, onLogout }: SecurityCenterProps) {
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: true,
    twoFactorAuth: false,
    ipWhitelist: true,
    sessionTimeout: true,
    bruteForceProtection: true,
    encryptionAtRest: true,
    auditLogging: true,
    vulnerabilityScanning: false
  });

  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [securityScore, setSecurityScore] = useState(87);
  const [loading, setLoading] = useState(true);

  // Charger les données de sécurité
  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSecurityThreats(),
        fetchVulnerabilities(),
        fetchActiveSessions(),
        calculateSecurityScore()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données de sécurité:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityThreats = async () => {
    // Récupérer les menaces depuis Supabase
    const { data, error } = await supabase
      .from('security_threats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erreur lors du chargement des menaces:', error);
      // Données simulées en cas d'erreur
      setThreats([
        {
          id: 1,
          type: 'Tentative de connexion suspecte',
          severity: 'high',
          timestamp: '2024-01-15T14:15:33Z',
          details: 'Multiple failed login attempts from IP 89.45.123.67',
          status: 'blocked',
          country: 'Russie',
          ip_address: '89.45.123.67'
        },
        {
          id: 2,
          type: 'Accès non autorisé',
          severity: 'medium',
          timestamp: '2024-01-15T13:22:18Z',
          details: 'Access attempt to admin panel from unknown device',
          status: 'investigating',
          country: 'Chine',
          ip_address: '156.78.90.123'
        }
      ]);
    } else if (data && data.length > 0) {
      setThreats(data);
    }
  };

  const fetchVulnerabilities = async () => {
    // Récupérer les vulnérabilités depuis Supabase
    const { data, error } = await supabase
      .from('security_vulnerabilities')
      .select('*')
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des vulnérabilités:', error);
      // Données simulées en cas d'erreur
      setVulnerabilities([
        {
          id: 1,
          title: 'Certificat SSL expirant',
          severity: 'medium',
          description: 'Le certificat SSL expire dans 15 jours',
          recommendation: 'Renouveler le certificat SSL',
          status: 'open'
        },
        {
          id: 2,
          title: 'Mots de passe faibles',
          severity: 'high',
          description: '12 utilisateurs ont des mots de passe faibles',
          recommendation: 'Forcer le changement de mot de passe',
          status: 'open'
        }
      ]);
    } else if (data && data.length > 0) {
      setVulnerabilities(data);
    }
  };

  const fetchActiveSessions = async () => {
    // Récupérer les sessions actives depuis Supabase
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('status', 'active')
      .order('last_activity', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      // Données simulées en cas d'erreur
      setActiveSessions([
        {
          id: 1,
          user: 'Dr. Martin Dubois',
          role: 'doctor',
          ip_address: '192.168.1.100',
          location: 'Paris, France',
          device: 'Chrome on Windows',
          last_activity: '2024-01-15T14:30:00Z',
          status: 'active'
        },
        {
          id: 2,
          user: 'Marie Secrétaire',
          role: 'secretary',
          ip_address: '192.168.1.101',
          location: 'Lyon, France',
          device: 'Firefox on macOS',
          last_activity: '2024-01-15T14:25:00Z',
          status: 'active'
        }
      ]);
    } else if (data && data.length > 0) {
      setActiveSessions(data);
    }
  };

  const calculateSecurityScore = async () => {
    // Calculer le score de sécurité basé sur les paramètres et les menaces
    let score = 100;
    
    // Pénalités pour les paramètres désactivés
    if (!securitySettings.twoFactorAuth) score -= 10;
    if (!securitySettings.vulnerabilityScanning) score -= 5;
    
    // Pénalités pour les menaces actives
    const highThreats = threats.filter(t => t.severity === 'high' && t.status !== 'resolved');
    const mediumThreats = threats.filter(t => t.severity === 'medium' && t.status !== 'resolved');
    
    score -= highThreats.length * 5;
    score -= mediumThreats.length * 2;
    
    setSecurityScore(Math.max(0, Math.min(100, score)));
  };

  const handleSettingChange = async (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));

    // Sauvegarder le paramètre dans Supabase
    const { error } = await supabase
      .from('security_settings')
      .upsert({
        setting_name: setting,
        setting_value: value,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur lors de la sauvegarde du paramètre:', error);
      toast.error('Erreur lors de la mise à jour du paramètre');
    } else {
      toast.success(`Paramètre ${setting} ${value ? 'activé' : 'désactivé'}`);
      calculateSecurityScore();
    }
  };

  const handleTerminateSession = async (sessionId: number) => {
    const { error } = await supabase
      .from('user_sessions')
      .update({ status: 'terminated' })
      .eq('id', sessionId);

    if (error) {
      console.error('Erreur lors de la terminaison de session:', error);
      toast.error('Erreur lors de la terminaison de la session');
    } else {
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session terminée avec succès');
    }
  };

  const handleBlockIP = async (ip: string) => {
    const { error } = await supabase
      .from('blocked_ips')
      .insert({ ip_address: ip, reason: 'Manual block', created_at: new Date().toISOString() });

    if (error) {
      console.error('Erreur lors du blocage IP:', error);
      toast.error('Erreur lors du blocage de l\'adresse IP');
    } else {
      toast.success(`Adresse IP ${ip} bloquée`);
    }
  };

  const handleResolveVulnerability = async (vulnId: number) => {
    const { error } = await supabase
      .from('security_vulnerabilities')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', vulnId);

    if (error) {
      console.error('Erreur lors de la résolution de vulnérabilité:', error);
      toast.error('Erreur lors de la résolution');
    } else {
      setVulnerabilities(prev => 
        prev.map(vuln => 
          vuln.id === vulnId ? { ...vuln, status: 'resolved' } : vuln
        )
      );
      toast.success('Vulnérabilité résolue');
      calculateSecurityScore();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Élevée</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Moyenne</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Faible</Badge>;
      default:
        return <Badge variant="secondary">Inconnue</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'blocked': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'investigating': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'monitored': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="security-center" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chargement des données de sécurité...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="security-center" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Centre de Sécurité</h1>
              <p className="text-gray-600 mt-2">Surveillance et gestion de la sécurité système</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchSecurityData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Rapport sécurité
              </Button>
            </div>
          </div>

          {/* Score de sécurité */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Score de Sécurité</span>
              </CardTitle>
              <CardDescription>Évaluation globale de la sécurité du système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Sécurité globale</span>
                    <span className="text-2xl font-bold text-green-600">{securityScore}%</span>
                  </div>
                  <Progress value={securityScore} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">
                    {securityScore >= 90 ? 'Excellent' :
                     securityScore >= 75 ? 'Bon' :
                     securityScore >= 60 ? 'Moyen' : 'Critique'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(securitySettings).filter(v => v).length}
                    </div>
                    <div className="text-sm text-gray-600">Protections actives</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {vulnerabilities.filter(v => v.status === 'open').length}
                    </div>
                    <div className="text-sm text-gray-600">Vulnérabilités</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="threats" className="space-y-6">
            <TabsList>
              <TabsTrigger value="threats">Menaces</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnérabilités</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            {/* Menaces */}
            <TabsContent value="threats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Menaces Détectées</span>
                  </CardTitle>
                  <CardDescription>Menaces actives et tentatives d'intrusion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {threats.map((threat) => (
                      <div key={threat.id} className={`p-4 border rounded-lg ${getSeverityColor(threat.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{threat.type}</h3>
                              {getSeverityBadge(threat.severity)}
                              {getStatusIcon(threat.status)}
                            </div>
                            <p className="text-sm mb-2">{threat.details}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                              <span>{formatTimestamp(threat.timestamp)}</span>
                              <span className="flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>{threat.country}</span>
                              </span>
                              {threat.ip_address && (
                                <span>IP: {threat.ip_address}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => threat.ip_address && handleBlockIP(threat.ip_address)}
                            >
                              <Lock className="w-4 h-4 mr-1" />
                              Bloquer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vulnérabilités */}
            <TabsContent value="vulnerabilities">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Vulnérabilités</span>
                  </CardTitle>
                  <CardDescription>Failles de sécurité identifiées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vulnerabilities.map((vuln) => (
                      <div key={vuln.id} className={`p-4 border rounded-lg ${getSeverityColor(vuln.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{vuln.title}</h3>
                              {getSeverityBadge(vuln.severity)}
                              {vuln.status === 'resolved' ? 
                                <Badge className="bg-green-100 text-green-800">Résolu</Badge> :
                                <Badge className="bg-orange-100 text-orange-800">Ouvert</Badge>
                              }
                            </div>
                            <p className="text-sm mb-2">{vuln.description}</p>
                            <p className="text-sm text-blue-600">
                              <strong>Recommandation:</strong> {vuln.recommendation}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {vuln.status === 'open' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleResolveVulnerability(vuln.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Résoudre
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions actives */}
            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Sessions Actives</span>
                  </CardTitle>
                  <CardDescription>Utilisateurs actuellement connectés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{session.user}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Globe className="w-3 h-3" />
                                  <span>{session.location}</span>
                                </span>
                                <span>{session.device}</span>
                                <span>IP: {session.ip_address}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Dernière activité: {formatTimestamp(session.last_activity)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-100 text-green-800">Actif</Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTerminateSession(session.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Terminer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Paramètres de sécurité */}
            <TabsContent value="settings">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres de Sécurité</CardTitle>
                    <CardDescription>Configuration des protections système</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Politique de mots de passe</Label>
                        <p className="text-sm text-gray-500">Enforcer les règles de mot de passe</p>
                      </div>
                      <Switch
                        checked={securitySettings.passwordPolicy}
                        onCheckedChange={(checked) => handleSettingChange('passwordPolicy', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Authentification à deux facteurs</Label>
                        <p className="text-sm text-gray-500">Activer la 2FA obligatoire</p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Liste blanche IP</Label>
                        <p className="text-sm text-gray-500">Restreindre l'accès par IP</p>
                      </div>
                      <Switch
                        checked={securitySettings.ipWhitelist}
                        onCheckedChange={(checked) => handleSettingChange('ipWhitelist', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Timeout de session</Label>
                        <p className="text-sm text-gray-500">Déconnexion automatique</p>
                      </div>
                      <Switch
                        checked={securitySettings.sessionTimeout}
                        onCheckedChange={(checked) => handleSettingChange('sessionTimeout', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Protections Avancées</CardTitle>
                    <CardDescription>Sécurité système et surveillance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Protection force brute</Label>
                        <p className="text-sm text-gray-500">Bloquer les tentatives répétées</p>
                      </div>
                      <Switch
                        checked={securitySettings.bruteForceProtection}
                        onCheckedChange={(checked) => handleSettingChange('bruteForceProtection', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Chiffrement au repos</Label>
                        <p className="text-sm text-gray-500">Chiffrer les données stockées</p>
                      </div>
                      <Switch
                        checked={securitySettings.encryptionAtRest}
                        onCheckedChange={(checked) => handleSettingChange('encryptionAtRest', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Journalisation d'audit</Label>
                        <p className="text-sm text-gray-500">Enregistrer toutes les actions</p>
                      </div>
                      <Switch
                        checked={securitySettings.auditLogging}
                        onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Scan de vulnérabilités</Label>
                        <p className="text-sm text-gray-500">Scan automatique quotidien</p>
                      </div>
                      <Switch
                        checked={securitySettings.vulnerabilityScanning}
                        onCheckedChange={(checked) => handleSettingChange('vulnerabilityScanning', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="font-medium">{children}</label>;
}