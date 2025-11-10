  /**
   * Configuration centralisée de toutes les routes de l'application
   * Utilisé par React Router pour la navigation SPA
   */

  export const ROUTES = {
    // Routes publiques
    PUBLIC: {
      HOME: '/',
      LOGIN: '/login',
      SIGNUP: '/signup',
      CONTACT: '/contact',
      SUBSCRIPTION_PLANS: '/subscription-plans',
      PAYMENT: '/payment/:planId',
    },

    // Routes médecin
    DOCTOR: {
      DASHBOARD: '/doctor/dashboard',
      PROFILE: '/doctor/profile',
      PATIENTS: '/doctor/patients',
      PATIENT_DETAILS: '/doctor/patients/:id',
      APPOINTMENTS: '/doctor/appointments',
      HISTORY: '/doctor/history',
      SECRETARIES: '/doctor/secretaries',
    PRESCRIPTIONS: '/doctor/prescriptions',
    },

    // Routes patient
    PATIENT: {
      DASHBOARD: '/patient/dashboard',
      REQUEST_APPOINTMENT: '/patient/appointments/request',
      APPOINTMENTS: '/patient/appointments',
      HISTORY: '/patient/history',
    },

    // Routes secrétaire
  SECRETARY: {
    DASHBOARD: '/secretary/dashboard',
    PATIENTS_Mangement: '/secretary/patients', // ✅ même convention que le docteur
    APPOINTMENTS: '/secretary/appointments',
    ADD_PATIENT: '/secretary/add-patient',
    NOTIFICATIONS: '/secretary/notifications',
  },

    // Routes admin
    ADMIN: {
      DASHBOARD: '/admin/dashboard',
      USERS: '/admin/users',
      SUBSCRIPTIONS: '/admin/subscriptions',
      SECRETARIES: '/admin/secretaries',
      SETTINGS: '/admin/settings',
      SECURITY: '/admin/security',
      REPORTS: '/admin/reports',
      LOGS: '/admin/logs',
    },

    // Routes spéciales
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
  } as const;

  /**
   * Helper pour générer des URLs dynamiques
   */
  export const generatePath = (path: string, params: Record<string, string>) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(`:${key}`, value);
    });
    return result;
  };


  /**
   * Navigation guards - Routes protégées par rôle
   */
  export const ROUTE_PERMISSIONS = {
    [ROUTES.DOCTOR.DASHBOARD]: ['doctor'],
    [ROUTES.DOCTOR.PROFILE]: ['doctor'],
    [ROUTES.DOCTOR.PATIENTS]: ['doctor'],
    [ROUTES.DOCTOR.PATIENT_DETAILS]: ['doctor'],
    [ROUTES.DOCTOR.APPOINTMENTS]: ['doctor'],
    [ROUTES.DOCTOR.PRESCRIPTIONS]: ['doctor'],
    [ROUTES.DOCTOR.HISTORY]: ['doctor'],


    [ROUTES.PATIENT.DASHBOARD]: ['patient'],
    [ROUTES.PATIENT.REQUEST_APPOINTMENT]: ['patient'],
    [ROUTES.PATIENT.APPOINTMENTS]: ['patient'],
    [ROUTES.PATIENT.HISTORY]: ['patient'],

    [ROUTES.SECRETARY.DASHBOARD]: ['secretary'],
    [ROUTES.SECRETARY.APPOINTMENTS]: ['secretary'],
    [ROUTES.SECRETARY.PATIENTS_Mangement]: ['secretary'],

    [ROUTES.ADMIN.DASHBOARD]: ['admin'],
    [ROUTES.ADMIN.USERS]: ['admin'],
    [ROUTES.ADMIN.SUBSCRIPTIONS]: ['admin'],
    [ROUTES.ADMIN.SECRETARIES]: ['admin'],
    [ROUTES.ADMIN.SETTINGS]: ['admin'],
    [ROUTES.ADMIN.SECURITY]: ['admin'],
    [ROUTES.ADMIN.REPORTS]: ['admin'],
    [ROUTES.ADMIN.LOGS]: ['admin'],
  } as const;

  /**
   * Redirection par défaut selon le rôle
   */
  export const DEFAULT_ROUTE_BY_ROLE = {
    doctor: ROUTES.DOCTOR.DASHBOARD,
    patient: ROUTES.PATIENT.DASHBOARD,
    secretary: ROUTES.SECRETARY.DASHBOARD,
    admin: ROUTES.ADMIN.DASHBOARD,
  } as const;

  /**
   * Routes accessibles sans authentification
   */
  export const PUBLIC_ROUTES = [
    ROUTES.PUBLIC.HOME,
    ROUTES.PUBLIC.LOGIN,
    ROUTES.PUBLIC.SIGNUP,
    ROUTES.PUBLIC.CONTACT,
    ROUTES.PUBLIC.SUBSCRIPTION_PLANS,
    ROUTES.PUBLIC.PAYMENT,
  ] as const;

  /**
   * Vérifie si une route est publique
   */
  export const isPublicRoute = (path: string): boolean => {
    return PUBLIC_ROUTES.some(route => {
      const pattern = route.replace(/:\w+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    });
  };

  /**
   * Vérifie si un utilisateur a accès à une route
   */
  export const canAccessRoute = (path: string, userRole: string | null): boolean => {
    // Routes publiques accessibles à tous
    if (isPublicRoute(path)) return true;

    // Pas de rôle = pas d'accès aux routes protégées
    if (!userRole) return false;

    // Chercher les permissions pour cette route
    const routePattern = Object.keys(ROUTE_PERMISSIONS).find(pattern => {
      const regex = new RegExp(`^${pattern.replace(/:\w+/g, '[^/]+')}$`);
      return regex.test(path);
    });

    if (!routePattern) return false;

    const allowedRoles = ROUTE_PERMISSIONS[routePattern as keyof typeof ROUTE_PERMISSIONS] as readonly string[];
    return allowedRoles.includes(userRole);

  };

  export default ROUTES;
