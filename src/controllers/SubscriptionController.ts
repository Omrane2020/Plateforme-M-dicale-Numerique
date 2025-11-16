/**
 * CONTROLLER - Gestion des abonnements
 * 
 * Orchestre les opérations sur les abonnements
 * Fait le lien entre les Models, Services et Views
 */

import { SubscriptionModel, SubscriptionFactory } from '../models';
import SubscriptionApiService from '../services/api/subscriptionApi';
import type { 
  CreateSubscriptionPlanDTO, 
  UpdateSubscriptionPlanDTO,
} from '../types/subscription';

export class SubscriptionController {
  /**
   * Récupère tous les plans d'abonnement
   */
  static async getAllPlans(): Promise<SubscriptionModel[]> {
    try {
      console.log('[Controller] Récupération de tous les plans...');
      
      const plans = await SubscriptionApiService.getAllPlans();
      const models = SubscriptionFactory.createMany(plans);
      
      console.log('[Controller] Plans récupérés:', models.length);
      return models;
    } catch (error) {
      console.error('[Controller] Erreur lors de la récupération:', error);
      throw new Error('Impossible de récupérer les plans d\'abonnement');
    }
  }

  /**
   * Récupère les plans par catégorie
   */
  static async getPlansByCategory(
    category: 'doctor' | 'clinic' | 'patient'
  ): Promise<SubscriptionModel[]> {
    try {
      console.log(`[Controller] Récupération des plans ${category}...`);
      
      const plans = await SubscriptionApiService.getPlansByCategory(category);
      const models = SubscriptionFactory.createMany(plans);
      
      console.log(`[Controller] Plans ${category} récupérés:`, models.length);
      return models;
    } catch (error) {
      console.error('[Controller] Erreur lors de la récupération:', error);
      throw new Error(`Impossible de récupérer les plans ${category}`);
    }
  }

  /**
   * Récupère uniquement les plans actifs
   */
  static async getActivePlans(): Promise<SubscriptionModel[]> {
    try {
      console.log('[Controller] Récupération des plans actifs...');
      
      const plans = await SubscriptionApiService.getActivePlans();
      const models = SubscriptionFactory.createMany(plans);
      
      // Filtrer encore une fois côté client pour être sûr
      const activePlans = models.filter(plan => plan.active);
      
      console.log('[Controller] Plans actifs récupérés:', activePlans.length);
      return activePlans;
    } catch (error) {
      console.error('[Controller] Erreur lors de la récupération:', error);
      throw new Error('Impossible de récupérer les plans actifs');
    }
  }

  /**
   * Récupère les plans actifs d'une catégorie spécifique
   */
  static async getActivePlansByCategory(
    category: 'doctor' | 'clinic' | 'patient'
  ): Promise<SubscriptionModel[]> {
    try {
      const allPlans = await this.getPlansByCategory(category);
      return allPlans.filter(plan => plan.active);
    } catch (error) {
      console.error('[Controller] Erreur:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau plan d'abonnement
   */
  static async createPlan(data: CreateSubscriptionPlanDTO): Promise<SubscriptionModel> {
    try {
      console.log('[Controller] Création d\'un nouveau plan...');
      
      // Créer un modèle temporaire pour validation
      const tempPlan = new SubscriptionModel({
        id: 'temp',
        ...data,
        active: true
      });
      
      // Valider les données
      const validation = tempPlan.validate();
      if (!validation.valid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }
      
      // Créer via l'API
      const createdPlan = await SubscriptionApiService.createPlan(data);
      const model = new SubscriptionModel(createdPlan);
      
      console.log('[Controller] Plan créé avec succès:', model.id);
      return model;
    } catch (error) {
      console.error('[Controller] Erreur lors de la création:', error);
      throw error;
    }
  }

  /**
   * Met à jour un plan existant
   */
  static async updatePlan(
    id: string, 
    updates: UpdateSubscriptionPlanDTO
  ): Promise<SubscriptionModel> {
    try {
      console.log(`[Controller] Mise à jour du plan ${id}...`);
      
      // Si on met à jour des données critiques, valider
      if (updates.name || updates.monthlyPrice || updates.yearlyPrice || updates.features) {
        // Récupérer le plan actuel
        const currentPlan = await SubscriptionApiService.getPlanById(id);
        
        // Créer un modèle avec les mises à jour pour validation
        const updatedModel = new SubscriptionModel({
          ...currentPlan,
          ...updates
        });
        
        const validation = updatedModel.validate();
        if (!validation.valid) {
          throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
        }
      }
      
      // Mettre à jour via l'API
      const updatedPlan = await SubscriptionApiService.updatePlan(id, updates);
      const model = new SubscriptionModel(updatedPlan);
      
      console.log('[Controller] Plan mis à jour avec succès:', model.id);
      return model;
    } catch (error) {
      console.error('[Controller] Erreur lors de la mise à jour:', error);
      throw error;
    }
  }

  /**
   * Supprime un plan
   */
  static async deletePlan(id: string): Promise<void> {
    try {
      console.log(`[Controller] Suppression du plan ${id}...`);
      
      // Récupérer le plan pour vérifier s'il peut être supprimé
      const plan = await SubscriptionApiService.getPlanById(id);
      const model = new SubscriptionModel(plan);
      
      if (!model.canBeDeleted()) {
        throw new Error('Ce plan ne peut pas être supprimé');
      }
      
      // Supprimer via l'API
      await SubscriptionApiService.deletePlan(id);
      
      console.log('[Controller] Plan supprimé avec succès');
    } catch (error) {
      console.error('[Controller] Erreur lors de la suppression:', error);
      throw error;
    }
  }

  /**
   * Active ou désactive un plan
   */
  static async togglePlanStatus(id: string): Promise<SubscriptionModel> {
    try {
      console.log(`[Controller] Toggle statut du plan ${id}...`);
      
      // Récupérer le plan actuel
      const currentPlan = await SubscriptionApiService.getPlanById(id);
      const model = new SubscriptionModel(currentPlan);
      
      // Vérifier si on peut changer le statut
      if (!model.canToggleStatus()) {
        throw new Error('Le statut de ce plan ne peut pas être modifié');
      }
      
      // Toggle via l'API
      const updatedPlan = await SubscriptionApiService.togglePlanStatus(id);
      const updatedModel = new SubscriptionModel(updatedPlan);
      
      console.log('[Controller] Statut modifié:', updatedModel.active ? 'Actif' : 'Inactif');
      return updatedModel;
    } catch (error) {
      console.error('[Controller] Erreur lors du toggle:', error);
      throw error;
    }
  }

  /**
   * Clone un plan existant
   */
  static async clonePlan(id: string): Promise<SubscriptionModel> {
    try {
      console.log(`[Controller] Clonage du plan ${id}...`);
      
      // Récupérer le plan à cloner
      const plan = await SubscriptionApiService.getPlanById(id);
      const model = new SubscriptionModel(plan);
      
      // Cloner le modèle
      const clonedModel = model.clone();
      
      // Créer le nouveau plan
      const createdPlan = await SubscriptionApiService.createPlan({
        name: clonedModel.name,
        description: clonedModel.description,
        category: clonedModel.category,
        monthlyPrice: clonedModel.monthlyPrice,
        yearlyPrice: clonedModel.yearlyPrice,
        popular: clonedModel.popular,
        color: clonedModel.color,
        features: clonedModel.features,
        order: clonedModel.order
      });
      
      const newModel = new SubscriptionModel(createdPlan);
      
      console.log('[Controller] Plan cloné avec succès:', newModel.id);
      return newModel;
    } catch (error) {
      console.error('[Controller] Erreur lors du clonage:', error);
      throw error;
    }
  }

  /**
   * Calcule les statistiques des plans
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCategory: {
      doctor: number;
      clinic: number;
      patient: number;
    };
    averagePrice: {
      monthly: number;
      yearly: number;
    };
  }> {
    try {
      const plans = await this.getAllPlans();
      
      const active = plans.filter(p => p.active).length;
      const inactive = plans.length - active;
      
      const byCategory = {
        doctor: plans.filter(p => p.category === 'doctor').length,
        clinic: plans.filter(p => p.category === 'clinic').length,
        patient: plans.filter(p => p.category === 'patient').length
      };
      
      const totalMonthly = plans.reduce((sum, p) => sum + p.monthlyPrice, 0);
      const totalYearly = plans.reduce((sum, p) => sum + p.yearlyPrice, 0);
      
      return {
        total: plans.length,
        active,
        inactive,
        byCategory,
        averagePrice: {
          monthly: plans.length > 0 ? totalMonthly / plans.length : 0,
          yearly: plans.length > 0 ? totalYearly / plans.length : 0
        }
      };
    } catch (error) {
      console.error('[Controller] Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }

  /**
   * Recherche des plans par nom ou description
   */
  static async searchPlans(query: string): Promise<SubscriptionModel[]> {
    try {
      const allPlans = await this.getAllPlans();
      const lowercaseQuery = query.toLowerCase();
      
      return allPlans.filter(plan => 
        plan.name.toLowerCase().includes(lowercaseQuery) ||
        plan.description.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('[Controller] Erreur lors de la recherche:', error);
      throw error;
    }
  }

  /**
   * Trie les plans selon un critère
   */
  static sortPlans(
    plans: SubscriptionModel[],
    sortBy: 'name' | 'price' | 'order' | 'popular'
  ): SubscriptionModel[] {
    const sorted = [...plans];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'price':
        return sorted.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
      
      case 'order':
        return sorted.sort((a, b) => a.order - b.order);
      
      case 'popular':
        return sorted.sort((a, b) => {
          if (a.popular === b.popular) return 0;
          return a.popular ? -1 : 1;
        });
      
      default:
        return sorted;
    }
  }
}

export default SubscriptionController;
