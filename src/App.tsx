import { useState } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppRoutes } from './routes';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { Toaster } from './components/ui/sonner';

import type { UserType } from './types/UserType';

function AppInner() {
  const navigate = useNavigate();

  const [userType, setUserType] = useState<UserType>('doctor');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleLogin = (email: string, password: string) => {
    if (email.includes('admin')) setUserType('admin');
    else if (email.includes('doctor') || email.includes('medecin')) setUserType('doctor');
    else if (email.includes('secretary') || email.includes('secretaire')) setUserType('secretary');
    else setUserType('patient');

    setIsAuthenticated(true);
    console.log('[Auth] Connexion réussie:', { email, role: userType });
  };

  const handleSignup = (formData: any) => {
    const { userType: type } = formData;
    setUserType(type);
    setIsAuthenticated(true);
    console.log('[Auth] Inscription réussie:', formData);
  };

  const handleLogout = () => {
    setUserType(null);
    setIsAuthenticated(false);
    setSelectedPlan(null);
    console.log('[Auth] Déconnexion');
    navigate('/'); // ✅ Retour à l’accueil
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    console.log('[Subscription] Plan sélectionné:', plan);
  };

  /** 🌐 Navigation réelle */
  const handleNavigate = (page: string) => {
    console.log('[Navigation] Page demandée:', page);
    console.log("[Navigation] Page demandée:", page);

    switch (true) {
      case page.startsWith('payment/'):
        navigate(`/${page}`);
        break;

      default:

        switch (page) {
          // PUBLIC
          case 'home': navigate('/'); break;
          case 'signup': navigate('/signup'); break;
          case 'login': navigate('/login'); break;
          case 'contact': navigate('/contact'); break;
          case 'subscription-plans': navigate('/subscription-plans'); break;
          case 'payment':
            navigate(`/${page}`);
            break;



          // DOCTOR
          case 'doctor-dashboard': navigate('/doctor/dashboard'); break;
          case 'doctor-profile': navigate('/doctor/profile'); break;
          case 'patient-management': navigate('/doctor/patients'); break;
          case 'appointments': navigate('/doctor/appointments'); break;
          case 'doctor-history': navigate('/doctor/history'); break;
          case 'prescription':
          case 'prescriptions': navigate('/doctor/prescriptions'); break;
          case 'secretary-management': navigate('/doctor/secretaries'); break;

          // PATIENT
          case 'patient-dashboard': navigate('/patient/dashboard'); break;
          case 'request-appointment': navigate('/patient/request-appointment'); break;
          case 'patient-history': navigate('/patient/history'); break;

          // SECRETARY
          case 'secretary-dashboard': navigate('/secretary/dashboard'); break;
          case 'secretary-patient-management': navigate('/secretary/patients'); break;
          case 'secretary-appointments': navigate('/secretary/appointments'); break;
          case 'add-patient': navigate('/secretary/add-patient'); break;
          case 'secretary-notifications': navigate('/secretary/notifications'); break;

          // ADMIN
          case 'admin-dashboard': navigate('/admin/dashboard'); break;
          case 'user-management': navigate('/admin/users'); break;
          case 'subscription-management': navigate('/admin/subscriptions'); break;
          case 'admin-secretaries': navigate('/admin/secretaries'); break;
          case 'system-settings': navigate('/admin/settings'); break;
          case 'security-center': navigate('/admin/security'); break;
          case 'system-reports': navigate('/admin/reports'); break;
          case 'activity-logs': navigate('/admin/logs'); break;
          default:
            console.warn('Page inconnue:', page);
            navigate(`/${page}`);
        }
    }
  };




  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes
          isAuthenticated={isAuthenticated}
          userType={userType}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onSelectPlan={handleSelectPlan}
        />
        <Toaster position="top-right" />
      </div>
    </SubscriptionProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
