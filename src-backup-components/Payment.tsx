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
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Users,
  Star,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  userType: string | null;
  onLogout: () => void;
  selectedPlan: any;
}

export function Payment({ onNavigate, isAuthenticated, userType, onLogout, selectedPlan }: PaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sepa'>('card');
  const [formData, setFormData] = useState({
    // Informations de facturation
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    
    // Informations de paiement - Carte
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Informations de paiement - SEPA
    iban: '',
    bic: '',
    accountHolderName: '',
    
    // Options
    agreeTerms: false,
    savePaymentMethod: false,
    marketing: false
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error('Veuillez accepter les conditions générales');
      return;
    }

    setIsProcessing(true);
    
    // Simulation du traitement du paiement
    setTimeout(() => {
      toast.success('Paiement réussi ! Votre compte est maintenant actif.');
      setIsProcessing(false);
      onNavigate('doctor-dashboard');
    }, 3000);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Users className="w-5 h-5" />;
      case 'professional': return <Star className="w-5 h-5" />;
      case 'premium': return <Crown className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
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
            <h1 className="text-3xl font-bold text-gray-900">Finaliser votre commande</h1>
            <p className="text-gray-600 mt-2">Complétez votre inscription et activez votre compte</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire de paiement */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePayment} className="space-y-8">
                {/* Informations de facturation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de facturation</CardTitle>
                    <CardDescription>Ces informations apparaîtront sur votre facture</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Cabinet/Clinique</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Code postal *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Pays *</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Belgique">Belgique</SelectItem>
                            <SelectItem value="Suisse">Suisse</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Méthode de paiement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Méthode de paiement</span>
                    </CardTitle>
                    <CardDescription>Choisissez comment vous souhaitez payer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Sélection méthode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5" />
                          <div>
                            <h3 className="font-semibold">Carte bancaire</h3>
                            <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'sepa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('sepa')}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5" />
                          <div>
                            <h3 className="font-semibold">Prélèvement SEPA</h3>
                            <p className="text-sm text-gray-500">Virement automatique</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Formulaire carte */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardNumber">Numéro de carte *</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                            maxLength={19}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Date d'expiration *</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/AA"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                              maxLength={5}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cardName">Nom sur la carte *</Label>
                          <Input
                            id="cardName"
                            value={formData.cardName}
                            onChange={(e) => handleInputChange('cardName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Formulaire SEPA */}
                    {paymentMethod === 'sepa' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="iban">IBAN *</Label>
                          <Input
                            id="iban"
                            placeholder="FR76 1234 5678 9012 3456 7890 123"
                            value={formData.iban}
                            onChange={(e) => handleInputChange('iban', e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="bic">BIC/SWIFT</Label>
                          <Input
                            id="bic"
                            placeholder="BNPAFRPP"
                            value={formData.bic}
                            onChange={(e) => handleInputChange('bic', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="accountHolderName">Titulaire du compte *</Label>
                          <Input
                            id="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      <span>Vos informations de paiement sont sécurisées et chiffrées</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Conditions et options */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                      />
                      <Label htmlFor="agreeTerms" className="text-sm">
                        J'accepte les <a href="#" className="text-blue-600 hover:underline">conditions générales</a> et la <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a> *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="savePaymentMethod"
                        checked={formData.savePaymentMethod}
                        onCheckedChange={(checked) => handleInputChange('savePaymentMethod', checked as boolean)}
                      />
                      <Label htmlFor="savePaymentMethod" className="text-sm">
                        Sauvegarder cette méthode de paiement pour les prochains paiements
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="marketing"
                        checked={formData.marketing}
                        onCheckedChange={(checked) => handleInputChange('marketing', checked as boolean)}
                      />
                      <Label htmlFor="marketing" className="text-sm">
                        Je souhaite recevoir des informations sur les nouveautés et offres spéciales
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Bouton de paiement */}
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    'Traitement en cours...'
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Finaliser le paiement - {selectedPlan.price}€
                    </>
                  )}
                </Button>
              </form>
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
                    <span>Total</span>
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
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>14 jours d'essai gratuit</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Annulation à tout moment</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Paiement 100% sécurisé</span>
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
