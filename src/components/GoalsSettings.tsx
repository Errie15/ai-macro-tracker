'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [isManualCalories, setIsManualCalories] = useState(false);

  // Update local state when currentGoals prop changes
  useEffect(() => {
    setGoals(currentGoals);
  }, [currentGoals]);

  // Calculate calories automatically from macros
  const calculateCalories = useCallback((protein: number, carbs: number, fat: number) => {
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
  }, []);

  // Update calories automatically when macros change (unless manual mode)
  useEffect(() => {
    if (!isManualCalories && goals.protein >= 0 && goals.carbs >= 0 && goals.fat >= 0) {
      const calculatedCalories = calculateCalories(goals.protein, goals.carbs, goals.fat);
      if (calculatedCalories !== goals.calories) {
        setGoals(prev => ({
          ...prev,
          calories: calculatedCalories
        }));
      }
    }
  }, [goals.protein, goals.carbs, goals.fat, goals.calories, isManualCalories, calculateCalories]);

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

  const handleCaloriesFocus = () => {
    if (!isManualCalories) {
      const confirmManual = window.confirm(
        'Do you want to set calories manually instead of automatic calculation from macros?'
      );
      if (confirmManual) {
        setIsManualCalories(true);
      }
    }
  };

  const resetToAutoCalories = () => {
    setIsManualCalories(false);
    const calculatedCalories = calculateCalories(goals.protein, goals.carbs, goals.fat);
    setGoals(prev => ({
      ...prev,
      calories: calculatedCalories
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
                {!isManualCalories && (
                  <span className="text-xs text-gray-500 block">Automatic calculation</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="calories"
                  type="number"
                  min="0"
                  value={goals.calories}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                  onFocus={handleCaloriesFocus}
                  className={`input-field-small ${!isManualCalories ? 'bg-gray-50 text-gray-600' : ''}`}
                  placeholder="2000"
                  readOnly={!isManualCalories}
                />
                {isManualCalories && (
                  <button
                    type="button"
                    onClick={resetToAutoCalories}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Auto
                  </button>
                )}
              </div>
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