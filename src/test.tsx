import { useState } from 'react';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { DoctorDashboard } from './components/DoctorDashboard';
import { DoctorProfile } from './components/DoctorProfile';
import { PatientManagement } from './components/PatientManagement';
import { AppointmentManagement } from './components/AppointmentManagement';
import { PatientDashboard } from './components/PatientDashboard';
import { Contact } from './components/Contact';
import { PrescriptionView } from './components/PrescriptionView';
import { SecretaryDashboard } from './components/SecretaryDashboard';
import { SecretaryManagement } from './components/SecretaryManagement';
import { SecretaryAppointments } from './components/SecretaryAppointments';
import { SecretaryPatientManagement } from './components/SecretaryPatientManagement';
import { AddPatientForm } from './components/AddPatientForm';
import { DoctorHistory } from './components/DoctorHistory';
import { PatientHistory } from './components/PatientHistory';
import { RequestAppointment } from './components/RequestAppointment';
import { AdminDashboard } from './components/AdminDashboard';
import { UserManagement } from './components/UserManagement';
import { SystemReports } from './components/SystemReports';
import { AddUserForm } from './components/AddUserForm';
import { SystemSettings } from './components/SystemSettings';
import { ActivityLogs } from './components/ActivityLogs';
import { SecurityCenter } from './components/SecurityCenter';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { Payment } from './components/Payment';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import type { UserType } from './types/UserType';
import type { Page } from './types/Page';

export default function App() {
console.log('[App] Rendering App component');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [userType, setUserType] = useState<UserType>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleLogin = (type: UserType) => {
    console.log('[Login] userType:', type);
    setUserType(type);
    setIsAuthenticated(true);

    const pageMap: Record<Exclude<UserType, null>, Page> = {
      doctor: 'doctor-dashboard',
      secretary: 'secretary-dashboard',
      admin: 'admin-dashboard',
      patient: 'patient-dashboard',
    };

    const nextPage = type ? pageMap[type] : 'home';
    console.log('[Login] Navigating to page:', nextPage);
    setCurrentPage(nextPage);
  };

  const handleLogout = () => {
    console.log('[Logout] Resetting user');
    setUserType(null);
    setIsAuthenticated(false);
    setSelectedPlan(null);
    setCurrentPage('home');
    console.log('[Logout] Current page:', 'home');
  };

  const handleSelectPlan = (plan: any) => {
    console.log('[SelectPlan] Selected plan:', plan);
    setSelectedPlan(plan);
  };

  const handleNavigate = (page: string) => {
    const nextPage = pagesMap[page as Page] ? (page as Page) : 'home';
    console.log('[Navigate] From', currentPage, 'to', nextPage);
    setCurrentPage(nextPage);
  };

  const pagesMap: Record<Page, JSX.Element> = {
    home: <Home onNavigate={handleNavigate} isAuthenticated={isAuthenticated} userType={userType} onLogout={handleLogout} />,
    login: <Login onNavigate={handleNavigate} onLogin={handleLogin} />,
    signup: <Signup onNavigate={handleNavigate} onLogin={handleLogin} />,
    'doctor-dashboard': <DoctorDashboard onNavigate={handleNavigate} onLogout={handleLogout} />,
    'doctor-profile': <DoctorProfile onNavigate={handleNavigate} onLogout={handleLogout} />,
    'patient-management': <PatientManagement onNavigate={handleNavigate} onLogout={handleLogout} />,
    appointments: <AppointmentManagement onNavigate={handleNavigate} onLogout={handleLogout} />,
    'patient-dashboard': <PatientDashboard onNavigate={handleNavigate} onLogout={handleLogout} />,
    contact: <Contact onNavigate={handleNavigate} isAuthenticated={isAuthenticated} userType={userType} onLogout={handleLogout} />,
    prescription: <PrescriptionView onNavigate={handleNavigate} onLogout={handleLogout} />,
    'secretary-dashboard': <SecretaryDashboard onNavigate={handleNavigate} onLogout={handleLogout} />,
    'secretary-management': <SecretaryManagement onNavigate={handleNavigate} onLogout={handleLogout} />,
    'secretary-appointments': <SecretaryAppointments onNavigate={handleNavigate} onLogout={handleLogout} />,
    'secretary-patient-management': <SecretaryPatientManagement onNavigate={handleNavigate} onLogout={handleLogout} />,
    'add-patient': <AddPatientForm onNavigate={handleNavigate} onLogout={handleLogout} userType={userType} />,
    'doctor-history': <DoctorHistory onNavigate={handleNavigate} onLogout={handleLogout} />,
    'patient-history': <PatientHistory onNavigate={handleNavigate} onLogout={handleLogout} />,
    'request-appointment': <RequestAppointment onNavigate={handleNavigate} onLogout={handleLogout} />,
    'admin-dashboard': <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogout} />,
    'user-management': <UserManagement onNavigate={handleNavigate} onLogout={handleLogout} />,
    'subscription-management': <SubscriptionManagement onNavigate={handleNavigate} onLogout={handleLogout} />,
    'system-reports': <SystemReports onNavigate={handleNavigate} onLogout={handleLogout} />,
    'system-settings': <SystemSettings onNavigate={handleNavigate} onLogout={handleLogout} />,
    'activity-logs': <ActivityLogs onNavigate={handleNavigate} onLogout={handleLogout} />,
    'security-center': <SecurityCenter onNavigate={handleNavigate} onLogout={handleLogout} />,
    'add-user': <AddUserForm onNavigate={handleNavigate} onLogout={handleLogout} />,
    'subscription-plans': <SubscriptionPlans onNavigate={handleNavigate} isAuthenticated={isAuthenticated} userType={userType} onLogout={handleLogout} onSelectPlan={handleSelectPlan} />,
    payment: <Payment onNavigate={handleNavigate} isAuthenticated={isAuthenticated} userType={userType} onLogout={handleLogout} selectedPlan={selectedPlan} />,
  };

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-slate-50">
        {pagesMap[currentPage] ?? pagesMap['home']}
      </div>
    </SubscriptionProvider>
  );
}
