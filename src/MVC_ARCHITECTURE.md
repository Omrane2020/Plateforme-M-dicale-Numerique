# Architecture MVC - Plateforme Médicale

## 📋 Vue d'ensemble

Ce projet utilise une architecture **MVC (Model-View-Controller)** adaptée pour React/TypeScript, offrant une séparation claire des responsabilités et une meilleure organisation du code.

## 🏗️ Structure MVC

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE MVC                          │
│                                                              │
│  ┌─────────────┐      ┌─────────────┐      ┌────────────┐ │
│  │    MODEL    │◄─────│ CONTROLLER  │─────►│    VIEW    │ │
│  │             │      │             │      │            │ │
│  │  • Entités  │      │  • Logique  │      │  • UI      │ │
│  │  • Données  │      │  • Services │      │  • Pages   │ │
│  │  • Types    │      │  • Context  │      │  • Comps   │ │
│  └─────────────┘      └─────────────┘      └────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Nouvelle Structure des Dossiers

```
/
├── models/                           # MODEL - Logique métier et entités
│   ├── User.model.ts                # Entité utilisateur
│   ├── Doctor.model.ts              # Entité médecin
│   ├── Patient.model.ts             # Entité patient
│   ├── Appointment.model.ts         # Entité rendez-vous
│   ├── Prescription.model.ts        # Entité prescription
│   ├── Secretary.model.ts           # Entité secrétaire
│   ├── Subscription.model.ts        # Entité abonnement
│   └── index.ts                     # Exports centralisés
│
├── views/                            # VIEW - Interface utilisateur
│   ├── public/                      # Pages publiques
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── SubscriptionPlansPage.tsx
│   │   └── PaymentPage.tsx
│   │
│   ├── doctor/                      # Dashboard médecin
│   │   ├── DoctorDashboardPage.tsx
│   │   ├── DoctorProfilePage.tsx
│   │   ├── PatientManagementPage.tsx
│   │   ├── AppointmentManagementPage.tsx
│   │   ├── PrescriptionPage.tsx
│   │   └── DoctorHistoryPage.tsx
│   │
│   ├── patient/                     # Dashboard patient
│   │   ├── PatientDashboardPage.tsx
│   │   ├── RequestAppointmentPage.tsx
│   │   └── PatientHistoryPage.tsx
│   │
│   ├── secretary/                   # Dashboard secrétaire
│   │   ├── SecretaryDashboardPage.tsx
│   │   ├── SecretaryAppointmentsPage.tsx
│   │   └── SecretaryPatientManagementPage.tsx
│   │
│   └── admin/                       # Dashboard admin
│       ├── AdminDashboardPage.tsx
│       ├── UserManagementPage.tsx
│       ├── SubscriptionManagementPage.tsx
│       ├── SecretaryManagementPage.tsx
│       ├── SystemSettingsPage.tsx
│       ├── SecurityCenterPage.tsx
│       ├── SystemReportsPage.tsx
│       └── ActivityLogsPage.tsx
│
├── components/                       # VIEW - Composants réutilisables
│   ├── layout/                      # Composants de mise en page
│   │   ├── Header.tsx
│   │   ├── DoctorSidebar.tsx
│   │   ├── SecretarySidebar.tsx
│   │   └── AdminSidebar.tsx
│   │
│   ├── forms/                       # Formulaires
│   │   ├── AddPatientForm.tsx
│   │   ├── AddUserForm.tsx
│   │   └── AppointmentRequestForm.tsx
│   │
│   ├── shared/                      # Composants partagés
│   │   ├── PrescriptionView.tsx
│   │   ├── PrescriptionModule.tsx
│   │   └── AppointmentCard.tsx
│   │
│   ├── figma/                       # Composants Figma
│   │   └── ImageWithFallback.tsx
│   │
│   └── ui/                          # Composants UI de base (Shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (tous les composants UI)
│
├── controllers/                      # CONTROLLER - Logique de contrôle
│   ├── UserController.ts            # Gestion des utilisateurs
│   ├── DoctorController.ts          # Gestion médecins
│   ├── PatientController.ts         # Gestion patients
│   ├── AppointmentController.ts     # Gestion RDV
│   ├── PrescriptionController.ts    # Gestion prescriptions
│   ├── SubscriptionController.ts    # Gestion abonnements
│   ├── SecretaryController.ts       # Gestion secrétaires
│   └── AdminController.ts           # Gestion admin
│
├── services/                         # Services (partie Controller)
│   ├── api/                         # Services API
│   │   ├── subscriptionApi.ts
│   │   ├── userApi.ts
│   │   ├── appointmentApi.ts
│   │   ├── patientApi.ts
│   │   ├── prescriptionApi.ts
│   │   └── index.ts
│   │
│   └── database/                    # Accès base de données
│       ├── config.ts
│       ├── schema.sql
│       ├── subscriptionDb.ts
│       ├── userDb.ts
│       ├── appointmentDb.ts
│       └── index.ts
│
├── contexts/                         # Gestion d'état global (Controller)
│   ├── AuthContext.tsx
│   ├── SubscriptionContext.tsx
│   ├── AppointmentContext.tsx
│   └── index.ts
│
├── hooks/                           # Custom React Hooks
│   ├── useAuth.ts
│   ├── useSubscription.ts
│   ├── useAppointments.ts
│   ├── usePrescriptions.ts
│   └── index.ts
│
├── types/                           # Types TypeScript (Model)
│   ├── subscription.ts
│   ├── user.ts
│   ├── appointment.ts
│   ├── patient.ts
│   ├── prescription.ts
│   └── index.ts
│
├── utils/                           # Utilitaires
│   ├── validation.ts
│   ├── formatters.ts
│   ├── constants.ts
│   ├── helpers.ts
│   └── index.ts
│
├── config/                          # Configuration
│   ├── routes.ts
│   ├── permissions.ts
│   └── app.config.ts
│
└── App.tsx                          # Point d'entrée
```

## 🎯 Responsabilités par Couche

### 📦 MODEL (Modèles)

**Rôle :** Représente les données et la logique métier

**Contient :**
- Définitions des entités (classes ou interfaces)
- Validation des données
- Logique métier spécifique
- Types TypeScript

**Exemple :**
```typescript
// models/Appointment.model.ts
export class Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  status: AppointmentStatus;
  
  validate(): boolean {
    // Logique de validation
  }
  
  canBeCancelled(): boolean {
    // Logique métier
  }
}
```

### 🎨 VIEW (Vues)

**Rôle :** Gère l'affichage et l'interaction utilisateur

**Contient :**
- Pages principales (`/views`)
- Composants réutilisables (`/components`)
- Composants UI de base (`/components/ui`)
- Layouts et navigation

**Exemple :**
```typescript
// views/doctor/DoctorDashboardPage.tsx
export function DoctorDashboardPage() {
  const { appointments } = useAppointments();
  const { patients } = usePatients();
  
  return (
    <div>
      <Header />
      <DoctorSidebar />
      <DashboardContent 
        appointments={appointments}
        patients={patients}
      />
    </div>
  );
}
```

### 🎮 CONTROLLER (Contrôleurs)

**Rôle :** Gère la logique de l'application et fait le lien entre Model et View

**Contient :**
- Controllers (logique métier complexe)
- Services API (communication backend)
- Contexts (état global)
- Hooks personnalisés

**Exemple :**
```typescript
// controllers/AppointmentController.ts
export class AppointmentController {
  async createAppointment(data: CreateAppointmentDTO) {
    // 1. Valider les données
    const appointment = new Appointment(data);
    appointment.validate();
    
    // 2. Appeler le service API
    const result = await AppointmentApi.create(appointment);
    
    // 3. Mettre à jour le contexte
    AppointmentContext.addAppointment(result);
    
    return result;
  }
}
```

## 🔄 Flux de Données MVC

### Exemple : Créer un rendez-vous

```
1. VIEW (User Action)
   ├─ Patient clique "Demander RDV"
   └─ RequestAppointmentPage.tsx
          │
          ▼
2. CONTROLLER (Process)
   ├─ useAppointments().createAppointment()
   ├─ AppointmentController.createAppointment()
   └─ AppointmentApi.create()
          │
          ▼
3. MODEL (Data)
   ├─ Appointment.validate()
   ├─ appointmentDb.create()
   └─ SQL INSERT
          │
          ▼
4. CONTROLLER (Update State)
   ├─ AppointmentContext mise à jour
   └─ Notification des observers
          │
          ▼
5. VIEW (Re-render)
   ├─ RequestAppointmentPage re-render
   ├─ SecretaryDashboard re-render
   └─ DoctorDashboard re-render
```

## 📊 Avantages de cette Architecture

### 1. **Séparation des Responsabilités**
- Chaque couche a un rôle clair et défini
- Facilite la maintenance et les tests

### 2. **Réutilisabilité**
- Les modèles peuvent être utilisés partout
- Les composants sont indépendants de la logique

### 3. **Testabilité**
- Chaque couche peut être testée indépendamment
- Mocking facile des dépendances

### 4. **Scalabilité**
- Facile d'ajouter de nouvelles fonctionnalités
- Structure claire pour les nouveaux développeurs

### 5. **Maintenabilité**
- Code organisé et prévisible
- Modifications localisées

## 🔧 Migration depuis l'Ancienne Structure

### Étape 1 : Créer la nouvelle structure
```bash
mkdir -p models views/{public,doctor,patient,secretary,admin}
mkdir -p components/{layout,forms,shared}
mkdir -p controllers hooks utils config
```

### Étape 2 : Déplacer les fichiers

**Composants → Views (Pages)**
```
components/Home.tsx → views/public/HomePage.tsx
components/Login.tsx → views/public/LoginPage.tsx
components/DoctorDashboard.tsx → views/doctor/DoctorDashboardPage.tsx
...
```

**Créer les Models**
```
types/subscription.ts → models/Subscription.model.ts
+ Ajouter logique métier
```

**Créer les Controllers**
```
contexts/SubscriptionContext.tsx → controllers/SubscriptionController.ts
services/api/subscriptionApi.ts → Reste en place
```

### Étape 3 : Mettre à jour les imports
```typescript
// Avant
import { Home } from './components/Home';

// Après
import { HomePage } from './views/public/HomePage';
```

## 📝 Conventions de Nommage

### Fichiers
- **Models :** `*.model.ts` (ex: `User.model.ts`)
- **Views (Pages) :** `*Page.tsx` (ex: `DoctorDashboardPage.tsx`)
- **Components :** `*.tsx` (ex: `Header.tsx`)
- **Controllers :** `*Controller.ts` (ex: `UserController.ts`)
- **Services :** `*Api.ts` ou `*Db.ts` (ex: `userApi.ts`)
- **Hooks :** `use*.ts` (ex: `useAuth.ts`)
- **Types :** `*.ts` (ex: `user.ts`)

### Exports
- Toujours utiliser des exports nommés
- Créer des fichiers `index.ts` pour regrouper les exports

```typescript
// models/index.ts
export * from './User.model';
export * from './Doctor.model';
export * from './Patient.model';

// Utilisation
import { User, Doctor, Patient } from '@/models';
```

## 🚀 Bonnes Pratiques

### 1. **Models**
- Ne contiennent QUE la logique métier
- Pas de dépendances vers React
- Peuvent être réutilisés côté backend

### 2. **Views**
- Ne contiennent QUE le code UI
- Utilisent les hooks et contexts
- Délèguent la logique aux controllers

### 3. **Controllers**
- Orchestrent les opérations
- Gèrent les erreurs
- Mettent à jour l'état global

### 4. **Services**
- Communication avec le backend
- Pas de logique métier
- Retournent des données brutes

## 📚 Exemple Complet

### Créer un Rendez-vous

```typescript
// 1. MODEL
// models/Appointment.model.ts
export class Appointment {
  constructor(
    public id: string,
    public patientId: string,
    public doctorId: string,
    public date: Date,
    public status: 'pending' | 'confirmed' | 'cancelled'
  ) {}
  
  validate(): boolean {
    if (!this.patientId || !this.doctorId) return false;
    if (this.date < new Date()) return false;
    return true;
  }
}

// 2. CONTROLLER
// controllers/AppointmentController.ts
export class AppointmentController {
  static async createAppointment(data: CreateAppointmentDTO) {
    // Créer le modèle
    const appointment = new Appointment(
      generateId(),
      data.patientId,
      data.doctorId,
      new Date(data.date),
      'pending'
    );
    
    // Valider
    if (!appointment.validate()) {
      throw new Error('Données invalides');
    }
    
    // Sauvegarder
    const result = await AppointmentApi.create(appointment);
    
    // Notifier
    toast.success('Rendez-vous créé avec succès');
    
    return result;
  }
}

// 3. SERVICE API
// services/api/appointmentApi.ts
export class AppointmentApi {
  static async create(appointment: Appointment) {
    return await appointmentDb.create(appointment);
  }
}

// 4. VIEW
// views/patient/RequestAppointmentPage.tsx
export function RequestAppointmentPage() {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = async () => {
    try {
      await AppointmentController.createAppointment(formData);
      navigate('/patient/dashboard');
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <AppointmentRequestForm 
      onSubmit={handleSubmit}
      onChange={setFormData}
    />
  );
}
```

## 🎓 Points Clés

1. **Model** = Qu'est-ce que c'est ? (données, structure, validation)
2. **View** = Comment ça s'affiche ? (UI, composants, pages)
3. **Controller** = Comment ça fonctionne ? (logique, flux, orchestration)

## 🆘 Support

Pour toute question sur l'architecture MVC :
1. Consultez ce fichier
2. Référez-vous aux exemples dans `/models`, `/views`, `/controllers`
3. Suivez les conventions de nommage
4. Respectez la séparation des responsabilités
