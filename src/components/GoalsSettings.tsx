'use client';

import { useState } from 'react';
import { Settings, Save, Target, X } from 'lucide-react';
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
        className="btn-secondary micro-bounce micro-glow flex items-center gap-3 text-lg"
      >
        <Target className="w-5 h-5" />
        Ställ In Mål
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-dark-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full micro-bounce reveal">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Settings className="w-6 h-6 text-macro-protein" />
            Makromål
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-dark-700/30 transition-all duration-200 micro-bounce"
            aria-label="Stäng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Protein Input */}
          <div className="space-y-3">
            <label htmlFor="protein" className="block text-lg font-bold text-slate-100 flex items-center gap-2">
              <div className="w-3 h-3 bg-macro-protein rounded-full"></div>
              Protein (gram)
            </label>
            <div className="relative">
              <input
                id="protein"
                type="number"
                min="0"
                value={goals.protein}
                onChange={(e) => handleInputChange('protein', e.target.value)}
                className="input-field text-center text-xl font-bold"
                placeholder="150"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                g
              </div>
            </div>
          </div>

          {/* Carbs Input */}
          <div className="space-y-3">
            <label htmlFor="carbs" className="block text-lg font-bold text-slate-100 flex items-center gap-2">
              <div className="w-3 h-3 bg-macro-carbs rounded-full"></div>
              Kolhydrater (gram)
            </label>
            <div className="relative">
              <input
                id="carbs"
                type="number"
                min="0"
                value={goals.carbs}
                onChange={(e) => handleInputChange('carbs', e.target.value)}
                className="input-field text-center text-xl font-bold"
                placeholder="200"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                g
              </div>
            </div>
          </div>

          {/* Fat Input */}
          <div className="space-y-3">
            <label htmlFor="fat" className="block text-lg font-bold text-slate-100 flex items-center gap-2">
              <div className="w-3 h-3 bg-macro-fat rounded-full"></div>
              Fett (gram)
            </label>
            <div className="relative">
              <input
                id="fat"
                type="number"
                min="0"
                value={goals.fat}
                onChange={(e) => handleInputChange('fat', e.target.value)}
                className="input-field text-center text-xl font-bold"
                placeholder="70"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                g
              </div>
            </div>
          </div>

          {/* Calories Input */}
          <div className="space-y-3">
            <label htmlFor="calories" className="block text-lg font-bold text-slate-100 flex items-center gap-2">
              <div className="w-3 h-3 bg-macro-calories rounded-full"></div>
              Kalorier (kcal)
            </label>
            <div className="relative">
              <input
                id="calories"
                type="number"
                min="0"
                value={goals.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                className="input-field text-center text-xl font-bold"
                placeholder="2000"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                kcal
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-secondary flex-1 micro-bounce"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-3 micro-bounce micro-glow"
            >
              <Save className="w-5 h-5" />
              Spara Mål
            </button>
          </div>
        </form>

        {/* Quick presets */}
        <div className="mt-8 pt-6 border-t border-dark-600/30">
          <p className="text-slate-400 text-sm font-medium mb-4 text-center">💡 Snabba inställningar:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGoals({ protein: 120, carbs: 150, fat: 60, calories: 1600 })}
              className="p-3 bg-dark-700/30 hover:bg-dark-600/40 text-slate-300 hover:text-slate-200 rounded-soft text-sm font-medium transition-all duration-200 backdrop-blur-sm micro-bounce border border-dark-600/30 hover:border-macro-protein/50"
            >
              🏃‍♀️ Viktminskning
            </button>
            <button
              type="button" 
              onClick={() => setGoals({ protein: 180, carbs: 250, fat: 80, calories: 2400 })}
              className="p-3 bg-dark-700/30 hover:bg-dark-600/40 text-slate-300 hover:text-slate-200 rounded-soft text-sm font-medium transition-all duration-200 backdrop-blur-sm micro-bounce border border-dark-600/30 hover:border-macro-protein/50"
            >
              💪 Muskelbyggande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 