import React, { useState } from 'react';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Crown,
  Users,
  Shield,
  Heart,
  DollarSign,
  Layers
} from 'lucide-react';
import { useSubscriptions, type SubscriptionPlan,type SubscriptionFeature } from '../../contexts/SubscriptionContext';

interface SubscriptionManagementProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function SubscriptionManagement({ onNavigate, onLogout }: SubscriptionManagementProps) {
  const { plans, addPlan, updatePlan, deletePlan, togglePlanStatus } = useSubscriptions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'doctor' | 'clinic' | 'patient'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'doctor' as 'doctor' | 'clinic' | 'patient',
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    color: 'blue' as 'blue' | 'green' | 'purple' | 'orange',
    order: 1,
    features: [] as SubscriptionFeature[]
  });

  const [newFeature, setNewFeature] = useState('');

  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      description: '',
      category: 'doctor',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      color: 'blue',
      order: 1,
      features: []
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      category: plan.category,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      popular: plan.popular,
      color: plan.color,
      order: plan.order,
      features: [...plan.features]
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, { name: newFeature.trim(), included: true }]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleToggleFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.map((f, i) => 
        i === index ? { ...f, included: !f.included } : f
      )
    });
  };

  const handleAddPlan = async () => {
    try {
      // Créer un DTO sans l'ID (généré par le backend)
      await addPlan(formData);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du plan:', error);
      // L'erreur est déjà gérée dans le contexte
    }
  };

  const handleUpdatePlan = async () => {
    if (selectedPlan) {
      try {
        await updatePlan(selectedPlan.id, formData);
        setIsEditDialogOpen(false);
        setSelectedPlan(null);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du plan:', error);
        // L'erreur est déjà gérée dans le contexte
      }
    }
  };

  const handleDeletePlan = async () => {
    if (selectedPlan) {
      try {
        await deletePlan(selectedPlan.id);
        setIsDeleteDialogOpen(false);
        setSelectedPlan(null);
      } catch (error) {
        console.error('Erreur lors de la suppression du plan:', error);
        // L'erreur est déjà gérée dans le contexte
      }
    }
  };

  const filteredPlans = filterCategory === 'all' 
    ? plans 
    : plans.filter(p => p.category === filterCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'doctor': return <Users className="w-4 h-4" />;
      case 'clinic': return <Shield className="w-4 h-4" />;
      case 'patient': return <Heart className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'doctor': return 'Médecins';
      case 'clinic': return 'Cliniques';
      case 'patient': return 'Patients';
      default: return category;
    }
  };

  const getColorBadge = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onNavigate={onNavigate} onLogout={onLogout} activePage="subscription-management" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Abonnements</h1>
              <p className="text-gray-600 mt-2">
                Ajoutez, modifiez ou supprimez les plans d'abonnement affichés sur la plateforme
              </p>
            </div>
            <Button onClick={handleOpenAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Plan
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plans.length}</div>
                <p className="text-xs text-muted-foreground">
                  {plans.filter(p => p.active).length} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Médecins</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.category === 'doctor').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Plans médecins
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cliniques</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.category === 'clinic').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Plans cliniques
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients</CardTitle>
                <Heart className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plans.filter(p => p.category === 'patient').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Plans patients
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <Button
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('all')}
              >
                Tous ({plans.length})
              </Button>
              <Button
                variant={filterCategory === 'doctor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('doctor')}
              >
                <Users className="w-4 h-4 mr-1" />
                Médecins ({plans.filter(p => p.category === 'doctor').length})
              </Button>
              <Button
                variant={filterCategory === 'clinic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('clinic')}
              >
                <Shield className="w-4 h-4 mr-1" />
                Cliniques ({plans.filter(p => p.category === 'clinic').length})
              </Button>
              <Button
                variant={filterCategory === 'patient' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('patient')}
              >
                <Heart className="w-4 h-4 mr-1" />
                Patients ({plans.filter(p => p.category === 'patient').length})
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className={!plan.active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(plan.category)}
                      <Badge className={getColorBadge(plan.color)}>
                        {getCategoryLabel(plan.category)}
                      </Badge>
                    </div>
                    {plan.popular && (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <Star className="w-3 h-3 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {plan.monthlyPrice}€
                      </span>
                      <span className="text-gray-500">/mois</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {plan.yearlyPrice}€/an (économie de {plan.monthlyPrice * 12 - plan.yearlyPrice}€)
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      {plan.features.filter(f => f.included).length} fonctionnalités incluses
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={plan.active}
                        onCheckedChange={() => togglePlanStatus(plan.id)}
                      />
                      <span className="text-sm">
                        {plan.active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditDialog(plan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleOpenDeleteDialog(plan)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun plan trouvé dans cette catégorie.</p>
              <Button onClick={handleOpenAddDialog} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Créer un plan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddDialogOpen ? 'Ajouter un nouveau plan' : 'Modifier le plan'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du plan d'abonnement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom du plan</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Médecin Solo"
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Médecins</SelectItem>
                    <SelectItem value="clinic">Cliniques</SelectItem>
                    <SelectItem value="patient">Patients</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Pour les médecins débutants"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyPrice">Prix mensuel (€)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="yearlyPrice">Prix annuel (€)</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  value={formData.yearlyPrice}
                  onChange={(e) => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Couleur</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value: any) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Bleu</SelectItem>
                    <SelectItem value="green">Vert</SelectItem>
                    <SelectItem value="purple">Violet</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="order">Ordre d'affichage</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.popular}
                onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
              />
              <Label>Marquer comme populaire</Label>
            </div>

            <div>
              <Label>Fonctionnalités</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Nouvelle fonctionnalité"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                />
                <Button type="button" onClick={handleAddFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2 flex-1">
                      <Switch
                        checked={feature.included}
                        onCheckedChange={() => handleToggleFeature(index)}
                      />
                      <span className={!feature.included ? 'line-through text-gray-400' : ''}>
                        {feature.name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
              }}
            >
              Annuler
            </Button>
            <Button onClick={isAddDialogOpen ? handleAddPlan : handleUpdatePlan}>
              {isAddDialogOpen ? 'Ajouter' : 'Mettre à jour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le plan "{selectedPlan?.name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
