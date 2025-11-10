/**
 * Composant pour protéger les routes selon le rôle de l'utilisateur
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../config/routes.config';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  userRole: string | null;
  allowedRoles: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  isAuthenticated, 
  userRole, 
  allowedRoles,
  redirectTo = ROUTES.PUBLIC.LOGIN
}: ProtectedRouteProps) {
  // Pas authentifié → rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Authentifié mais pas le bon rôle → page non autorisée
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  
  // Tout est OK, afficher la route
  return <Outlet />;
}

export default ProtectedRoute;
