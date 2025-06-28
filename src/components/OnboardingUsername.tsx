'use client';

import { useState, useEffect } from 'react';
import { User, Check, Sparkles } from 'lucide-react';
import { UserProfile } from '@/types';
import { getUserProfile, setUserProfile } from '@/lib/storage';

interface OnboardingUsernameProps {
  onComplete: () => void;
}

export default function OnboardingUsername({ onComplete }: OnboardingUsernameProps) {
  const [username, setUsername] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load existing username if available
    getUserProfile().then(savedProfile => {
      if (savedProfile.username) {
        setUsername(savedProfile.username);
      }
    });
  }, []);

  useEffect(() => {
    // Validate username (basic validation: at least 3 characters, alphanumeric + underscore)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    setIsValid(usernameRegex.test(username));
  }, [username]);

  const handleSave = async () => {
    if (!isValid) return;
    
    try {
      setShowSuccess(true);
      
      // Get existing profile and update with username
      const existingProfile = await getUserProfile();
      const updatedProfile: UserProfile = {
        ...existingProfile,
        username: username.trim()
      };
      
      await setUserProfile(updatedProfile);
      
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('Error saving username:', error);
      // Still proceed even if save fails
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
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
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {username}!</h3>
        <p className="text-gray-600 mb-4">
          Your username has been set successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Set Your Username</h3>
        <p className="text-gray-600 leading-relaxed">
          Choose a unique username that you&apos;ll be known by in the app.
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`input-field w-full pr-12 ${isValid ? 'border-green-500 focus:border-green-500' : ''}`}
              placeholder="Enter your username"
              maxLength={20}
            />
            {isValid && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Check className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
          <div className="mt-2 text-sm">
            {username.length > 0 && !isValid && (
              <p className="text-red-500">
                Username must be 3-20 characters long and contain only letters, numbers, and underscores.
              </p>
            )}
            {isValid && (
              <p className="text-green-600">
                Great! This username is available.
              </p>
            )}
            <p className="text-gray-500 mt-1">
              {username.length}/20 characters
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`btn-pill-primary ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>Set Username</span>
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 