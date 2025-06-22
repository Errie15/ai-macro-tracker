'use client';

import { useState, useEffect } from 'react';
import { Target, Zap, Calculator, Sparkles, Check, Brain, TrendingUp, Flame } from 'lucide-react';
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
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadExistingMacros = async () => {
      const existingMacros = await getMacroGoals();
      setMacros(existingMacros);
    };
    loadExistingMacros();
  }, []);

  // Remove auto-completion - only complete when user explicitly confirms
  const handleComplete = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

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
      
      // Simulate AI processing delay with realistic feel
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const aiMacros = calculateAIMacros(profile);
      setMacros(aiMacros);
      await setMacroGoals(aiMacros);
      
      handleComplete();
    } catch (error) {
      console.error('Error generating AI macros:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = async () => {
    try {
      await setMacroGoals(macros);
      handleComplete();
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

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="relative">
          {/* Success animation */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Target className="w-12 h-12 text-white" />
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-ping" />
          </div>
          <div className="absolute top-8 left-1/3 transform -translate-x-1/2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute top-6 right-1/3 transform translate-x-1/2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Goals Set!</h3>
        <p className="text-gray-600 mb-4">
          Your personalized macro targets are ready to go!
        </p>
        
        {/* Quick preview of macros */}
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          <div className="glass-card-compact text-center">
            <div className="text-lg font-bold text-orange-500">{macros.calories}</div>
            <div className="text-xs text-gray-600">Cal</div>
          </div>
          <div className="glass-card-compact text-center">
            <div className="text-lg font-bold text-blue-500">{macros.protein}g</div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div className="glass-card-compact text-center">
            <div className="text-lg font-bold text-green-500">{macros.carbs}g</div>
            <div className="text-xs text-gray-600">Carbs</div>
          </div>
          <div className="glass-card-compact text-center">
            <div className="text-lg font-bold text-purple-500">{macros.fat}g</div>
            <div className="text-xs text-gray-600">Fat</div>
          </div>
        </div>
      </div>
    );
  }

  if (setupMethod === null) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Choose how you&apos;d like to set your daily macro targets. We recommend AI for personalized, science-based goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AI Option */}
          <div 
            onClick={() => setSetupMethod('ai')}
            className="glass-card hover:bg-white/20 cursor-pointer transition-all hover-lift tap-effect group relative overflow-hidden"
          >
            {/* Recommended badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
              RECOMMENDED
            </div>
            
            <div className="text-center p-2">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                {/* Animated ring */}
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-purple-400/50 animate-ping"></div>
              </div>
              
                        <h4 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-500 transition-colors">
            AI Recommendations
          </h4>
          <p className="text-gray-600 mb-6 leading-relaxed">
                Our smart AI analyzes your profile, goals, and body composition to create perfectly balanced macro targets tailored just for you.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-purple-500">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Science-based calculations</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-purple-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Personalized for your body</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-purple-500">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Instant setup</span>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Perfect for beginners
              </div>
            </div>
          </div>

          {/* Manual Option */}
          <div 
            onClick={() => setSetupMethod('manual')}
            className="glass-card hover:bg-white/20 cursor-pointer transition-all hover-lift tap-effect group"
          >
            <div className="text-center p-2">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-500/25">
                <Calculator className="w-10 h-10 text-white" />
              </div>
              
                        <h4 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-500 transition-colors">
            Manual Setup
          </h4>
          <p className="text-gray-600 mb-6 leading-relaxed">
                Have specific macro targets in mind? Set your own custom protein, carbs, fat, and calorie goals based on your preferences.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Full control</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <Calculator className="w-4 h-4" />
                  <span className="text-sm font-medium">Custom targets</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">Flexible approach</span>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-300 text-sm font-semibold">
                <Target className="w-4 h-4" />
                For experienced users
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
          
          {!isComplete && !isGenerating && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6 justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-left">
                          <h3 className="text-2xl font-bold text-gray-800">AI Macro Generator</h3>
        <p className="text-gray-600">Personalized recommendations just for you</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card-compact text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                              <h4 className="font-semibold text-gray-800 mb-2">Analyzes Profile</h4>
            <p className="text-sm text-gray-600">Uses your age, weight, height, and activity level</p>
                </div>
                
                <div className="glass-card-compact text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-green-500" />
                  </div>
                              <h4 className="font-semibold text-gray-800 mb-2">Calculates BMR</h4>
            <p className="text-sm text-gray-600">Science-based metabolic rate calculation</p>
                </div>
                
                <div className="glass-card-compact text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                              <h4 className="font-semibold text-gray-800 mb-2">Optimizes Macros</h4>
            <p className="text-sm text-gray-600">Perfect protein, carbs, and fat ratios</p>
                </div>
              </div>

              <button
                onClick={handleAIGenerate}
                className="btn-pill-primary text-xl px-8 py-4 group"
              >
                <Brain className="w-6 h-6 group-hover:animate-pulse" />
                Generate My Perfect Macros
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-8 py-8">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                
                {/* Animated rings */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-purple-400/30 animate-ping"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full border-2 border-blue-400/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">AI is Working Its Magic</h3>
        <div className="space-y-3 text-gray-600 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Analyzing your profile data...</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <span>Calculating optimal metabolic rate...</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <span>Optimizing macro distribution...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (setupMethod === 'manual') {
    const totalMacroCalories = (macros.protein * 4) + (macros.carbs * 4) + (macros.fat * 9);
    const isValidMacros = macros.calories > 0 && macros.protein > 0 && macros.carbs > 0 && macros.fat > 0;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500/20 to-teal-500/20 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Custom Macro Setup</h3>
          </div>
          <p className="text-gray-600">
            Set your own macro targets based on your specific goals and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Macro inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card-compact">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Daily Calories
                </div>
                <input
                  type="number"
                  min="1000"
                  max="5000"
                  value={macros.calories}
                  onChange={(e) => handleMacroChange('calories', parseInt(e.target.value) || 0)}
                  className="input-field-small w-full text-center text-xl font-bold transition-all focus:scale-105"
                  placeholder="2000"
                />
              </label>
            </div>

            <div className="glass-card-compact">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  Protein (g)
                </div>
                <input
                  type="number"
                  min="50"
                  max="400"
                  value={macros.protein}
                  onChange={(e) => handleMacroChange('protein', parseInt(e.target.value) || 0)}
                  className="input-field-small w-full text-center text-xl font-bold transition-all focus:scale-105"
                  placeholder="150"
                />
              </label>
            </div>

            <div className="glass-card-compact">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  Carbs (g)
                </div>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={macros.carbs}
                  onChange={(e) => handleMacroChange('carbs', parseInt(e.target.value) || 0)}
                  className="input-field-small w-full text-center text-xl font-bold transition-all focus:scale-105"
                  placeholder="200"
                />
              </label>
            </div>

            <div className="glass-card-compact">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  Fat (g)
                </div>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={macros.fat}
                  onChange={(e) => handleMacroChange('fat', parseInt(e.target.value) || 0)}
                  className="input-field-small w-full text-center text-xl font-bold transition-all focus:scale-105"
                  placeholder="80"
                />
              </label>
            </div>
          </div>

          {/* Macro breakdown visualization */}
          <div className="glass-card-compact">
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">Macro Breakdown</h4>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">{macros.protein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
                <div className="text-xs text-gray-500">{macros.protein * 4} calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{macros.carbs}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
                <div className="text-xs text-gray-500">{macros.carbs * 4} calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">{macros.fat}g</div>
                <div className="text-sm text-gray-600">Fat</div>
                <div className="text-xs text-gray-500">{macros.fat * 9} calories</div>
              </div>
            </div>
            
            {Math.abs(totalMacroCalories - macros.calories) > 50 && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-yellow-400 text-sm text-center">
                  ⚠️ Your macro calories ({totalMacroCalories}) don&apos;t match your target calories ({macros.calories})
                </p>
              </div>
            )}
          </div>

          {/* Save button */}
          <div className="text-center">
            <button
              onClick={handleManualSave}
              disabled={!isValidMacros}
              className="btn-pill-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              Save My Custom Macros
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 