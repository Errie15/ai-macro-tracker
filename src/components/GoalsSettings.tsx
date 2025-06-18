'use client';

import { useState } from 'react';
import { Settings, Save, X } from 'lucide-react';
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
    
    // Validate values
    if (goals.protein < 0 || goals.carbs < 0 || goals.fat < 0 || goals.calories < 0) {
      alert('All values must be positive');
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
        className="btn-pill-secondary flex items-center gap-2 hover-lift tap-effect"
      >
        <Settings className="w-5 h-5" />
        <span className="font-semibold">Set Goals</span>
      </button>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="glass-card-strong max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-primary">Set Your Goals</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="btn-pill-secondary w-10 h-10 p-0 tap-effect"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="protein" className="block text-sm font-semibold text-secondary">
                Protein (g)
              </label>
              <input
                id="protein"
                type="number"
                min="0"
                value={goals.protein}
                onChange={(e) => handleInputChange('protein', e.target.value)}
                className="input-field-small"
                placeholder="150"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="carbs" className="block text-sm font-semibold text-secondary">
                Carbs (g)
              </label>
              <input
                id="carbs"
                type="number"
                min="0"
                value={goals.carbs}
                onChange={(e) => handleInputChange('carbs', e.target.value)}
                className="input-field-small"
                placeholder="200"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="fat" className="block text-sm font-semibold text-secondary">
                Fat (g)
              </label>
              <input
                id="fat"
                type="number"
                min="0"
                value={goals.fat}
                onChange={(e) => handleInputChange('fat', e.target.value)}
                className="input-field-small"
                placeholder="70"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="calories" className="block text-sm font-semibold text-secondary">
                Calories (kcal)
              </label>
              <input
                id="calories"
                type="number"
                min="0"
                value={goals.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                className="input-field-small"
                placeholder="2000"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-pill-secondary px-4 py-2 tap-effect text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pill-primary px-4 py-2 tap-effect hover-lift text-sm"
            >
              <Save className="w-4 h-4" />
              <span className="font-semibold">Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 