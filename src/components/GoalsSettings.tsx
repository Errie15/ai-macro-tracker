'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Save, X, Sparkles, Calculator } from 'lucide-react';
import { MacroGoals, UserProfile } from '@/types';
import { setMacroGoals, getUserProfile } from '@/lib/storage';

interface GoalsSettingsProps {
  currentGoals: MacroGoals;
  onGoalsUpdated: (goals: MacroGoals) => void;
}

export default function GoalsSettings({ currentGoals, onGoalsUpdated }: GoalsSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [goals, setGoals] = useState(currentGoals);
  const [isManualCalories, setIsManualCalories] = useState(false);
  const [showMethodSelection, setShowMethodSelection] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  // Update local state when currentGoals prop changes
  useEffect(() => {
    setGoals(currentGoals);
  }, [currentGoals]);

  // Load user profile when opening
  useEffect(() => {
    if (isOpen) {
      getUserProfile().then(profile => {
        setUserProfile(profile);
      });
    }
  }, [isOpen]);

  // Calculate calories automatically from macros
  const calculateCalories = useCallback((protein: number, carbs: number, fat: number) => {
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
  }, []);

  // AI-powered macro calculation (same logic as onboarding)
  const calculateAIMacros = useCallback(() => {
    if (!userProfile.age || !userProfile.weight || !userProfile.height || !userProfile.gender || !userProfile.activityLevel) {
      alert('Please complete your profile first to use AI macro calculation');
      return null;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (userProfile.gender === 'male') {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    } else {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = Math.round(bmr * activityMultipliers[userProfile.activityLevel]);

    // Calculate macros with optimal ratios
    const proteinPerKg = 2.2; // 2.2g per kg body weight
    const protein = Math.round(userProfile.weight * proteinPerKg);
    const fat = Math.round(tdee * 0.25 / 9); // 25% of calories from fat
    const carbs = Math.round((tdee - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs

    return {
      calories: tdee,
      protein,
      carbs,
      fat
    };
  }, [userProfile]);

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

  const handleAICalculation = () => {
    const aiMacros = calculateAIMacros();
    if (aiMacros) {
      setGoals(aiMacros);
      setShowMethodSelection(false);
    }
  };

  const handleManualSetup = () => {
    setShowMethodSelection(false);
  };

  const openMethodSelection = () => {
    setShowMethodSelection(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setShowMethodSelection(true);
        }}
        className="btn-pill-secondary flex items-center gap-2 hover-lift tap-effect"
      >
        <Settings className="w-5 h-5" />
        <span className="font-semibold">Set Goals</span>
      </button>
    );
  }

  // Method Selection UI
  if (showMethodSelection) {
    return (
      <div className="space-y-4 animate-slide-up">
        <div className="glass-card-strong max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary">How would you like to set your macros?</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowMethodSelection(false);
              }}
              className="btn-pill-secondary w-10 h-10 p-0 tap-effect"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-4">
            {/* AI Expert Option */}
            <button
              onClick={handleAICalculation}
              className="glass-card p-6 hover:bg-white/20 transition-all duration-300 tap-effect hover-lift group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-lg font-bold text-primary mb-2">AI Expert Recommendation</h4>
                  <p className="text-secondary text-sm leading-relaxed">
                    Let our AI calculate personalized macro goals based on your profile and fitness objectives.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded-full font-medium">
                      Recommended
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Manual Setup Option */}
            <button
              onClick={handleManualSetup}
              className="glass-card p-6 hover:bg-white/20 transition-all duration-300 tap-effect hover-lift group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-gray-500/20 to-slate-500/20 group-hover:from-gray-500/30 group-hover:to-slate-500/30 transition-all duration-300">
                  <Calculator className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-lg font-bold text-primary mb-2">Manual Setup</h4>
                  <p className="text-secondary text-sm leading-relaxed">
                    Set your own macro targets based on your personal preferences and experience.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs bg-gray-500/20 text-gray-600 px-2 py-1 rounded-full font-medium">
                      Advanced
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="glass-card-strong max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-primary">Set Your Goals</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={openMethodSelection}
              className="btn-pill-secondary text-xs px-3 py-1 tap-effect"
            >
              Switch Method
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-pill-secondary w-10 h-10 p-0 tap-effect"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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