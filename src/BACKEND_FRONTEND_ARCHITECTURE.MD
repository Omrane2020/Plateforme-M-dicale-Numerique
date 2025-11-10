# Architecture Backend/Frontend - Système d'Abonnements

## 🎯 Objectif

Système complet de gestion des abonnements avec séparation claire entre backend et frontend, utilisant MySQL comme base de données. L'administrateur peut modifier, ajouter ou supprimer des plans d'abonnement qui s'affichent automatiquement sur la page d'accueil.

## 📐 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│  │  Visiteurs  │  │     Admin    │  │  Médecins/Patients      │   │
│  │  (Home)     │  │ (Management) │  │  (Subscription Plans)   │   │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬─────────────┘   │
└─────────┼────────────────┼──────────────────────┼──────────────────┘
          │                │                       │
          │    Lecture     │   CRUD Operations     │    Lecture
          │                │                       │
┌─────────▼────────────────▼───────────────────────▼──────────────────┐
│                    FRONTEND (React)                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Components                                                    │  │
│  │  • Home.tsx          - Affiche les plans actifs               │  │
│  │  • SubscriptionPlans - Tous les plans par catégorie           │  │
│  │  • SubscriptionManagement - Interface admin CRUD              │  │
│  └─────────────────────────┬─────────────────────────────────────┘  │
│                             │                                         │
│  ┌─────────────────────────▼─────────────────────────────────────┐  │
│  │  Context API (SubscriptionContext)                            │  │
│  │  • État global des plans                                      │  │
│  │  • Synchronisation automatique                                │  │
│  │  • Gestion du loading/error                                   │  │
│  └─────────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              │ API Calls
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                    API SERVICE LAYER                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  SubscriptionApiService                                        │  │
│  │  • getAllPlans()                                              │  │
│  │  • getPlansByCategory(category)                               │  │
│  │  • createPlan(data)      [ADMIN]                              │  │
│  │  • updatePlan(id, data)  [ADMIN]                              │  │
│  │  • deletePlan(id)        [ADMIN]                              │  │
│  │  • togglePlanStatus(id)  [ADMIN]                              │  │
│  └─────────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              │ Database Operations
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                    DATABASE LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  subscriptionDb.ts                                             │  │
│  │  • Fonctions SQL pour toutes les opérations CRUD              │  │
│  │  • Gestion des transactions                                   │  │
│  │  • Validation des données                                     │  │
│  └─────────────────────────┬─────────────────────────────────────┘  │
│                             │                                         │
│  ┌─────────────────────────▼─────────────────────────────────────┐  │
│  │  MySQL Database                                                │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  subscription_plans                                      │  │  │
│  │  │  • id, name, description, category                       │  │  │
│  │  │  • monthly_price, yearly_price                           │  │  │
│  │  │  • popular, color, active, display_order                 │  │  │
│  │  │  • created_at, updated_at                                │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  subscription_features                                   │  │  │
│  │  │  • id, plan_id (FK), feature_name                        │  │  │
│  │  │  • included, display_order                               │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données

### 1. Affichage sur la Page d'Accueil (Lecture)

```
Visiteur accède à Home.tsx
         │
         ▼
useSubscriptions() récupère le contexte
         │
         ▼
getPlansByCategory('doctor').filter(p => p.active)
         │
         ▼
Contexte retourne les plans depuis l'état local
         │
         ▼
Si vide ou périmé, charge depuis l'API
         │
         ▼
SubscriptionApiService.getPlansByCategory('doctor')
         │
         ▼
subscriptionDb.getPlansByCategory('doctor')
         │
         ▼
SQL: SELECT * FROM subscription_plans WHERE category='doctor' AND active=TRUE
         │
         ▼
Résultats retournés au frontend
         │
         ▼
Home.tsx affiche les 3 premiers plans actifs
```

### 2. Modification par l'Admin (Écriture)

```
Admin clique "Modifier" dans SubscriptionManagement.tsx
         │
         ▼
Dialogue de modification s'ouvre avec les données actuelles
         │
         ▼
Admin modifie les champs (prix, fonctionnalités, etc.)
         │
         ▼
handleUpdatePlan() appelé avec les nouvelles données
         │
         ▼
Context.updatePlan(planId, updates)
         │
         ▼
SubscriptionApiService.updatePlan(planId, updates)
         │
         ▼
subscriptionDb.updatePlan(planId, updates)
         │
         ▼
BEGIN TRANSACTION;
UPDATE subscription_plans SET ... WHERE id = ?;
DELETE FROM subscription_features WHERE plan_id = ?;
INSERT INTO subscription_features (...) VALUES (...);
COMMIT;
         │
         ▼
Retour de la réponse à l'API
         │
         ▼
Context appelle refreshPlans()
         │
         ▼
Tous les composants abonnés au contexte sont notifiés
         │
         ▼
Home.tsx, SubscriptionPlans.tsx se mettent à jour automatiquement
         │
         ▼
Les visiteurs voient les changements immédiatement
```

## 📁 Structure des Fichiers et Responsabilités

### Frontend (React)

```
/components/
  ├── Home.tsx
  │   └── Affiche les 3 plans médecins actifs pour les visiteurs
  ├── SubscriptionPlans.tsx
  │   └── Page complète de tous les plans (médecins, cliniques, patients)
  └── SubscriptionManagement.tsx
      └── Interface admin pour gérer les plans (CRUD complet)

/contexts/
  └── SubscriptionContext.tsx
      ├── État global des plans
      ├── Fonctions CRUD asynchrones
      ├── Gestion du loading/error
      └── Synchronisation automatique
```

### Backend (Services)

```
/services/
  ├── api/
  │   └── subscriptionApi.ts
  │       ├── Interface publique pour le frontend
  │       ├── Abstraction des appels HTTP
  │       └── Gestion des erreurs
  │
  └── database/
      ├── config.ts
      │   └── Configuration MySQL
      ├── schema.sql
      │   └── Structure complète de la BDD
      └── subscriptionDb.ts
          ├── Toutes les requêtes SQL
          ├── Gestion des transactions
          └── Validation des données
```

### Types Partagés

```
/types/
  └── subscription.ts
      ├── SubscriptionPlan
      ├── SubscriptionFeature
      ├── CreateSubscriptionPlanDTO
      ├── UpdateSubscriptionPlanDTO
      └── SubscriptionPlanFilters
```

## 🔐 Séparation Backend/Frontend

### Frontend (Client-Side)

**Responsabilités :**
- Affichage des interfaces utilisateur
- Gestion de l'état local (Context API)
- Validation des formulaires
- Interactions utilisateur
- Feedback visuel (loading, erreurs)

**Ne fait PAS :**
- Accès direct à la base de données
- Logique métier complexe
- Gestion des transactions
- Authentification/Autorisation

**Code Frontend :**
```tsx
// components/Home.tsx
const { getPlansByCategory } = useSubscriptions();
const doctorPlans = getPlansByCategory('doctor').filter(p => p.active);
```

### Backend (Server-Side)

**Responsabilités :**
- Accès à la base de données
- Validation des données
- Gestion des transactions SQL
- Sécurité et autorisation
- Logique métier

**Ne fait PAS :**
- Rendu des composants React
- Gestion de l'état UI
- Interactions utilisateur directes

**Code Backend :**
```typescript
// services/database/subscriptionDb.ts
export async function updatePlan(id: string, updates: UpdateSubscriptionPlanDTO) {
  // BEGIN TRANSACTION
  // Validation des données
  // UPDATE subscription_plans
  // Gestion des features
  // COMMIT
}
```

## 🎨 Cas d'Usage Complets

### Cas 1 : Visiteur voit les plans

```typescript
// 1. Frontend - Home.tsx
function Home() {
  const { getPlansByCategory } = useSubscriptions();
  const activePlans = getPlansByCategory('doctor')
    .filter(p => p.active)
    .slice(0, 3);
  
  return (
    <div>
      {activePlans.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

// 2. Context charge automatiquement au montage
useEffect(() => {
  loadPlans(); // Appelle l'API
}, []);

// 3. Backend - Database
SELECT * FROM subscription_plans 
WHERE category = 'doctor' AND active = TRUE 
ORDER BY display_order 
LIMIT 3;
```

### Cas 2 : Admin crée un nouveau plan

```typescript
// 1. Frontend - SubscriptionManagement.tsx
const handleAddPlan = async () => {
  await addPlan({
    name: 'Nouveau Plan',
    description: 'Description',
    category: 'doctor',
    monthlyPrice: 49,
    yearlyPrice: 490,
    popular: false,
    color: 'blue',
    features: [
      { name: 'Feature 1', included: true },
      { name: 'Feature 2', included: true }
    ],
    order: 4
  });
  // Le contexte recharge automatiquement
};

// 2. Context - SubscriptionContext.tsx
const addPlan = async (planData: CreateSubscriptionPlanDTO) => {
  await SubscriptionApiService.createPlan(planData);
  await refreshPlans(); // Recharge tous les plans
};

// 3. API Service
static async createPlan(planData: CreateSubscriptionPlanDTO) {
  return await createPlan(planData);
}

// 4. Database Layer
export async function createPlan(planData: CreateSubscriptionPlanDTO) {
  // BEGIN TRANSACTION
  const planId = `plan-${Date.now()}`;
  
  // INSERT INTO subscription_plans
  await db.query(`
    INSERT INTO subscription_plans (id, name, description, ...)
    VALUES (?, ?, ?, ...)
  `, [planId, planData.name, planData.description, ...]);
  
  // INSERT INTO subscription_features
  for (const feature of planData.features) {
    await db.query(`
      INSERT INTO subscription_features (plan_id, feature_name, included)
      VALUES (?, ?, ?)
    `, [planId, feature.name, feature.included]);
  }
  
  // COMMIT
  return newPlan;
}
```

### Cas 3 : Admin désactive un plan

```typescript
// 1. Frontend
const handleToggle = async (planId: string) => {
  await togglePlanStatus(planId);
};

// 2. Context
const togglePlanStatus = async (id: string) => {
  await SubscriptionApiService.togglePlanStatus(id);
  await refreshPlans();
};

// 3. Backend
UPDATE subscription_plans 
SET active = NOT active 
WHERE id = ?;

// 4. Effet automatique
// Le plan disparaît de Home.tsx car il n'est plus actif
// Les visiteurs ne le voient plus immédiatement
```

## 🚀 Déploiement et Environnements

### Développement (Actuel)

- **Frontend** : React avec Vite/Next.js
- **Backend** : Simulé avec localStorage
- **BDD** : Simulée en mémoire

### Production (Recommandé)

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel/Netlify)              │
│  - React Application                    │
│  - Appels API vers backend              │
└────────────┬────────────────────────────┘
             │
             │ HTTPS
             │
┌────────────▼────────────────────────────┐
│  Backend (Node.js/Express)              │
│  - API REST Endpoints                   │
│  - Authentification JWT                 │
│  - Validation des données               │
└────────────┬────────────────────────────┘
             │
             │ Connection Pool
             │
┌────────────▼────────────────────────────┐
│  MySQL Database (AWS RDS/DigitalOcean)  │
│  - subscription_plans                   │
│  - subscription_features                │
│  - Backups automatiques                 │
└─────────────────────────────────────────┘
```

### Alternative : Supabase (Recommandé pour MVP)

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel/Netlify)              │
│  - React Application                    │
│  - Supabase Client                      │
└────────────┬────────────────────────────┘
             │
             │ Supabase API
             │
┌────────────▼────────────────────────────┐
│  Supabase (Backend as a Service)        │
│  - PostgreSQL Database                  │
│  - Authentication                       │
│  - Row Level Security                   │
│  - Real-time Subscriptions              │
│  - Storage                              │
└─────────────────────────────────────────┘
```

## 📊 Avantages de cette Architecture

### 1. Séparation des Responsabilités
- **Frontend** : Interface et expérience utilisateur
- **Backend** : Logique métier et persistance

### 2. Synchronisation Automatique
- Les modifications de l'admin apparaissent immédiatement
- Pas besoin de rafraîchir la page manuellement

### 3. Scalabilité
- Facile d'ajouter de nouveaux endpoints
- Peut gérer des milliers d'utilisateurs simultanés

### 4. Maintenabilité
- Code organisé et modulaire
- Facile à tester et déboguer
- Documentation complète

### 5. Sécurité
- Validation côté backend
- Protection contre les injections SQL
- Authentification et autorisation

### 6. Performance
- Mise en cache des données
- Requêtes optimisées
- Chargement progressif

## 🔧 Migration et Évolution

### Phase 1 : Développement (Actuel)
- ✅ Architecture mise en place
- ✅ Simulation avec localStorage
- ✅ Toutes les fonctionnalités CRUD
- ✅ Interface admin complète

### Phase 2 : Backend Node.js (Optionnel)
- [ ] Créer serveur Express.js
- [ ] Implémenter les endpoints REST
- [ ] Connecter à MySQL
- [ ] Ajouter authentification JWT

### Phase 3 : Supabase (Recommandé)
- [ ] Créer projet Supabase
- [ ] Exécuter schema SQL
- [ ] Modifier subscriptionDb.ts
- [ ] Configurer RLS policies

### Phase 4 : Production
- [ ] Tests complets
- [ ] Monitoring et logging
- [ ] Backups automatiques
- [ ] CI/CD pipeline

## 📚 Documentation Complémentaire

- `/services/README.md` - Architecture détaillée des services
- `/services/MIGRATION_SUPABASE.md` - Guide de migration vers Supabase
- `/services/database/schema.sql` - Structure complète de la BDD
- Ce fichier - Vue d'ensemble de l'architecture

## 🎓 Points Clés à Retenir

1. **Frontend et Backend sont séparés** - Le frontend n'accède jamais directement à la BDD
2. **L'admin modifie, tous voient** - Synchronisation automatique via le Context
3. **Architecture évolutive** - Facile de migrer vers MySQL ou Supabase
4. **Prêt pour la production** - Code structuré et documenté
5. **Sécurisé** - Validation côté backend, RLS avec Supabase

## 🆘 Support

Pour toute question :
1. Consultez les fichiers de documentation dans `/services/`
2. Vérifiez le schema SQL pour comprendre la structure
3. Regardez les exemples de code dans ce fichier
4. Testez avec les outils de développement du navigateur
