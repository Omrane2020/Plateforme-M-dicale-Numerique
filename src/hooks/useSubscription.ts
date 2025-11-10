/**
 * Hook personnalisé pour gérer les abonnements
 * 
 * Utilise le SubscriptionController et fournit une interface simple aux composants
 */

import { useState, useEffect, useCallback } from 'react';
import { SubscriptionController } from '../controllers';
import { SubscriptionModel } from '../models';
import { type CreateSubscriptionPlanDTO, type UpdateSubscriptionPlanDTO } from '../types/subscription';

interface UseSubscriptionReturn {
  // État
  plans: SubscriptionModel[];
  loading: boolean;
  error: string | null;
  
  // Actions CRUD
  createPlan: (data: CreateSubscriptionPlanDTO) => Promise<SubscriptionModel>;
  updatePlan: (id: string, data: UpdateSubscriptionPlanDTO) => Promise<SubscriptionModel>;
  deletePlan: (id: string) => Promise<void>;
  togglePlanStatus: (id: string) => Promise<SubscriptionModel>;
  clonePlan: (id: string) => Promise<SubscriptionModel>;
  
  // Filtres et recherche
  getPlansByCategory: (category: 'doctor' | 'clinic' | 'patient') => SubscriptionModel[];
  getActivePlans: () => SubscriptionModel[];
  searchPlans: (query: string) => SubscriptionModel[];
  sortPlans: (sortBy: 'name' | 'price' | 'order' | 'popular') => SubscriptionModel[];
  
  // Utilitaires
  refreshPlans: () => Promise<void>;
  getPlanById: (id: string) => SubscriptionModel | undefined;
}

/**
 * Hook principal pour gérer les abonnements
 */
export function useSubscription(): UseSubscriptionReturn {
  const [plans, setPlans] = useState<SubscriptionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les plans au montage
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SubscriptionController.getAllPlans();
      setPlans(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(message);
      console.error('[useSubscription] Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Créer un plan
  const createPlan = useCallback(async (data: CreateSubscriptionPlanDTO) => {
    try {
      setError(null);
      const newPlan = await SubscriptionController.createPlan(data);
      await loadPlans(); // Recharger tous les plans
      return newPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de création';
      setError(message);
      throw err;
    }
  }, [loadPlans]);

  // Mettre à jour un plan
  const updatePlan = useCallback(async (id: string, data: UpdateSubscriptionPlanDTO) => {
    try {
      setError(null);
      const updatedPlan = await SubscriptionController.updatePlan(id, data);
      await loadPlans(); // Recharger tous les plans
      return updatedPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de mise à jour';
      setError(message);
      throw err;
    }
  }, [loadPlans]);

  // Supprimer un plan
  const deletePlan = useCallback(async (id: string) => {
    try {
      setError(null);
      await SubscriptionController.deletePlan(id);
      await loadPlans(); // Recharger tous les plans
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de suppression';
      setError(message);
      throw err;
    }
  }, [loadPlans]);

  // Toggle statut
  const togglePlanStatus = useCallback(async (id: string) => {
    try {
      setError(null);
      const updatedPlan = await SubscriptionController.togglePlanStatus(id);
      await loadPlans(); // Recharger tous les plans
      return updatedPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de modification';
      setError(message);
      throw err;
    }
  }, [loadPlans]);

  // Cloner un plan
  const clonePlan = useCallback(async (id: string) => {
    try {
      setError(null);
      const clonedPlan = await SubscriptionController.clonePlan(id);
      await loadPlans(); // Recharger tous les plans
      return clonedPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de clonage';
      setError(message);
      throw err;
    }
  }, [loadPlans]);

  // Filtrer par catégorie
  const getPlansByCategory = useCallback(
    (category: 'doctor' | 'clinic' | 'patient'): SubscriptionModel[] => {
      return plans
        .filter(plan => plan.category === category)
        .sort((a, b) => a.order - b.order);
    },
    [plans]
  );

  // Récupérer les plans actifs
  const getActivePlans = useCallback((): SubscriptionModel[] => {
    return plans
      .filter(plan => plan.active)
      .sort((a, b) => a.order - b.order);
  }, [plans]);

  // Rechercher des plans
  const searchPlans = useCallback(
    (query: string): SubscriptionModel[] => {
      const lowercaseQuery = query.toLowerCase();
      return plans.filter(
        plan =>
          plan.name.toLowerCase().includes(lowercaseQuery) ||
          plan.description.toLowerCase().includes(lowercaseQuery)
      );
    },
    [plans]
  );

  // Trier les plans
  const sortPlans = useCallback(
    (sortBy: 'name' | 'price' | 'order' | 'popular'): SubscriptionModel[] => {
      return SubscriptionController.sortPlans(plans, sortBy);
    },
    [plans]
  );

  // Rafraîchir les plans
  const refreshPlans = useCallback(async () => {
    await loadPlans();
  }, [loadPlans]);

  // Récupérer un plan par ID
  const getPlanById = useCallback(
    (id: string): SubscriptionModel | undefined => {
      return plans.find(plan => plan.id === id);
    },
    [plans]
  );

  return {
    // État
    plans,
    loading,
    error,

    // Actions CRUD
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
    clonePlan,

    // Filtres et recherche
    getPlansByCategory,
    getActivePlans,
    searchPlans,
    sortPlans,

    // Utilitaires
    refreshPlans,
    getPlanById
  };
}

/**
 * Hook pour récupérer les statistiques des abonnements
 */
export function useSubscriptionStatistics() {
  const [statistics, setStatistics] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const stats = await SubscriptionController.getStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('[useSubscriptionStatistics] Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { statistics, loading };
}

/**
 * Hook pour récupérer les plans actifs d'une catégorie spécifique
 */
export function useActivePlansByCategory(category: 'doctor' | 'clinic' | 'patient') {
  const [plans, setPlans] = useState<SubscriptionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SubscriptionController.getActivePlansByCategory(category);
        setPlans(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [category]);

  return { plans, loading, error };
}

export default useSubscription;
