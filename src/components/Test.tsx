// src/components/Test.tsx
import React from 'react';

type TestProps = {
  onNavigate: (page: string) => void;
};

export const Test: React.FC<TestProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
      <h1 className="text-3xl font-bold text-green-600">Ceci est la page Test</h1>
      <button
        onClick={() => onNavigate('home')}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retour à l'accueil
      </button>
    </div>
  );
};
