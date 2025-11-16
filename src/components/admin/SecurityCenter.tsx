import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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

interface SecurityCenterProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
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

  // Données simulées pour la sécurité
  const securityScore = 87;
  
  const threats = [
    {
      id: 1,
      type: 'Tentative de connexion suspecte',
      severity: 'high',
      timestamp: '2024-01-15T14:15:33Z',
      details: 'Multiple failed login attempts from IP 89.45.123.67',
      status: 'blocked',
      country: 'Russie'
    },
    {
      id: 2,
      type: 'Accès non autorisé',
      severity: 'medium',
      timestamp: '2024-01-15T13:22:18Z',
      details: 'Access attempt to admin panel from unknown device',
      status: 'investigating',
      country: 'Chine'
    },
    {
      id: 3,
      type: 'Scan de vulnérabilités',
      severity: 'low',
      timestamp: '2024-01-15T12:45:07Z',
      details: 'Port scanning detected from IP 156.78.90.123',
      status: 'monitored',
      country: 'États-Unis'
    }
  ];

  const vulnerabilities = [
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
    },
    {
      id: 3,
      title: 'Version PHP obsolète',
      severity: 'low',
      description: 'PHP 8.1 est disponible (version actuelle: 8.0)',
      recommendation: 'Mettre à jour vers PHP 8.1',
      status: 'resolved'
    }
  ];

  const activeSessions = [
    {
      id: 1,
      user: 'Dr. Martin Dubois',
      role: 'doctor',
      ipAddress: '192.168.1.100',
      location: 'Paris, France',
      device: 'Chrome on Windows',
      lastActivity: '2024-01-15T14:30:00Z',
      status: 'active'
    },
    {
      id: 2,
      user: 'Marie Secrétaire',
      role: 'secretary',
      ipAddress: '192.168.1.101',
      location: 'Lyon, France',
      device: 'Firefox on macOS',
      lastActivity: '2024-01-15T14:25:00Z',
      status: 'active'
    },
    {
      id: 3,
      user: 'Admin Système',
      role: 'admin',
      ipAddress: '192.168.1.102',
      location: 'Marseille, France',
      device: 'Chrome on Linux',
      lastActivity: '2024-01-15T14:32:00Z',
      status: 'active'
    }
  ];

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

  const handleSettingChange = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
    toast.success(`Paramètre ${setting} ${value ? 'activé' : 'désactivé'}`);
  };

  const handleTerminateSession = (sessionId: number) => {
    toast.success('Session terminée avec succès');
  };

  const handleBlockIP = (ip: string) => {
    toast.success(`Adresse IP ${ip} bloquée`);
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
              <Button variant="outline">
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
                    <div className="text-2xl font-bold text-green-600">7</div>
                    <div className="text-sm text-gray-600">Protections actives</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">2</div>
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
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Button>
                            <Button variant="outline" size="sm">
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
                              <Button variant="outline" size="sm">
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
                                <span>IP: {session.ipAddress}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Dernière activité: {formatTimestamp(session.lastActivity)}
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