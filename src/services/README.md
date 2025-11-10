# Architecture Backend/Frontend - Système d'Abonnements

## 📋 Vue d'ensemble

Ce système implémente une architecture backend/frontend séparée pour la gestion des abonnements de la plateforme médicale. Les modifications effectuées par l'administrateur via l'interface de gestion sont automatiquement reflétées sur la page d'accueil et toutes les autres pages.

## 🏗️ Structure de l'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components (React)                                   │  │
│  │  - Home.tsx (affiche les plans)                      │  │
│  │  - SubscriptionPlans.tsx (tous les plans)            │  │
│  │  - SubscriptionManagement.tsx (admin CRUD)           │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │  Context (React Context API)                         │  │
│  │  - SubscriptionContext.tsx                           │  │
│  │  - Gère l'état global des plans                      │  │
│  │  - Interface entre Components et API Service         │  │
│  └────────────────────┬─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ API Calls
                         │
┌─────────────────────────────────────────────────────────────┐
│                     API SERVICE LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  services/api/subscriptionApi.ts                     │  │
│  │  - SubscriptionApiService                            │  │
│  │  - Fait le pont entre frontend et backend            │  │
│  │  - Gère les appels HTTP (simulation pour dev)        │  │
│  └────────────────────┬─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Database Operations
                         │
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  services/database/subscriptionDb.ts                 │  │
│  │  - Fonctions SQL pour CRUD des plans                 │  │
│  │  - Simulation avec localStorage (dev)                │  │
│  │  - Prêt pour MySQL en production                     │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │  MySQL Database (Production)                         │  │
│  │  - subscription_plans (table principale)             │  │
│  │  - subscription_features (fonctionnalités)           │  │
│  │  - Schema défini dans schema.sql                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure des Fichiers

```
/
├── types/
│   └── subscription.ts           # Types TypeScript partagés
│
├── services/
│   ├── database/
│   │   ├── config.ts            # Configuration MySQL
│   │   ├── schema.sql           # Schema de la base de données
│   │   └── subscriptionDb.ts    # Requêtes SQL et logique DB
│   │
│   └── api/
│       └── subscriptionApi.ts   # Service API (interface publique)
│
├── contexts/
│   └── SubscriptionContext.tsx  # Context React (état global)
│
└── components/
    ├── Home.tsx                 # Affiche les plans actifs
    ├── SubscriptionPlans.tsx    # Page de tous les plans
    └── SubscriptionManagement.tsx # Interface admin CRUD
```

## 🔄 Flux de Données

### 1. Chargement des Plans (Page d'Accueil)

```
Home.tsx
  ↓ useSubscriptions()
SubscriptionContext
  ↓ getPlansByCategory('doctor')
Plans filtrés et triés
  ↓ Affichage
Page d'accueil avec les 3 plans médecins actifs
```

### 2. Modification par l'Admin

```
Admin clique "Modifier" dans SubscriptionManagement
  ↓
Composant appelle updatePlan(id, data)
  ↓
SubscriptionContext.updatePlan()
  ↓
SubscriptionApiService.updatePlan()
  ↓
subscriptionDb.updatePlan() [Requête SQL]
  ↓
MySQL UPDATE subscription_plans SET ... WHERE id = ?
  ↓
Context recharge tous les plans
  ↓
Tous les composants sont notifiés
  ↓
Home.tsx affiche automatiquement les changements
```

## 🔧 Utilisation

### Dans les Composants React

```tsx
import { useSubscriptions } from '../contexts/SubscriptionContext';

function MyComponent() {
  const { plans, loading, error, getActivePlans } = useSubscriptions();
  
  // Récupérer les plans actifs
  const activePlans = getActivePlans();
  
  // Afficher les plans
  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {activePlans.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
    </div>
  );
}
```

### Administration (CRUD)

```tsx
const { addPlan, updatePlan, deletePlan, togglePlanStatus } = useSubscriptions();

// Créer un nouveau plan
await addPlan({
  name: 'Nouveau Plan',
  description: 'Description',
  category: 'doctor',
  monthlyPrice: 49,
  yearlyPrice: 490,
  popular: false,
  color: 'blue',
  features: [
    { name: 'Feature 1', included: true }
  ],
  order: 4
});

// Modifier un plan
await updatePlan('plan-id', {
  monthlyPrice: 59,
  popular: true
});

// Supprimer un plan
await deletePlan('plan-id');

// Activer/Désactiver un plan
await togglePlanStatus('plan-id');
```

## 🗄️ Base de Données MySQL

### Schema

Deux tables principales :

1. **subscription_plans** : Plans d'abonnement
   - id (PRIMARY KEY)
   - name, description
   - category (doctor/clinic/patient)
   - monthly_price, yearly_price
   - popular, color, active
   - display_order
   - created_at, updated_at

2. **subscription_features** : Fonctionnalités des plans
   - id (AUTO_INCREMENT)
   - plan_id (FOREIGN KEY)
   - feature_name
   - included (boolean)
   - display_order

### Exemples de Requêtes SQL

```sql
-- Récupérer tous les plans médecins actifs
SELECT * FROM subscription_plans 
WHERE category = 'doctor' AND active = TRUE 
ORDER BY display_order;

-- Modifier le prix d'un plan
UPDATE subscription_plans 
SET monthly_price = 35.00, yearly_price = 350.00 
WHERE id = 'doctor-basic';

-- Désactiver un plan
UPDATE subscription_plans 
SET active = FALSE 
WHERE id = 'doctor-basic';

-- Supprimer un plan (avec cascade sur features)
DELETE FROM subscription_plans 
WHERE id = 'doctor-basic';
```

## 🚀 Migration vers la Production

### Étape 1 : Configuration MySQL

```bash
# Créer la base de données
mysql -u root -p < services/database/schema.sql
```

### Étape 2 : Configuration Backend Node.js

```javascript
// backend/config/database.js
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});
```

### Étape 3 : API REST Endpoints

```javascript
// backend/routes/subscriptions.js
import express from 'express';
import * as subscriptionDb from '../services/database/subscriptionDb.js';

const router = express.Router();

// GET /api/subscriptions
router.get('/', async (req, res) => {
  const { category, active } = req.query;
  const result = await subscriptionDb.getAllPlans();
  res.json(result.data);
});

// POST /api/subscriptions (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const result = await subscriptionDb.createPlan(req.body);
  res.json(result.data);
});

// PUT /api/subscriptions/:id (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const result = await subscriptionDb.updatePlan(req.params.id, req.body);
  res.json(result.data);
});

// DELETE /api/subscriptions/:id (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await subscriptionDb.deletePlan(req.params.id);
  res.json({ success: true });
});

export default router;
```

### Étape 4 : Modifier l'API Service Frontend

```typescript
// services/api/subscriptionApi.ts (version production)
static async getAllPlans(): Promise<SubscriptionPlan[]> {
  const response = await fetch('/api/subscriptions');
  if (!response.ok) throw new Error('Erreur API');
  return response.json();
}

static async createPlan(planData: CreateSubscriptionPlanDTO): Promise<SubscriptionPlan> {
  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(planData)
  });
  if (!response.ok) throw new Error('Erreur création');
  return response.json();
}
```

## 📊 Avantages de cette Architecture

1. **Séparation des Responsabilités**
   - Frontend : Affichage et interaction utilisateur
   - API Service : Logique métier et communication
   - Database Layer : Persistance des données

2. **Synchronisation Automatique**
   - Les modifications de l'admin sont immédiatement visibles
   - Le Context React notifie tous les composants

3. **Facilité de Migration**
   - Code prêt pour MySQL
   - Transition facile de localStorage vers une vraie BDD

4. **Maintenabilité**
   - Code modulaire et organisé
   - Types TypeScript partagés
   - Documentation SQL complète

5. **Scalabilité**
   - Prêt pour Supabase, PostgreSQL, ou autre backend
   - Architecture standard REST API

## 🔐 Sécurité (Production)

Pour la production, ajoutez :

1. **Authentification** : Vérifier que seuls les admins peuvent modifier
2. **Validation** : Valider les données côté backend
3. **Sanitization** : Nettoyer les entrées SQL
4. **Rate Limiting** : Limiter les requêtes
5. **HTTPS** : Chiffrer les communications

## 📝 Notes Importantes

- **Développement** : Utilise localStorage pour simuler MySQL
- **Production** : Remplacer par de vraies requêtes MySQL
- **Supabase** : Alternative à MySQL, architecture similaire
- **Types** : Partagés entre backend et frontend pour cohérence

## 🆘 Support

Pour toute question sur l'architecture ou la migration :
1. Consultez les commentaires dans les fichiers de service
2. Référez-vous au schema.sql pour la structure de la BDD
3. Regardez les exemples d'utilisation dans ce README
