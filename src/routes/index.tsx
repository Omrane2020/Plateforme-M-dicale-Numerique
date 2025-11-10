/**
 * Configuration principale du routing React Router
 * Point central de toutes les routes de l'application
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES, DEFAULT_ROUTE_BY_ROLE } from '../config/routes.config';
import { ProtectedRoute } from './ProtectedRoute';

// Import des pages publiques
import { HomePage } from '../views/public/HomePage';

// Anciens composants
import { Login } from '../components/Login';
import { Signup } from '../components/Signup';
import { Contact } from '../components/Contact';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { Payment } from '../components/Payment';

// Routes Doctor
import { DoctorDashboard } from '../components/DoctorDashboard';
import { DoctorProfile } from '../components/DoctorProfile';
import { PatientManagement } from '../components/PatientManagement';
import { AppointmentManagement } from '../components/AppointmentManagement';
import { DoctorHistory } from '../components/DoctorHistory';
import { PrescriptionView } from '../components/PrescriptionView';


// Routes Patient
import { PatientDashboard } from '../components/PatientDashboard';
import { RequestAppointment } from '../components/RequestAppointment';
import { PatientHistory } from '../components/PatientHistory';

// Routes Secretary
import { SecretaryDashboard } from '../components/SecretaryDashboard';
import { SecretaryAppointments } from '../components/SecretaryAppointments';
import { SecretaryPatientManagement } from '../components/SecretaryPatientManagement';
import { AddPatientForm } from '../components/AddPatientForm';
// Routes Admin
import { AdminDashboard } from '../components/AdminDashboard';
import { UserManagement } from '../components/UserManagement';
import { SubscriptionManagement } from '../components/SubscriptionManagement';
import { SecretaryManagement } from '../components/SecretaryManagement';
import { SystemSettings } from '../components/SystemSettings';
import { SecurityCenter } from '../components/SecurityCenter';
import { SystemReports } from '../components/SystemReports';
import { ActivityLogs } from '../components/ActivityLogs';
import type { UserType } from '../types/UserType';

interface AppRoutesProps {
  isAuthenticated: boolean;
  userType: UserType;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onLogin?: (userType: UserType) => void;
  onSignup?: (formData: any) => void;
  onSelectPlan?: (plan: any) => void;
}

export function AppRoutes({
  isAuthenticated,
  userType,
  onNavigate = () => { },
  onLogout = () => { },
  onLogin = () => { },
  onSignup = () => { },
  onSelectPlan = () => { }
}: AppRoutesProps) {

  const getCommonProps = () => ({
    onNavigate,
    isAuthenticated,
    userType,
    onLogout
  });

  return (
    <Routes>
      {/* ========== ROUTES PUBLIQUES ========== */}
      <Route
        path={ROUTES.PUBLIC.HOME}
        element={<HomePage {...getCommonProps()} />}
      />

      <Route
        path={ROUTES.PUBLIC.LOGIN}
        element={
          isAuthenticated ? (
            <Navigate to={DEFAULT_ROUTE_BY_ROLE[userType || 'patient']} replace />
          ) : (
            <Login onLogin={onLogin} onNavigate={onNavigate} />
          )
        }
      />

      <Route
        path={ROUTES.PUBLIC.SIGNUP}
        element={
          isAuthenticated ? (
            <Navigate to={DEFAULT_ROUTE_BY_ROLE[userType || 'patient']} replace />
          ) : (
            <Signup onLogin={onLogin} onNavigate={onNavigate} />
          )
        }
      />

      <Route path={ROUTES.PUBLIC.CONTACT} element={<Contact {...getCommonProps()} />} />

      <Route
        path={ROUTES.PUBLIC.SUBSCRIPTION_PLANS}
        element={<SubscriptionPlans {...getCommonProps()} onSelectPlan={onSelectPlan} />}
      />

      <Route path={ROUTES.PUBLIC.PAYMENT} element={<Payment {...getCommonProps()} />} />

      {/* ========== ROUTES MÉDECIN (Protégées) ========== */}
      <Route
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            userRole={userType}
            allowedRoles={['doctor']}
          />
        }
      >
        <Route path={ROUTES.DOCTOR.DASHBOARD} element={<DoctorDashboard {...getCommonProps()} />} />
        <Route path={ROUTES.DOCTOR.PROFILE} element={<DoctorProfile {...getCommonProps()} />} />
        <Route path={ROUTES.DOCTOR.PATIENTS} element={<PatientManagement {...getCommonProps()} />} />
        <Route path={ROUTES.DOCTOR.APPOINTMENTS} element={<AppointmentManagement {...getCommonProps()} />} />
        <Route path={ROUTES.DOCTOR.HISTORY} element={<DoctorHistory {...getCommonProps()} />} />
        <Route path={ROUTES.DOCTOR.SECRETARIES} element={<SecretaryManagement {...getCommonProps()} />} />

        <Route path={ROUTES.DOCTOR.PRESCRIPTIONS} element={<PrescriptionView {...getCommonProps()} />} />


      </Route>

      {/* ========== ROUTES PATIENT (Protégées) ========== */}
      <Route
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            userRole={userType}
            allowedRoles={['patient']}
          />
        }
      >
        <Route path={ROUTES.PATIENT.DASHBOARD} element={<PatientDashboard {...getCommonProps()} />} />
        <Route path={ROUTES.PATIENT.REQUEST_APPOINTMENT} element={<RequestAppointment {...getCommonProps()} />} />
        <Route path={ROUTES.PATIENT.HISTORY} element={<PatientHistory {...getCommonProps()} />} />
      </Route>

      {/* ========== ROUTES SECRÉTAIRE (Protégées) ========== */}
      {/* ✅ Routes secrétaire */}
      <Route path={ROUTES.SECRETARY.DASHBOARD} element={<SecretaryDashboard onNavigate={onNavigate} onLogout={onLogout} />} />
      <Route path={ROUTES.SECRETARY.PATIENTS_Mangement} element={<SecretaryPatientManagement onNavigate={onNavigate} onLogout={onLogout} />} />
      <Route path={ROUTES.SECRETARY.APPOINTMENTS} element={<SecretaryAppointments onNavigate={onNavigate} onLogout={onLogout} />} />
      <Route path={ROUTES.SECRETARY.ADD_PATIENT} element={<AddPatientForm onNavigate={onNavigate} onLogout={onLogout}  userType="secretary" />} />


      {/* ========== ROUTES ADMIN (Protégées) ========== */}
      <Route
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            userRole={userType}
            allowedRoles={['admin']}
          />
        }
      >
        <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard {...getCommonProps()} />} />
        <Route path={ROUTES.ADMIN.USERS} element={<UserManagement {...getCommonProps()} />} />
        <Route path={ROUTES.ADMIN.SUBSCRIPTIONS} element={<SubscriptionManagement {...getCommonProps()} />} />
        <Route path={ROUTES.ADMIN.SECRETARIES} element={<SecretaryManagement {...getCommonProps()} />} />
        <Route path={ROUTES.ADMIN.SETTINGS} element={<SystemSettings {...getCommonProps()} />} />
        <Route path={ROUTES.ADMIN.SECURITY} element={<SecurityCenter {...getCommonProps()} />} />
        <Route path={ROUTES.ADMIN.REPORTS} element={<SystemReports {...getCommonProps()} />} />
        <Route path={ROUTES.ADMIN.LOGS} element={<ActivityLogs {...getCommonProps()} />} />

      </Route>

      {/* ========== ERREURS ET REDIRECTIONS ========== */}
      <Route
        path={ROUTES.UNAUTHORIZED}
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
              <p className="text-xl text-gray-600 mb-8">Accès non autorisé</p>
              <button
                onClick={() => onNavigate('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        }
      />

      <Route
        path={ROUTES.NOT_FOUND}
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
              <button
                onClick={() => onNavigate('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        }
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
}

export default AppRoutes;
