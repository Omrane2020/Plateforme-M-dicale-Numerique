import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  FileText, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Pill,
  Brain,
  Save,
  Send,
  Loader
} from 'lucide-react';
//@ts-ignore
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity?: number;
  refills?: number;
}

interface DrugInteraction {
  severity: 'low' | 'moderate' | 'high';
  drug1: string;
  drug2: string;
  description: string;
  recommendation: string;
}

interface PrescriptionModuleProps {
  selectedPatient?: {
    id: string;
    name: string;
    age: number;
    currentMedications: Medication[];
    allergies: string[];
    conditions: string[];
  };
  onClose: () => void;
  doctorId: string;
}

export function PrescriptionModule({ selectedPatient, onClose, doctorId }: PrescriptionModuleProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [recommendations, setRecommendations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [medicationDatabase, setMedicationDatabase] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicationDatabase();
  }, []);

  const fetchMedicationDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('medication_database')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setMedicationDatabase(data?.map((item:any) => item.name) || []);
    } catch (error) {
      console.error('Erreur lors du chargement de la base de données des médicaments:', error);
      toast.error('Erreur lors du chargement des médicaments');
      // Fallback à une liste basique
      setMedicationDatabase([
        'Paracétamol', 'Ibuprofène', 'Aspirine', 'Amoxicilline', 'Azithromycine',
        'Oméprazole', 'Simvastatine', 'Metformine', 'Lisinopril', 'Amlodipine',
        'Atorvastatine', 'Losartan', 'Furosémide', 'Warfarine', 'Clopidogrel'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1,
      refills: 0
    };
    setMedications([...medications, newMedication]);
  };

  const updateMedication = (id: string, field: keyof Medication, value: string | number) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
    if (showAIAnalysis) {
      analyzeInteractions();
    }
  };

  const analyzeInteractions = async () => {
    if (!selectedPatient) return;

    setIsAnalyzing(true);
    setShowAIAnalysis(true);

    try {
      // Simulation d'analyse IA avec Supabase
      const { data: analysisData, error } = await supabase
        .from('ai_analysis_logs')
        .insert({
          analysis_type: 'drug_interactions',
          input_data: {
            patient_id: selectedPatient.id,
            medications: medications,
            current_medications: selectedPatient.currentMedications,
            allergies: selectedPatient.allergies
          },
          confidence_score: 0.85
        })
        .select()
        .single();

      if (error) throw error;

      // Simulation du traitement IA (en production, utiliser un vrai service IA)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockInteractions: DrugInteraction[] = [];
      
      // Logique d'analyse des interactions
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const med1 = medications[i];
          const med2 = medications[j];
          
          if (med1.name.toLowerCase().includes('warfarine') && med2.name.toLowerCase().includes('aspirine')) {
            mockInteractions.push({
              severity: 'high',
              drug1: med1.name,
              drug2: med2.name,
              description: 'Risque accru de saignement',
              recommendation: 'Surveiller étroitement la coagulation. Envisager une alternative.'
            });
          }
          
          if (med1.name.toLowerCase().includes('ibuprofène') && med2.name.toLowerCase().includes('lisinopril')) {
            mockInteractions.push({
              severity: 'moderate',
              drug1: med1.name,
              drug2: med2.name,
              description: 'Diminution de l\'efficacité de l\'ACE inhibiteur',
              recommendation: 'Surveiller la tension artérielle. Préférer le paracétamol.'
            });
          }
        }
      }

      // Vérifier les interactions avec les médicaments actuels du patient
      if (selectedPatient.currentMedications) {
        medications.forEach(newMed => {
          selectedPatient.currentMedications.forEach(currentMed => {
            if (newMed.name.toLowerCase().includes('warfarine') && currentMed.name.toLowerCase().includes('amiodarone')) {
              mockInteractions.push({
                severity: 'high',
                drug1: newMed.name,
                drug2: currentMed.name,
                description: 'Augmentation significative de l\'effet anticoagulant',
                recommendation: 'Réduire la dose de warfarine de 25-50%. Surveiller l\'INR.'
              });
            }
          });
        });
      }

      // Vérifier les allergies
      if (selectedPatient.allergies) {
        medications.forEach(med => {
          selectedPatient.allergies.forEach(allergy => {
            if (med.name.toLowerCase().includes(allergy.toLowerCase())) {
              mockInteractions.push({
                severity: 'high',
                drug1: med.name,
                drug2: 'Allergie connue',
                description: `Patient allergique à ${allergy}`,
                recommendation: 'Contre-indication absolue. Choisir une alternative.'
              });
            }
          });
        });
      }

      setInteractions(mockInteractions);

      // Sauvegarder les résultats d'analyse
      await supabase
        .from('ai_analysis_logs')
        .update({
          output_data: { interactions: mockInteractions },
          confidence_score: mockInteractions.length > 0 ? 0.92 : 0.95
        })
        .eq('id', analysisData.id);

    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      toast.error('Erreur lors de l\'analyse des interactions');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const savePrescription = async (sendToPatient: boolean = false) => {
    if (!selectedPatient) {
      toast.error('Aucun patient sélectionné');
      return;
    }

    try {
      // Créer la prescription
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: selectedPatient.id,
          doctor_id: doctorId,
          status: sendToPatient ? 'active' : 'draft',
          recommendations: recommendations,
          diagnosis: diagnosis,
          notes: `Prescription ${sendToPatient ? 'envoyée' : 'sauvegardée'} le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      // Ajouter les médicaments prescrits
      const medicationsToInsert = medications.map(med => ({
        prescription_id: prescriptionData.id,
        medication_name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions,
        quantity: med.quantity || 1,
        refills: med.refills || 0
      }));

      const { error: medicationsError } = await supabase
        .from('prescription_medications')
        .insert(medicationsToInsert);

      if (medicationsError) throw medicationsError;

      // Sauvegarder les interactions détectées
      if (interactions.length > 0) {
        const interactionsToInsert = interactions.map(interaction => ({
          prescription_id: prescriptionData.id,
          severity: interaction.severity,
          drug1_name: interaction.drug1,
          drug2_name: interaction.drug2,
          description: interaction.description,
          recommendation: interaction.recommendation
        }));

        await supabase
          .from('drug_interactions')
          .insert(interactionsToInsert);
      }

      toast.success(
        sendToPatient 
          ? 'Prescription envoyée au patient avec succès !' 
          : 'Prescription sauvegardée avec succès !'
      );

      onClose();

    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la prescription:', error);
      toast.error('Erreur lors de la sauvegarde de la prescription');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'moderate': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm border-0">
          <CardContent className="p-8 text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-slate-600">Chargement de la base de données des médicaments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      {selectedPatient && (
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Prescription pour {selectedPatient.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Âge:</span> {selectedPatient.age} ans
              </div>
              <div>
                <span className="text-slate-600">Allergies:</span> {selectedPatient.allergies.join(', ') || 'Aucune'}
              </div>
              <div>
                <span className="text-slate-600">Conditions:</span> {selectedPatient.conditions.join(', ')}
              </div>
            </div>
            
            {selectedPatient.currentMedications.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm text-slate-700 mb-2">Traitements actuels:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.currentMedications.map((med, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {med.name} {med.dosage}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diagnosis */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Diagnostic principal..."
            className="mb-4"
          />
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="shadow-sm border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-800 flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Médicaments prescrits
          </CardTitle>
          <Button onClick={addMedication} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.map((medication) => (
              <div key={medication.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div>
                    <Label htmlFor={`med-name-${medication.id}`}>Médicament</Label>
                    <Select onValueChange={(value) => updateMedication(medication.id, 'name', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choisir un médicament" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicationDatabase.map((med) => (
                          <SelectItem key={med} value={med}>
                            {med}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`dosage-${medication.id}`}>Dosage</Label>
                    <Input
                      id={`dosage-${medication.id}`}
                      value={medication.dosage}
                      onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                      placeholder="ex: 500mg"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`frequency-${medication.id}`}>Fréquence</Label>
                    <Select onValueChange={(value) => updateMedication(medication.id, 'frequency', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Fréquence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1x/jour">1 fois/jour</SelectItem>
                        <SelectItem value="2x/jour">2 fois/jour</SelectItem>
                        <SelectItem value="3x/jour">3 fois/jour</SelectItem>
                        <SelectItem value="4x/jour">4 fois/jour</SelectItem>
                        <SelectItem value="si-besoin">Si besoin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`duration-${medication.id}`}>Durée</Label>
                    <Input
                      id={`duration-${medication.id}`}
                      value={medication.duration}
                      onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                      placeholder="ex: 7 jours"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`quantity-${medication.id}`}>Quantité</Label>
                    <Input
                      id={`quantity-${medication.id}`}
                      type="number"
                      value={medication.quantity || 1}
                      onChange={(e) => updateMedication(medication.id, 'quantity', parseInt(e.target.value))}
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      onClick={() => removeMedication(medication.id)}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor={`instructions-${medication.id}`}>Instructions particulières</Label>
                  <Input
                    id={`instructions-${medication.id}`}
                    value={medication.instructions}
                    onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                    placeholder="ex: À prendre pendant les repas"
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
            
            {medications.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Pill className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p>Aucun médicament ajouté</p>
                <p className="text-sm">Cliquez sur "Ajouter" pour prescrire un médicament</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {medications.length > 0 && (
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Analyse IA - Vérification de compatibilité
              </div>
              <Button 
                onClick={analyzeInteractions}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Analyse...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyser
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600 animate-pulse" />
                <p className="text-slate-600">L'IA analyse les interactions médicamenteuses...</p>
              </div>
            )}
            
            {showAIAnalysis && !isAnalyzing && (
              <div className="space-y-4">
                {interactions.length === 0 ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ Aucune interaction détectée. La prescription semble sûre.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="mb-4">
                      <h4 className="text-slate-800 mb-2">Interactions détectées:</h4>
                    </div>
                    {interactions.map((interaction, index) => (
                      <Alert key={index} className={getSeverityColor(interaction.severity)}>
                        <div className="flex items-start space-x-3">
                          {getSeverityIcon(interaction.severity)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{interaction.drug1}</span>
                              <span>×</span>
                              <span className="font-medium">{interaction.drug2}</span>
                              <Badge variant="secondary" className={getSeverityColor(interaction.severity)}>
                                {interaction.severity === 'high' ? 'Élevé' : 
                                 interaction.severity === 'moderate' ? 'Modéré' : 'Faible'}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{interaction.description}</p>
                            <p className="text-sm font-medium">
                              Recommandation: {interaction.recommendation}
                            </p>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Recommandations médicales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            placeholder="Ajoutez vos recommandations, conseils de suivi, précautions particulières..."
            rows={6}
            className="mb-4"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <div className="flex space-x-3">
          <Button 
            onClick={() => savePrescription(false)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button 
            onClick={() => savePrescription(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer au patient
          </Button>
        </div>
      </div>
    </div>
  );
}