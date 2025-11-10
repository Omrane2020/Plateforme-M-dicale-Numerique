// Types pour le système d'abonnements
// Ces types sont partagés entre le backend et le frontend

export interface SubscriptionFeature {
  name: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
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
  createdAt?: Date;
  updatedAt?: Date;
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

export interface UpdateSubscriptionPlanDTO extends Partial<CreateSubscriptionPlanDTO> {
  active?: boolean;
}

export interface SubscriptionPlanFilters {
  category?: 'doctor' | 'clinic' | 'patient';
  active?: boolean;
}
