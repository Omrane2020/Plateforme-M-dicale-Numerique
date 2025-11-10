import React, { useState } from 'react';
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
  Stethoscope
} from 'lucide-react';
import type { Page } from '../types/Page';
import type { UserType } from '../types/UserType';

interface ContactProps {
  onNavigate: (page: Page) => void;
  isAuthenticated: boolean;
  userType: UserType;
  onLogout: () => void;
}

export function Contact({ onNavigate, isAuthenticated, userType, onLogout }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    userType: userType || ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici on traiterait l'envoi du formulaire
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
      userType: userType || ''
    });
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      description: 'Lun-Ven 9h-18h'
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: 'Email',
      content: 'contact@medplatform.com',
      description: 'Réponse sous 24h'
    },
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: 'Adresse',
      content: '123 Avenue de la Santé',
      description: '75014 Paris, France'
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: 'Horaires',
      content: 'Lun-Ven : 9h-18h',
      description: 'Sam : 10h-16h'
    }
  ];

  const supportCategories = [
    {
      icon: <Headphones className="h-8 w-8 text-blue-600" />,
      title: 'Support Technique',
      description: 'Problèmes de connexion, bugs, fonctionnalités',
      contact: 'support@medplatform.com'
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: 'Support Commercial',
      description: 'Abonnements, facturation, partenariats',
      contact: 'commercial@medplatform.com'
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      title: 'Documentation',
      description: 'Guides d\'utilisation, formations, FAQ',
      contact: 'docs@medplatform.com'
    },
    {
      icon: <Stethoscope className="h-8 w-8 text-red-600" />,
      title: 'Support Médical',
      description: 'Questions spécifiques aux professionnels de santé',
      contact: 'medical@medplatform.com'
    }
  ];

  const faqItems = [
    {
      question: 'Comment créer un compte médecin ?',
      answer: 'Cliquez sur "S\'inscrire" puis choisissez "Médecin". Remplissez le formulaire avec vos informations professionnelles. Une vérification sera effectuée avant activation.'
    },
    {
      question: 'Les données médicales sont-elles sécurisées ?',
      answer: 'Oui, toutes les données sont chiffrées et stockées selon les normes RGPD et de sécurité médicale. Nous utilisons un chiffrement de niveau bancaire.'
    },
    {
      question: 'Comment prendre un rendez-vous ?',
      answer: 'Connectez-vous à votre compte patient, puis cliquez sur "Prendre rendez-vous". Choisissez votre médecin et le créneau disponible.'
    },
    {
      question: 'Puis-je annuler un rendez-vous ?',
      answer: 'Oui, vous pouvez annuler un rendez-vous jusqu\'à 24h avant la consultation via votre espace personnel.'
    },
    {
      question: 'Comment contacter mon médecin ?',
      answer: 'Utilisez la messagerie sécurisée disponible dans votre espace patient pour communiquer avec votre médecin traitant.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-0">
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
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
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
                  {info.icon}
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Votre nom"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="votre@email.com"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select onValueChange={(value) => handleChange('category', value)}>
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
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="Résumé de votre demande"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Décrivez votre demande en détail..."
                      rows={6}
                      required
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Envoyer le message
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
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg text-slate-800 mb-1">{category.title}</h4>
                        <p className="text-sm text-slate-600 mb-2">{category.description}</p>
                        <p className="text-sm text-blue-600">{category.contact}</p>
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
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
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