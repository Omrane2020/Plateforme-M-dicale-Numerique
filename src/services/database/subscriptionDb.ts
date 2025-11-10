/**
 * Couche d'accès aux données pour les abonnements
 * 
 * BACKEND ONLY - Ce fichier contient la logique SQL pour interagir avec MySQL
 * 
 * Dans une vraie application Node.js/Express:
 * - Utilisez mysql2/promise pour les requêtes
 * - Ajoutez la gestion des transactions
 * - Ajoutez la validation et la sanitization
 * - Gérez les erreurs de connexion
 * 
 * Pour ce projet frontend, nous simulons les appels MySQL avec localStorage
 */

import type { SubscriptionPlan, SubscriptionFeature, CreateSubscriptionPlanDTO, UpdateSubscriptionPlanDTO, SubscriptionPlanFilters } from '../../types/subscription';
import { simulateDbConnection,type  DbResponse } from './config';

// Clé pour le stockage local (simulation de la BDD pour le développement)
const STORAGE_KEY = 'subscription_plans_db';

// =====================================================
// SIMULATION DE LA BASE DE DONNÉES (Pour développement frontend)
// =====================================================

// Fonction helper pour charger les données depuis le stockage local
function loadFromStorage(): SubscriptionPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Initialiser avec les données par défaut si vide
      return getInitialData();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('[DB] Erreur de chargement:', error);
    return getInitialData();
  }
}

// Fonction helper pour sauvegarder dans le stockage local
function saveToStorage(plans: SubscriptionPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error('[DB] Erreur de sauvegarde:', error);
  }
}

// Données initiales (équivalent à la BDD)
function getInitialData(): SubscriptionPlan[] {
  const initialPlans: SubscriptionPlan[] = [
    // Plans Médecins
    {
      id: 'doctor-basic',
      name: 'Médecin Solo',
      description: 'Pour les médecins débutants',
      category: 'doctor',
      monthlyPrice: 29,
      yearlyPrice: 290,
      popular: false,
      color: 'blue',
      active: true,
      order: 1,
      features: [
        { name: 'Jusqu\'à 50 patients', included: true },
        { name: 'Gestion RDV médecin (interface dédiée)', included: true },
        { name: 'Dossiers médicaux basiques', included: true },
        { name: 'Prescriptions électroniques', included: true },
        { name: 'Support email', included: true },
        { name: 'Rapports basiques', included: true },
        { name: 'Application mobile', included: false },
        { name: 'Téléconsultation', included: false },
        { name: '1 secrétaire avec interface propre RDV', included: true },
        { name: 'API intégration', included: false }
      ]
    },
    {
      id: 'doctor-professional',
      name: 'Cabinet Médical',
      description: 'Pour les cabinets établis',
      category: 'doctor',
      monthlyPrice: 59,
      yearlyPrice: 590,
      popular: true,
      color: 'green',
      active: true,
      order: 2,
      features: [
        { name: 'Jusqu\'à 200 patients', included: true },
        { name: 'Gestion RDV médecin avancée (interface dédiée)', included: true },
        { name: 'Dossiers médicaux avancés', included: true },
        { name: 'Prescriptions électroniques', included: true },
        { name: 'Support email & téléphone', included: true },
        { name: 'Rapports détaillés', included: true },
        { name: 'Application mobile', included: true },
        { name: 'Téléconsultation (50/mois)', included: true },
        { name: '3 secrétaires avec interface propre RDV', included: true },
        { name: 'API intégration', included: true }
      ]
    },
    {
      id: 'doctor-premium',
      name: 'Multi-Praticiens',
      description: 'Pour les groupes de médecins',
      category: 'doctor',
      monthlyPrice: 99,
      yearlyPrice: 990,
      popular: false,
      color: 'purple',
      active: true,
      order: 3,
      features: [
        { name: 'Patients illimités', included: true },
        { name: 'Système RDV multi-praticiens (interfaces dédiées)', included: true },
        { name: 'Dossiers médicaux complets', included: true },
        { name: 'Prescriptions électroniques', included: true },
        { name: 'Support 24/7', included: true },
        { name: 'Analytics avancés', included: true },
        { name: 'Application mobile', included: true },
        { name: 'Téléconsultation illimitée', included: true },
        { name: 'Secrétaires illimités (interface propre chacun)', included: true },
        { name: 'API & intégrations complètes', included: true }
      ]
    },
    // Plans Cliniques
    {
      id: 'clinic-standard',
      name: 'Clinique Standard',
      description: 'Pour les petites cliniques',
      category: 'clinic',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      popular: false,
      color: 'blue',
      active: true,
      order: 1,
      features: [
        { name: 'Jusqu\'à 10 médecins', included: true },
        { name: 'Patients illimités', included: true },
        { name: 'Gestion multi-services', included: true },
        { name: 'Système de facturation', included: true },
        { name: 'Gestion des lits', included: true },
        { name: 'Rapports financiers', included: true },
        { name: 'Support dédié', included: true },
        { name: 'Formation du personnel', included: true },
        { name: 'Sauvegarde quotidienne', included: true },
        { name: 'Intégration laboratoire', included: true }
      ]
    },
    {
      id: 'clinic-enterprise',
      name: 'Hôpital Enterprise',
      description: 'Pour les grandes structures',
      category: 'clinic',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      popular: true,
      color: 'green',
      active: true,
      order: 2,
      features: [
        { name: 'Médecins illimités', included: true },
        { name: 'Patients illimités', included: true },
        { name: 'Gestion hospitalière complète', included: true },
        { name: 'Système ERP intégré', included: true },
        { name: 'Gestion des urgences', included: true },
        { name: 'BI et analytics avancés', included: true },
        { name: 'Support 24/7 prioritaire', included: true },
        { name: 'Formation continue', included: true },
        { name: 'Sécurité renforcée', included: true },
        { name: 'API personnalisées', included: true }
      ]
    },
    {
      id: 'clinic-custom',
      name: 'Solution Sur-Mesure',
      description: 'Développement personnalisé',
      category: 'clinic',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      popular: false,
      color: 'purple',
      active: true,
      order: 3,
      features: [
        { name: 'Architecture personnalisée', included: true },
        { name: 'Développement sur-mesure', included: true },
        { name: 'Intégrations spécifiques', included: true },
        { name: 'Conformité réglementaire', included: true },
        { name: 'Déploiement sur site', included: true },
        { name: 'Support technique dédié', included: true },
        { name: 'SLA garantis', included: true },
        { name: 'Formation personnalisée', included: true },
        { name: 'Maintenance incluse', included: true },
        { name: 'Évolutions continues', included: true }
      ]
    },
    // Plans Patients
    {
      id: 'patient-basic',
      name: 'Patient Gratuit',
      description: 'Accès de base gratuit',
      category: 'patient',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: true,
      color: 'green',
      active: true,
      order: 1,
      features: [
        { name: 'Prise de rendez-vous', included: true },
        { name: 'Consultation de dossier', included: true },
        { name: 'Historique médical', included: true },
        { name: 'Rappels de RDV', included: true },
        { name: 'Application mobile', included: true },
        { name: 'Support client', included: true },
        { name: 'Téléconsultation', included: false },
        { name: 'Suivi personnalisé', included: false },
        { name: 'Analyses avancées', included: false },
        { name: 'Support prioritaire', included: false }
      ]
    },
    {
      id: 'patient-premium',
      name: 'Patient Premium',
      description: 'Suivi de santé avancé',
      category: 'patient',
      monthlyPrice: 9,
      yearlyPrice: 90,
      popular: false,
      color: 'blue',
      active: true,
      order: 2,
      features: [
        { name: 'Toutes fonctions gratuites', included: true },
        { name: 'Téléconsultations illimitées', included: true },
        { name: 'Suivi santé personnalisé', included: true },
        { name: 'Analyses et graphiques', included: true },
        { name: 'Rappels médicaments', included: true },
        { name: 'Objectifs de santé', included: true },
        { name: 'Partage famille', included: true },
        { name: 'Support prioritaire', included: true },
        { name: 'Conseils IA', included: true },
        { name: 'Espace de stockage étendu', included: true }
      ]
    },
    {
      id: 'patient-family',
      name: 'Famille Premium',
      description: 'Pour toute la famille',
      category: 'patient',
      monthlyPrice: 19,
      yearlyPrice: 190,
      popular: false,
      color: 'purple',
      active: true,
      order: 3,
      features: [
        { name: 'Jusqu\'à 6 membres', included: true },
        { name: 'Toutes fonctions Premium', included: true },
        { name: 'Carnet de santé famille', included: true },
        { name: 'Suivi enfants/seniors', included: true },
        { name: 'Urgences famille', included: true },
        { name: 'Partage avec médecins', included: true },
        { name: 'Historique génétique', included: true },
        { name: 'Conseiller santé dédié', included: true },
        { name: 'Assurance santé intégrée', included: true },
        { name: 'Concierge médical', included: true }
      ]
    }
  ];
  
  saveToStorage(initialPlans);
  return initialPlans;
}

// =====================================================
// FONCTIONS D'ACCÈS AUX DONNÉES (Équivalent SQL)
// =====================================================

/**
 * SQL Équivalent:
 * SELECT p.*, f.* FROM subscription_plans p
 * LEFT JOIN subscription_features f ON p.id = f.plan_id
 * ORDER BY p.display_order
 */
export async function getAllPlans(): Promise<DbResponse<SubscriptionPlan[]>> {
  try {
    simulateDbConnection();
    const plans = loadFromStorage();
    
    console.log('[DB] SELECT * FROM subscription_plans ORDER BY display_order');
    
    return {
      success: true,
      data: plans.sort((a, b) => a.order - b.order)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * SQL Équivalent:
 * SELECT * FROM subscription_plans
 * WHERE category = ? AND active = TRUE
 * ORDER BY display_order
 */
export async function getPlansByCategory(category: 'doctor' | 'clinic' | 'patient'): Promise<DbResponse<SubscriptionPlan[]>> {
  try {
    simulateDbConnection();
    const plans = loadFromStorage();
    
    console.log(`[DB] SELECT * FROM subscription_plans WHERE category = '${category}' ORDER BY display_order`);
    
    const filtered = plans
      .filter(p => p.category === category)
      .sort((a, b) => a.order - b.order);
    
    return {
      success: true,
      data: filtered
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * SQL Équivalent:
 * SELECT * FROM subscription_plans WHERE active = TRUE
 */
export async function getActivePlans(): Promise<DbResponse<SubscriptionPlan[]>> {
  try {
    simulateDbConnection();
    const plans = loadFromStorage();
    
    console.log('[DB] SELECT * FROM subscription_plans WHERE active = TRUE ORDER BY display_order');
    
    const active = plans
      .filter(p => p.active)
      .sort((a, b) => a.order - b.order);
    
    return {
      success: true,
      data: active
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * SQL Équivalent:
 * SELECT * FROM subscription_plans WHERE id = ?
 */
export async function getPlanById(id: string): Promise<DbResponse<SubscriptionPlan>> {
  try {
    simulateDbConnection();
    const plans = loadFromStorage();
    
    console.log(`[DB] SELECT * FROM subscription_plans WHERE id = '${id}'`);
    
    const plan = plans.find(p => p.id === id);
    
    if (!plan) {
      return {
        success: false,
        error: 'Plan non trouvé'
      };
    }
    
    return {
      success: true,
      data: plan
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * SQL Équivalent:
 * INSERT INTO subscription_plans (...) VALUES (...)
 * INSERT INTO subscription_features (...) VALUES (...)
 */
export async function createPlan(planData: CreateSubscriptionPlanDTO): Promise<DbResponse<SubscriptionPlan>> {
  try {
    simulateDbConnection();
    const plans = loadFromStorage();
    
    const newPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      ...planData,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('[DB] INSERT INTO subscription_plans VALUES (...)', newPlan);
    
    plans.push(newPlan);
    saveToStorage(plans);
    
    return {
      success: true,
      data: newPlan
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * SQL Équivalent:
 * UPDATE subscription_plans SET ... WHERE id = ?
 */
export async function updatePlan(id: string, updates: UpdateSubscriptionPlanDTO): Promise<DbResponse<SubscriptionPlan>> {
  try {
    simulateDbConnection();
    const plans = loadFromStorage();
    
    const index = plans.findIndex(p => p.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Plan non trouvé'
      };
    }
    
    console.log(`[DB] UPDATE subscription_plans SET ... WHERE id = '${id}'`, updates);
    
    plans[index] = {
      ...plans[index],
      ...updates,
      updatedAt: new Date()
    };
    
    saveToStorage(plans);
    
    return {
      success: true,
      data: plans[index]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * SQL Équivalent:
 * DELETE FROM subscription_plans WHERE id = ?
 * (Les features sont supprimées en cascade)
 */
export async function deletePlan(id: string): Promise<DbResponse<boolean>> {
  try {
    simulateDbConnection();
    const plans = loadFromStorage();
    
    const index = plans.findIndex(p => p.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Plan non trouvé'
      };
    }
    
    console.log(`[DB] DELETE FROM subscription_plans WHERE id = '${id}'`);
    
    plans.splice(index, 1);
    saveToStorage(plans);
    
    return {
      success: true,
      data: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * SQL Équivalent:
 * UPDATE subscription_plans SET active = NOT active WHERE id = ?
 */
export async function togglePlanStatus(id: string): Promise<DbResponse<SubscriptionPlan>> {
  try {
    simulateDbConnection();
    const plans = loadFromStorage();
    
    const index = plans.findIndex(p => p.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Plan non trouvé'
      };
    }
    
    console.log(`[DB] UPDATE subscription_plans SET active = NOT active WHERE id = '${id}'`);
    
    plans[index].active = !plans[index].active;
    plans[index].updatedAt = new Date();
    
    saveToStorage(plans);
    
    return {
      success: true,
      data: plans[index]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// =====================================================
// NOTE POUR LA PRODUCTION AVEC MySQL RÉEL
// =====================================================
/*
Exemple avec mysql2 pour un vrai backend Node.js:

import { pool } from './config';

export async function getAllPlans(): Promise<DbResponse<SubscriptionPlan[]>> {
  try {
    const [planRows] = await pool.query(`
      SELECT * FROM subscription_plans ORDER BY display_order
    `);
    
    const plans: SubscriptionPlan[] = [];
    
    for (const planRow of planRows as any[]) {
      const [featureRows] = await pool.query(`
        SELECT feature_name, included
        FROM subscription_features
        WHERE plan_id = ?
        ORDER BY display_order
      `, [planRow.id]);
      
      plans.push({
        id: planRow.id,
        name: planRow.name,
        description: planRow.description,
        category: planRow.category,
        monthlyPrice: parseFloat(planRow.monthly_price),
        yearlyPrice: parseFloat(planRow.yearly_price),
        popular: Boolean(planRow.popular),
        color: planRow.color,
        active: Boolean(planRow.active),
        order: planRow.display_order,
        features: (featureRows as any[]).map(f => ({
          name: f.feature_name,
          included: Boolean(f.included)
        })),
        createdAt: planRow.created_at,
        updatedAt: planRow.updated_at
      });
    }
    
    return { success: true, data: plans };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
*/
