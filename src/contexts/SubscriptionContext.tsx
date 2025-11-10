import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import SubscriptionApiService from '../services/api/subscriptionApi';
import type  { SubscriptionPlan, CreateSubscriptionPlanDTO, UpdateSubscriptionPlanDTO } from '../types/subscription';

// Re-export des types pour la compatibilité
export type { SubscriptionPlan } from '../types/subscription';
export type { SubscriptionFeature } from '../types/subscription';

interface SubscriptionContextType {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  addPlan: (plan: CreateSubscriptionPlanDTO) => Promise<void>;
  updatePlan: (id: string, plan: UpdateSubscriptionPlanDTO) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  togglePlanStatus: (id: string) => Promise<void>;
  getPlansByCategory: (category: 'doctor' | 'clinic' | 'patient') => SubscriptionPlan[];
  getActivePlans: () => SubscriptionPlan[];
  refreshPlans: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * Provider pour la gestion des abonnements
 * 
 * ARCHITECTURE BACKEND/FRONTEND:
 * - Ce contexte utilise le service API (SubscriptionApiService)
 * - Le service API communique avec la couche base de données
 * - Les modifications de l'admin sont automatiquement reflétées dans toute l'application
 * 
 * FLUX DE DONNÉES:
 * 1. Admin modifie un plan via SubscriptionManagement
 * 2. Le composant appelle addPlan/updatePlan/deletePlan du contexte
 * 3. Le contexte appelle SubscriptionApiService
 * 4. L'API met à jour la base de données (MySQL simulé avec localStorage)
 * 5. Le contexte recharge les plans et notifie tous les composants
 * 6. La page Home affiche automatiquement les plans mis à jour
 */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les plans au montage du composant
  useEffect(() => {
    loadPlans();
  }, []);

  /**
   * Charge tous les plans depuis l'API
   * Cette fonction est appelée automatiquement et après chaque modification
   */
  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[Context] Chargement des plans depuis l\'API...');
      const data = await SubscriptionApiService.getAllPlans();
      
      setPlans(data);
      console.log('[Context] Plans chargés:', data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMessage);
      console.error('[Context] Erreur:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ajoute un nouveau plan
   * L'admin peut créer de nouveaux plans qui apparaîtront automatiquement sur la page Home
   */
  const addPlan = async (planData: CreateSubscriptionPlanDTO) => {
    try {
      setError(null);
      
      console.log('[Context] Création d\'un nouveau plan...');
      await SubscriptionApiService.createPlan(planData);
      
      // Recharger tous les plans pour synchroniser l'affichage
      await loadPlans();
      
      console.log('[Context] Plan créé avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de création';
      setError(errorMessage);
      console.error('[Context] Erreur:', errorMessage);
      throw err;
    }
  };

  /**
   * Met à jour un plan existant
   * Les modifications sont immédiatement visibles sur toutes les pages
   */
  const updatePlan = async (id: string, updates: UpdateSubscriptionPlanDTO) => {
    try {
      setError(null);
      
      console.log('[Context] Mise à jour du plan:', id);
      await SubscriptionApiService.updatePlan(id, updates);
      
      // Recharger tous les plans pour synchroniser l'affichage
      await loadPlans();
      
      console.log('[Context] Plan mis à jour avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour';
      setError(errorMessage);
      console.error('[Context] Erreur:', errorMessage);
      throw err;
    }
  };

  /**
   * Supprime un plan
   * Le plan disparaîtra automatiquement de la page Home et de toutes les autres pages
   */
  const deletePlan = async (id: string) => {
    try {
      setError(null);
      
      console.log('[Context] Suppression du plan:', id);
      await SubscriptionApiService.deletePlan(id);
      
      // Recharger tous les plans pour synchroniser l'affichage
      await loadPlans();
      
      console.log('[Context] Plan supprimé avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de suppression';
      setError(errorMessage);
      console.error('[Context] Erreur:', errorMessage);
      throw err;
    }
  };

  /**
   * Active ou désactive un plan
   * Les plans désactivés n'apparaissent plus sur la page Home
   */
  const togglePlanStatus = async (id: string) => {
    try {
      setError(null);
      
      console.log('[Context] Changement de statut du plan:', id);
      await SubscriptionApiService.togglePlanStatus(id);
      
      // Recharger tous les plans pour synchroniser l'affichage
      await loadPlans();
      
      console.log('[Context] Statut modifié avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de modification';
      setError(errorMessage);
      console.error('[Context] Erreur:', errorMessage);
      throw err;
    }
  };

  /**
   * Récupère les plans d'une catégorie spécifique
   * Utilisé par la page SubscriptionPlans pour afficher les plans par catégorie
   */
  const getPlansByCategory = (category: 'doctor' | 'clinic' | 'patient'): SubscriptionPlan[] => {
    return plans
      .filter(plan => plan.category === category)
      .sort((a, b) => a.order - b.order);
  };

  /**
   * Récupère uniquement les plans actifs
   * Utilisé par la page Home pour n'afficher que les plans disponibles
   */
  const getActivePlans = (): SubscriptionPlan[] => {
    return plans
      .filter(plan => plan.active)
      .sort((a, b) => a.order - b.order);
  };

  /**
   * Recharge manuellement les plans depuis l'API
   * Utile pour forcer une synchronisation
   */
  const refreshPlans = async () => {
    await loadPlans();
  };

  return (
    <SubscriptionContext.Provider value={{
      plans,
      loading,
      error,
      addPlan,
      updatePlan,
      deletePlan,
      togglePlanStatus,
      getPlansByCategory,
      getActivePlans,
      refreshPlans
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook personnalisé pour utiliser le contexte des abonnements
 * 
 * UTILISATION:
 * ```tsx
 * const { plans, addPlan, updatePlan, deletePlan } = useSubscriptions();
 * ```
 */
export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}
