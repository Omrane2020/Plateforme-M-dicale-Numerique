// services/userService.js
import API from './api';

export const userService = {
  // Récupérer tous les utilisateurs
  getAllUsers: () => API.get('/users'),
  
  // Récupérer un utilisateur par ID
  getUserById: (id) => API.get(`/users/${id}`),
  
  // Créer un nouvel utilisateur
  createUser: (userData) => API.post('/auth/signup', userData),
  
  // Mettre à jour un utilisateur
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),
  
  // Supprimer un utilisateur
  deleteUser: (id) => API.delete(`/users/${id}`),
  
  // Activer/désactiver un utilisateur (seulement pour les secrétaires)
  toggleUserStatus: (id, isActive) => API.patch(`/users/${id}/status`, { isActive })
};