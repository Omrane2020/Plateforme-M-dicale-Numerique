# Guide de Migration vers l'Architecture MVC

## 📋 Vue d'ensemble

Ce guide explique comment migrer les composants existants vers la nouvelle architecture MVC.

## 🎯 Objectifs de la Migration

1. ✅ **Séparation des responsabilités** - Model, View, Controller
2. ✅ **Meilleure organisation** - Code plus maintenable
3. ✅ **Réutilisabilité** - Components et logic réutilisables
4. ✅ **Testabilité** - Chaque couche testable indépendamment

## 📦 Ce qui a été créé

### Models
- ✅ `/models/Subscription.model.ts` - Entité Subscription avec logique métier
- ✅ `/models/index.ts` - Exports centralisés

### Controllers
- ✅ `/controllers/SubscriptionController.ts` - Logique de gestion des abonnements
- ✅ `/controllers/index.ts` - Exports centralisés

### Hooks
- ✅ `/hooks/useSubscription.ts` - Hook personnalisé pour les composants
- ✅ `/hooks/index.ts` - Exports centralisés

## 🔄 Comment Utiliser la Nouvelle Architecture

### Avant (Ancien Code)

```typescript
// components/Home.tsx
import { useSubscriptions } from '../contexts/SubscriptionContext';

function Home() {
  const { getPlansByCategory } = useSubscriptions();
  const doctorPlans = getPlansByCategory('doctor')
    .filter(p => p.active)
    .slice(0, 3);
  
  return (
    <div>
      {doctorPlans.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
```

### Après (Nouveau Code avec MVC)

```typescript
// views/public/HomePage.tsx
import { useSubscription } from '../../hooks';

function HomePage() {
  const { getPlansByCategory, getActivePlans } = useSubscription();
  
  // Les plans sont déjà des SubscriptionModel avec logique métier
  const doctorPlans = getPlansByCategory('doctor')
    .filter(p => p.active)
    .slice(0, 3);
  
  return (
    <div>
      {doctorPlans.map(plan => (
        <PlanCard 
          key={plan.id} 
          plan={plan}
          savings={plan.calculateYearlySavings()}
          featuresCount={plan.countIncludedFeatures()}
        />
      ))}
    </div>
  );
}
```

## 🔧 Migration des Composants

### Étape 1 : Utiliser le Hook au lieu du Context

**Avant :**
```typescript
import { useSubscriptions } from '../contexts/SubscriptionContext';

const { plans, addPlan, updatePlan } = useSubscriptions();
```

**Après :**
```typescript
import { useSubscription } from '../hooks';

const { plans, createPlan, updatePlan } = useSubscription();
```

### Étape 2 : Bénéficier de la Logique Métier du Model

**Avant :**
```typescript
// Calcul manuel dans le composant
const savings = plan.monthlyPrice * 12 - plan.yearlyPrice;
const includedFeatures = plan.features.filter(f => f.included).length;
```

**Après :**
```typescript
// Utiliser les méthodes du model
const savings = plan.calculateYearlySavings();
const includedFeatures = plan.countIncludedFeatures();
const hasTeleconsultation = plan.hasFeature('téléconsultation');
```

### Étape 3 : Validation Côté Model

**Avant :**
```typescript
// Validation manuelle dans le composant
const handleSubmit = () => {
  if (!formData.name || formData.name.trim() === '') {
    setError('Le nom est requis');
    return;
  }
  if (formData.monthlyPrice < 0) {
    setError('Le prix doit être positif');
    return;
  }
  // ... plus de validations
  
  addPlan(formData);
};
```

**Après :**
```typescript
// Le controller gère la validation via le model
const handleSubmit = async () => {
  try {
    await createPlan(formData);
    // Success - la validation est faite automatiquement
  } catch (error) {
    // L'erreur contient déjà un message explicite
    setError(error.message);
  }
};
```

## 📝 Exemples de Migration Complets

### Exemple 1 : SubscriptionManagement (Admin)

**Fichier actuel :** `/components/SubscriptionManagement.tsx`

**Changements à faire :**

1. **Importer le hook au lieu du context**
```typescript
// Avant
import { useSubscriptions } from '../contexts/SubscriptionContext';

// Après
import { useSubscription } from '../hooks';
```

2. **Utiliser les nouvelles méthodes**
```typescript
// Avant
const { plans, addPlan, updatePlan, deletePlan, togglePlanStatus } = useSubscriptions();

// Après
const { plans, createPlan, updatePlan, deletePlan, togglePlanStatus } = useSubscription();

// Et remplacer addPlan par createPlan dans le code
```

3. **Utiliser la logique du model**
```typescript
// Ajouter dans le composant pour afficher plus d'informations
{plans.map(plan => (
  <Card key={plan.id}>
    <CardTitle>{plan.name}</CardTitle>
    <p>{plan.getSummary()}</p>
    <p>Économie annuelle: {plan.calculateYearlySavings()}€</p>
    <p>{plan.countIncludedFeatures()} fonctionnalités incluses</p>
    {plan.isFree() && <Badge>Gratuit</Badge>}
    {plan.isPremium() && <Badge>Premium</Badge>}
  </Card>
))}
```

### Exemple 2 : Home Page

**Fichier actuel :** `/components/Home.tsx`

**Changements à faire :**

1. **Créer le nouveau fichier**
```typescript
// views/public/HomePage.tsx
import React from 'react';
import { Header } from '../../components/layout/Header';
import { useSubscription } from '../../hooks';

export function HomePage({ onNavigate, isAuthenticated, userType, onLogout }) {
  const { getPlansByCategory } = useSubscription();
  
  // Récupérer les 3 premiers plans médecins actifs
  const activeDoctorPlans = getPlansByCategory('doctor')
    .filter(plan => plan.active)
    .slice(0, 3);
  
  return (
    <div className="min-h-screen bg-white">
      <Header 
        onNavigate={onNavigate} 
        isAuthenticated={isAuthenticated} 
        userType={userType} 
        onLogout={onLogout} 
      />
      
      {/* Hero Section */}
      <section>...</section>
      
      {/* Plans Section */}
      <section>
        {activeDoctorPlans.map((plan) => (
          <Card key={plan.id}>
            <CardTitle>{plan.name}</CardTitle>
            <p>{plan.getShortDescription(100)}</p>
            <div>{plan.monthlyPrice}€/mois</div>
            <div>
              Économisez {plan.calculateYearlySavings()}€ 
              ({plan.calculateSavingsPercentage()}%) par an
            </div>
            <ul>
              {plan.getIncludedFeatures().slice(0, 5).map((feature, idx) => (
                <li key={idx}>{feature.name}</li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </div>
  );
}
```

2. **Mettre à jour App.tsx**
```typescript
// Dans App.tsx, remplacer l'import
// Avant
import { Home } from './components/Home';

// Après
import { HomePage } from './views/public/HomePage';

// Et dans le JSX
<HomePage onNavigate={navigate} ... />
```

### Exemple 3 : SubscriptionPlans Page

**Fichier actuel :** `/components/SubscriptionPlans.tsx`

**Changements :**

```typescript
// views/public/SubscriptionPlansPage.tsx
import { useSubscription } from '../../hooks';

export function SubscriptionPlansPage({ ... }) {
  const { getPlansByCategory, loading, error } = useSubscription();
  const [selectedCategory, setSelectedCategory] = useState<'doctor' | 'clinic' | 'patient'>('doctor');
  
  const currentPlans = getPlansByCategory(selectedCategory);
  
  // Afficher les plans avec toute la logique métier disponible
  return (
    <div>
      {currentPlans.map(plan => (
        <Card key={plan.id}>
          <h3>{plan.name} - {plan.getCategoryLabel()}</h3>
          
          {/* Utiliser les méthodes du model */}
          {plan.isFree() && <Badge>Gratuit</Badge>}
          {plan.popular && <Badge>Populaire</Badge>}
          
          <div>
            <strong>{plan.monthlyPrice}€</strong> /mois
          </div>
          
          <div>
            ou {plan.yearlyPrice}€/an 
            <small>
              (économisez {plan.calculateYearlySavings()}€ 
              soit {plan.calculateSavingsPercentage()}%)
            </small>
          </div>
          
          <div>
            {plan.countIncludedFeatures()} fonctionnalités incluses
          </div>
          
          <ul>
            {plan.getIncludedFeatures().map((feature, i) => (
              <li key={i}>{feature.name}</li>
            ))}
          </ul>
          
          {/* Vérifier des features spécifiques */}
          {plan.hasFeature('téléconsultation') && (
            <Badge>Téléconsultation incluse</Badge>
          )}
        </Card>
      ))}
    </div>
  );
}
```

## 🎨 Organisation des Composants UI

### Layout Components

Déplacer les composants de mise en page :

```
components/Header.tsx → components/layout/Header.tsx
components/DoctorSidebar.tsx → components/layout/DoctorSidebar.tsx
components/AdminSidebar.tsx → components/layout/AdminSidebar.tsx
components/SecretarySidebar.tsx → components/layout/SecretarySidebar.tsx
```

### Form Components

Déplacer les formulaires :

```
components/AddPatientForm.tsx → components/forms/AddPatientForm.tsx
components/AddUserForm.tsx → components/forms/AddUserForm.tsx
```

### Shared Components

Composants partagés :

```
components/PrescriptionView.tsx → components/shared/PrescriptionView.tsx
components/PrescriptionModule.tsx → components/shared/PrescriptionModule.tsx
```

## 🔍 Checklist de Migration

### Pour chaque composant :

- [ ] Identifier si c'est une Page (View) ou un Component réutilisable
- [ ] Déplacer vers le bon dossier (`views/` ou `components/`)
- [ ] Remplacer `useSubscriptions()` par `useSubscription()`
- [ ] Remplacer `addPlan` par `createPlan`
- [ ] Utiliser les méthodes du `SubscriptionModel` pour la logique métier
- [ ] Mettre à jour les imports dans les autres fichiers
- [ ] Tester que tout fonctionne

### Pour l'application globale :

- [ ] Créer `/views` avec les sous-dossiers (public, doctor, patient, secretary, admin)
- [ ] Réorganiser `/components` (layout, forms, shared)
- [ ] Mettre à jour tous les imports dans `App.tsx`
- [ ] Vérifier que la navigation fonctionne
- [ ] Tester toutes les fonctionnalités CRUD

## 🚀 Avantages de la Nouvelle Architecture

### 1. Code plus propre
```typescript
// Avant - logique mélangée avec l'UI
const savings = plan.monthlyPrice * 12 - plan.yearlyPrice;
const percentage = Math.round((savings / (plan.monthlyPrice * 12)) * 100);
const included = plan.features.filter(f => f.included).length;

// Après - logique dans le model
const savings = plan.calculateYearlySavings();
const percentage = plan.calculateSavingsPercentage();
const included = plan.countIncludedFeatures();
```

### 2. Validation automatique
```typescript
// Avant - validation manuelle partout
if (!name || name.trim() === '') { ... }
if (price < 0) { ... }
// ... 10+ validations

// Après - une seule ligne
const validation = plan.validate();
if (!validation.valid) {
  console.error(validation.errors);
}
```

### 3. Réutilisabilité
```typescript
// Le model peut être utilisé partout
import { SubscriptionModel } from '@/models';

// Dans n'importe quel composant
const plan = new SubscriptionModel(data);
if (plan.hasFeature('téléconsultation')) { ... }
```

## 📚 Ressources

- `/MVC_ARCHITECTURE.md` - Documentation complète de l'architecture
- `/models/Subscription.model.ts` - Voir toutes les méthodes disponibles
- `/controllers/SubscriptionController.ts` - Voir toutes les actions possibles
- `/hooks/useSubscription.ts` - Voir le hook complet

## 🆘 Support

Si vous avez des questions :
1. Consultez les exemples dans ce guide
2. Regardez le code des models et controllers
3. Suivez les conventions de nommage
4. Testez progressivement

## ✅ Next Steps

1. **Phase 1 (Actuelle)** : Architecture MVC mise en place pour les abonnements
2. **Phase 2** : Migrer progressivement les composants existants
3. **Phase 3** : Créer des Models pour les autres entités (User, Appointment, etc.)
4. **Phase 4** : Créer des Controllers pour toutes les fonctionnalités
5. **Phase 5** : Organisation complète en Views/Components
