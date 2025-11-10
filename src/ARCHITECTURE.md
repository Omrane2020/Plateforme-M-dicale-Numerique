# Architecture de la Plateforme Médicale

## Séparation Backend / Frontend

### 📦 Backend (Données - Format JSON)

**Emplacement** : `/contexts/SubscriptionContext.tsx`

Ce fichier contient toutes les données des abonnements dans un format JSON structuré via un Context React. Il simule une base de données backend et sépare complètement les données de la présentation.

**Structure des données** :
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  category: 'doctor' | 'clinic' | 'patient';
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
  features: SubscriptionFeature[];
  active: boolean;  // Contrôle si le plan est visible publiquement
  order: number;    // Ordre d'affichage
}
```

**Fonctionnalités du Backend** :
- ✅ `addPlan()` - Ajouter un nouveau plan
- ✅ `updatePlan()` - Modifier un plan existant
- ✅ `deletePlan()` - Supprimer un plan
- ✅ `togglePlanStatus()` - Activer/désactiver un plan
- ✅ `getPlansByCategory()` - Récupérer les plans par catégorie
- ✅ `getActivePlans()` - Récupérer uniquement les plans actifs

### 🎨 Frontend

#### 1. Interface Admin (Backend Management)
**Composant** : `/components/SubscriptionManagement.tsx`

Interface complète de gestion des abonnements pour l'administrateur :
- ➕ Ajouter de nouveaux plans d'abonnement
- ✏️ Modifier les plans existants (nom, prix, fonctionnalités, etc.)
- 🗑️ Supprimer des plans
- 👁️ Activer/désactiver la visibilité des plans
- 📊 Statistiques en temps réel
- 🎨 Gestion des couleurs et de l'ordre d'affichage
- 📝 Gestion des fonctionnalités (ajouter/supprimer/activer/désactiver)

**Accès** : Menu Admin → "Gestion Abonnements"

#### 2. Affichage Public
**Composants** :
- `/components/Home.tsx` - Section pricing sur la page d'accueil
- `/components/SubscriptionPlans.tsx` - Page complète des plans d'abonnement

Ces composants récupèrent dynamiquement les données depuis le contexte et affichent uniquement les plans actifs.

### 🔄 Flux de Données

```
┌─────────────────────────────────┐
│   SubscriptionContext.tsx       │
│   (Backend - Données JSON)      │
│                                 │
│  - Stockage des plans           │
│  - Méthodes CRUD                │
│  - État global                  │
└────────────┬────────────────────┘
             │
             │ Fournit les données via Context
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐     ┌──────────────┐
│  Admin  │     │   Public     │
│         │     │              │
│ Gestion │     │ Affichage    │
│ Plans   │     │ Plans Actifs │
└─────────┘     └──────────────┘
```

### 🎯 Utilisation

#### Pour l'Administrateur :
1. Se connecter en tant qu'admin
2. Aller dans "Gestion Abonnements"
3. Ajouter, modifier ou supprimer des plans
4. Les changements sont immédiatement visibles sur la page publique

#### Pour les Utilisateurs :
1. Visiteur la page d'accueil : voir les 3 premiers plans médecins actifs
2. Aller sur "Voir les tarifs" : voir tous les plans actifs par catégorie
3. Sélectionner un plan pour procéder au paiement

### 🔧 Migration vers Supabase

Pour connecter à Supabase et avoir une vraie base de données :

1. **Créer une table `subscription_plans`** avec le même schéma
2. **Remplacer les méthodes du contexte** par des appels API Supabase
3. **Ajouter l'authentification** pour sécuriser les opérations admin
4. **Synchroniser les données** en temps réel avec Supabase Realtime

Exemple de structure SQL :
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('doctor', 'clinic', 'patient')),
  monthly_price NUMERIC(10,2),
  yearly_price NUMERIC(10,2),
  popular BOOLEAN DEFAULT false,
  color TEXT,
  features JSONB,
  active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 📝 Notes Importantes

- **Données actuelles** : Stockées en mémoire React (perdu au rafraîchissement)
- **Pour production** : Migrer vers Supabase pour persistance
- **Sécurité** : Actuellement frontend-only, ajouter authentification pour les actions admin en production
- **Performance** : Context API suffit pour cette échelle, considérer Redux si > 100 composants

### 🚀 Avantages de cette Architecture

1. **Séparation des préoccupations** : Données séparées de la présentation
2. **Réutilisabilité** : Le contexte peut être utilisé partout dans l'app
3. **Maintenabilité** : Facile de modifier les données sans toucher à l'UI
4. **Évolutivité** : Migration facile vers une vraie BDD (Supabase)
5. **Testabilité** : Backend et Frontend testables indépendamment
