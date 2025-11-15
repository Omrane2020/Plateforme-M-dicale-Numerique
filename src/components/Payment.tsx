import React, { useState } from 'react';
import { Header } from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Send,
  Lock,
  Shield,
  CheckCircle,
  ArrowLeft,
  Users,
  Star,
  Crown,
  Copy,
  AlertCircle,
  Clock,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import type { UserType } from '../types/UserType';
interface PaymentProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  userType:UserType ;
  onLogout: () => void;
  selectedPlan?: any;
}

export function Payment({ onNavigate, isAuthenticated, userType, onLogout, selectedPlan }: PaymentProps) {
  const [formData, setFormData] = useState({
    // Informations de contact
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Informations de transfert Western Union
    transferCode: '',
    senderName: '',
    senderCountry: 'France',
    transferAmount: '',
    transferDate: '',
    
    // Options
    agreeTerms: false,
    confirmPayment: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [transferSubmitted, setTransferSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Informations de réception Western Union
  const westernUnionDetails = {
    receiverName: 'MEDICONNECT SARL',
    receiverCountry: 'France',
    receiverCity: 'Paris',
    amount: selectedPlan ? Math.round(selectedPlan.price * 1.2) : 0
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papiers`);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error('Veuillez accepter les conditions générales');
      return;
    }

    if (!formData.confirmPayment) {
      toast.error('Veuillez confirmer que vous avez effectué le transfert');
      return;
    }

    if (!formData.transferCode || !formData.senderName || !formData.transferAmount) {
      toast.error('Veuillez remplir toutes les informations du transfert');
      return;
    }

    setIsProcessing(true);
    
    // Simulation de l'envoi des informations de transfert
    setTimeout(() => {
      setTransferSubmitted(true);
      toast.success('Informations de paiement enregistrées avec succès !');
      setIsProcessing(false);
    }, 2000);
  };

  const getPlanIcon = (planId: string) => {
    if (planId?.includes('basic') || planId?.includes('solo')) return <Users className="w-5 h-5" />;
    if (planId?.includes('professional') || planId?.includes('cabinet')) return <Star className="w-5 h-5" />;
    if (planId?.includes('premium') || planId?.includes('multi')) return <Crown className="w-5 h-5" />;
    return <Users className="w-5 h-5" />;
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Aucun plan sélectionné</h2>
            <p className="text-gray-600 mb-6">Veuillez d'abord choisir un plan d'abonnement.</p>
            <Button onClick={() => onNavigate('subscription-plans')}>
              Choisir un Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Page de confirmation après soumission
  if (transferSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onNavigate={onNavigate} 
          isAuthenticated={isAuthenticated} 
          userType={userType} 
          onLogout={onLogout} 
        />
        
        <div className="pt-20 pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-2 border-green-500">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Paiement en cours de vérification
                </h1>
                
                <p className="text-lg text-gray-600 mb-8">
                  Merci d'avoir soumis vos informations de paiement Western Union !
                </p>
                
                <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-blue-900 mb-4">Prochaines étapes :</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-800">Notre équipe vérifiera votre transfert Western Union dans les 24-48 heures</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-800">Vous recevrez un email de confirmation une fois le paiement validé</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-800">Votre compte sera activé automatiquement après validation</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-yellow-900 mb-2">Informations importantes :</p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Code de transfert : <strong>{formData.transferCode}</strong></li>
                        <li>• Montant : <strong>{formData.transferAmount}€</strong></li>
                        <li>• Un email de confirmation vous a été envoyé à : <strong>{formData.email}</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={() => onNavigate('home')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Retour à l'accueil
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    Besoin d'aide ? Contactez-nous à{' '}
                    <a href="mailto:support@mediconnect.fr" className="text-blue-600 hover:underline">
                      support@mediconnect.fr
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onNavigate={onNavigate} 
        isAuthenticated={isAuthenticated} 
        userType={userType} 
        onLogout={onLogout} 
      />
      
      <div className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => onNavigate('subscription-plans')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux plans
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Paiement via Western Union</h1>
            <p className="text-gray-600 mt-2">Effectuez votre paiement de manière sécurisée</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Instructions de paiement */}
            <div className="lg:col-span-2 space-y-6">
              {/* Étape 1: Instructions Western Union */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Étape 1 : Effectuez le transfert Western Union</CardTitle>
                      <CardDescription>Suivez ces instructions pour envoyer votre paiement</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Informations du bénéficiaire
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white rounded-lg p-4">
                        <div>
                          <p className="text-sm text-gray-600">Nom du bénéficiaire</p>
                          <p className="font-semibold text-gray-900">{westernUnionDetails.receiverName}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(westernUnionDetails.receiverName, 'Nom du bénéficiaire')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center bg-white rounded-lg p-4">
                        <div>
                          <p className="text-sm text-gray-600">Pays</p>
                          <p className="font-semibold text-gray-900">{westernUnionDetails.receiverCountry}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(westernUnionDetails.receiverCountry, 'Pays')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center bg-white rounded-lg p-4">
                        <div>
                          <p className="text-sm text-gray-600">Ville</p>
                          <p className="font-semibold text-gray-900">{westernUnionDetails.receiverCity}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(westernUnionDetails.receiverCity, 'Ville')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center bg-green-100 rounded-lg p-4 border-2 border-green-300">
                        <div>
                          <p className="text-sm text-green-700">Montant à envoyer (TTC)</p>
                          <p className="text-2xl font-bold text-green-900">{westernUnionDetails.amount}€</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(westernUnionDetails.amount.toString(), 'Montant')}
                          className="border-green-300"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-900 mb-2">Comment effectuer le transfert ?</p>
                        <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
                          <li>Rendez-vous dans une agence Western Union ou sur leur site web</li>
                          <li>Utilisez les informations du bénéficiaire ci-dessus</li>
                          <li>Conservez le code de suivi (MTCN) qui vous sera fourni</li>
                          <li>Remplissez le formulaire ci-dessous avec les détails du transfert</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Étape 2: Formulaire de confirmation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Étape 2 : Confirmez votre transfert</CardTitle>
                      <CardDescription>Renseignez les informations de votre transfert Western Union</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayment} className="space-y-6">
                    {/* Informations de contact */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Vos informations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Prénom *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nom *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="votre.email@example.com"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">Vous recevrez la confirmation à cette adresse</p>
                      </div>

                      <div>
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+33 6 12 34 56 78"
                          required
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Informations du transfert */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Détails du transfert Western Union</h4>
                      
                      <div>
                        <Label htmlFor="transferCode">Code de suivi (MTCN) *</Label>
                        <Input
                          id="transferCode"
                          value={formData.transferCode}
                          onChange={(e) => handleInputChange('transferCode', e.target.value)}
                          placeholder="Ex: 1234567890"
                          maxLength={10}
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">Le code à 10 chiffres fourni par Western Union</p>
                      </div>

                      <div>
                        <Label htmlFor="senderName">Nom de l'expéditeur *</Label>
                        <Input
                          id="senderName"
                          value={formData.senderName}
                          onChange={(e) => handleInputChange('senderName', e.target.value)}
                          placeholder="Nom complet comme sur votre pièce d'identité"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="senderCountry">Pays d'envoi *</Label>
                          <Select value={formData.senderCountry} onValueChange={(value) => handleInputChange('senderCountry', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Belgique">Belgique</SelectItem>
                              <SelectItem value="Suisse">Suisse</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Maroc">Maroc</SelectItem>
                              <SelectItem value="Algérie">Algérie</SelectItem>
                              <SelectItem value="Tunisie">Tunisie</SelectItem>
                              <SelectItem value="Sénégal">Sénégal</SelectItem>
                              <SelectItem value="Côte d'Ivoire">Côte d'Ivoire</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="transferDate">Date du transfert *</Label>
                          <Input
                            id="transferDate"
                            type="date"
                            value={formData.transferDate}
                            onChange={(e) => handleInputChange('transferDate', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="transferAmount">Montant envoyé (€) *</Label>
                        <Input
                          id="transferAmount"
                          type="number"
                          value={formData.transferAmount}
                          onChange={(e) => handleInputChange('transferAmount', e.target.value)}
                          placeholder={westernUnionDetails.amount.toString()}
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">Doit correspondre à {westernUnionDetails.amount}€</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Conditions */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="confirmPayment"
                          checked={formData.confirmPayment}
                          onCheckedChange={(checked) => handleInputChange('confirmPayment', checked as boolean)}
                        />
                        <Label htmlFor="confirmPayment" className="text-sm leading-relaxed">
                          Je confirme avoir effectué le transfert Western Union et que toutes les informations fournies sont exactes
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreeTerms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                        />
                        <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                          J'accepte les <a href="#" className="text-blue-600 hover:underline">conditions générales</a> et la{' '}
                          <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a> *
                        </Label>
                      </div>
                    </div>

                    {/* Bouton de soumission */}
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                      disabled={isProcessing || !formData.agreeTerms || !formData.confirmPayment}
                    >
                      {isProcessing ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Confirmer le paiement
                        </>
                      )}
                    </Button>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 justify-center">
                      <Lock className="w-4 h-4" />
                      <span>Vos informations sont sécurisées et chiffrées</span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan sélectionné */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getPlanIcon(selectedPlan.id)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedPlan.name}</h3>
                      <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Facturation {selectedPlan.billingCycle === 'monthly' ? 'mensuelle' : 'annuelle'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Détails de facturation */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Plan {selectedPlan.name}</span>
                      <span>{selectedPlan.price}€</span>
                    </div>
                    
                    {selectedPlan.billingCycle === 'yearly' && selectedPlan.savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Économies annuelles</span>
                        <span>-{selectedPlan.savings}€</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>TVA (20%)</span>
                      <span>{Math.round(selectedPlan.price * 0.2)}€</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total à payer</span>
                    <span>{Math.round(selectedPlan.price * 1.2)}€</span>
                  </div>

                  {selectedPlan.billingCycle === 'yearly' && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Badge className="bg-green-100 text-green-800 mb-2">
                        Économisez {selectedPlan.savings}€ par an
                      </Badge>
                      <p className="text-sm text-green-700">
                        Soit {Math.round(selectedPlan.price / 12)}€/mois
                      </p>
                    </div>
                  )}

                  {/* Garanties */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Activation sous 24-48h</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Support client dédié</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Paiement 100% sécurisé</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Délai d'activation</p>
                        <p>Votre compte sera activé dans les 24-48h suivant la vérification de votre transfert</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
