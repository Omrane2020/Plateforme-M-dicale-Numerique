/**
 * MODEL - Entité Subscription (Abonnement)
 * 
 * Représente un plan d'abonnement avec sa logique métier
 * Pas de dépendances vers React ou UI
 */

import type { SubscriptionPlan, SubscriptionFeature } from '../types/subscription';

export class SubscriptionModel implements SubscriptionPlan {
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

  constructor(data: SubscriptionPlan) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.monthlyPrice = data.monthlyPrice;
    this.yearlyPrice = data.yearlyPrice;
    this.popular = data.popular;
    this.color = data.color;
    this.features = data.features;
    this.active = data.active;
    this.order = data.order;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Valide les données de l'abonnement
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Le nom est requis');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('La description est requise');
    }

    if (!['doctor', 'clinic', 'patient'].includes(this.category)) {
      errors.push('Catégorie invalide');
    }

    if (this.monthlyPrice < 0) {
      errors.push('Le prix mensuel doit être positif');
    }

    if (this.yearlyPrice < 0) {
      errors.push('Le prix annuel doit être positif');
    }

    // Le prix annuel devrait être inférieur au prix mensuel * 12
    if (this.yearlyPrice > this.monthlyPrice * 12) {
      errors.push('Le prix annuel ne peut pas être supérieur au prix mensuel × 12');
    }

    if (!['blue', 'green', 'purple', 'orange'].includes(this.color)) {
      errors.push('Couleur invalide');
    }

    if (this.features.length === 0) {
      errors.push('Au moins une fonctionnalité est requise');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcule l'économie réalisée avec le paiement annuel
   */
  calculateYearlySavings(): number {
    return this.monthlyPrice * 12 - this.yearlyPrice;
  }

  /**
   * Calcule le pourcentage d'économie
   */
  calculateSavingsPercentage(): number {
    const savings = this.calculateYearlySavings();
    const monthlyCost = this.monthlyPrice * 12;
    return Math.round((savings / monthlyCost) * 100);
  }

  /**
   * Récupère uniquement les fonctionnalités incluses
   */
  getIncludedFeatures(): SubscriptionFeature[] {
    return this.features.filter(f => f.included);
  }

  /**
   * Récupère uniquement les fonctionnalités non incluses
   */
  getExcludedFeatures(): SubscriptionFeature[] {
    return this.features.filter(f => !f.included);
  }

  /**
   * Compte le nombre de fonctionnalités incluses
   */
  countIncludedFeatures(): number {
    return this.getIncludedFeatures().length;
  }

  /**
   * Vérifie si une fonctionnalité spécifique est incluse
   */
  hasFeature(featureName: string): boolean {
    return this.features.some(
      f => f.name.toLowerCase().includes(featureName.toLowerCase()) && f.included
    );
  }

  /**
   * Vérifie si le plan peut être activé/désactivé
   */
  canToggleStatus(): boolean {
    // Un plan peut toujours être désactivé
    // Un plan peut être activé s'il est valide
    return this.active || this.validate().valid;
  }

  /**
   * Vérifie si le plan peut être supprimé
   * (logique métier : par exemple, ne pas supprimer si des utilisateurs l'utilisent)
   */
  canBeDeleted(): boolean {
    // Pour l'instant, tous les plans peuvent être supprimés
    // Dans une vraie application, vérifier s'il y a des abonnements actifs
    return true;
  }

  /**
   * Génère un badge de catégorie
   */
  getCategoryLabel(): string {
    const labels = {
      doctor: 'Médecins',
      clinic: 'Cliniques',
      patient: 'Patients'
    };
    return labels[this.category];
  }

  /**
   * Génère une description courte
   */
  getShortDescription(maxLength: number = 100): string {
    if (this.description.length <= maxLength) {
      return this.description;
    }
    return this.description.substring(0, maxLength) + '...';
  }

  /**
   * Clone le plan
   */
  clone(): SubscriptionModel {
    return new SubscriptionModel({
      ...this,
      id: `${this.id}-copy`,
      name: `${this.name} (Copie)`,
      active: false
    });
  }

  /**
   * Convertit vers un objet simple (pour JSON)
   */
  toJSON(): SubscriptionPlan {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      monthlyPrice: this.monthlyPrice,
      yearlyPrice: this.yearlyPrice,
      popular: this.popular,
      color: this.color,
      features: this.features,
      active: this.active,
      order: this.order,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Crée une instance depuis un objet simple
   */
  static fromJSON(data: SubscriptionPlan): SubscriptionModel {
    return new SubscriptionModel(data);
  }

  /**
   * Compare deux plans
   */
  equals(other: SubscriptionModel): boolean {
    return this.id === other.id;
  }

  /**
   * Vérifie si le plan est gratuit
   */
  isFree(): boolean {
    return this.monthlyPrice === 0 && this.yearlyPrice === 0;
  }

  /**
   * Vérifie si c'est un plan premium
   */
  isPremium(): boolean {
    return this.monthlyPrice >= 50;
  }

  /**
   * Génère un résumé du plan
   */
  getSummary(): string {
    const category = this.getCategoryLabel();
    const price = this.isFree() ? 'Gratuit' : `${this.monthlyPrice}€/mois`;
    const featuresCount = this.countIncludedFeatures();
    const status = this.active ? 'Actif' : 'Inactif';
    
    return `${this.name} (${category}) - ${price} - ${featuresCount} fonctionnalités - ${status}`;
  }
}

// Factory pour créer des plans
export class SubscriptionFactory {
  /**
   * Crée un plan vide avec des valeurs par défaut
   */
  static createEmpty(category: 'doctor' | 'clinic' | 'patient'): SubscriptionModel {
    return new SubscriptionModel({
      id: `plan-${Date.now()}`,
      name: '',
      description: '',
      category,
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      color: 'blue',
      features: [],
      active: false,
      order: 999
    });
  }

  /**
   * Crée un plan à partir de données partielles
   */
  static createFromPartial(
    partial: Partial<SubscriptionPlan>,
    defaults: SubscriptionPlan
  ): SubscriptionModel {
    return new SubscriptionModel({
      ...defaults,
      ...partial
    });
  }

  /**
   * Crée plusieurs plans depuis un tableau
   */
  static createMany(plans: SubscriptionPlan[]): SubscriptionModel[] {
    return plans.map(plan => new SubscriptionModel(plan));
  }
}
