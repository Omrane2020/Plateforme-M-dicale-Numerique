import React, { useState } from 'react';
import { Header } from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  Phone,
  Mail
} from 'lucide-react';


interface RequestAppointmentProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface AppointmentRequest {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  alternativeDate: string;
  alternativeTime: string;
  reason: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  notes: string;
}

export function RequestAppointment({ onNavigate, onLogout }: RequestAppointmentProps) {
  const [formData, setFormData] = useState<AppointmentRequest>({
    patientName: 'Marie Dubois', // Pre-filled for logged patient
    patientPhone: '06 12 34 56 78',
    patientEmail: 'marie.dubois@email.com',
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    alternativeDate: '',
    alternativeTime: '',
    reason: '',
    urgency: 'normal',
    notes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation générale', duration: '30 min' },
    { value: 'follow-up', label: 'Suivi médical', duration: '20 min' },
    { value: 'prescription', label: 'Renouvellement ordonnance', duration: '15 min' },
    { value: 'analysis', label: 'Résultats d\'analyses', duration: '20 min' },
    { value: 'emergency', label: 'Consultation urgente', duration: '45 min' },
    { value: 'prevention', label: 'Médecine préventive', duration: '45 min' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleInputChange = (field: keyof AppointmentRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!formData.appointmentType || !formData.preferredDate || !formData.preferredTime || !formData.reason) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    console.log('Appointment request submitted:', formData);
    setIsSubmitted(true);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Urgent</Badge>;
      case 'emergency':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Urgence</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header 
          onNavigate={onNavigate} 
          isAuthenticated={true} 
          userType="patient" 
          onLogout={onLogout} 
        />
        
        <div className="max-w-2xl mx-auto p-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              <h1 className="text-2xl text-slate-800 mb-4">
                Demande de rendez-vous envoyée !
              </h1>
              
              <p className="text-slate-600 mb-6">
                Votre demande de rendez-vous a été transmise au secrétariat du Dr. Martin. 
                Vous recevrez une confirmation par email ou téléphone dans les plus brefs délais.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-blue-800 mb-2">Récapitulatif de votre demande</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Type:</strong> {appointmentTypes.find(t => t.value === formData.appointmentType)?.label}</p>
                  <p><strong>Date préférée:</strong> {new Date(formData.preferredDate).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Heure préférée:</strong> {formData.preferredTime}</p>
                  <p><strong>Motif:</strong> {formData.reason}</p>
                  <p><strong>Urgence:</strong> {getUrgencyBadge(formData.urgency)}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => onNavigate('patient-dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Retour au Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      ...formData,
                      appointmentType: '',
                      preferredDate: '',
                      preferredTime: '',
                      alternativeDate: '',
                      alternativeTime: '',
                      reason: '',
                      urgency: 'normal',
                      notes: ''
                    });
                  }}
                  className="w-full"
                >
                  Nouvelle demande
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onNavigate={onNavigate} 
        isAuthenticated={true} 
        userType="patient" 
        onLogout={onLogout} 
      />
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl text-slate-800 mb-2 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-blue-600" />
                Demander un rendez-vous
              </h1>
              <p className="text-slate-600">
                Remplissez le formulaire pour demander un rendez-vous avec Dr. Martin
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate('patient-dashboard')}>
              ← Retour Dashboard
            </Button>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-blue-800 mb-1">Information importante</h3>
                <p className="text-blue-700 text-sm">
                  Votre demande sera traitée par notre secrétariat. Pour les urgences médicales, 
                  appelez directement le cabinet au <strong>01 23 45 67 89</strong> ou le 15 en cas d'urgence vitale.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Information */}
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Vos informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientName">Nom complet</Label>
                      <Input
                        id="patientName"
                        value={formData.patientName}
                        onChange={(e) => handleInputChange('patientName', e.target.value)}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientPhone">Téléphone</Label>
                      <Input
                        id="patientPhone"
                        value={formData.patientPhone}
                        onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="patientEmail">Email</Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      value={formData.patientEmail}
                      onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Details */}
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Détails du rendez-vous
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="appointmentType">Type de consultation *</Label>
                    <Select onValueChange={(value) => handleInputChange('appointmentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type de consultation" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} ({type.duration})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reason">Motif de la consultation *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      placeholder="Décrivez brièvement le motif de votre consultation..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency">Niveau d'urgence</Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le niveau d'urgence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal - Dans la semaine</SelectItem>
                        <SelectItem value="urgent">Urgent - Dans les 48h</SelectItem>
                        <SelectItem value="emergency">Urgence - Aujourd'hui</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Preferred Schedule */}
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Créneaux souhaités
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredDate">Date préférée *</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredTime">Heure préférée *</Label>
                      <Select onValueChange={(value) => handleInputChange('preferredTime', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir l'heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="alternativeDate">Date alternative (optionnel)</Label>
                      <Input
                        id="alternativeDate"
                        type="date"
                        value={formData.alternativeDate}
                        onChange={(e) => handleInputChange('alternativeDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="alternativeTime">Heure alternative (optionnel)</Label>
                      <Select onValueChange={(value) => handleInputChange('alternativeTime', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir l'heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Informations complémentaires (optionnel)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Précisions sur vos disponibilités, contraintes particulières..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary */}
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Type:</span>
                    <span className="text-slate-800">
                      {formData.appointmentType ? 
                        appointmentTypes.find(t => t.value === formData.appointmentType)?.label 
                        : 'Non sélectionné'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Date préférée:</span>
                    <span className="text-slate-800">
                      {formData.preferredDate ? 
                        new Date(formData.preferredDate).toLocaleDateString('fr-FR') 
                        : 'Non sélectionnée'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Heure:</span>
                    <span className="text-slate-800">{formData.preferredTime || 'Non sélectionnée'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Urgence:</span>
                    <span className="text-slate-800">{getUrgencyBadge(formData.urgency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Contact Cabinet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Téléphone</p>
                      <p className="text-slate-800">01 23 45 67 89</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="text-slate-800">cabinet@drmartin.fr</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Horaires</p>
                      <p className="text-slate-800 text-sm">Lun-Ven: 8h-18h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Card className="shadow-sm border-0">
                <CardContent className="p-4">
                  <Button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer la demande
                  </Button>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Vous recevrez une confirmation par email
                  </p>
                </CardContent>
              </Card>

              {/* Urgency Warning */}
              {formData.urgency === 'emergency' && (
                <Card className="shadow-sm border-0 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-red-800 mb-1">Urgence médicale</h4>
                        <p className="text-red-700 text-sm">
                          Pour une urgence immédiate, appelez directement le cabinet ou le 15.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
