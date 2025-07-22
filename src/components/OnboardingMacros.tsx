'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Zap, Calculator, Sparkles, Check, Brain, TrendingUp, Flame, HelpCircle, Activity } from 'lucide-react';
import { MacroGoals, UserProfile } from '@/types';
import { getMacroGoals, setMacroGoals, getUserProfile } from '@/lib/storage';

interface OnboardingMacrosProps {
  onComplete: () => void;
  onNeedHelp?: () => void;
  showHelpButton?: boolean;
  showSuggested?: boolean;
}

type MacroSetupMethod = 'ai' | 'manual' | null;

export default function OnboardingMacros({ onComplete, onNeedHelp, showHelpButton = false, showSuggested = false }: OnboardingMacrosProps) {
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
  const handleComplete = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  }, [onComplete]);

  const calculateAIMacros = (profile: UserProfile): MacroGoals => {
    if (!profile.age || !profile.weight || !profile.height || !profile.gender || !profile.activityLevel || !profile.fitnessGoal) {
      // Fallback to default macros if profile is incomplete
      return { calories: 2000, protein: 150, carbs: 200, fat: 80 };
    }

    // 1. BMR calculation using Mifflin-St Jeor Equation
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    // 2. TDEE calculation with activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,           // Lite eller ingen träning
      lightly_active: 1.375,    // Träning 1–3 gånger per vecka
      moderately_active: 1.55,  // Träning 3–5 gånger per vecka
      very_active: 1.725,       // Träning 6–7 gånger per vecka
      extremely_active: 1.9     // 2 pass per dag eller mycket fysiskt arbete
    };

    const tdee = bmr * activityMultipliers[profile.activityLevel];
    
    // 3. Kalorimål baserat på mål
    let calories: number;
    switch (profile.fitnessGoal) {
      case 'maintain':
        calories = Math.round(tdee); // Behålla vikt: Kcal = TDEE
        break;
      case 'lose_fat':
        calories = Math.round(tdee * 0.80); // Gå ner i vikt: Kcal = TDEE x 0.80
        break;
      case 'build_muscle':
        calories = Math.round(tdee * 1.10); // Gå upp i vikt: Kcal = TDEE x 1.10
        break;
      default:
        calories = Math.round(tdee);
    }
    
    // 4. Makronutrientfördelning (gram) enligt exakta formler
    const protein = Math.round(profile.weight * 2.2); // Protein i gram = vikt i kg x 2.2
    const fat = Math.round(profile.weight * 0.9); // Fett i gram = vikt i kg x 0.9
    
    // Kolhydrater i kcal = Kalorimål – protein i kcal – fett i kcal
    // Kolhydrater i gram = kolhydrat i kcal / 4
    const carbsKcal = calories - (protein * 4) - (fat * 9);
    const carbs = Math.round(Math.max(carbsKcal / 4, 0)); // Ensure no negative carbs

    return {
      calories,
      protein: Math.max(protein, 100), // Minimum 100g protein
      carbs: Math.max(carbs, 50), // Minimum 50g carbs
      fat: Math.max(fat, 40) // Minimum 40g fat
    };
  };

  const handleAIGenerate = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      console.log('🧠 Starting AI macro generation...');
      const profile = await getUserProfile();
      console.log('👤 Loaded profile for AI calculation:', profile);
      
      // Check if profile is complete
      const isProfileComplete = Boolean(
        profile.age && 
        profile.weight && 
        profile.height && 
        profile.gender && 
        profile.activityLevel &&
        profile.fitnessGoal
      );
      
      if (!isProfileComplete) {
        console.warn('⚠️ Profile incomplete for AI calculation:', {
          hasAge: !!profile.age,
          hasWeight: !!profile.weight,
          hasHeight: !!profile.height,
          hasGender: !!profile.gender,
          hasActivityLevel: !!profile.activityLevel,
          hasFitnessGoal: !!profile.fitnessGoal
        });
      }
      
      // Simulate AI processing delay with realistic feel
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const aiMacros = calculateAIMacros(profile);
      console.log('🎯 Calculated AI macros:', aiMacros);
      
      setMacros(aiMacros);
      await setMacroGoals(aiMacros);
      console.log('✅ AI macros saved successfully');
      
      if (showSuggested) {
        setIsComplete(true);
        setSetupMethod('ai');
      } else {
        handleComplete();
      }
    } catch (error) {
      console.error('❌ Error generating AI macros:', error);
      // Don't fail silently - show user-friendly error
      alert('Unable to calculate personalized macros. Please ensure your profile information is complete and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [showSuggested, handleComplete]);

  // If showing suggested macros, automatically load AI-calculated ones
  useEffect(() => {
    if (showSuggested) {
      handleAIGenerate();
    }
  }, [showSuggested, handleAIGenerate]);

  const handleManualSave = async () => {
    try {
      await setMacroGoals(macros);
      handleComplete();
    } catch (error) {
      console.error('Error saving manual macros:', error);
    }
  };

  const handleMacroChange = (field: keyof MacroGoals, value: number) => {
    setMacros(prev => {
      const updatedMacros = {
        ...prev,
        [field]: Math.max(0, value)
      };
      
      // Auto-calculate calories when other macros change (except when directly editing calories)
      if (field !== 'calories') {
        updatedMacros.calories = updatedMacros.protein * 4 + updatedMacros.carbs * 4 + updatedMacros.fat * 9;
      }
      
      return updatedMacros;
    });
  };

  const handleNeedHelpClick = () => {
    if (onNeedHelp) {
      onNeedHelp();
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="relative">
          {/* Success animation */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Target className="w-10 h-10 text-white" />
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
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Goals Set!</h3>
        <p className="text-gray-600 mb-4">
          Your personalized macro targets are ready to go!
        </p>
        
        {/* Quick preview of macros */}
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
            <div className="text-lg font-bold text-orange-600">{macros.calories}</div>
            <div className="text-xs text-gray-600">Cal</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
            <div className="text-lg font-bold text-blue-600">{macros.protein}g</div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
            <div className="text-lg font-bold text-green-600">{macros.carbs}g</div>
            <div className="text-xs text-gray-600">Carbs</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
            <div className="text-lg font-bold text-purple-600">{macros.fat}g</div>
            <div className="text-xs text-gray-600">Fat</div>
          </div>
        </div>
      </div>
    );
  }

  // Show suggested macros view
  if (showSuggested) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Set your macro goals</h3>
          <p className="text-gray-600 leading-relaxed">
            Based on your personal information, here are our AI-recommended macro goals. You can still adjust them manually.
          </p>
        </div>

        {isGenerating ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center animate-spin">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Calculating Your Perfect Macros...</h3>
            <p className="text-gray-600">This will only take a moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Protein */}
              <div className="macro-block bg-gradient-to-br from-blue-500/20 to-cyan-500/20 relative overflow-hidden">
                <div className="absolute top-3 right-3 opacity-20">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <label className="font-bold text-gray-900 text-sm">Protein (g)</label>
                  </div>
                  <input
                    type="number"
                    value={macros.protein}
                    onChange={(e) => handleMacroChange('protein', parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent border-none text-2xl font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                    style={{ padding: 0 }}
                  />
                </div>
              </div>
              
              {/* Carbs */}
              <div className="macro-block bg-gradient-to-br from-green-500/20 to-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-3 right-3 opacity-20">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <label className="font-bold text-gray-900 text-sm">Carbs (g)</label>
                  </div>
                  <input
                    type="number"
                    value={macros.carbs}
                    onChange={(e) => handleMacroChange('carbs', parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent border-none text-2xl font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                    style={{ padding: 0 }}
                  />
                </div>
              </div>
              
              {/* Fat */}
              <div className="macro-block bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden">
                <div className="absolute top-3 right-3 opacity-20">
                  <Flame className="w-6 h-6 text-purple-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-purple-500" />
                    <label className="font-bold text-gray-900 text-sm">Fat (g)</label>
                  </div>
                  <input
                    type="number"
                    value={macros.fat}
                    onChange={(e) => handleMacroChange('fat', parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent border-none text-2xl font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                    style={{ padding: 0 }}
                  />
                </div>
              </div>
            </div>

            {/* Calories */}
            <div className="macro-block bg-gradient-to-br from-orange-500/20 to-red-500/20 relative overflow-hidden">
              <div className="absolute top-3 right-3 opacity-20">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <label className="font-bold text-gray-900 text-sm">Kcal (auto-calculated)</label>
                </div>
                <div className="text-2xl font-black text-gray-900">{macros.calories}</div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleManualSave}
                className="btn-pill-primary"
              >
                <span>Save your macros</span>
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default macros setup view
  if (setupMethod === null) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Set your macro goals</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Set your daily macro targets. You can choose manual entry or get help with personalized recommendations.
          </p>
          
          {/* Help section moved here */}
          {showHelpButton && (
            <div className="text-center mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-gray-700 mb-3 text-sm font-medium">Do you need help setting your macros?</p>
              <button
                onClick={handleNeedHelpClick}
                className="btn-pill-secondary"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Get Help</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Protein */}
            <div className="macro-block bg-gradient-to-br from-blue-500/20 to-cyan-500/20 relative overflow-hidden">
              <div className="absolute top-3 right-3 opacity-20">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <label className="font-bold text-gray-900 text-sm">Protein (g)</label>
                </div>
                <input
                  type="number"
                  value={macros.protein}
                  onChange={(e) => handleMacroChange('protein', parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-none text-2xl font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                  style={{ padding: 0 }}
                />
              </div>
            </div>
            
            {/* Carbs */}
            <div className="macro-block bg-gradient-to-br from-green-500/20 to-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-3 right-3 opacity-20">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <label className="font-bold text-gray-900 text-sm">Carbs (g)</label>
                </div>
                <input
                  type="number"
                  value={macros.carbs}
                  onChange={(e) => handleMacroChange('carbs', parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-none text-2xl font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                  style={{ padding: 0 }}
                />
              </div>
            </div>
            
            {/* Fat */}
            <div className="macro-block bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden">
              <div className="absolute top-3 right-3 opacity-20">
                <Flame className="w-6 h-6 text-purple-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-purple-500" />
                  <label className="font-bold text-gray-900 text-sm">Fat (g)</label>
                </div>
                <input
                  type="number"
                  value={macros.fat}
                  onChange={(e) => handleMacroChange('fat', parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-none text-2xl font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                  style={{ padding: 0 }}
                />
              </div>
            </div>
          </div>

          {/* Calories */}
          <div className="macro-block bg-gradient-to-br from-orange-500/20 to-red-500/20 relative overflow-hidden">
            <div className="absolute top-3 right-3 opacity-20">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-orange-500" />
                <label className="font-bold text-gray-900 text-sm">Kcal (auto-calculated)</label>
              </div>
              <div className="text-2xl font-black text-gray-900">{macros.calories}</div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleManualSave}
              className="btn-pill-primary"
            >
              <span>Save your macros</span>
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Manual setup view (keeping existing functionality)
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
            
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Personalized calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Science-based formulas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Goal-oriented targeting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Option */}
        <div 
          onClick={() => setSetupMethod('manual')}
          className="glass-card hover:bg-white/20 cursor-pointer transition-all hover-lift tap-effect group"
        >
          <div className="text-center p-2">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-500/25">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            
            <h4 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-500 transition-colors">
              Manual Setup
            </h4>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Already know your ideal macro split? Set your protein, carbs, and fat targets manually for complete control over your nutrition plan.
            </p>
            
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Full customization</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Instant setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Total control</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 