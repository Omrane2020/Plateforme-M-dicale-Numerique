import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Settings,
  Database,
  Mail,
  Shield,
  Clock,
  Bell,
  Palette,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettingsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function SystemSettings({ onNavigate, onLogout }: SystemSettingsProps) {
  const [settings, setSettings] = useState({
    // Paramètres généraux
    systemName: 'MediCare Platform',
    systemDescription: 'Plateforme médicale numérique',
    timezone: 'Europe/Paris',
    language: 'fr',
    dateFormat: 'dd/mm/yyyy',
    
    // Paramètres d'email
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'system@medicare.com',
    smtpPassword: '',
    emailFrom: 'MediCare <noreply@medicare.com>',
    
    // Paramètres de sécurité
    sessionTimeout: '30',
    passwordMinLength: '8',
    passwordRequireSpecial: true,
    twoFactorAuth: false,
    loginAttempts: '5',
    lockoutDuration: '15',
    
    // Notifications
    emailNotifications: true,
    appointmentReminders: true,
    systemAlerts: true,
    maintenanceMode: false,
    
    // Sauvegarde
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: '30',
    
    // API
    apiRateLimit: '1000',
    apiTimeout: '30',
    enableApiLogs: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = (section: string) => {
    toast.success(`Paramètres ${section} sauvegardés`);
  };

  const handleBackup = () => {
    toast.loading('Création de la sauvegarde...', { id: 'backup' });
    setTimeout(() => {
      toast.success('Sauvegarde créée avec succès', { id: 'backup' });
    }, 2000);
  };

  const handleRestore = () => {
    toast.warning('Fonctionnalité de restauration en développement');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="system-settings" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configuration Système</h1>
            <p className="text-gray-600 mt-2">Paramètres et configuration de la plateforme</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>

            {/* Paramètres généraux */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Paramètres généraux</span>
                  </CardTitle>
                  <CardDescription>Configuration de base du système</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="systemName">Nom du système</Label>
                      <Input
                        id="systemName"
                        value={settings.systemName}
                        onChange={(e) => handleSettingChange('systemName', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="timezone">Fuseau horaire</Label>
                      <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language">Langue par défaut</Label>
                      <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dateFormat">Format de date</Label>
                      <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="systemDescription">Description du système</Label>
                    <Textarea
                      id="systemDescription"
                      value={settings.systemDescription}
                      onChange={(e) => handleSettingChange('systemDescription', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button onClick={() => handleSave('généraux')} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Paramètres Email */}
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Configuration Email</span>
                  </CardTitle>
                  <CardDescription>Paramètres SMTP pour l'envoi d'emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="smtpHost">Serveur SMTP</Label>
                      <Input
                        id="smtpHost"
                        value={settings.smtpHost}
                        onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpPort">Port SMTP</Label>
                      <Input
                        id="smtpPort"
                        value={settings.smtpPort}
                        onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpUsername">Nom d'utilisateur</Label>
                      <Input
                        id="smtpUsername"
                        value={settings.smtpUsername}
                        onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpPassword">Mot de passe</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emailFrom">Adresse d'expéditeur</Label>
                    <Input
                      id="emailFrom"
                      value={settings.emailFrom}
                      onChange={(e) => handleSettingChange('emailFrom', e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => handleSave('email')} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Tester la connexion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Paramètres de sécurité */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Paramètres de sécurité</span>
                  </CardTitle>
                  <CardDescription>Configuration de la sécurité du système</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="sessionTimeout">Timeout de session (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="passwordMinLength">Longueur minimale du mot de passe</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={settings.passwordMinLength}
                        onChange={(e) => handleSettingChange('passwordMinLength', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="loginAttempts">Tentatives de connexion max</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={settings.loginAttempts}
                        onChange={(e) => handleSettingChange('loginAttempts', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lockoutDuration">Durée de verrouillage (minutes)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        value={settings.lockoutDuration}
                        onChange={(e) => handleSettingChange('lockoutDuration', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Caractères spéciaux requis</Label>
                        <p className="text-sm text-gray-500">Exiger des caractères spéciaux dans les mots de passe</p>
                      </div>
                      <Switch
                        checked={settings.passwordRequireSpecial}
                        onCheckedChange={(checked) => handleSettingChange('passwordRequireSpecial', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Authentification à deux facteurs</Label>
                        <p className="text-sm text-gray-500">Activer la 2FA pour tous les utilisateurs</p>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('sécurité')} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </CardTitle>
                  <CardDescription>Configuration des notifications système</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notifications par email</Label>
                        <p className="text-sm text-gray-500">Envoyer des notifications par email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Rappels de rendez-vous</Label>
                        <p className="text-sm text-gray-500">Envoyer des rappels automatiques</p>
                      </div>
                      <Switch
                        checked={settings.appointmentReminders}
                        onCheckedChange={(checked) => handleSettingChange('appointmentReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Alertes système</Label>
                        <p className="text-sm text-gray-500">Notifications des événements système</p>
                      </div>
                      <Switch
                        checked={settings.systemAlerts}
                        onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mode maintenance</Label>
                        <p className="text-sm text-gray-500">Activer le mode maintenance</p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('notifications')} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sauvegarde */}
            <TabsContent value="backup">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="w-5 h-5" />
                      <span>Sauvegarde automatique</span>
                    </CardTitle>
                    <CardDescription>Configuration des sauvegardes automatiques</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sauvegarde automatique</Label>
                        <p className="text-sm text-gray-500">Activer les sauvegardes automatiques</p>
                      </div>
                      <Switch
                        checked={settings.autoBackup}
                        onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="backupFrequency">Fréquence</Label>
                        <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Quotidienne</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                            <SelectItem value="monthly">Mensuelle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="backupRetention">Rétention (jours)</Label>
                        <Input
                          id="backupRetention"
                          type="number"
                          value={settings.backupRetention}
                          onChange={(e) => handleSettingChange('backupRetention', e.target.value)}
                        />
                      </div>
                    </div>

                    <Button onClick={() => handleSave('sauvegarde')} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions de sauvegarde</CardTitle>
                    <CardDescription>Créer ou restaurer une sauvegarde manuellement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      <Button onClick={handleBackup} className="bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Créer une sauvegarde
                      </Button>
                      <Button onClick={handleRestore} variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Restaurer une sauvegarde
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* API */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Configuration API</span>
                  </CardTitle>
                  <CardDescription>Paramètres des API externes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="apiRateLimit">Limite de requêtes/heure</Label>
                      <Input
                        id="apiRateLimit"
                        type="number"
                        value={settings.apiRateLimit}
                        onChange={(e) => handleSettingChange('apiRateLimit', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="apiTimeout">Timeout API (secondes)</Label>
                      <Input
                        id="apiTimeout"
                        type="number"
                        value={settings.apiTimeout}
                        onChange={(e) => handleSettingChange('apiTimeout', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Logs API</Label>
                      <p className="text-sm text-gray-500">Enregistrer les appels API</p>
                    </div>
                    <Switch
                      checked={settings.enableApiLogs}
                      onCheckedChange={(checked) => handleSettingChange('enableApiLogs', checked)}
                    />
                  </div>

                  <Button onClick={() => handleSave('API')} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
