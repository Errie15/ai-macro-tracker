'use client';

import { useState, useEffect } from 'react';
import { User, Save, X, Plus, Trash2 } from 'lucide-react';
import { UserProfile, FitnessGoal } from '@/types';
import { getUserProfile, setUserProfile } from '@/lib/storage';

interface ProfileSettingsProps {
  onClose: () => void;
}

const FITNESS_GOAL_TYPES = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_muscle', label: 'Build Muscle' },
  { value: 'maintain_weight', label: 'Maintain Weight' },
  { value: 'improve_endurance', label: 'Improve Endurance' },
  { value: 'get_stronger', label: 'Get Stronger' },
  { value: 'improve_health', label: 'Improve Health' },
  { value: 'other', label: 'Other' }
] as const;

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3 days/week)' },
  { value: 'moderately_active', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise 6-7 days/week)' },
  { value: 'extremely_active', label: 'Extremely Active (very hard exercise/physical job)' }
] as const;

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [newGoal, setNewGoal] = useState<Partial<FitnessGoal>>({
    type: 'lose_weight',
    description: '',
    isActive: true
  });
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    getUserProfile().then(savedProfile => {
      console.log('📖 ProfileSettings loading profile:', savedProfile);
      setProfile(savedProfile);
    }).catch(error => {
      console.error('❌ Error loading profile in ProfileSettings:', error);
    });
  }, []);

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setUserProfile(profile);
    onClose();
  };

  const addFitnessGoal = () => {
    if (!newGoal.type) return;
    
    const goal: FitnessGoal = {
      id: Date.now().toString(),
      type: newGoal.type as FitnessGoal['type'],
      description: newGoal.description || '',
      targetDate: newGoal.targetDate,
      isActive: newGoal.isActive ?? true
    };

    setProfile(prev => ({
      ...prev,
      fitnessGoals: [...(prev.fitnessGoals || []), goal]
    }));

    setNewGoal({
      type: 'lose_weight',
      description: '',
      isActive: true
    });
    setShowAddGoal(false);
  };

  const removeGoal = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals?.filter(goal => goal.id !== goalId) || []
    }));
  };

  const toggleGoalActive = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals?.map(goal => 
        goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal
      ) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-primary">Profile Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-pill-secondary w-10 h-10 p-0 tap-effect"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-secondary mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={profile.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="input-field-small w-full"
                  placeholder="John"
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
                  Age
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
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-secondary mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={profile.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="select-field-small w-full"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-semibold text-secondary mb-2">
                  Height (cm)
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
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-semibold text-secondary mb-2">
                  Weight (kg)
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
                  placeholder="70"
                />
              </div>
            </div>

            <div>
              <label htmlFor="activityLevel" className="block text-sm font-semibold text-secondary mb-2">
                Activity Level
              </label>
              <select
                id="activityLevel"
                value={profile.activityLevel || ''}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                className="select-field-small w-full"
              >
                <option value="">Select Activity Level</option>
                {ACTIVITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fitness Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">Fitness Goals</h3>
              <button
                type="button"
                onClick={() => setShowAddGoal(true)}
                className="btn-pill-primary px-3 py-1 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Goal
              </button>
            </div>

            {profile.fitnessGoals && profile.fitnessGoals.length > 0 && (
              <div className="space-y-2">
                {profile.fitnessGoals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={goal.isActive}
                        onChange={() => toggleGoalActive(goal.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <span className={`font-medium ${goal.isActive ? 'text-primary' : 'text-secondary'}`}>
                          {FITNESS_GOAL_TYPES.find(type => type.value === goal.type)?.label}
                        </span>
                        {goal.description && (
                          <p className="text-sm text-secondary">{goal.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGoal(goal.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddGoal && (
              <div className="p-4 rounded-xl bg-white/5 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Goal Type
                  </label>
                  <select
                    value={newGoal.type || ''}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as FitnessGoal['type'] }))}
                    className="select-field-small w-full"
                  >
                    {FITNESS_GOAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newGoal.description || ''}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field-small w-full"
                    placeholder="Lose 10 kg by summer..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate || ''}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="input-field-small w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addFitnessGoal}
                    className="btn-pill-primary px-3 py-1 text-sm"
                  >
                    Add Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="btn-pill-secondary px-3 py-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="btn-pill-secondary px-6 py-2 tap-effect"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pill-primary px-6 py-2 tap-effect hover-lift"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 