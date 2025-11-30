import API from '../api';

export interface SubscriptionFeature {
  name: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  category: 'doctor' | 'clinic' | 'patient';
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
  features: SubscriptionFeature[];
  active: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  // Champs calculés par le backend
  yearlySavings: number;
  includedFeaturesCount: number;
  canToggle?: boolean;
}

export interface CreateSubscriptionPlanDTO {
  name: string;
  description: string;
  category: 'doctor' | 'clinic' | 'patient';
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
  features: SubscriptionFeature[];
  order: number;
}

export interface UpdateSubscriptionPlanDTO extends Partial<CreateSubscriptionPlanDTO> { }

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  stats?: any;
}

class SubscriptionApiService {
  private baseUrl = '/subscriptions';
async getAllPlans(): Promise<{ plans: SubscriptionPlan[], stats: any }> {
  try {
    const response = await API.get<any>(this.baseUrl);
    
    console.log('🔍 Type de response.data:', typeof response.data);
    console.log('🔍 Est un tableau?:', Array.isArray(response.data));
    
    // L'API retourne directement le tableau de plans
    if (Array.isArray(response.data)) {
      return {
        plans: response.data,
        stats: {}
      };
    }
    
    // Si par hasard c'est encapsulé dans data
    if (response.data && Array.isArray(response.data.data)) {
      return {
        plans: response.data.data,
        stats: response.data.stats || {}
      };
    }
    
    // Si c'est un objet avec success
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || 'Erreur API');
    }
    
    // Fallback
    console.warn('⚠️ Structure inattendue, retour tableau vide');
    return {
      plans: [],
      stats: {}
    };
    
  } catch (error: any) {
    console.error('❌ Erreur API:', error);
    throw new Error('Erreur lors de la récupération des plans');
  }
}

  async getPlansByCategory(category: string): Promise<SubscriptionPlan[]> {
    try {
      const response = await this.getAllPlans();
      return response.plans.filter(plan => plan.category === category);
    } catch (error) {
      console.error(`Erreur lors de la récupération des plans ${category}:`, error);
      throw new Error(`Impossible de récupérer les plans ${category}`);
    }
  }

  async createPlan(planData: CreateSubscriptionPlanDTO): Promise<SubscriptionPlan> {
    const response = await API.post<ApiResponse<SubscriptionPlan>>(this.baseUrl, planData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la création du plan');
    }
    return response.data.data!;
  }

  async updatePlan(id: string, updates: UpdateSubscriptionPlanDTO): Promise<SubscriptionPlan> {
    const response = await API.put<ApiResponse<SubscriptionPlan>>(`${this.baseUrl}/${id}`, updates);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la mise à jour du plan');
    }
    return response.data.data!;
  }

  async deletePlan(id: string): Promise<void> {
    const response = await API.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la suppression du plan');
    }
  }

  async togglePlanStatus(id: string): Promise<SubscriptionPlan> {
    const response = await API.patch<ApiResponse<SubscriptionPlan>>(`${this.baseUrl}/${id}/toggle`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors du changement de statut');
    }
    return response.data.data!;
  }

  async getStatistics(): Promise<any> {
    const response = await API.get<ApiResponse<any>>(`${this.baseUrl}/statistics`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la récupération des statistiques');
    }
    return response.data.data;
  }

  async searchPlans(query: string): Promise<SubscriptionPlan[]> {
    const response = await API.get<ApiResponse<SubscriptionPlan[]>>(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la recherche');
    }
    return response.data.data || [];
  }

  async clonePlan(id: string): Promise<SubscriptionPlan> {
    const response = await API.post<ApiResponse<SubscriptionPlan>>(`${this.baseUrl}/${id}/clone`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors du clonage du plan');
    }
    return response.data.data!;
  }
  // Supprimer static
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const allPlansResponse = await this.getAllPlans();
    return allPlansResponse.plans.filter(p => p.active);
  }

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const allPlansResponse = await this.getAllPlans();
    const plan = allPlansResponse.plans.find(p => p.id.toString() === id);
    if (!plan) throw new Error('Plan non trouvé');
    return plan;
  }


}


export default new SubscriptionApiService();