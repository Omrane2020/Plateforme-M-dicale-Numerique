import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Settings,
  Database,
  Mail,
  Shield,
  Bell,
  Globe,
  Save,
  Download,
  Upload,
  Loader2,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';

//@ts-ignore
import { supabase } from '../supabaseClient';
interface SystemSettingsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface SystemSettings {
  // Paramètres généraux
  system_name: string;
  system_description: string;
  timezone: string;
  language: string;
  date_format: string;
  
  // Paramètres d'email
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  email_from: string;
  
  // Paramètres de sécurité
  session_timeout: string;
  password_min_length: string;
  password_require_special: boolean;
  two_factor_auth: boolean;
  login_attempts: string;
  lockout_duration: string;
  
  // Notifications
  email_notifications: boolean;
  appointment_reminders: boolean;
  system_alerts: boolean;
  maintenance_mode: boolean;
  
  // Sauvegarde
  auto_backup: boolean;
  backup_frequency: string;
  backup_retention: string;
  
  // API
  api_rate_limit: string;
  api_timeout: string;
  enable_api_logs: boolean;
}

export function SystemSettings({ onNavigate, onLogout }: SystemSettingsProps) {
  const [settings, setSettings] = useState<SystemSettings>({
    // Paramètres généraux
    system_name: 'MediCare Platform',
    system_description: 'Plateforme médicale numérique',
    timezone: 'Europe/Paris',
    language: 'fr',
    date_format: 'dd/mm/yyyy',
    
    // Paramètres d'email
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_username: 'system@medicare.com',
    smtp_password: '',
    email_from: 'MediCare <noreply@medicare.com>',
    
    // Paramètres de sécurité
    session_timeout: '30',
    password_min_length: '8',
    password_require_special: true,
    two_factor_auth: false,
    login_attempts: '5',
    lockout_duration: '15',
    
    // Notifications
    email_notifications: true,
    appointment_reminders: true,
    system_alerts: true,
    maintenance_mode: false,
    
    // Sauvegarde
    auto_backup: true,
    backup_frequency: 'daily',
    backup_retention: '30',
    
    // API
    api_rate_limit: '1000',
    api_timeout: '30',
    enable_api_logs: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Charger les paramètres depuis Supabase
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      // Transformer les données pour les mettre dans le state
      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc:any, setting:any) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, any>);

        setSettings(prev => ({
          ...prev,
          ...settingsMap
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async (section: string, settingsToSave: Partial<SystemSettings>) => {
    try {
      setSaving(section);

      // Préparer les données pour l'insertion
      const settingsData = Object.entries(settingsToSave).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        category: section,
        updated_at: new Date().toISOString()
      }));

      // Utiliser upsert pour mettre à jour ou créer les paramètres
      const { error } = await supabase
        .from('system_settings')
        .upsert(settingsData, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast.success(`Paramètres ${section} sauvegardés`);
      
      // Mettre à jour le cache côté client si nécessaire
      await supabase.auth.refreshSession();
      
    } catch (error: any) {
      console.error(`Erreur sauvegarde paramètres ${section}:`, error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message}`);
    } finally {
      setSaving(null);
    }
  };

  const testEmailConnection = async () => {
    try {
      setTestingConnection(true);
      
      // Appeler une edge function pour tester la connexion SMTP
      const { data, error } = await supabase.functions.invoke('test-smtp-connection', {
        body: {
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_username: settings.smtp_username,
          smtp_password: settings.smtp_password
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Connexion SMTP réussie');
      } else {
        toast.error('Échec de la connexion SMTP');
      }
    } catch (error: any) {
      console.error('Erreur test SMTP:', error);
      toast.error('Erreur lors du test de connexion');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleBackup = async () => {
    try {
      toast.loading('Création de la sauvegarde...', { id: 'backup' });
      
      // Appeler une edge function pour créer une sauvegarde
      const { data, error } = await supabase.functions.invoke('create-backup', {
        body: {
          backup_type: 'manual',
          retention_days: parseInt(settings.backup_retention)
        }
      });

      if (error) throw error;

      toast.success('Sauvegarde créée avec succès', { id: 'backup' });
      
      // Enregistrer l'événement de sauvegarde
      await supabase
        .from('system_events')
        .insert({
          event_type: 'backup_created',
          description: 'Sauvegarde manuelle créée',
          metadata: { backup_id: data.backup_id }
        });
        
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la création de la sauvegarde', { id: 'backup' });
    }
  };

  const handleRestore = async () => {
    try {
      // Pour la restauration, nous devrions avoir une interface pour sélectionner la sauvegarde
      // Pour l'instant, montrer un message d'avertissement
      toast.warning('Veuillez contacter l\'administrateur pour la restauration', {
        description: 'La restauration nécessite une intervention manuelle'
      });
    } catch (error) {
      console.error('Erreur restauration:', error);
      toast.error('Erreur lors de la restauration');
    }
  };

  const handleSaveGeneral = () => {
    const generalSettings = {
      system_name: settings.system_name,
      system_description: settings.system_description,
      timezone: settings.timezone,
      language: settings.language,
      date_format: settings.date_format
    };
    saveSettings('general', generalSettings);
  };

  const handleSaveEmail = () => {
    const emailSettings = {
      smtp_host: settings.smtp_host,
      smtp_port: settings.smtp_port,
      smtp_username: settings.smtp_username,
      smtp_password: settings.smtp_password,
      email_from: settings.email_from
    };
    saveSettings('email', emailSettings);
  };

  const handleSaveSecurity = () => {
    const securitySettings = {
      session_timeout: settings.session_timeout,
      password_min_length: settings.password_min_length,
      password_require_special: settings.password_require_special,
      two_factor_auth: settings.two_factor_auth,
      login_attempts: settings.login_attempts,
      lockout_duration: settings.lockout_duration
    };
    saveSettings('security', securitySettings);
  };

  const handleSaveNotifications = () => {
    const notificationSettings = {
      email_notifications: settings.email_notifications,
      appointment_reminders: settings.appointment_reminders,
      system_alerts: settings.system_alerts,
      maintenance_mode: settings.maintenance_mode
    };
    saveSettings('notifications', notificationSettings);
  };

  const handleSaveBackup = () => {
    const backupSettings = {
      auto_backup: settings.auto_backup,
      backup_frequency: settings.backup_frequency,
      backup_retention: settings.backup_retention
    };
    saveSettings('backup', backupSettings);
  };

  const handleSaveApi = () => {
    const apiSettings = {
      api_rate_limit: settings.api_rate_limit,
      api_timeout: settings.api_timeout,
      enable_api_logs: settings.enable_api_logs
    };
    saveSettings('api', apiSettings);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="system-settings" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chargement des paramètres...</p>
          </div>
        </div>
      </div>
    );
  }

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
                        value={settings.system_name}
                        onChange={(e) => handleSettingChange('system_name', e.target.value)}
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
                      <Select value={settings.date_format} onValueChange={(value) => handleSettingChange('date_format', value)}>
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
                      value={settings.system_description}
                      onChange={(e) => handleSettingChange('system_description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleSaveGeneral} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={saving === 'general'}
                  >
                    {saving === 'general' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving === 'general' ? 'Sauvegarde...' : 'Sauvegarder'}
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
                        value={settings.smtp_host}
                        onChange={(e) => handleSettingChange('smtp_host', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpPort">Port SMTP</Label>
                      <Input
                        id="smtpPort"
                        value={settings.smtp_port}
                        onChange={(e) => handleSettingChange('smtp_port', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpUsername">Nom d'utilisateur</Label>
                      <Input
                        id="smtpUsername"
                        value={settings.smtp_username}
                        onChange={(e) => handleSettingChange('smtp_username', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpPassword">Mot de passe</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.smtp_password}
                        onChange={(e) => handleSettingChange('smtp_password', e.target.value)}
                        placeholder="Laissez vide pour ne pas modifier"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emailFrom">Adresse d'expéditeur</Label>
                    <Input
                      id="emailFrom"
                      value={settings.email_from}
                      onChange={(e) => handleSettingChange('email_from', e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleSaveEmail} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={saving === 'email'}
                    >
                      {saving === 'email' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving === 'email' ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={testEmailConnection}
                      disabled={testingConnection}
                    >
                      {testingConnection ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      {testingConnection ? 'Test...' : 'Tester la connexion'}
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
                        value={settings.session_timeout}
                        onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="passwordMinLength">Longueur minimale du mot de passe</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={settings.password_min_length}
                        onChange={(e) => handleSettingChange('password_min_length', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="loginAttempts">Tentatives de connexion max</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={settings.login_attempts}
                        onChange={(e) => handleSettingChange('login_attempts', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lockoutDuration">Durée de verrouillage (minutes)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        value={settings.lockout_duration}
                        onChange={(e) => handleSettingChange('lockout_duration', e.target.value)}
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
                        checked={settings.password_require_special}
                        onCheckedChange={(checked) => handleSettingChange('password_require_special', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Authentification à deux facteurs</Label>
                        <p className="text-sm text-gray-500">Activer la 2FA pour tous les utilisateurs</p>
                      </div>
                      <Switch
                        checked={settings.two_factor_auth}
                        onCheckedChange={(checked) => handleSettingChange('two_factor_auth', checked)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveSecurity} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={saving === 'security'}
                  >
                    {saving === 'security' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving === 'security' ? 'Sauvegarde...' : 'Sauvegarder'}
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
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Rappels de rendez-vous</Label>
                        <p className="text-sm text-gray-500">Envoyer des rappels automatiques</p>
                      </div>
                      <Switch
                        checked={settings.appointment_reminders}
                        onCheckedChange={(checked) => handleSettingChange('appointment_reminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Alertes système</Label>
                        <p className="text-sm text-gray-500">Notifications des événements système</p>
                      </div>
                      <Switch
                        checked={settings.system_alerts}
                        onCheckedChange={(checked) => handleSettingChange('system_alerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mode maintenance</Label>
                        <p className="text-sm text-gray-500">Activer le mode maintenance</p>
                      </div>
                      <Switch
                        checked={settings.maintenance_mode}
                        onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveNotifications} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={saving === 'notifications'}
                  >
                    {saving === 'notifications' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving === 'notifications' ? 'Sauvegarde...' : 'Sauvegarder'}
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
                        checked={settings.auto_backup}
                        onCheckedChange={(checked) => handleSettingChange('auto_backup', checked)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="backupFrequency">Fréquence</Label>
                        <Select value={settings.backup_frequency} onValueChange={(value) => handleSettingChange('backup_frequency', value)}>
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
                          value={settings.backup_retention}
                          onChange={(e) => handleSettingChange('backup_retention', e.target.value)}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleSaveBackup} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={saving === 'backup'}
                    >
                      {saving === 'backup' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving === 'backup' ? 'Sauvegarde...' : 'Sauvegarder'}
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
                        value={settings.api_rate_limit}
                        onChange={(e) => handleSettingChange('api_rate_limit', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="apiTimeout">Timeout API (secondes)</Label>
                      <Input
                        id="apiTimeout"
                        type="number"
                        value={settings.api_timeout}
                        onChange={(e) => handleSettingChange('api_timeout', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Logs API</Label>
                      <p className="text-sm text-gray-500">Enregistrer les appels API</p>
                    </div>
                    <Switch
                      checked={settings.enable_api_logs}
                      onCheckedChange={(checked) => handleSettingChange('enable_api_logs', checked)}
                    />
                  </div>

                  <Button 
                    onClick={handleSaveApi} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={saving === 'api'}
                  >
                    {saving === 'api' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving === 'api' ? 'Sauvegarde...' : 'Sauvegarder'}
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