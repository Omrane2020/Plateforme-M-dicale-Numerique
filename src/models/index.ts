/**
 * Index centralisé pour tous les models
 * Facilite les imports dans l'application
 */

export * from './Subscription.model';

// Ré-exporter les types pour faciliter l'accès
export type { SubscriptionPlan, SubscriptionFeature } from '../types/subscription';
