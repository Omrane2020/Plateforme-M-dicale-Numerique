# Migration vers Supabase

Ce guide explique comment migrer le système d'abonnements de localStorage/MySQL vers Supabase.

## 📋 Prérequis

1. Compte Supabase créé
2. Projet Supabase initialisé
3. URL et clés API Supabase

## 🗄️ Étape 1 : Créer les Tables dans Supabase

### Via l'Interface Supabase SQL Editor

```sql
-- Table des plans d'abonnement
CREATE TABLE subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('doctor', 'clinic', 'patient')),
    monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    yearly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    popular BOOLEAN DEFAULT FALSE,
    color TEXT DEFAULT 'blue' CHECK (color IN ('blue', 'green', 'purple', 'orange')),
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX idx_subscription_plans_category ON subscription_plans(category);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(active);
CREATE INDEX idx_subscription_plans_order ON subscription_plans(display_order);
CREATE INDEX idx_subscription_plans_category_active ON subscription_plans(category, active);

-- Table des fonctionnalités
CREATE TABLE subscription_features (
    id SERIAL PRIMARY KEY,
    plan_id TEXT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    included BOOLEAN DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_subscription_features_plan_id ON subscription_features(plan_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Tout le monde peut lire
CREATE POLICY "Tous peuvent lire les plans" ON subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "Tous peuvent lire les fonctionnalités" ON subscription_features
    FOR SELECT USING (true);

-- Politique RLS : Seuls les admins peuvent modifier (à adapter selon votre auth)
CREATE POLICY "Admins peuvent tout faire sur plans" ON subscription_plans
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins peuvent tout faire sur features" ON subscription_features
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );
```

### Insérer les Données Initiales

```sql
-- Plans Médecins
INSERT INTO subscription_plans (id, name, description, category, monthly_price, yearly_price, popular, color, active, display_order) VALUES
('doctor-basic', 'Médecin Solo', 'Pour les médecins débutants', 'doctor', 29.00, 290.00, FALSE, 'blue', TRUE, 1),
('doctor-professional', 'Cabinet Médical', 'Pour les cabinets établis', 'doctor', 59.00, 590.00, TRUE, 'green', TRUE, 2),
('doctor-premium', 'Multi-Praticiens', 'Pour les groupes de médecins', 'doctor', 99.00, 990.00, FALSE, 'purple', TRUE, 3);

-- (Continuez avec les autres plans comme dans schema.sql)
```

## 🔧 Étape 2 : Modifier la Configuration

### Installer le Client Supabase

```bash
npm install @supabase/supabase-js
```

### Créer le Fichier de Configuration Supabase

```typescript
// services/database/supabaseConfig.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour Supabase
export interface Database {
  public: {
    Tables: {
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: 'doctor' | 'clinic' | 'patient';
          monthly_price: number;
          yearly_price: number;
          popular: boolean;
          color: 'blue' | 'green' | 'purple' | 'orange';
          active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscription_plans']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>;
      };
      subscription_features: {
        Row: {
          id: number;
          plan_id: string;
          feature_name: string;
          included: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscription_features']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['subscription_features']['Insert']>;
      };
    };
  };
}
```

## 🔄 Étape 3 : Modifier subscriptionDb.ts pour Supabase

```typescript
// services/database/subscriptionDb.ts (version Supabase)
import { supabase } from './supabaseConfig';
import { SubscriptionPlan, SubscriptionFeature } from '../../types/subscription';

export async function getAllPlans(): Promise<DbResponse<SubscriptionPlan[]>> {
  try {
    // Récupérer les plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('display_order');

    if (plansError) throw plansError;
    if (!plans) return { success: true, data: [] };

    // Récupérer les fonctionnalités pour chaque plan
    const plansWithFeatures: SubscriptionPlan[] = [];
    
    for (const plan of plans) {
      const { data: features, error: featuresError } = await supabase
        .from('subscription_features')
        .select('feature_name, included')
        .eq('plan_id', plan.id)
        .order('display_order');

      if (featuresError) throw featuresError;

      plansWithFeatures.push({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        category: plan.category as 'doctor' | 'clinic' | 'patient',
        monthlyPrice: Number(plan.monthly_price),
        yearlyPrice: Number(plan.yearly_price),
        popular: plan.popular,
        color: plan.color as 'blue' | 'green' | 'purple' | 'orange',
        active: plan.active,
        order: plan.display_order,
        features: (features || []).map(f => ({
          name: f.feature_name,
          included: f.included
        })),
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at)
      });
    }

    return { success: true, data: plansWithFeatures };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

export async function createPlan(planData: CreateSubscriptionPlanDTO): Promise<DbResponse<SubscriptionPlan>> {
  try {
    // Insérer le plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .insert({
        id: `plan-${Date.now()}`,
        name: planData.name,
        description: planData.description,
        category: planData.category,
        monthly_price: planData.monthlyPrice,
        yearly_price: planData.yearlyPrice,
        popular: planData.popular,
        color: planData.color,
        active: true,
        display_order: planData.order
      })
      .select()
      .single();

    if (planError) throw planError;
    if (!plan) throw new Error('Plan non créé');

    // Insérer les fonctionnalités
    if (planData.features.length > 0) {
      const { error: featuresError } = await supabase
        .from('subscription_features')
        .insert(
          planData.features.map((f, index) => ({
            plan_id: plan.id,
            feature_name: f.name,
            included: f.included,
            display_order: index
          }))
        );

      if (featuresError) throw featuresError;
    }

    // Récupérer le plan complet
    const result = await getPlanById(plan.id);
    if (!result.success || !result.data) {
      throw new Error('Impossible de récupérer le plan créé');
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

export async function updatePlan(id: string, updates: UpdateSubscriptionPlanDTO): Promise<DbResponse<SubscriptionPlan>> {
  try {
    // Préparer les données pour Supabase
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.monthlyPrice !== undefined) updateData.monthly_price = updates.monthlyPrice;
    if (updates.yearlyPrice !== undefined) updateData.yearly_price = updates.yearlyPrice;
    if (updates.popular !== undefined) updateData.popular = updates.popular;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.active !== undefined) updateData.active = updates.active;
    if (updates.order !== undefined) updateData.display_order = updates.order;

    // Mettre à jour le plan
    const { error: planError } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', id);

    if (planError) throw planError;

    // Si les fonctionnalités sont mises à jour
    if (updates.features) {
      // Supprimer les anciennes fonctionnalités
      const { error: deleteError } = await supabase
        .from('subscription_features')
        .delete()
        .eq('plan_id', id);

      if (deleteError) throw deleteError;

      // Insérer les nouvelles fonctionnalités
      if (updates.features.length > 0) {
        const { error: insertError } = await supabase
          .from('subscription_features')
          .insert(
            updates.features.map((f, index) => ({
              plan_id: id,
              feature_name: f.name,
              included: f.included,
              display_order: index
            }))
          );

        if (insertError) throw insertError;
      }
    }

    // Récupérer le plan mis à jour
    const result = await getPlanById(id);
    if (!result.success || !result.data) {
      throw new Error('Impossible de récupérer le plan mis à jour');
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

export async function deletePlan(id: string): Promise<DbResponse<boolean>> {
  try {
    // La suppression en cascade des features est gérée par la contrainte FOREIGN KEY
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

export async function togglePlanStatus(id: string): Promise<DbResponse<SubscriptionPlan>> {
  try {
    // Récupérer le statut actuel
    const { data: plan, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('active')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!plan) throw new Error('Plan non trouvé');

    // Inverser le statut
    const { error: updateError } = await supabase
      .from('subscription_plans')
      .update({ active: !plan.active })
      .eq('id', id);

    if (updateError) throw updateError;

    // Récupérer le plan mis à jour
    const result = await getPlanById(id);
    if (!result.success || !result.data) {
      throw new Error('Impossible de récupérer le plan mis à jour');
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
```

## 🔑 Étape 4 : Variables d'Environnement

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Étape 5 : Tester la Migration

1. Vérifier que les tables sont créées dans Supabase
2. Insérer les données de test
3. Tester chaque opération :
   - Récupération des plans
   - Création d'un plan
   - Modification d'un plan
   - Suppression d'un plan
   - Toggle du statut

## 📊 Avantages de Supabase

1. **Base de données PostgreSQL** robuste et scalable
2. **Row Level Security (RLS)** pour la sécurité
3. **Realtime** - synchronisation en temps réel (optionnel)
4. **Authentication** intégrée
5. **Storage** pour les fichiers
6. **Edge Functions** pour la logique backend
7. **Interface d'administration** facile à utiliser

## 🔐 Sécurité avec Supabase

### Configurer l'Authentification Admin

```typescript
// Dans SubscriptionManagement.tsx, vérifier le rôle admin
import { supabase } from '../services/database/supabaseConfig';

// Vérifier si l'utilisateur est admin
const { data: { user } } = await supabase.auth.getUser();
const isAdmin = user?.app_metadata?.role === 'admin';

if (!isAdmin) {
  // Rediriger ou afficher un message d'erreur
  return <div>Accès refusé</div>;
}
```

### Politique RLS Plus Stricte

```sql
-- Créer une fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique pour modifications (admins uniquement)
DROP POLICY IF EXISTS "Admins peuvent tout faire sur plans" ON subscription_plans;
CREATE POLICY "Admins peuvent tout faire sur plans" ON subscription_plans
    FOR ALL USING (is_admin());
```

## 🚀 Déploiement

1. Vérifier que toutes les variables d'environnement sont configurées
2. Tester en local avec Supabase
3. Déployer sur votre plateforme (Vercel, Netlify, etc.)
4. Configurer les RLS policies en production
5. Monitorer les logs Supabase

## 📝 Checklist de Migration

- [ ] Créer le projet Supabase
- [ ] Exécuter le schema SQL
- [ ] Insérer les données initiales
- [ ] Installer @supabase/supabase-js
- [ ] Créer supabaseConfig.ts
- [ ] Modifier subscriptionDb.ts pour Supabase
- [ ] Configurer les variables d'environnement
- [ ] Tester toutes les opérations CRUD
- [ ] Configurer les politiques RLS
- [ ] Tester l'authentification admin
- [ ] Déployer en production

## 🆘 Dépannage

**Erreur de permissions** : Vérifier les politiques RLS
**Données non visibles** : Vérifier la politique SELECT
**Impossible de modifier** : Vérifier le rôle admin dans auth.users
**Timeout** : Augmenter les limites dans Supabase dashboard

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
