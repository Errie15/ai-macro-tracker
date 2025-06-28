'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Save, X, Sparkles, Calculator } from 'lucide-react';
import { MacroGoals, UserProfile } from '@/types';
import { setMacroGoals, getUserProfile, setUserProfile } from '@/lib/storage';

interface GoalsSettingsProps {
  currentGoals: MacroGoals;
  onGoalsUpdated: (goals: MacroGoals) => void;
}

export default function GoalsSettings({ currentGoals, onGoalsUpdated }: GoalsSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [goals, setGoals] = useState(currentGoals);
  const [isManualCalories, setIsManualCalories] = useState(false);
  const [showMethodSelection, setShowMethodSelection] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'ai' | 'manual' | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  // Update local state when currentGoals prop changes
  useEffect(() => {
    setGoals(currentGoals);
  }, [currentGoals]);

  // Load user profile when opening
  useEffect(() => {
    if (showPersonalInfo) {
      getUserProfile().then(profile => {
        setUserProfile(profile);
      });
    }
  }, [showPersonalInfo]);

  // Calculate calories automatically from macros
  const calculateCalories = useCallback((protein: number, carbs: number, fat: number) => {
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
  }, []);

  // AI-powered macro calculation
  const calculateAIMacros = useCallback((profile: UserProfile) => {
    if (!profile.age || !profile.weight || !profile.height || !profile.gender || !profile.activityLevel) {
      return null;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = Math.round(bmr * activityMultipliers[profile.activityLevel]);

    // Calculate macros with optimal ratios
    const proteinPerKg = 2.2; // 2.2g per kg body weight
    const protein = Math.round(profile.weight * proteinPerKg);
    const fat = Math.round(tdee * 0.25 / 9); // 25% of calories from fat
    const carbs = Math.round((tdee - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs

    return {
      calories: tdee,
      protein,
      carbs,
      fat
    };
  }, []);

  // Handle macro input changes with auto-calculation of calories
  const handleMacroChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    const newGoals = { ...goals, [macro]: value };
    
    // Auto-calculate calories unless user is manually setting them
    if (!isManualCalories) {
      newGoals.calories = calculateCalories(newGoals.protein, newGoals.carbs, newGoals.fat);
    }
    
    setGoals(newGoals);
  };

  // Handle profile input changes
  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle AI profile completion
  const handleAIProfileComplete = async () => {
    // Save profile
    await setUserProfile(userProfile);
    
    // Calculate AI macros
    const aiMacros = calculateAIMacros(userProfile);
    if (aiMacros) {
      setGoals(aiMacros);
      setShowPersonalInfo(false);
      setIsOpen(true);
    }
  };

  // Handle saving goals
  const handleSaveGoals = async () => {
    try {
      await setMacroGoals(goals);
      onGoalsUpdated(goals);
      setIsOpen(false);
      setSetupMethod(null);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  // Reset all states
  const handleClose = () => {
    setShowMethodSelection(false);
    setIsOpen(false);
    setShowPersonalInfo(false);
    setSetupMethod(null);
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
    setShowPersonalInfo(true);
  };

  const handleManualSetup = () => {
    setShowMethodSelection(false);
  };

  const openMethodSelection = () => {
    setShowMethodSelection(true);
  };

  return (
    <>
      {/* Set Goals Button */}
      <button
        onClick={() => setShowMethodSelection(true)}
        className="w-full btn-pill-secondary justify-between group"
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5" />
          <span>Set Goals</span>
        </div>
        <span className="text-xs opacity-70">Current: {currentGoals.calories} cal</span>
      </button>

      {/* Method Selection Modal */}
      {showMethodSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Update Macro Goals</h2>
              <button
                onClick={() => setShowMethodSelection(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                Choose how you&apos;d like to update your macro goals. We recommend AI-assisted setup for personalized, science-based recommendations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI-Assisted Option */}
                <div 
                  onClick={() => {
                    setSetupMethod('ai');
                    setShowMethodSelection(false);
                    setShowPersonalInfo(true);
                  }}
                  className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">AI-Assisted Setup</h4>
                  <p className="text-gray-600 text-sm text-center mb-4">
                    Get personalized recommendations based on your profile and goals
                  </p>
                  <div className="text-blue-600 font-semibold text-sm text-center">Recommended</div>
                </div>

                {/* Manual Option */}
                <div 
                  onClick={() => {
                    setSetupMethod('manual');
                    setShowMethodSelection(false);
                    setIsOpen(true);
                  }}
                  className="p-6 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Manual Setup</h4>
                  <p className="text-gray-600 text-sm text-center mb-4">
                    Set your protein, carbs, and fat targets manually
                  </p>
                  <div className="text-gray-600 font-semibold text-sm text-center">Full control</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information Modal for AI Setup */}
      {showPersonalInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Personal Information</h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600 leading-relaxed">
                Help us calculate your personalized macro goals by providing some basic information.
              </p>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="120"
                    value={userProfile.age || ''}
                    onChange={(e) => handleProfileChange('age', parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    placeholder="25"
                  />
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Gender
                  </label>
                  <select
                    value={userProfile.gender || ''}
                    onChange={(e) => handleProfileChange('gender', e.target.value)}
                    className="select-field w-full"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={userProfile.height || ''}
                    onChange={(e) => handleProfileChange('height', parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    placeholder="175"
                  />
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={userProfile.weight || ''}
                    onChange={(e) => handleProfileChange('weight', parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    placeholder="70"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Activity Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { value: 'sedentary', label: 'Sedentary', description: 'Little/no exercise' },
                    { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
                    { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
                    { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
                    { value: 'extremely_active', label: 'Extremely Active', description: 'Very hard exercise, physical job' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleProfileChange('activityLevel', level.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        userProfile.activityLevel === level.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fitness Goal */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Fitness Goal
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'lose_fat', label: 'Lose Fat', description: 'Reduce body fat percentage' },
                    { value: 'build_muscle', label: 'Build Muscle', description: 'Increase muscle mass' },
                    { value: 'maintain', label: 'Maintain', description: 'Maintain current physique' }
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => handleProfileChange('fitnessGoal', goal.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        userProfile.fitnessGoal === goal.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{goal.label}</div>
                      <div className="text-sm text-gray-600">{goal.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  onClick={handleAIProfileComplete}
                  disabled={!userProfile.age || !userProfile.gender || !userProfile.height || !userProfile.weight || !userProfile.activityLevel}
                  className={`btn-pill-primary ${
                    !userProfile.age || !userProfile.gender || !userProfile.height || !userProfile.weight || !userProfile.activityLevel
                      ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Calculate My Macros</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Macro Setup Modal - Using same style as onboarding */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {setupMethod === 'ai' ? 'AI-Suggested Macro Goals' : 'Set your macro goals'}
              </h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {setupMethod === 'ai' && (
              <div className="text-center mb-6">
                <p className="text-gray-600 leading-relaxed">
                  Based on your personal information, here are our AI-recommended macro goals. You can still adjust them if needed.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Protein */}
                <div className="macro-block bg-gradient-to-br from-blue-500/20 to-cyan-500/20 relative overflow-hidden">
                  <div className="absolute top-3 right-3 opacity-20">
                    <Settings className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <label className="font-bold text-gray-900 text-sm">Protein (g)</label>
                    </div>
                    <input
                      type="number"
                      value={goals.protein}
                      onChange={(e) => handleMacroChange('protein', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-2xl font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                      style={{ padding: 0 }}
                    />
                  </div>
                </div>
                
                {/* Carbs */}
                <div className="macro-block bg-gradient-to-br from-green-500/20 to-emerald-500/20 relative overflow-hidden">
                  <div className="absolute top-3 right-3 opacity-20">
                    <Settings className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-green-500" />
                      <label className="font-bold text-gray-900 text-sm">Carbs (g)</label>
                    </div>
                    <input
                      type="number"
                      value={goals.carbs}
                      onChange={(e) => handleMacroChange('carbs', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-2xl font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                      style={{ padding: 0 }}
                    />
                  </div>
                </div>
                
                {/* Fat */}
                <div className="macro-block bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden">
                  <div className="absolute top-3 right-3 opacity-20">
                    <Settings className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-purple-500" />
                      <label className="font-bold text-gray-900 text-sm">Fat (g)</label>
                    </div>
                    <input
                      type="number"
                      value={goals.fat}
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
                  <Settings className="w-6 h-6 text-orange-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-orange-500" />
                    <label className="font-bold text-gray-900 text-sm">Kcal (auto-calculated)</label>
                  </div>
                  <div className="text-2xl font-black text-gray-900">{goals.calories}</div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSaveGoals}
                  className="btn-pill-primary"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Goals</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 