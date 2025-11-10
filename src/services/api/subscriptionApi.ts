/**
 * Service API pour la gestion des abonnements
 * 
 * Ce fichier fait le pont entre le frontend (composants React) et le backend (base de données)
 * 
 * ARCHITECTURE:
 * Frontend (Components) -> API Service -> Database Layer -> MySQL
 * 
 * Pour une vraie application:
 * - Ce service appellerait des endpoints REST/GraphQL
 * - Exemple: fetch('/api/subscriptions') ou axios.get('/api/subscriptions')
 * - Le backend Node.js/Express recevrait ces requêtes et appellerait subscriptionDb.ts
 */

import {
  getAllPlans,
  getPlansByCategory,
  getActivePlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus
} from '../database/subscriptionDb';

import type {
  SubscriptionPlan,
  CreateSubscriptionPlanDTO,
  UpdateSubscriptionPlanDTO
} from '../../types/subscription';

// =====================================================
// API PUBLIQUE (utilisée par le frontend)
// =====================================================

export class SubscriptionApiService {
  /**
   * Récupère tous les plans d'abonnement
   * 
   * Production:
   * return fetch('/api/subscriptions').then(res => res.json())
   */
  static async getAllPlans(): Promise<SubscriptionPlan[]> {
    try {
      console.log('[API] GET /api/subscriptions');
      
      const response = await getAllPlans();
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la récupération des plans');
      }
      
      return response.data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  /**
   * Récupère les plans par catégorie
   * 
   * Production:
   * return fetch(`/api/subscriptions?category=${category}`).then(res => res.json())
   */
  static async getPlansByCategory(category: 'doctor' | 'clinic' | 'patient'): Promise<SubscriptionPlan[]> {
    try {
      console.log(`[API] GET /api/subscriptions?category=${category}`);
      
      const response = await getPlansByCategory(category);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la récupération des plans');
      }
      
      return response.data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les plans actifs
   * 
   * Production:
   * return fetch('/api/subscriptions?active=true').then(res => res.json())
   */
  static async getActivePlans(): Promise<SubscriptionPlan[]> {
    try {
      console.log('[API] GET /api/subscriptions?active=true');
      
      const response = await getActivePlans();
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la récupération des plans actifs');
      }
      
      return response.data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  /**
   * Récupère un plan spécifique par son ID
   * 
   * Production:
   * return fetch(`/api/subscriptions/${id}`).then(res => res.json())
   */
  static async getPlanById(id: string): Promise<SubscriptionPlan> {
    try {
      console.log(`[API] GET /api/subscriptions/${id}`);
      
      const response = await getPlanById(id);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Plan non trouvé');
      }
      
      return response.data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau plan d'abonnement (ADMIN ONLY)
   * 
   * Production:
   * return fetch('/api/subscriptions', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(planData)
   * }).then(res => res.json())
   */
  static async createPlan(planData: CreateSubscriptionPlanDTO): Promise<SubscriptionPlan> {
    try {
      console.log('[API] POST /api/subscriptions', planData);
      
      const response = await createPlan(planData);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la création du plan');
      }
      
      return response.data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  /**
   * Met à jour un plan existant (ADMIN ONLY)
   * 
   * Production:
   * return fetch(`/api/subscriptions/${id}`, {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(updates)
   * }).then(res => res.json())
   */
  static async updatePlan(id: string, updates: UpdateSubscriptionPlanDTO): Promise<SubscriptionPlan> {
    try {
      console.log(`[API] PUT /api/subscriptions/${id}`, updates);
      
      const response = await updatePlan(id, updates);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la mise à jour du plan');
      }
      
      return response.data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  /**
   * Supprime un plan (ADMIN ONLY)
   * 
   * Production:
   * return fetch(`/api/subscriptions/${id}`, {
   *   method: 'DELETE'
   * }).then(res => res.json())
   */
  static async deletePlan(id: string): Promise<void> {
    try {
      console.log(`[API] DELETE /api/subscriptions/${id}`);
      
      const response = await deletePlan(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la suppression du plan');
      }
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  /**
   * Active/désactive un plan (ADMIN ONLY)
   * 
   * Production:
   * return fetch(`/api/subscriptions/${id}/toggle`, {
   *   method: 'PATCH'
   * }).then(res => res.json())
   */
  static async togglePlanStatus(id: string): Promise<SubscriptionPlan> {
    try {
      console.log(`[API] PATCH /api/subscriptions/${id}/toggle`);
      
      const response = await togglePlanStatus(id);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors du changement de statut');
      }
      
      return response.data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  /**
   * Récupère les plans actifs d'une catégorie spécifique
   * Utile pour afficher les plans sur la page d'accueil
   * 
   * Production:
   * return fetch(`/api/subscriptions?category=${category}&active=true`).then(res => res.json())
   */
  static async getActivePlansByCategory(category: 'doctor' | 'clinic' | 'patient'): Promise<SubscriptionPlan[]> {
    try {
      console.log(`[API] GET /api/subscriptions?category=${category}&active=true`);
      
      const allPlans = await this.getPlansByCategory(category);
      return allPlans.filter(plan => plan.active);
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }
}

// Export par défaut pour faciliter l'importation
export default SubscriptionApiService;

// =====================================================
// EXEMPLE D'UTILISATION DANS LES COMPOSANTS
// =====================================================
/*
import SubscriptionApiService from '../services/api/subscriptionApi';

// Récupérer tous les plans
const plans = await SubscriptionApiService.getAllPlans();

// Récupérer les plans médecins actifs
const doctorPlans = await SubscriptionApiService.getActivePlansByCategory('doctor');

// Créer un nouveau plan (admin)
const newPlan = await SubscriptionApiService.createPlan({
  name: 'Nouveau Plan',
  description: 'Description',
  category: 'doctor',
  monthlyPrice: 49,
  yearlyPrice: 490,
  popular: false,
  color: 'blue',
  features: [
    { name: 'Feature 1', included: true }
  ],
  order: 4
});

// Mettre à jour un plan (admin)
const updatedPlan = await SubscriptionApiService.updatePlan('plan-id', {
  monthlyPrice: 59
});

// Supprimer un plan (admin)
await SubscriptionApiService.deletePlan('plan-id');

// Activer/désactiver un plan (admin)
const toggledPlan = await SubscriptionApiService.togglePlanStatus('plan-id');
*/
