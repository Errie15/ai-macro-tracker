'use client';

import { useState, useEffect } from 'react';
import { User, Check, Sparkles, Activity, Ruler, Weight, Briefcase, Footprints, Bike, Dumbbell, Zap, SkipForward, Target, Settings, Save, X, Calculator } from 'lucide-react';
import { UserProfile, MacroGoals } from '@/types';
import { getUserProfile, setUserProfile, addWeightEntry, getTodayDateString, getWeightEntryByDate, getMacroGoals, setMacroGoals } from '@/lib/storage';

interface OnboardingProfileProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const ACTIVITY_LEVELS = [
  { 
    value: 'sedentary', 
    label: 'Sedentary', 
    description: 'Little/no exercise',
    icon: Briefcase,
    multiplier: '1.2x BMR'
  },
  { 
    value: 'lightly_active', 
    label: 'Lightly Active', 
    description: 'Light exercise 1-3 days/week',
    icon: Footprints,
    multiplier: '1.375x BMR'
  },
  { 
    value: 'moderately_active', 
    label: 'Moderately Active', 
    description: 'Moderate exercise 3-5 days/week',
    icon: Bike,
    multiplier: '1.55x BMR'
  },
  { 
    value: 'very_active', 
    label: 'Very Active', 
    description: 'Hard exercise 6-7 days/week',
    icon: Dumbbell,
    multiplier: '1.725x BMR'
  },
  { 
    value: 'extremely_active', 
    label: 'Extremely Active', 
    description: 'Very hard exercise/physical job',
    icon: Zap,
    multiplier: '1.9x BMR'
  }
] as const;

export default function OnboardingProfile({ onComplete, onSkip }: OnboardingProfileProps) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [goals, setGoals] = useState<MacroGoals>({ calories: 2000, protein: 150, carbs: 200, fat: 70 });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGoalsSetup, setShowGoalsSetup] = useState(false);
  const [showGoalsMethodSelection, setShowGoalsMethodSelection] = useState(false);
  const [isManualCalories, setIsManualCalories] = useState(false);

  useEffect(() => {
    getUserProfile().then(savedProfile => {
      setProfile(savedProfile);
    });
    getMacroGoals().then(savedGoals => {
      setGoals(savedGoals);
    });
  }, []);

  useEffect(() => {
    // Check if required fields are filled
    const isValid = Boolean(
      profile.firstName &&
      profile.age &&
      profile.age >= 13 && profile.age <= 120 &&
      profile.gender &&
      profile.height &&
      profile.height >= 100 && profile.height <= 250 &&
      profile.weight &&
      profile.weight >= 30 && profile.weight <= 300 &&
      profile.activityLevel
    );
    setIsFormValid(isValid);
  }, [profile]);

  const handleSkip = () => {
    // Use onSkip prop if provided, otherwise use onComplete
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const handleSaveProfile = async () => {
    if (!isFormValid) return;
    
    try {
      setShowSuccess(true);
      console.log('💾 Saving profile data to Firebase:', profile);
      await setUserProfile(profile);
      console.log('✅ Profile saved successfully');
      
      // Add weight entry for today (this should be the ONLY place creating today's weight)
      if (profile.weight && profile.weight > 0) {
        const today = getTodayDateString();
        const existingEntry = await getWeightEntryByDate(today);
        
        if (!existingEntry) {
          console.log('⚖️ Adding initial weight entry for today:', profile.weight, 'kg');
          await addWeightEntry(profile.weight, today, 'Starting weight');
          console.log('✅ Weight entry saved successfully');
        } else {
          console.log('📋 Weight entry already exists for today, skipping duplicate');
        }
      }
      
      // Show goals setup option
      setTimeout(() => {
        setShowSuccess(false);
        setShowGoalsSetup(true);
      }, 1500);
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      // Still show goals setup even if save fails
      setTimeout(() => {
        setShowSuccess(false);
        setShowGoalsSetup(true);
      }, 1500);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Goals functionality (similar to GoalsSettings)
  const calculateCalories = (protein: number, carbs: number, fat: number) => {
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
  };

  const calculateAIMacros = () => {
    if (!profile.age || !profile.weight || !profile.height || !profile.gender || !profile.activityLevel) {
      alert('Please complete your profile first to use AI macro calculation');
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
  };

  const handleAICalculation = () => {
    const aiMacros = calculateAIMacros();
    if (aiMacros) {
      setGoals(aiMacros);
      setShowGoalsMethodSelection(false);
    }
  };

  const handleManualSetup = () => {
    setShowGoalsMethodSelection(false);
  };

  const handleSaveGoals = async () => {
    try {
      await setMacroGoals(goals);
      onComplete();
    } catch (error) {
      console.error('❌ Error saving goals:', error);
      onComplete();
    }
  };

  const handleSkipGoals = () => {
    onComplete();
  };

  const handleGoalsInputChange = (field: keyof MacroGoals, value: string) => {
    const numValue = parseInt(value) || 0;
    setGoals(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Auto-calculate calories when macros change (unless manual mode)
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
  }, [goals.protein, goals.carbs, goals.fat, goals.calories, isManualCalories]);

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

  // Goals Method Selection UI
  if (showGoalsSetup && showGoalsMethodSelection) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Set Your Macro Goals</h3>
          <p className="text-gray-600">Choose how you&apos;d like to set your daily nutritional targets</p>
        </div>

        <div className="grid gap-4">
          {/* AI Expert Option */}
          <button
            onClick={handleAICalculation}
            className="glass-card-compact p-6 hover:bg-white/20 transition-all duration-300 tap-effect hover-lift group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-800 mb-2">AI Expert Recommendation</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
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
            className="glass-card-compact p-6 hover:bg-white/20 transition-all duration-300 tap-effect hover-lift group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-gray-500/20 to-slate-500/20 group-hover:from-gray-500/30 group-hover:to-slate-500/30 transition-all duration-300">
                <Calculator className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-800 mb-2">Manual Setup</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
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

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={handleSkipGoals}
            className="btn-pill-secondary px-6 py-3"
          >
            <SkipForward className="w-5 h-5" />
            Skip Goals Setup
          </button>
        </div>
      </div>
    );
  }

  // Goals Setup UI
  if (showGoalsSetup && !showGoalsMethodSelection) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Set Your Goals</h3>
          <p className="text-gray-600">Configure your daily macro targets</p>
        </div>

        <div className="glass-card-compact space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="protein" className="block text-sm font-semibold text-gray-700">
                Protein (g)
              </label>
              <input
                id="protein"
                type="number"
                min="0"
                value={goals.protein}
                onChange={(e) => handleGoalsInputChange('protein', e.target.value)}
                className="input-field-small w-full"
                placeholder="150"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="carbs" className="block text-sm font-semibold text-gray-700">
                Carbs (g)
              </label>
              <input
                id="carbs"
                type="number"
                min="0"
                value={goals.carbs}
                onChange={(e) => handleGoalsInputChange('carbs', e.target.value)}
                className="input-field-small w-full"
                placeholder="200"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="fat" className="block text-sm font-semibold text-gray-700">
                Fat (g)
              </label>
              <input
                id="fat"
                type="number"
                min="0"
                value={goals.fat}
                onChange={(e) => handleGoalsInputChange('fat', e.target.value)}
                className="input-field-small w-full"
                placeholder="70"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="calories" className="block text-sm font-semibold text-gray-700">
                Calories (kcal)
                {!isManualCalories && (
                  <span className="text-xs text-gray-500 block">Auto calculation</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="calories"
                  type="number"
                  min="0"
                  value={goals.calories}
                  onChange={(e) => handleGoalsInputChange('calories', e.target.value)}
                  onFocus={handleCaloriesFocus}
                  className={`input-field-small w-full ${!isManualCalories ? 'bg-gray-50 text-gray-600' : ''}`}
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

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowGoalsMethodSelection(true)}
              className="btn-pill-secondary px-4 py-2"
            >
              <Settings className="w-4 h-4" />
              Switch Method
            </button>
            <button
              onClick={handleSkipGoals}
              className="btn-pill-secondary px-4 py-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
            <button
              onClick={handleSaveGoals}
              className="btn-pill-primary px-6 py-2"
            >
              <Save className="w-4 h-4" />
              Save Goals
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="relative">
          {/* Success animation */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Check className="w-12 h-12 text-white" />
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
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Profile Complete!</h3>
        <p className="text-gray-600">
          Great! We&apos;ve got everything we need to create your personalized experience.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Skip Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSkip}
          className="btn-pill-secondary flex items-center gap-2 text-sm"
        >
          <SkipForward className="w-4 h-4" />
          Skip This Step
        </button>
      </div>

      {/* Basic Info Section */}
      <div className="glass-card-compact">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
            <p className="text-gray-600 text-sm">Let&apos;s start with the basics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              value={profile.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="input-field-small w-full transition-all focus:scale-105"
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={profile.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="input-field-small w-full transition-all focus:scale-105"
              placeholder="Enter your last name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-semibold text-gray-700">
              Age *
            </label>
            <input
              id="age"
              type="number"
              min="1"
              max="120"
              value={profile.age || ''}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              className="input-field-small w-full transition-all focus:scale-105"
              placeholder="25"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
              Gender *
            </label>
            <select
              id="gender"
              value={profile.gender || ''}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="select-field-small w-full transition-all focus:scale-105"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Physical Stats Section */}
      <div className="glass-card-compact">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
            <Ruler className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Physical Stats</h3>
            <p className="text-gray-600 text-sm">Help us calculate your goals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="height" className="block text-sm font-semibold text-gray-700">
              Height (cm) *
            </label>
            <div className="relative">
              <input
                id="height"
                type="number"
                min="100"
                max="250"
                value={profile.height || ''}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                className="input-field-small w-full pl-12 transition-all focus:scale-105"
                placeholder="175"
                required
              />
              <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="weight" className="block text-sm font-semibold text-gray-700">
              Weight (kg) *
            </label>
            <div className="relative">
              <input
                id="weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={profile.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className="input-field-small w-full pl-12 transition-all focus:scale-105"
                placeholder="70.5"
                required
              />
              <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Level Section */}
      <div className="glass-card-compact">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Activity Level</h3>
            <p className="text-gray-600 text-sm">Choose what best describes your lifestyle</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACTIVITY_LEVELS.map((level) => (
            <div
              key={level.value}
              onClick={() => handleInputChange('activityLevel', level.value)}
              className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                profile.activityLevel === level.value
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-white/20 hover:border-white/40 bg-white/5'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-2 mx-auto">
                  <level.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{level.label}</h4>
                <p className="text-xs text-gray-600 mb-2">{level.description}</p>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs font-mono text-gray-600">
                  <span>BMR × {level.multiplier}</span>
                </div>
              </div>
              
              {profile.activityLevel === level.value && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          onClick={handleSaveProfile}
          disabled={!isFormValid}
          className="btn-pill-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-5 h-5" />
          Save Profile & Continue
        </button>
        
        {!isFormValid && (
          <p className="mt-3 text-sm text-gray-400">
            Please fill all required fields with valid values
          </p>
        )}
      </div>
    </div>
  );
} 