'use client';

import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { MacroGoals } from '@/types';
import { setMacroGoals } from '@/lib/storage';

interface GoalsSettingsProps {
  currentGoals: MacroGoals;
  onGoalsUpdated: (goals: MacroGoals) => void;
}

export default function GoalsSettings({ currentGoals, onGoalsUpdated }: GoalsSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [goals, setGoals] = useState(currentGoals);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validera värden
    if (goals.protein < 0 || goals.carbs < 0 || goals.fat < 0 || goals.calories < 0) {
      alert('Alla värden måste vara positiva');
      return;
    }

    setMacroGoals(goals);
    onGoalsUpdated(goals);
    setIsOpen(false);
  };

  const handleInputChange = (field: keyof MacroGoals, value: string) => {
    const numValue = parseInt(value) || 0;
    setGoals(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Ställ In Mål
      </button>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Makromål</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="protein" className="block text-sm font-semibold text-gray-900 mb-2">
            Protein (gram)
          </label>
          <input
            id="protein"
            type="number"
            min="0"
            value={goals.protein}
            onChange={(e) => handleInputChange('protein', e.target.value)}
            className="input-field"
            placeholder="150"
          />
        </div>

        <div>
          <label htmlFor="carbs" className="block text-sm font-semibold text-gray-900 mb-2">
            Kolhydrater (gram)
          </label>
          <input
            id="carbs"
            type="number"
            min="0"
            value={goals.carbs}
            onChange={(e) => handleInputChange('carbs', e.target.value)}
            className="input-field"
            placeholder="200"
          />
        </div>

        <div>
          <label htmlFor="fat" className="block text-sm font-semibold text-gray-900 mb-2">
            Fett (gram)
          </label>
          <input
            id="fat"
            type="number"
            min="0"
            value={goals.fat}
            onChange={(e) => handleInputChange('fat', e.target.value)}
            className="input-field"
            placeholder="70"
          />
        </div>

        <div>
          <label htmlFor="calories" className="block text-sm font-semibold text-gray-900 mb-2">
            Kalorier (kcal)
          </label>
          <input
            id="calories"
            type="number"
            min="0"
            value={goals.calories}
            onChange={(e) => handleInputChange('calories', e.target.value)}
            className="input-field"
            placeholder="2000"
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Spara Mål
        </button>
      </form>
    </div>
  );
} 