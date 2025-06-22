'use client';

import { useState, useEffect } from 'react';
import { Target, Zap, Calculator, Sparkles, Check } from 'lucide-react';
import { MacroGoals, UserProfile } from '@/types';
import { getMacroGoals, setMacroGoals, getUserProfile } from '@/lib/storage';

interface OnboardingMacrosProps {
  onComplete: () => void;
}

type MacroSetupMethod = 'ai' | 'manual' | null;

export default function OnboardingMacros({ onComplete }: OnboardingMacrosProps) {
  const [setupMethod, setSetupMethod] = useState<MacroSetupMethod>(null);
  const [macros, setMacros] = useState<MacroGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 80
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const loadExistingMacros = async () => {
      const existingMacros = await getMacroGoals();
      setMacros(existingMacros);
    };
    loadExistingMacros();
  }, []);

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const calculateAIMacros = (profile: UserProfile): MacroGoals => {
    if (!profile.age || !profile.weight || !profile.height || !profile.gender || !profile.activityLevel) {
      // Fallback to default macros if profile is incomplete
      return { calories: 2000, protein: 150, carbs: 200, fat: 80 };
    }

    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = bmr * activityMultipliers[profile.activityLevel];
    
    // Macro distribution based on common recommendations
    const calories = Math.round(tdee);
    const protein = Math.round(profile.weight * 2.2); // 2.2g per kg body weight
    const fat = Math.round(calories * 0.25 / 9); // 25% of calories from fat
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs

    return {
      calories,
      protein: Math.max(protein, 100), // Minimum 100g protein
      carbs: Math.max(carbs, 100), // Minimum 100g carbs
      fat: Math.max(fat, 50) // Minimum 50g fat
    };
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const profile = await getUserProfile();
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiMacros = calculateAIMacros(profile);
      setMacros(aiMacros);
      await setMacroGoals(aiMacros);
      
      setIsComplete(true);
    } catch (error) {
      console.error('Error generating AI macros:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = async () => {
    try {
      await setMacroGoals(macros);
      setIsComplete(true);
    } catch (error) {
      console.error('Error saving manual macros:', error);
    }
  };

  const handleMacroChange = (field: keyof MacroGoals, value: number) => {
    setMacros(prev => ({
      ...prev,
      [field]: Math.max(0, value)
    }));
  };

  if (setupMethod === null) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2">
        <div className="glass-card-compact mb-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-primary">How would you like to set your macros?</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {/* AI Option */}
            <div 
              onClick={() => setSetupMethod('ai')}
              className="glass-card hover:bg-white/20 cursor-pointer transition-all hover-lift tap-effect group"
            >
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-primary mb-2">AI Expert Recommendation</h4>
                <p className="text-secondary text-xs sm:text-sm mb-3">
                  Let our AI analyze your profile and generate personalized macro goals based on your age, weight, height, and activity level.
                </p>
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-blue-500">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-semibold">Recommended for beginners</span>
                </div>
              </div>
            </div>

            {/* Manual Option */}
            <div 
              onClick={() => setSetupMethod('manual')}
              className="glass-card hover:bg-white/20 cursor-pointer transition-all hover-lift tap-effect group"
            >
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-primary mb-2">Set Manually</h4>
                <p className="text-secondary text-xs sm:text-sm mb-3">
                  Have specific macro targets in mind? Set your own protein, carbs, fat, and calorie goals based on your preferences.
                </p>
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-green-500">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-semibold">For experienced users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (setupMethod === 'ai') {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <div className="glass-card-compact">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-primary">AI Macro Generation</h3>
          </div>

          {!isComplete && !isGenerating && (
            <div>
              <p className="text-secondary mb-8">
                Our AI will analyze your profile and create personalized macro goals tailored to your body composition, activity level, and fitness objectives.
              </p>
              <button
                onClick={handleAIGenerate}
                className="btn-pill-primary"
              >
                <Sparkles className="w-5 h-5" />
                Generate My Macros
              </button>
            </div>
          )}

          {isGenerating && (
            <div>
              <div className="w-16 h-16 mx-auto mb-4 animate-spin">
                <div className="w-full h-full border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
              </div>
              <p className="text-secondary">Analyzing your profile and generating optimal macros...</p>
            </div>
          )}

          {isComplete && (
            <div>
              <div className="glass-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Check className="w-6 h-6 text-green-600" />
                  <h4 className="text-lg font-bold text-green-800">Your Personalized Macros</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-600">{macros.calories}</div>
                    <div className="text-sm text-secondary">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-red-600">{macros.protein}g</div>
                    <div className="text-sm text-secondary">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-yellow-600">{macros.carbs}g</div>
                    <div className="text-sm text-secondary">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-600">{macros.fat}g</div>
                    <div className="text-sm text-secondary">Fat</div>
                  </div>
                </div>
              </div>
              <p className="text-green-600 font-semibold">✓ Macro goals saved successfully!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (setupMethod === 'manual') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="glass-card-compact">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-primary">Set Your Macro Goals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="calories" className="block text-sm font-semibold text-secondary mb-2">
                Daily Calories
              </label>
              <input
                id="calories"
                type="number"
                min="1000"
                max="5000"
                value={macros.calories}
                onChange={(e) => handleMacroChange('calories', parseInt(e.target.value) || 0)}
                className="input-field-small w-full"
              />
            </div>

            <div>
              <label htmlFor="protein" className="block text-sm font-semibold text-secondary mb-2">
                Protein (g)
              </label>
              <input
                id="protein"
                type="number"
                min="50"
                max="400"
                value={macros.protein}
                onChange={(e) => handleMacroChange('protein', parseInt(e.target.value) || 0)}
                className="input-field-small w-full"
              />
            </div>

            <div>
              <label htmlFor="carbs" className="block text-sm font-semibold text-secondary mb-2">
                Carbohydrates (g)
              </label>
              <input
                id="carbs"
                type="number"
                min="50"
                max="500"
                value={macros.carbs}
                onChange={(e) => handleMacroChange('carbs', parseInt(e.target.value) || 0)}
                className="input-field-small w-full"
              />
            </div>

            <div>
              <label htmlFor="fat" className="block text-sm font-semibold text-secondary mb-2">
                Fat (g)
              </label>
              <input
                id="fat"
                type="number"
                min="30"
                max="200"
                value={macros.fat}
                onChange={(e) => handleMacroChange('fat', parseInt(e.target.value) || 0)}
                className="input-field-small w-full"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleManualSave}
              className="btn-pill-primary"
            >
              <Target className="w-5 h-5" />
              Save My Macros
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 