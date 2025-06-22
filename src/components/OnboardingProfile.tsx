'use client';

import { useState, useEffect } from 'react';
import { User, Check } from 'lucide-react';
import { UserProfile } from '@/types';
import { getUserProfile, setUserProfile, addWeightEntry, getTodayDateString, getWeightEntryByDate } from '@/lib/storage';

interface OnboardingProfileProps {
  onComplete: () => void;
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3 days/week)' },
  { value: 'moderately_active', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise 6-7 days/week)' },
  { value: 'extremely_active', label: 'Extremely Active (very hard exercise/physical job)' }
] as const;

export default function OnboardingProfile({ onComplete }: OnboardingProfileProps) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    getUserProfile().then(savedProfile => {
      setProfile(savedProfile);
    });
  }, []);

  useEffect(() => {
    // Check if required fields are filled
    const isValid = Boolean(
      profile.firstName &&
      profile.age &&
      profile.gender &&
      profile.height &&
      profile.weight &&
      profile.activityLevel
    );
    setIsFormValid(isValid);
    
    if (isValid) {
      // Save profile data immediately when form becomes valid
      const saveProfileAndComplete = async () => {
        try {
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
          
          onComplete();
        } catch (error) {
          console.error('❌ Error saving profile:', error);
          // Still complete onboarding even if save fails
          onComplete();
        }
      };
      saveProfileAndComplete();
    }
  }, [profile, onComplete]);

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      await setUserProfile(profile);
      onComplete();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-card-compact mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-primary">Tell us about yourself</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-secondary mb-2">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                value={profile.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="input-field-small w-full"
                placeholder="John"
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-secondary mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={profile.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="input-field-small w-full"
                placeholder="Doe"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-semibold text-secondary mb-2">
                Age *
              </label>
              <input
                id="age"
                type="number"
                min="1"
                max="120"
                value={profile.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                className="input-field-small w-full"
                placeholder="25"
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-secondary mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={profile.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="select-field-small w-full"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-semibold text-secondary mb-2">
                Height (cm) *
              </label>
              <input
                id="height"
                type="number"
                min="100"
                max="250"
                value={profile.height || ''}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                className="input-field-small w-full"
                placeholder="175"
                required
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-semibold text-secondary mb-2">
                Weight (kg) *
              </label>
              <input
                id="weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={profile.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className="input-field-small w-full"
                placeholder="70.5"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="activityLevel" className="block text-sm font-semibold text-secondary mb-2">
              Activity Level *
            </label>
            <select
              id="activityLevel"
              value={profile.activityLevel || ''}
              onChange={(e) => handleInputChange('activityLevel', e.target.value)}
              className="select-field-small w-full"
              required
            >
              <option value="">Select Activity Level</option>
              {ACTIVITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      <div className="text-center">
        <p className="text-sm text-secondary mb-4">
          Fields marked with * are required. This information helps us personalize your macro recommendations.
        </p>
        
        {isFormValid && (
          <div className="glass-card-compact bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-semibold">Profile information complete!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 