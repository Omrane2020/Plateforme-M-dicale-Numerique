import React, { useState } from 'react';
import { Header } from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Check,
  X,
  Star,
  Users,
  Calendar,
  FileText,
  Shield,
  Smartphone,
  Headphones,
  Zap,
  Crown,
  ArrowRight,
  Heart,
  Clock,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Bell,
  BarChart3,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  UserPlus,
  ClipboardCheck,
  Send
} from 'lucide-react';
import type { UserType } from '../types';
interface SubscriptionPlansProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  userType: UserType;
  onLogout: () => void;
  onSelectPlan: (plan: any) => void;
}

export function SubscriptionPlans({ onNavigate, isAuthenticated, userType, onLogout, onSelectPlan }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanType, setSelectedPlanType] = useState<'doctor' | 'clinic' | 'patient'>('doctor');

  const doctorPlans = [
    {
      id: 'doctor-basic',
      name: 'Médecin Solo',
      description: 'Pour les médecins débutants',
      icon: <Users className="w-8 h-8" />,
      monthlyPrice: 29,
      yearlyPrice: 290,
      popular: false,
      color: 'blue',
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
      icon: <Star className="w-8 h-8" />,
      monthlyPrice: 59,
      yearlyPrice: 590,
      popular: true,
      color: 'green',
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
      icon: <Crown className="w-8 h-8" />,
      monthlyPrice: 99,
      yearlyPrice: 990,
      popular: false,
      color: 'purple',
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
    }
  ];

  const clinicPlans = [
    {
      id: 'clinic-standard',
      name: 'Clinique Standard',
      description: 'Pour les petites cliniques',
      icon: <Shield className="w-8 h-8" />,
      monthlyPrice: 199,
      yearlyPrice: 1990,
      popular: false,
      color: 'blue',
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
      icon: <Zap className="w-8 h-8" />,
      monthlyPrice: 499,
      yearlyPrice: 4990,
      popular: true,
      color: 'green',
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
      icon: <Crown className="w-8 h-8" />,
      monthlyPrice: 999,
      yearlyPrice: 9990,
      popular: false,
      color: 'purple',
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
    }
  ];

  const patientPlans = [
    {
      id: 'patient-basic',
      name: 'Patient Gratuit',
      description: 'Accès de base gratuit',
      icon: <Heart className="w-8 h-8" />,
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: true,
      color: 'green',
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
      icon: <Star className="w-8 h-8" />,
      monthlyPrice: 9,
      yearlyPrice: 90,
      popular: false,
      color: 'blue',
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
      icon: <Users className="w-8 h-8" />,
      monthlyPrice: 19,
      yearlyPrice: 190,
      popular: false,
      color: 'purple',
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

  const getCurrentPlans = () => {
    switch (selectedPlanType) {
      case 'doctor': return doctorPlans;
      case 'clinic': return clinicPlans;
      case 'patient': return patientPlans;
      default: return doctorPlans;
    }
  };

  const plans = getCurrentPlans();

  const handleSelectPlan = (plan: any) => {
    const selectedPlanData = {
      ...plan,
      billingCycle,
      price: billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice,
      savings: billingCycle === 'yearly' ? (plan.monthlyPrice * 12 - plan.yearlyPrice) : 0
    };
    
    onSelectPlan(selectedPlanData);
    onNavigate('payment');
  };

  const getPrice = (plan: any) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: any) => {
    if (billingCycle === 'yearly') {
      const monthlyCost = plan.monthlyPrice * 12;
      const yearlyCost = plan.yearlyPrice;
      return monthlyCost - yearlyCost;
    }
    return 0;
  };

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'ring') => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-500',
        ring: 'ring-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-500',
        ring: 'ring-green-500'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-500',
        ring: 'ring-purple-500'
      }
    };
    return colorMap[color as keyof typeof colorMap]?.[type] || colorMap.blue[type];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onNavigate={onNavigate} 
        isAuthenticated={isAuthenticated} 
        userType={userType} 
        onLogout={onLogout} 
      />
      
      <div className="pt-20">
        {/* Hero Section avec statistiques */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-24 overflow-hidden">
          {/* Decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">Plus de 5,000 professionnels de santé nous font confiance</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl mb-6">
                Des Solutions pour Tous les
                <span className="block bg-gradient-to-r from-green-300 to-blue-200 bg-clip-text text-transparent">
                  Professionnels de Santé
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Du médecin indépendant aux grandes cliniques, trouvez la solution adaptée à votre structure avec gestion intelligente des rendez-vous
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-center mb-2">
                    <CalendarCheck className="w-8 h-8 text-green-300" />
                  </div>
                  <div className="text-3xl mb-1">98%</div>
                  <div className="text-sm text-blue-200">RDV confirmés</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-8 h-8 text-green-300" />
                  </div>
                  <div className="text-3xl mb-1">-40%</div>
                  <div className="text-sm text-blue-200">Temps de gestion</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-green-300" />
                  </div>
                  <div className="text-3xl mb-1">5000+</div>
                  <div className="text-sm text-blue-200">Médecins actifs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-8 h-8 text-green-300" />
                  </div>
                  <div className="text-3xl mb-1">+25%</div>
                  <div className="text-sm text-blue-200">Productivité</div>
                </div>
              </div>
            </div>
            
            {/* Plan Type Selector */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 flex space-x-2">
                <button 
                  className={`px-6 py-3 rounded-lg transition-all ${
                    selectedPlanType === 'doctor' 
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedPlanType('doctor')}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Médecins
                </button>
                <button 
                  className={`px-6 py-3 rounded-lg transition-all ${
                    selectedPlanType === 'clinic' 
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedPlanType('clinic')}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Cliniques
                </button>
                <button 
                  className={`px-6 py-3 rounded-lg transition-all ${
                    selectedPlanType === 'patient' 
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedPlanType('patient')}
                >
                  <Heart className="w-4 h-4 inline mr-2" />
                  Patients
                </button>
              </div>
            </div>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span className={`transition-all ${billingCycle === 'monthly' ? 'text-white' : 'text-blue-200'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-green-500' : 'bg-white/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`transition-all ${billingCycle === 'yearly' ? 'text-white' : 'text-blue-200'}`}>
                Annuel
              </span>
              {billingCycle === 'yearly' && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  Économisez jusqu'à 20%
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Section - Rendez-vous */}
        {selectedPlanType === 'doctor' && (
          <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge className="bg-blue-100 text-blue-700 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Gestion Intelligente des Rendez-vous
                </Badge>
                <h2 className="text-4xl mb-4">
                  Médecins & Secrétaires : Chacun Son Interface
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Le médecin ET la secrétaire peuvent gérer les rendez-vous, mais chacun avec une interface adaptée à son rôle
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Patient demande */}
                <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-blue-900">1. Patient Demande</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Le patient soumet sa demande de rendez-vous via le formulaire en ligne
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Formulaire simplifié</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Choix du médecin</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Motif de consultation</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Secrétaire traite */}
                <Card className="border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-green-900">2. Secrétaire Gère</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      La secrétaire gère les RDV dans son interface opérationnelle dédiée
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Interface de gestion dédiée</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Planning et attribution créneaux</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Confirmations automatiques</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Médecin consulte */}
                <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <ClipboardCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-purple-900">3. Médecin Aussi !</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Le médecin peut aussi gérer ses RDV via son interface médicale
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Interface médicale complète</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Calendrier avec dossiers intégrés</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Gestion autonome ou déléguée</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
                <h3 className="text-2xl mb-6 text-center">
                  Deux Interfaces Complémentaires
                </h3>
                <p className="text-gray-600 mb-8 max-w-3xl mx-auto text-center">
                  Le médecin et la secrétaire peuvent TOUS LES DEUX gérer les rendez-vous, mais chacun dispose 
                  d'une interface optimisée pour ses besoins spécifiques
                </p>

                {/* Comparison des interfaces */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Interface Médecin */}
                  <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg text-blue-900">Interface Médecin</h4>
                        <p className="text-sm text-gray-500">Orientée clinique</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><strong>Gestion complète des RDV</strong> avec calendrier médical</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Accès direct aux <strong>dossiers patients</strong> depuis le calendrier</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Vue d'ensemble des <strong>consultations du jour</strong></span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Statistiques et <strong>analytics médicaux</strong></span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Création de RDV avec <strong>notes médicales</strong></span>
                      </li>
                    </ul>
                  </div>

                  {/* Interface Secrétaire */}
                  <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg text-green-900">Interface Secrétaire</h4>
                        <p className="text-sm text-gray-500">Orientée gestion</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><strong>Gestion complète des RDV</strong> avec planning optimisé</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Traitement des <strong>demandes en attente</strong></span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><strong>Confirmations automatiques</strong> par SMS/Email</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Gestion des <strong>coordonnées patients</strong></span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Tableau de bord <strong>opérationnel</strong> dédié</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-6 text-white text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <h4>Avantage clé</h4>
                  </div>
                  <p className="text-blue-50">
                    <strong>Flexibilité maximale :</strong> Le médecin peut gérer ses RDV lui-même ou déléguer totalement 
                    à sa secrétaire. Chaque interface est conçue pour optimiser le workflow de son utilisateur !
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Benefits Section */}
        {selectedPlanType === 'doctor' && (
          <div className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl text-white mb-4">
                  Pourquoi Deux Interfaces Pour La Gestion des RDV ?
                </h2>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Parce que chaque rôle a des besoins différents
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-yellow-300" />
                  </div>
                  <h3 className="text-xl mb-3">Flexibilité Totale</h3>
                  <p className="text-blue-100">
                    Le médecin peut gérer lui-même ses RDV pour un contrôle total, ou déléguer entièrement à sa secrétaire. 
                    C'est vous qui décidez !
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-green-300" />
                  </div>
                  <h3 className="text-xl mb-3">Optimisation Par Rôle</h3>
                  <p className="text-blue-100">
                    L'interface médecin affiche les infos médicales. L'interface secrétaire se concentre sur la coordination 
                    et la logistique. Chacun travaille efficacement.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-purple-300" />
                  </div>
                  <h3 className="text-xl mb-3">Sécurité & Permissions</h3>
                  <p className="text-blue-100">
                    Chaque utilisateur voit uniquement ce dont il a besoin. Le médecin garde le contrôle complet, 
                    la secrétaire accède aux fonctions opérationnelles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Section */}
        <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Plan Type Description */}
            <div className="text-center mb-12">
              {selectedPlanType === 'doctor' && (
                <div>
                  <h2 className="text-3xl mb-2">Plans pour Médecins</h2>
                  <p className="text-gray-600 text-lg mb-4">
                    <strong className="text-blue-600">Abonnement obligatoire</strong> - Choisissez le plan adapté à votre pratique pour créer votre compte médecin
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Secrétaire(s) inclus dans tous les plans
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      <Send className="w-4 h-4 mr-1" />
                      Paiement via Western Union
                    </Badge>
                  </div>
                </div>
              )}
              {selectedPlanType === 'clinic' && (
                <div>
                  <h2 className="text-3xl mb-2">Solutions pour Cliniques & Hôpitaux</h2>
                  <p className="text-gray-600 text-lg">
                    Des solutions complètes pour gérer vos structures de santé de toute taille
                  </p>
                </div>
              )}
              {selectedPlanType === 'patient' && (
                <div>
                  <h2 className="text-3xl mb-2">Plans pour Patients</h2>
                  <p className="text-gray-600 text-lg">
                    Accès gratuit aux fonctions de base ou abonnement premium pour un suivi avancé
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-300 ${
                    plan.popular 
                      ? `ring-2 ${getColorClasses(plan.color, 'ring')} shadow-2xl transform lg:scale-105` 
                      : 'hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className={`${getColorClasses(plan.color, 'bg')} ${getColorClasses(plan.color, 'text')} px-6 py-2 shadow-lg`}>
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        Recommandé
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-8">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-2xl ${getColorClasses(plan.color, 'bg')} ${getColorClasses(plan.color, 'text')}`}>
                        {plan.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl">{getPrice(plan)}€</span>
                        <span className="text-gray-500 ml-2">/{billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                      </div>
                      {billingCycle === 'yearly' && getSavings(plan) > 0 && (
                        <div className="mt-2">
                          <Badge className="bg-green-100 text-green-700">
                            Économisez {getSavings(plan)}€ par an
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          {feature.included ? (
                            <div className={`p-0.5 rounded-full ${getColorClasses(plan.color, 'bg')} mr-3 flex-shrink-0 mt-0.5`}>
                              <Check className={`w-4 h-4 ${getColorClasses(plan.color, 'text')}`} />
                            </div>
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full ${
                        plan.popular 
                          ? `bg-gradient-to-r ${plan.color === 'green' ? 'from-green-500 to-green-600' : plan.color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-blue-500 to-blue-600'} hover:opacity-90 text-white shadow-lg` 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {plan.popular ? (
                        <>
                          Commencer Maintenant
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        'Choisir ce Plan'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="bg-yellow-100 text-yellow-700 mb-4">
                <Star className="w-4 h-4 mr-1 fill-current" />
                Témoignages
              </Badge>
              <h2 className="text-3xl mb-4">
                Ils nous font confiance
              </h2>
              <p className="text-xl text-gray-600">
                Découvrez ce que nos utilisateurs disent de notre plateforme
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-2 border-blue-100 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Dr. Sophie Martin</CardTitle>
                      <CardDescription>Médecin généraliste</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-3">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">
                    "La gestion des rendez-vous avec ma secrétaire est devenue tellement plus simple. Je peux enfin me concentrer sur mes patients sans me soucier de l'administratif."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Marie Dubois</CardTitle>
                      <CardDescription>Secrétaire médicale</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-3">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">
                    "Mon interface est claire et intuitive. Je traite les demandes de RDV en quelques clics et les patients reçoivent une confirmation immédiate. Parfait !"
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-100 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Jean Dupont</CardTitle>
                      <CardDescription>Patient</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-3">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">
                    "Prendre rendez-vous n'a jamais été aussi facile. Plus besoin d'appeler pendant les heures d'ouverture, je peux tout faire en ligne à mon rythme."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl mb-4">
                Toutes les Fonctionnalités Incluses
              </h2>
              <p className="text-xl text-gray-600">
                Découvrez tout ce qui est inclus dans nos solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-all border-l-4 border-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Gestion des Rendez-vous</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Calendrier intelligent multi-praticiens</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Rappels automatiques SMS/Email</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Gestion des créneaux disponibles</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Synchronisation multi-appareils</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border-l-4 border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span>Dossiers Médicaux</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Historique médical complet</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Pièces jointes et imagerie</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Recherche et filtres avancés</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Sauvegarde sécurisée cloud</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border-l-4 border-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span>Sécurité & Conformité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Chiffrement de bout en bout</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Conformité RGPD complète</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Authentification 2FA</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Audit complet des accès</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border-l-4 border-indigo-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    <span>Applications Mobiles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Disponible sur iOS et Android</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Synchronisation temps réel</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Mode hors ligne disponible</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Notifications push intelligentes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border-l-4 border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Headphones className="w-5 h-5 text-orange-600" />
                    <span>Support Client Premium</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Formation initiale personnalisée</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Documentation complète</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Assistance technique rapide</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Mises à jour gratuites à vie</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border-l-4 border-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span>Intégrations Avancées</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>API REST complète et documentée</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Connexion laboratoires d'analyse</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Intégration pharmacies</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Systèmes d'assurance santé</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="bg-gray-100 text-gray-700 mb-4">
                <MessageSquare className="w-4 h-4 mr-1" />
                FAQ
              </Badge>
              <h2 className="text-3xl mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-gray-600">
                Tout ce que vous devez savoir sur nos plans d'abonnement
              </p>
            </div>

            <div className="space-y-6">
              <Card className="hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Puis-je changer de plan à tout moment ?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et la facturation est ajustée au prorata. Aucune pénalité, aucun frais caché.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Y a-t-il une période d'essai gratuite ?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Oui, nous offrons <strong>14 jours d'essai gratuit</strong> sur tous nos plans médecin et clinique. Aucune carte de crédit n'est requise pour commencer. Testez toutes les fonctionnalités sans engagement.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Le médecin peut-il aussi gérer les rendez-vous ?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <strong>Absolument !</strong> Le médecin dispose de sa propre interface de gestion des rendez-vous, orientée sur l'aspect clinique avec accès direct aux dossiers patients. 
                    La secrétaire a également son interface, orientée gestion opérationnelle. <strong>Les deux peuvent gérer les RDV</strong>, mais chacun avec des outils adaptés à son rôle.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Comment fonctionne la collaboration médecin-secrétaire ?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Chaque plan médecin inclut un ou plusieurs accès secrétaire. Chaque secrétaire dispose de sa propre interface pour gérer les demandes de RDV, 
                    les confirmations et la coordination. Le médecin peut superviser, gérer lui-même certains RDV, ou déléguer complètement selon ses préférences.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Mes données sont-elles sécurisées ?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Absolument. Nous utilisons un <strong>chiffrement de niveau bancaire</strong> et sommes entièrement conformes au <strong>RGPD</strong>. Vos données sont sauvegardées quotidiennement et stockées dans des centres de données sécurisés en Europe.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Que se passe-t-il si j'annule mon abonnement ?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Vous pouvez annuler à tout moment sans pénalité. Vous gardez l'accès jusqu'à la fin de votre période de facturation, et vous pouvez <strong>exporter toutes vos données</strong> au format standard avant la fin de votre abonnement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 py-20 overflow-hidden">
          {/* Decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm">Rejoignez plus de 5,000 professionnels de santé</span>
            </div>

            <h2 className="text-4xl text-white mb-6">
              {selectedPlanType === 'doctor' && 'Créez Votre Compte Médecin Maintenant'}
              {selectedPlanType === 'clinic' && 'Modernisez Votre Établissement'}
              {selectedPlanType === 'patient' && 'Prenez le Contrôle de Votre Santé'}
            </h2>
            
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {selectedPlanType === 'doctor' && 'Choisissez votre abonnement, profitez de 14 jours d\'essai gratuit et créez votre compte en quelques minutes'}
              {selectedPlanType === 'clinic' && 'Solutions sur-mesure pour votre structure de santé avec accompagnement personnalisé'}
              {selectedPlanType === 'patient' && 'Accès gratuit ou premium pour un suivi personnalisé de votre santé'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                onClick={() => onNavigate('signup')}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {selectedPlanType === 'doctor' && 'Commencer l\'Essai Gratuit'}
                {selectedPlanType === 'clinic' && 'Demander un Devis'}
                {selectedPlanType === 'patient' && 'Créer un Compte Gratuit'}
              </Button>
              
              {selectedPlanType !== 'patient' && (
                <Button 
                  variant="outline"
                  onClick={() => onNavigate('contact')}
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 backdrop-blur-sm"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Parler à un Expert
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-blue-100">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-300 mr-2" />
                <span>14 jours d'essai gratuit</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-300 mr-2" />
                <span>Aucun engagement</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-300 mr-2" />
                <span>Annulation facile</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-300 mr-2" />
                <span>Support gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
