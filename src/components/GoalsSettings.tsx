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
        className="btn-pill-secondary flex items-center gap-2 hover-lift tap-effect"
      >
        <Settings className="w-5 h-5" />
        <span className="font-semibold">Ställ In Mål</span>
      </button>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="glass-card-strong">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Dina Makromål</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="btn-pill-secondary w-10 h-10 p-0 tap-effect"
            aria-label="Stäng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="protein" className="block text-sm font-bold text-white">
                Protein
              </label>
              <div className="relative">
                <input
                  id="protein"
                  type="number"
                  min="0"
                  value={goals.protein}
                  onChange={(e) => handleInputChange('protein', e.target.value)}
                  className="input-field-large min-h-[60px] text-center text-2xl font-bold pr-12"
                  placeholder="150"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium">
                  g
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="carbs" className="block text-sm font-bold text-white">
                Kolhydrater
              </label>
              <div className="relative">
                <input
                  id="carbs"
                  type="number"
                  min="0"
                  value={goals.carbs}
                  onChange={(e) => handleInputChange('carbs', e.target.value)}
                  className="input-field-large min-h-[60px] text-center text-2xl font-bold pr-12"
                  placeholder="200"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium">
                  g
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="fat" className="block text-sm font-bold text-white">
                Fett
              </label>
              <div className="relative">
                <input
                  id="fat"
                  type="number"
                  min="0"
                  value={goals.fat}
                  onChange={(e) => handleInputChange('fat', e.target.value)}
                  className="input-field-large min-h-[60px] text-center text-2xl font-bold pr-12"
                  placeholder="70"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium">
                  g
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="calories" className="block text-sm font-bold text-white">
                Kalorier
              </label>
              <div className="relative">
                <input
                  id="calories"
                  type="number"
                  min="0"
                  value={goals.calories}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                  className="input-field-large min-h-[60px] text-center text-2xl font-bold pr-16"
                  placeholder="2000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium">
                  kcal
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-pill-primary w-full text-lg py-4 tap-effect hover-lift"
          >
            <Save className="w-6 h-6" />
            <span className="font-bold">Spara Mål</span>
          </button>
        </form>
      </div>
    </div>
  );
} 