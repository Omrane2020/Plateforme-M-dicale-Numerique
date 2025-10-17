import { useState } from 'react';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { Payment } from './components/Payment';
import type { UserType } from "./types";
import './styles/globals.css';

type Page = 'subscription-plans' | 'payment';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('subscription-plans');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setUserType(null);
    setSelectedPlan(null);
    setCurrentPage('subscription-plans');
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setCurrentPage('payment');
  };

  // ✅ Ici on cast en string pour correspondre à la prop attendue
  const navigate = (page: string) => setCurrentPage(page as Page);

  const renderPage = () => {
    switch (currentPage) {
      case 'subscription-plans':
        return (
          <SubscriptionPlans
            onNavigate={navigate} // ✅ plus d'erreur ici
            userType={userType}
            onLogout={handleLogout}
            onSelectPlan={handleSelectPlan}
            isAuthenticated={isAuthenticated} 
          />
        );
      case 'payment':
        return (
          <Payment
            onNavigate={navigate} // ✅ plus d'erreur ici aussi
            userType={userType}
            onLogout={handleLogout}
            selectedPlan={selectedPlan}
            isAuthenticated={isAuthenticated} 
          />
        );
      default:
        return (
          <SubscriptionPlans
            onNavigate={navigate}
            userType={userType}
            onLogout={handleLogout}
            onSelectPlan={handleSelectPlan}
            isAuthenticated={isAuthenticated} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderPage()}
    </div>
  );
}
