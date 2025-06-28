'use client';

import { useState, useEffect } from 'react';
import { User, Check, Sparkles, Activity, Ruler, Weight, Briefcase, Footprints, Bike, Dumbbell, Zap, Target, ArrowRight } from 'lucide-react';
import { UserProfile } from '@/types';
import { getUserProfile, setUserProfile, addWeightEntry, getTodayDateString, getWeightEntryByDate } from '@/lib/storage';

interface OnboardingProfileProps {
  onComplete: () => void;
  showReturnToMacros?: boolean;
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

const FITNESS_GOALS = [
  { value: 'lose_fat', label: 'Lose Fat', description: 'Reduce body fat percentage' },
  { value: 'build_muscle', label: 'Build Muscle', description: 'Increase muscle mass' },
  { value: 'maintain', label: 'Maintain', description: 'Maintain current physique' }
] as const;

const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to fitness and nutrition' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience with training' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced with fitness and nutrition' }
] as const;

export default function OnboardingProfile({ onComplete, showReturnToMacros = false }: OnboardingProfileProps) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    getUserProfile().then(savedProfile => {
      setProfile(savedProfile);
    });
  }, []);

  useEffect(() => {
    // Check if required fields are filled
    const isValid = Boolean(
      profile.age &&
      profile.age >= 13 && profile.age <= 120 &&
      profile.gender &&
      profile.height &&
      profile.height >= 100 && profile.height <= 250 &&
      profile.weight &&
      profile.weight >= 30 && profile.weight <= 300 &&
      profile.activityLevel &&
      profile.fitnessGoal &&
      profile.fitnessLevel
    );
    setIsFormValid(isValid);
  }, [profile]);

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
      
      // Navigate to next step
      setTimeout(() => {
        setShowSuccess(false);
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      // Still proceed even if save fails
      setTimeout(() => {
        setShowSuccess(false);
        onComplete();
      }, 1500);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="relative">
          {/* Success animation */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <User className="w-10 h-10 text-white" />
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
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Complete!</h3>
        <p className="text-gray-600 mb-4">
          {showReturnToMacros 
            ? "Now let's calculate your personalized macro goals."
            : "Your profile information has been saved successfully."
          }
        </p>
        
        {showReturnToMacros && (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
            <Target className="w-5 h-5" />
            Calculating your perfect macros...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Enter Personal Information</h3>
        <p className="text-gray-600 leading-relaxed">
          Help us personalize your macro recommendations with some basic information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <Activity className="w-4 h-4 inline mr-2" />
              Age
            </label>
            <input
              type="number"
              min="13"
              max="120"
              value={profile.age || ''}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              className="input-field w-full"
              placeholder="25"
            />
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Gender
            </label>
            <select
              value={profile.gender || ''}
              onChange={(e) => handleInputChange('gender', e.target.value)}
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
              <Ruler className="w-4 h-4 inline mr-2" />
              Height (cm)
            </label>
            <input
              type="number"
              min="100"
              max="250"
              value={profile.height || ''}
              onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
              className="input-field w-full"
              placeholder="175"
            />
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <Weight className="w-4 h-4 inline mr-2" />
              Weight (kg)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              value={profile.weight || ''}
              onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
              className="input-field w-full"
              placeholder="70"
            />
          </div>
        </div>

        {/* Fitness Level */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Fitness Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FITNESS_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => handleInputChange('fitnessLevel', level.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  profile.fitnessLevel === level.value
                    ? 'border-blue-500 bg-blue-50'
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
            {FITNESS_GOALS.map((goal) => (
              <button
                key={goal.value}
                onClick={() => handleInputChange('fitnessGoal', goal.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  profile.fitnessGoal === goal.value
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

        {/* Activity Level */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Activity Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACTIVITY_LEVELS.map((level) => {
              const IconComponent = level.icon;
              return (
                <button
                  key={level.value}
                  onClick={() => handleInputChange('activityLevel', level.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    profile.activityLevel === level.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-5 h-5 text-purple-600" />
                    <div className="font-semibold text-gray-800">{level.label}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{level.description}</div>
                  <div className="text-xs text-purple-600 font-medium">{level.multiplier}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={handleSaveProfile}
            disabled={!isFormValid}
            className={`btn-pill-primary ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{showReturnToMacros ? 'Calculate My Macros' : 'Save Profile'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 