import { Header } from './Header';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Heart, Calendar, FileText, Shield, Clock, Users, Star,
  ChevronRight, CheckCircle, Stethoscope, Award, Crown, ArrowRight
} from 'lucide-react';
import { useSubscriptions } from '../../contexts/SubscriptionContext';
import { useState, useEffect, useRef } from 'react';
import { userService } from '../../services/userService';

import type { UserType } from '../../types/UserType';
import type { Page } from '../../types/Page';

interface HomeProps {
  onNavigate: (page: Page) => void;
  isAuthenticated: boolean;
  userType: UserType;
  onLogout: () => void;
}

// Hook pour l'animation des nombres - CORRIGÉ
function useAnimatedNumber(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, isVisible]);

  return { count, ref };
}

export function Home({ onNavigate, isAuthenticated, userType, onLogout }: HomeProps) {
  const { getPlansByCategory } = useSubscriptions();
  
  const [userStats, setUserStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalConsultations: 0,
    satisfactionRate: 98.5,
    monthlyDoctorsGrowth: 0,
    monthlyPatientsGrowth: 0,
    monthlyConsultationsGrowth: 0
  });
  
  const [loading, setLoading] = useState(true);

  // AJOUT: Définition des variables manquantes
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Gestion des Rendez-vous",
      description: "Planifiez et gérez facilement vos consultations avec un système de calendrier intuitif."
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: "Dossiers Médicaux",
      description: "Accédez aux dossiers patients de manière sécurisée et centralisée."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Sécurité Maximale",
      description: "Vos données médicales sont protégées selon les normes les plus strictes."
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Gain de Temps",
      description: "Automatisez vos tâches administratives pour vous concentrer sur vos patients."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Marie Dubois",
      specialty: "Médecin généraliste",
      content: "Cette plateforme a révolutionné ma pratique quotidienne. La gestion des patients n'a jamais été aussi simple.",
      rating: 5
    },
    {
      name: "Dr. Pierre Martin",
      specialty: "Cardiologue",
      content: "L'interface est intuitive et sécurisée. Mes patients apprécient la facilité de prise de rendez-vous.",
      rating: 5
    },
    {
      name: "Sophie Lambert",
      specialty: "Patiente",
      content: "Très pratique pour suivre mes rendez-vous et communiquer avec mon médecin traitant.",
      rating: 5
    }
  ];

  const partners = [
    "Hôpital Saint-Louis",
    "Clinique des Champs",
    "Centre Médical Lyon",
    "Polyclinique du Nord"
  ];

  const activeDoctorPlans = getPlansByCategory('doctor').filter(plan => plan.active).slice(0, 3);

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoading(true);
        const response = await userService.getAllUsers();
        const users = response.data;

        const doctors = users.filter((user: any) => user.role === 'doctor');
        const patients = users.filter((user: any) => user.role === 'patient');

        const baseDoctors = 25000;
        const basePatients = 500000;
        const baseConsultations = 2000000;

        const totalDoctors = baseDoctors + doctors.length;
        const totalPatients = basePatients + patients.length;
        const totalConsultations = baseConsultations + patients.length * 4;

        const monthlyDoctorsGrowth = Math.min(15 + Math.floor(doctors.length / 10), 25);
        const monthlyPatientsGrowth = Math.min(22 + Math.floor(patients.length / 50), 35);
        const monthlyConsultationsGrowth = Math.min(35 + Math.floor(patients.length / 20), 50);

        setUserStats({
          totalDoctors,
          totalPatients,
          totalConsultations,
          satisfactionRate: 98.5,
          monthlyDoctorsGrowth,
          monthlyPatientsGrowth,
          monthlyConsultationsGrowth
        });

      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Valeurs par défaut en cas d'erreur
        setUserStats({
          totalDoctors: 25000,
          totalPatients: 500000,
          totalConsultations: 2000000,
          satisfactionRate: 98.5,
          monthlyDoctorsGrowth: 15,
          monthlyPatientsGrowth: 22,
          monthlyConsultationsGrowth: 35
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, []);

  // CORRECTION: Création de refs séparées pour chaque instance
  const doctorsCountHero = useAnimatedNumber(userStats.totalDoctors);
  const patientsCountHero = useAnimatedNumber(userStats.totalPatients);
  const consultationsCountHero = useAnimatedNumber(userStats.totalConsultations);
  
  const doctorsCountStats = useAnimatedNumber(userStats.totalDoctors);
  const patientsCountStats = useAnimatedNumber(userStats.totalPatients);
  const consultationsCountStats = useAnimatedNumber(userStats.totalConsultations);
  
  const satisfactionRate = useAnimatedNumber(userStats.satisfactionRate);
  const monthlyDoctorsGrowth = useAnimatedNumber(userStats.monthlyDoctorsGrowth);
  const monthlyPatientsGrowth = useAnimatedNumber(userStats.monthlyPatientsGrowth);
  const monthlyConsultationsGrowth = useAnimatedNumber(userStats.monthlyConsultationsGrowth);
  const countriesCount = useAnimatedNumber(40);
  const uptimeRate = useAnimatedNumber(99.9);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={onNavigate} isAuthenticated={isAuthenticated} userType={userType} onLogout={onLogout} />
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des statistiques...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={onNavigate} isAuthenticated={isAuthenticated} userType={userType} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl text-slate-800 mb-6">
                Une plateforme pour <span className="text-blue-600">simplifier</span> la gestion médicale
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Connectez médecins et patients dans un environnement numérique sécurisé et moderne.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => onNavigate('signup')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Commencer maintenant
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" onClick={() => onNavigate('subscription-plans')} className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                  Voir les tarifs
                </Button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1690784261287-f32b7b79b29f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
                alt="Médecin moderne avec stéthoscope"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div ref={doctorsCountHero.ref} className="text-2xl font-bold text-blue-600">{formatNumber(doctorsCountHero.count)}+</div>
                    <div className="text-sm text-slate-600">Médecins actifs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{satisfactionRate.count}%</div>
                    <div className="text-sm text-slate-600">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div ref={patientsCountHero.ref} className="text-2xl font-bold text-purple-600">{formatNumber(patientsCountHero.count)}+</div>
                    <div className="text-sm text-slate-600">Patients</div>
                  </div>
                  <div className="text-center">
                    <div ref={consultationsCountHero.ref} className="text-2xl font-bold text-orange-600">{formatNumber(consultationsCountHero.count)}+</div>
                    <div className="text-sm text-slate-600">Consultations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl text-slate-800 mb-4">
              Une plateforme de confiance
            </h2>
            <p className="text-xl text-slate-600">
              Rejoignez des milliers de professionnels qui nous font déjà confiance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <div ref={doctorsCountStats.ref} className="text-4xl font-bold text-slate-800 mb-2">
                {formatNumber(doctorsCountStats.count)}+
              </div>
              <div className="text-slate-600">Médecins inscrits</div>
              <div className="text-sm text-green-600 mt-1">
                +{monthlyDoctorsGrowth.count}% ce mois
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-50 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-green-600" />
              </div>
              <div ref={patientsCountStats.ref} className="text-4xl font-bold text-slate-800 mb-2">
                {formatNumber(patientsCountStats.count)}+
              </div>
              <div className="text-slate-600">Patients actifs</div>
              <div className="text-sm text-green-600 mt-1">
                +{monthlyPatientsGrowth.count}% ce mois
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-50 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-purple-600" />
              </div>
              <div ref={consultationsCountStats.ref} className="text-4xl font-bold text-slate-800 mb-2">
                {formatNumber(consultationsCountStats.count)}+
              </div>
              <div className="text-slate-600">Consultations réalisées</div>
              <div className="text-sm text-green-600 mt-1">
                +{monthlyConsultationsGrowth.count}% ce mois
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-50 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-slate-800 mb-2">
                {satisfactionRate.count}%
              </div>
              <div className="text-slate-600">Taux de satisfaction</div>
              <div className="text-sm text-green-600 mt-1">Certifié ISO</div>
            </div>
          </div>
          
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {countriesCount.count}+
                </div>
                <div className="text-slate-700">Pays utilisateurs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-slate-700">Support disponible</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {uptimeRate.count}%
                </div>
                <div className="text-slate-700">Temps de disponibilité</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl text-slate-800 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Découvrez comment notre plateforme facilite le quotidien des professionnels de santé et de leurs patients.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow bg-white border-0 shadow-sm">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-slate-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl text-slate-800 mb-4">
              Témoignages
            </h2>
            <p className="text-xl text-slate-600">
              Ce que disent nos utilisateurs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-800">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.specialty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl text-slate-800 mb-4">Nos partenaires</h3>
            <p className="text-slate-600">Ils nous font confiance</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-slate-700">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Plans Médecins */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 mb-4">
              <Stethoscope className="w-4 h-4 mr-1" />
              Plans Médecins
            </Badge>
            <h2 className="text-3xl lg:text-4xl text-slate-800 mb-4">
              Des tarifs adaptés à votre pratique
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choisissez le plan qui correspond à vos besoins et commencez votre essai gratuit de 14 jours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {activeDoctorPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : 'border border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Plus Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mb-4">
                    {plan.color === 'green' && <Star className="w-12 h-12 text-green-600 mx-auto" />}
                    {plan.color === 'blue' && <Users className="w-12 h-12 text-blue-600 mx-auto" />}
                    {plan.color === 'purple' && <Crown className="w-12 h-12 text-purple-600 mx-auto" />}
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <p className="text-slate-600 text-sm">{plan.description}</p>
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-slate-900">{plan.monthlyPrice}€</span>
                      <span className="text-slate-600 ml-2">/mois</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      ou {plan.yearlyPrice}€/an (économisez {plan.monthlyPrice * 12 - plan.yearlyPrice}€)
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        {feature.included ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 mr-3 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-sm text-slate-500 italic">
                        + {plan.features.length - 5} autres fonctionnalités
                      </li>
                    )}
                  </ul>
                  <Button 
                    onClick={() => onNavigate('subscription-plans')}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    Choisir ce plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              onClick={() => onNavigate('subscription-plans')}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Voir tous les plans (Médecins, Cliniques, Patients)
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl text-white mb-6">
            Prêt à digitaliser votre pratique médicale ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui ont déjà fait le choix de l'innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate('signup')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Créer un compte
            </Button>
            <Button 
              variant="outline"
              onClick={() => onNavigate('contact')}
              className="border-white text-white hover:bg-blue-700 px-8 py-3 text-lg"
            >
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

      {/* How to Get Started Section */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl text-slate-800 mb-4">
              Comment Commencer ?
            </h2>
            <p className="text-xl text-slate-600">
              Processus simple et sécurisé pour tous les types d'utilisateurs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pour les Médecins */}
            <Card className="p-8 border-l-4 border-l-blue-600">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Médecins</h3>
                  <p className="text-slate-600">Abonnement requis pour créer un compte</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Choisissez votre plan</h4>
                    <p className="text-slate-600 text-sm">À partir de 29€/mois avec 14 jours d'essai gratuit</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Effectuez le paiement</h4>
                    <p className="text-slate-600 text-sm">Paiement sécurisé par carte ou prélèvement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Compte activé immédiatement</h4>
                    <p className="text-slate-600 text-sm">Accès complet à votre dashboard médecin</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={() => onNavigate('subscription-plans')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Voir les Plans Médecin
                </Button>
              </div>
            </Card>
            
            {/* Pour les Patients */}
            <Card className="p-8 border-l-4 border-l-green-600">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Patients</h3>
                  <p className="text-slate-600">Inscription gratuite et immédiate</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Création gratuite</h4>
                    <p className="text-slate-600 text-sm">Aucun paiement requis pour commencer</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Accès immédiat</h4>
                    <p className="text-slate-600 text-sm">Toutes les fonctions de base incluses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Upgrade optionnel</h4>
                    <p className="text-slate-600 text-sm">Plan Premium à 9€/mois disponible</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={() => onNavigate('signup')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Créer un Compte Gratuit
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">
              Vous gérez une clinique ou un hôpital ?
            </p>
            <Button 
              variant="outline"
              onClick={() => onNavigate('subscription-plans')}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Découvrir nos Solutions Entreprise
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl text-white">MedPlatform</span>
              </div>
              <p className="text-gray-400">
                La plateforme qui simplifie la gestion médicale pour tous.
              </p>
            </div>
            
            <div>
              <h4 className="text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => onNavigate('home')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Accueil
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('login')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Médecins
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('login')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Patients
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('contact')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Gestion des rendez-vous</li>
                <li>Dossiers médicaux</li>
                <li>Communication sécurisée</li>
                <li>Statistiques</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centre d'aide</li>
                <li>Documentation</li>
                <li>Support technique</li>
                <li>Formations</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 MedPlatform. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}