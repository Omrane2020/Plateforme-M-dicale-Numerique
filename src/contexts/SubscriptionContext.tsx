import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import subscriptionApi, {
  type SubscriptionPlan,
  type CreateSubscriptionPlanDTO,
  type UpdateSubscriptionPlanDTO,
  type SubscriptionFeature
} from '../services/api/subscriptionApi';

// Interface pour les statistiques
interface SubscriptionStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: {
    doctor: number;
    clinic: number;
    patient: number;
  };
  averagePrice?: {
    monthly: number;
    yearly: number;
  };
}

interface SubscriptionContextType {
  plans: SubscriptionPlan[];
  stats: SubscriptionStats;
  loading: boolean;
  error: string | null;
  // Fonctions de gestion
  addPlan: (plan: CreateSubscriptionPlanDTO) => Promise<void>;
  updatePlan: (id: number, plan: UpdateSubscriptionPlanDTO) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  togglePlanStatus: (id: number) => Promise<void>;
  clonePlan: (id: number) => Promise<void>;
  searchPlans: (query: string) => Promise<SubscriptionPlan[]>;
  refreshPlans: () => Promise<void>;
  clearError: () => void;
  // Fonctions utilitaires
  getPlansByCategory: (category: string) => SubscriptionPlan[];
  getActivePlans: () => SubscriptionPlan[];
  getPlanById: (id: number) => SubscriptionPlan | undefined;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Stats par défaut
const defaultStats: SubscriptionStats = {
  total: 0,
  active: 0,
  inactive: 0,
  byCategory: {
    doctor: 0,
    clinic: 0,
    patient: 0
  }
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonctions utilitaires pour filtrer les plans
  const getPlansByCategory = (category: string): SubscriptionPlan[] => {
    return plans.filter(plan => plan.category === category);
  };

  const getActivePlans = (): SubscriptionPlan[] => {
    return plans.filter(plan => plan.active);
  };

  const getPlanById = (id: number): SubscriptionPlan | undefined => {
    return plans.find(plan => plan.id === id);
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const { plans: plansData, stats: statsData } = await subscriptionApi.getAllPlans();
      setPlans(plansData);
      setStats(statsData || defaultStats);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de chargement des abonnements';
      setError(errorMessage);
      console.error('Erreur lors du chargement des plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const addPlan = async (planData: CreateSubscriptionPlanDTO) => {
    try {
      setError(null);
      await subscriptionApi.createPlan(planData);
      await loadPlans();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updatePlan = async (id: number, updates: UpdateSubscriptionPlanDTO) => {
    try {
      setError(null);
      await subscriptionApi.updatePlan(id.toString(), updates);
      await loadPlans();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deletePlan = async (id: number) => {
    try {
      setError(null);
      await subscriptionApi.deletePlan(id.toString());
      await loadPlans();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const togglePlanStatus = async (id: number) => {
    try {
      setError(null);
      await subscriptionApi.togglePlanStatus(id.toString());
      await loadPlans();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du changement de statut';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clonePlan = async (id: number) => {
    try {
      setError(null);
      await subscriptionApi.clonePlan(id.toString());
      await loadPlans();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du clonage';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const searchPlans = async (query: string): Promise<SubscriptionPlan[]> => {
    try {
      setError(null);
      return await subscriptionApi.searchPlans(query);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la recherche';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshPlans = async () => {
    await loadPlans();
  };

  const clearError = () => {
    setError(null);
  };

  // ✅ useMemo placé APRÈS toutes les définitions de fonctions
  const memoizedValues = useMemo(() => ({
    plans,
    stats,
    loading,
    error,
    // Fonctions de gestion
    addPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
    clonePlan,
    searchPlans,
    refreshPlans,
    clearError,
    // Fonctions utilitaires
    getPlansByCategory,
    getActivePlans,
    getPlanById
  }), [plans, stats, loading, error]);

  return (
    <SubscriptionContext.Provider value={memoizedValues}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}

// Export des types pour une utilisation facile
export type { 
  SubscriptionPlan, 
  SubscriptionFeature, 
  CreateSubscriptionPlanDTO, 
  UpdateSubscriptionPlanDTO 
};