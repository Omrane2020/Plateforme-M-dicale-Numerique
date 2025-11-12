import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Headphones,
  FileText,
  Users,
  Stethoscope,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { Page } from '../types/Page';
import type { UserType } from '../types/UserType';
// @ts-ignore
import { supabase } from "../supabaseClient";

interface ContactProps {
  onNavigate: (page: Page) => void;
  isAuthenticated: boolean;
  userType: UserType;
  onLogout: () => void;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  userType: string;
}

interface ContactInfo {
  type: string;
  title: string;
  content: string;
  description: string;
  icon_name: string;
}

interface SupportCategory {
  title: string;
  description: string;
  contact_email: string;
  icon_name: string;
  response_time: string;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export function Contact({ onNavigate, isAuthenticated, userType, onLogout }: ContactProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    userType: userType || ''
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [supportCategories, setSupportCategories] = useState<SupportCategory[]>([]);
  const [faqItems, setFaqItems] = useState<FAQ[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les données de contact depuis Supabase
  const fetchContactData = async () => {
    try {
      const [contactInfoResponse, supportCategoriesResponse, faqsResponse] = await Promise.all([
        supabase.from('contact_info').select('*').order('order_index', { ascending: true }),
        supabase.from('support_categories').select('*').order('order_index', { ascending: true }),
        supabase.from('faqs').select('*').eq('is_active', true).order('order_index', { ascending: true }).limit(5)
      ]);

      if (contactInfoResponse.data) setContactInfo(contactInfoResponse.data);
      if (supportCategoriesResponse.data) setSupportCategories(supportCategoriesResponse.data);
      if (faqsResponse.data) setFaqItems(faqsResponse.data);

    } catch (error) {
      console.error('Erreur lors du chargement des données de contact:', error);
      // Charger les données par défaut en cas d'erreur
      setContactInfo(getDefaultContactInfo());
      setSupportCategories(getDefaultSupportCategories());
      setFaqItems(getDefaultFaqItems());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            category: formData.category,
            message: formData.message,
            user_type: formData.userType,
            status: 'new',
            priority: formData.category === 'technical' ? 'high' : 'medium'
          }
        ]);

      if (error) throw error;

      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        userType: userType || ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour obtenir l'icône par nom
  const getIconComponent = (iconName: string) => {
    const iconProps = { className: "h-6 w-6 text-blue-600" };
    
    switch (iconName) {
      case 'Phone': return <Phone {...iconProps} />;
      case 'Mail': return <Mail {...iconProps} />;
      case 'MapPin': return <MapPin {...iconProps} />;
      case 'Clock': return <Clock {...iconProps} />;
      case 'Headphones': return <Headphones {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'FileText': return <FileText {...iconProps} />;
      case 'Stethoscope': return <Stethoscope {...iconProps} />;
      default: return <MessageSquare {...iconProps} />;
    }
  };

  // Données par défaut en cas d'erreur
  const getDefaultContactInfo = (): ContactInfo[] => [
    {
      type: 'phone',
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      description: 'Lun-Ven 9h-18h',
      icon_name: 'Phone'
    },
    {
      type: 'email',
      title: 'Email',
      content: 'contact@medplatform.com',
      description: 'Réponse sous 24h',
      icon_name: 'Mail'
    },
    {
      type: 'address',
      title: 'Adresse',
      content: '123 Avenue de la Santé',
      description: '75014 Paris, France',
      icon_name: 'MapPin'
    },
    {
      type: 'hours',
      title: 'Horaires',
      content: 'Lun-Ven : 9h-18h',
      description: 'Sam : 10h-16h',
      icon_name: 'Clock'
    }
  ];

  const getDefaultSupportCategories = (): SupportCategory[] => [
    {
      title: 'Support Technique',
      description: 'Problèmes de connexion, bugs, fonctionnalités',
      contact_email: 'support@medplatform.com',
      icon_name: 'Headphones',
      response_time: 'Sous 2 heures'
    },
    {
      title: 'Support Commercial',
      description: 'Abonnements, facturation, partenariats',
      contact_email: 'commercial@medplatform.com',
      icon_name: 'Users',
      response_time: 'Sous 24 heures'
    },
    {
      title: 'Documentation',
      description: 'Guides d\'utilisation, formations, FAQ',
      contact_email: 'docs@medplatform.com',
      icon_name: 'FileText',
      response_time: 'Sous 4 heures'
    },
    {
      title: 'Support Médical',
      description: 'Questions spécifiques aux professionnels de santé',
      contact_email: 'medical@medplatform.com',
      icon_name: 'Stethoscope',
      response_time: 'Sous 2 heures'
    }
  ];

  const getDefaultFaqItems = (): FAQ[] => [
    {
      question: 'Comment créer un compte médecin ?',
      answer: 'Cliquez sur "S\'inscrire" puis choisissez "Médecin". Remplissez le formulaire avec vos informations professionnelles. Une vérification sera effectuée avant activation.',
      category: 'general'
    },
    {
      question: 'Les données médicales sont-elles sécurisées ?',
      answer: 'Oui, toutes les données sont chiffrées et stockées selon les normes RGPD et de sécurité médicale. Nous utilisons un chiffrement de niveau bancaire.',
      category: 'security'
    },
    {
      question: 'Comment prendre un rendez-vous ?',
      answer: 'Connectez-vous à votre compte patient, puis cliquez sur "Prendre rendez-vous". Choisissez votre médecin et le créneau disponible.',
      category: 'appointments'
    },
    {
      question: 'Puis-je annuler un rendez-vous ?',
      answer: 'Oui, vous pouvez annuler un rendez-vous jusqu\'à 24h avant la consultation via votre espace personnel.',
      category: 'appointments'
    },
    {
      question: 'Comment contacter mon médecin ?',
      answer: 'Utilisez la messagerie sécurisée disponible dans votre espace patient pour communiquer avec votre médecin traitant.',
      category: 'communication'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header 
          onNavigate={onNavigate} 
          isAuthenticated={isAuthenticated} 
          userType={userType} 
          onLogout={onLogout} 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onNavigate={onNavigate} 
        isAuthenticated={isAuthenticated} 
        userType={userType} 
        onLogout={onLogout} 
      />

      {/* Emergency Contact */}
      <div className="mt-0">
        <Card className="shadow-sm border-0 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-4">
              <Phone className="h-8 w-8 text-red-600" />
              <div className="text-center">
                <h3 className="text-lg text-red-800 mb-1">Urgence médicale ?</h3>
                <p className="text-red-700 mb-2">
                  En cas d'urgence médicale, contactez immédiatement le SAMU
                </p>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.open('tel:15')}
                >
                  Appeler le 15
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl text-slate-800 mb-4">Contactez-nous</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Notre équipe est là pour vous accompagner. N'hésitez pas à nous contacter pour toute question ou assistance.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <Card key={index} className="text-center shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {getIconComponent(info.icon_name)}
                </div>
                <h3 className="text-lg text-slate-800 mb-2">{info.title}</h3>
                <p className="text-slate-700 mb-1">{info.content}</p>
                <p className="text-sm text-slate-500">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2" />
                  Envoyez-nous un message
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">
                      Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                    </span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800">
                      Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Votre nom"
                        required
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="votre@email.com"
                        required
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleChange('category', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choisissez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Support Technique</SelectItem>
                        <SelectItem value="commercial">Support Commercial</SelectItem>
                        <SelectItem value="medical">Support Médical</SelectItem>
                        <SelectItem value="billing">Facturation</SelectItem>
                        <SelectItem value="feedback">Suggestions</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="Résumé de votre demande"
                      required
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Décrivez votre demande en détail..."
                      rows={6}
                      required
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer le message'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Support Categories & FAQ */}
          <div className="space-y-8">
            {/* Support Categories */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800">Types de support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportCategories.map((category, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-shrink-0">
                        {getIconComponent(category.icon_name)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg text-slate-800 mb-1">{category.title}</h4>
                        <p className="text-sm text-slate-600 mb-2">{category.description}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-blue-600">{category.contact_email}</p>
                          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                            {category.response_time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800">Questions fréquentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="border-b border-slate-200 pb-4 last:border-b-0">
                      <h4 className="text-slate-800 mb-2">{faq.question}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => onNavigate('faq')}
                  >
                    Voir toute la FAQ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 text-center">
          <h3 className="text-xl text-slate-800 mb-6">Suivez-nous</h3>
          <div className="flex justify-center space-x-6">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              LinkedIn
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Twitter
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}