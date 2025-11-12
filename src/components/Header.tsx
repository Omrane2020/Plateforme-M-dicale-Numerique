import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Stethoscope, Menu, X, Bell, User, Settings } from 'lucide-react';
import type { UserType } from '../types/UserType';
import type { Page } from '../types/Page';
//@ts-ignore
import { supabase } from "../supabaseClient";

interface HeaderProps {
  onNavigate: (page: Page) => void; 
  isAuthenticated: boolean;
  userType: UserType;
  onLogout: () => void;
}

interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

export function Header({ isAuthenticated, userType, onLogout, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer le profil utilisateur et les notifications
  const fetchUserData = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer le profil utilisateur
      const { data: profileData } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      }

      // Récupérer les notifications non lues
      await fetchNotifications(user.id);

      // Enregistrer l'activité de navigation
      await trackNavigation(user.id, 'home');

    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les notifications
  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((notification: UserNotification) => !notification.is_read).length);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Suivre la navigation
  const trackNavigation = async (userId: string, pagePath: Page) => {
    try {
      // Mettre à jour les statistiques de navigation du site
      await supabase.rpc('increment_page_visit', { page_path: pagePath });

      // Mettre à jour les préférences de navigation de l'utilisateur
      const { data: existingPrefs } = await supabase
        .from('user_navigation_preferences')
        .select('recent_pages')
        .eq('user_id', userId)
        .single();

      let recentPages: Page[] = [];
      
      if (existingPrefs?.recent_pages) {
        recentPages = [pagePath, ...existingPrefs.recent_pages.filter((p: Page) => p !== pagePath)].slice(0, 10);
      } else {
        recentPages = [pagePath];
      }

      await supabase
        .from('user_navigation_preferences')
        .upsert({
          user_id: userId,
          recent_pages: recentPages,
          updated_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Erreur lors du suivi de la navigation:', error);
    }
  };

  // Gérer la navigation avec suivi
  const handleNavigation = (page: Page) => {
    if (isAuthenticated) {
     supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
  const user = data?.user;
  if (user) {
    trackNavigation(user.id, page);
  }
});

    }
    onNavigate(page);
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      // Nettoyer les sessions côté serveur si nécessaire
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      onLogout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isAuthenticated]);

  // Fonction pour obtenir le nom d'affichage de l'utilisateur
  const getUserDisplayName = () => {
    if (!userProfile) return 'Utilisateur';
    
    if (userType === 'doctor') {
      return `Dr. ${userProfile.first_name} ${userProfile.last_name}`;
    }
    
    return `${userProfile.first_name} ${userProfile.last_name}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigation('home')}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl text-slate-800 font-semibold">MedPlatform</span>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('home')}
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Accueil
            </button>
            <button
              onClick={() => handleNavigation('subscription-plans')}
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Tarifs
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Contact
            </button>
          </nav>

          {/* Auth Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleNavigation('login')}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                >
                  Se connecter
                </Button>
                <Button
                  onClick={() => handleNavigation('signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Commencer
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>

                  {/* Dropdown Notifications */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                      <div className="p-4 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification: UserNotification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                                !notification.is_read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                if (notification.action_url) {
                                  handleNavigation(notification.action_url as Page);
                                }
                                markNotificationAsRead(notification.id);
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-slate-800">{notification.title}</h4>
                                {!notification.is_read && (
                                  <span className="bg-blue-500 rounded-full h-2 w-2"></span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                              <span className="text-xs text-slate-500 mt-2">
                                {new Date(notification.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                            <p>Aucune notification</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profil utilisateur */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">
                      {isLoading ? 'Chargement...' : getUserDisplayName()}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {userType === 'doctor' ? 'Médecin' : 'Patient'}
                    </p>
                  </div>
                  
                  {/* Menu profil */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="rounded-full border border-slate-200"
                    >
                      <User className="h-5 w-5" />
                    </Button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                        <div className="p-2">
                          <button
                            onClick={() => handleNavigation(
                              userType === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard'
                            )}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                          >
                            <User className="h-4 w-4" />
                            <span>Mon profil</span>
                          </button>
                          <button
                            onClick={() => handleNavigation(userType === 'doctor' ? 'doctor-settings' : 'patient-settings')}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Paramètres</span>
                          </button>
                          <div className="border-t border-slate-200 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Navigation Mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 bg-white">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavigation('home')}
                className="text-slate-600 hover:text-blue-600 text-left transition-colors font-medium py-2"
              >
                Accueil
              </button>
              <button
                onClick={() => handleNavigation('subscription-plans')}
                className="text-slate-600 hover:text-blue-600 text-left transition-colors font-medium py-2"
              >
                Tarifs
              </button>
              <button
                onClick={() => handleNavigation('contact')}
                className="text-slate-600 hover:text-blue-600 text-left transition-colors font-medium py-2"
              >
                Contact
              </button>

              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation('login')}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    Se connecter
                  </Button>
                  <Button
                    onClick={() => handleNavigation('signup')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    Commencer
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4">
                  <div className="px-2 py-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-800">
                      {isLoading ? 'Chargement...' : getUserDisplayName()}
                    </p>
                    <p className="text-sm text-slate-500 capitalize">
                      {userType === 'doctor' ? 'Médecin' : 'Patient'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleNavigation(
                      userType === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard'
                    )}
                    className="text-slate-600 hover:text-blue-600 text-left transition-colors py-2"
                  >
                    Mon profil
                  </button>
                  <button
                    onClick={() => handleNavigation(userType === 'doctor' ? 'doctor-settings' : 'patient-settings')}
                    className="text-slate-600 hover:text-blue-600 text-left transition-colors py-2"
                  >
                    Paramètres
                  </button>
                  
                  <div className="border-t border-slate-200 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full border-red-600 text-red-600 hover:bg-red-50 font-medium"
                    >
                      Déconnexion
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}