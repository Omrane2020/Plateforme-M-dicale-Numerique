/**
 * CONTROLLER - Gestion des abonnements
 * 
 * Orchestre les opérations sur les abonnements
 * Fait le lien entre les Models, Services et Views
 */

import { SubscriptionModel } from '../models';
import SubscriptionApiService from '../services/api/subscriptionApi';
import type {
  CreateSubscriptionPlanDTO,
  UpdateSubscriptionPlanDTO,
  SubscriptionFeature,
} from '../types/subscription';

// Interface pour mapper les données API - alignée avec la réponse Postman
interface ApiSubscriptionPlan {
  id: number;
  name: string;
  description: string;
  category: 'doctor' | 'clinic' | 'patient';
  monthlyPrice: string; // L'API retourne des string pour les prix
  yearlyPrice: string; // L'API retourne des string pour les prix
  features: string; // L'API retourne une chaîne JSON
  popular: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
  order: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  canBeDeleted?: boolean;
  canToggle?: boolean;
  yearlySavings?: number;
  includedFeaturesCount?: number;
}

export class SubscriptionController {
  /**
   * Parse les features depuis une chaîne JSON
   */
  private static parseFeatures(featuresString: string): SubscriptionFeature[] {
    try {
      // Si c'est déjà un tableau, le retourner tel quel
      if (Array.isArray(featuresString)) {
        return featuresString.map((feature: any) => {
          if (typeof feature === 'string') {
            return { name: feature, included: true };
          }
          return {
            name: feature.name || feature,
            included: feature.included !== undefined ? feature.included : true
          };
        });
      }

      // Si c'est une chaîne, la parser
      if (typeof featuresString === 'string') {
        const parsed = JSON.parse(featuresString);
        if (Array.isArray(parsed)) {
          return parsed.map((feature: any) => {
            if (typeof feature === 'string') {
              return { name: feature, included: true };
            }
            return {
              name: feature.name || feature,
              included: feature.included !== undefined ? feature.included : true
            };
          });
        }
      }

      // Fallback: retourner un tableau vide
      return [];
    } catch (error) {
      console.error('[Controller] Erreur lors du parsing des features:', error);
      return [];
    }
  }

  /**
   * Convertit les données API vers le format Model
   */
  private static convertApiToModel(apiPlan: any): any {
    return {
      ...apiPlan,
      id: apiPlan.id.toString(), // Convertir number en string
      monthlyPrice: parseFloat(apiPlan.monthlyPrice) || 0, // Convertir string en number
      yearlyPrice: parseFloat(apiPlan.yearlyPrice) || 0, // Convertir string en number
      features: this.parseFeatures(apiPlan.features), // Parser la chaîne JSON
      createdAt: apiPlan.createdAt ? new Date(apiPlan.createdAt) : undefined,
      updatedAt: apiPlan.updatedAt ? new Date(apiPlan.updatedAt) : undefined,
    };
  }

  /**
   * Convertit un tableau de données API
   */
  private static convertApiArrayToModel(apiPlans: any[]): any[] {
    return apiPlans.map(plan => this.convertApiToModel(plan));
  }

  /**
   * Convertit les features pour l'API (inverse)
   */
  private static convertFeaturesForApi(features: SubscriptionFeature[]): string {
    // Pour l'API, on envoie juste les noms des features incluses
    const featureNames = features
      .filter(feature => feature.included)
      .map(feature => feature.name);
    
    return JSON.stringify(featureNames);
  }

  /**
   * Convertit les données pour la création via API
   */
  private static convertForApiCreation(data: CreateSubscriptionPlanDTO): any {
    return {
      ...data,
      monthlyPrice: data.monthlyPrice.toString(),
      yearlyPrice: data.yearlyPrice.toString(),
      features: this.convertFeaturesForApi(data.features)
    };
  }

  /**
   * Convertit les données pour la mise à jour via API
   */
  private static convertForApiUpdate(data: UpdateSubscriptionPlanDTO): any {
    const converted: any = { ...data };
    
    if (data.monthlyPrice !== undefined) {
      converted.monthlyPrice = data.monthlyPrice.toString();
    }
    
    if (data.yearlyPrice !== undefined) {
      converted.yearlyPrice = data.yearlyPrice.toString();
    }
    
    if (data.features) {
      converted.features = this.convertFeaturesForApi(data.features);
    }
    
    return converted;
  }

  /**
   * Récupère tous les plans d'abonnement
   */
  static async getAllPlans(): Promise<SubscriptionModel[]> {
    try {
      console.log('[Controller] Récupération de tous les plans...');

      const response = await SubscriptionApiService.getAllPlans();

      // Vérifie que la réponse est valide
      if (!response || !Array.isArray(response.plans)) {
        throw new Error('Format de réponse invalide pour les plans d\'abonnement');
      }

      const convertedData = this.convertApiArrayToModel(response.plans);
      const models = convertedData.map(plan => new SubscriptionModel(plan));

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
      const convertedData = this.convertApiArrayToModel(plans);
      const models = convertedData.map(plan => new SubscriptionModel(plan));

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

      const allPlans = await this.getAllPlans();
      const activePlans = allPlans.filter(plan => plan.active);

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
      console.log(`[Controller] Récupération des plans actifs ${category}...`);
      
      const allPlans = await this.getPlansByCategory(category);
      const activePlans = allPlans.filter(plan => plan.active);
      
      console.log(`[Controller] Plans actifs ${category} récupérés:`, activePlans.length);
      return activePlans;
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
      console.log('[Controller] Création d\'un nouveau plan...', data);

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
      
      // Convertir les données pour l'API
      const apiData = this.convertForApiCreation(data);
      
      // Créer via l'API
      const createdPlan = await SubscriptionApiService.createPlan(apiData);
      const convertedData = this.convertApiToModel(createdPlan);
      const model = new SubscriptionModel(convertedData);

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
      console.log(`[Controller] Mise à jour du plan ${id}...`, updates);

      // Convertir les données pour l'API
      const apiUpdates = this.convertForApiUpdate(updates);

      // Récupérer le plan actuel pour validation
      const currentPlan = await SubscriptionApiService.getPlanById(id);
      const convertedCurrentPlan = this.convertApiToModel(currentPlan);
      
      // Créer un modèle avec les mises à jour pour validation
      const updatedModel = new SubscriptionModel({
        ...convertedCurrentPlan,
        ...updates, // Utiliser les updates originaux (avec SubscriptionFeature[])
        id // S'assurer que l'ID reste cohérent
      });

      const validation = updatedModel.validate();
      if (!validation.valid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      // Mettre à jour via l'API
      const updatedPlan = await SubscriptionApiService.updatePlan(id, apiUpdates);
      const convertedUpdatedPlan = this.convertApiToModel(updatedPlan);
      const model = new SubscriptionModel(convertedUpdatedPlan);

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
      const convertedPlan = this.convertApiToModel(plan);
      const model = new SubscriptionModel(convertedPlan);

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
      const convertedCurrentPlan = this.convertApiToModel(currentPlan);
      const model = new SubscriptionModel(convertedCurrentPlan);

      // Vérifier si on peut changer le statut
      if (!model.canToggleStatus()) {
        throw new Error('Le statut de ce plan ne peut pas être modifié');
      }

      // Toggle via l'API
      const updatedPlan = await SubscriptionApiService.togglePlanStatus(id);
      const convertedUpdatedPlan = this.convertApiToModel(updatedPlan);
      const updatedModel = new SubscriptionModel(convertedUpdatedPlan);

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
      const convertedPlan = this.convertApiToModel(plan);
      const model = new SubscriptionModel(convertedPlan);

      // Cloner le modèle
      const clonedModel = model.clone();

      // Convertir les données pour la création
      const apiData = this.convertForApiCreation({
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

      // Créer le nouveau plan
      const createdPlan = await SubscriptionApiService.createPlan(apiData);
      const convertedCreatedPlan = this.convertApiToModel(createdPlan);
      const newModel = new SubscriptionModel(convertedCreatedPlan);

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
      console.log('[Controller] Calcul des statistiques...');
      
      const plans = await this.getAllPlans();

      const active = plans.filter(p => p.active).length;
      const inactive = plans.length - active;

      const byCategory = {
        doctor: plans.filter(p => p.category === 'doctor').length,
        clinic: plans.filter(p => p.category === 'clinic').length,
        patient: plans.filter(p => p.category === 'patient').length
      };

      const activePlans = plans.filter(p => p.active);
      const totalMonthly = activePlans.reduce((sum, p) => sum + p.monthlyPrice, 0);
      const totalYearly = activePlans.reduce((sum, p) => sum + p.yearlyPrice, 0);

      const stats = {
        total: plans.length,
        active,
        inactive,
        byCategory,
        averagePrice: {
          monthly: activePlans.length > 0 ? totalMonthly / activePlans.length : 0,
          yearly: activePlans.length > 0 ? totalYearly / activePlans.length : 0
        }
      };

      console.log('[Controller] Statistiques calculées:', stats);
      return stats;
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
      console.log(`[Controller] Recherche de plans: "${query}"`);
      
      const allPlans = await this.getAllPlans();
      const lowercaseQuery = query.toLowerCase();

      const results = allPlans.filter(plan =>
        plan.name.toLowerCase().includes(lowercaseQuery) ||
        plan.description.toLowerCase().includes(lowercaseQuery)
      );

      console.log('[Controller] Résultats de recherche:', results.length);
      return results;
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
    sortBy: 'name' | 'price' | 'order' | 'popular' = 'order',
    ascending: boolean = true
  ): SubscriptionModel[] {
    console.log(`[Controller] Tri des plans par: ${sortBy} (${ascending ? 'asc' : 'desc'})`);
    
    const sorted = [...plans];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => 
          ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );

      case 'price':
        return sorted.sort((a, b) => 
          ascending ? a.monthlyPrice - b.monthlyPrice : b.monthlyPrice - a.monthlyPrice
        );

      case 'order':
        return sorted.sort((a, b) => 
          ascending ? a.order - b.order : b.order - a.order
        );

      case 'popular':
        return sorted.sort((a, b) => {
          if (a.popular === b.popular) return 0;
          const popularCompare = a.popular ? -1 : 1;
          return ascending ? popularCompare : -popularCompare;
        });

      default:
        return sorted;
    }
  }

  /**
   * Récupère un plan par son ID
   */
  static async getPlanById(id: string): Promise<SubscriptionModel> {
    try {
      console.log(`[Controller] Récupération du plan ${id}...`);

      const plan = await SubscriptionApiService.getPlanById(id);
      const convertedPlan = this.convertApiToModel(plan);
      const model = new SubscriptionModel(convertedPlan);

      console.log('[Controller] Plan récupéré:', model.name);
      return model;
    } catch (error) {
      console.error('[Controller] Erreur lors de la récupération:', error);
      throw new Error('Impossible de récupérer le plan');
    }
  }
}

export default SubscriptionController;