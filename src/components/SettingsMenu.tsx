'use client';

import { useState, useEffect } from 'react';
import { Settings, X, Target, Globe, Sun, Moon, User, LogOut, HelpCircle } from 'lucide-react';
import { MacroGoals, UserProfile } from '@/types';
import GoalsSettings from './GoalsSettings';
import ProfileSettings from './ProfileSettings';
// import OnboardingHelp from './OnboardingHelp';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/storage';

interface SettingsMenuProps {
  goals: MacroGoals;
  onGoalsUpdated: (goals: MacroGoals) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function SettingsMenu({ 
  goals, 
  onGoalsUpdated, 
  isDarkMode,
  onToggleTheme
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      getUserProfile().then(profile => {
        setUserProfile(profile);
      });
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getDisplayName = () => {
    if (user?.isAnonymous) return 'Guest';
    
    // Use profile first name if available
    if (userProfile.firstName) {
      return userProfile.firstName;
    }
    
    // Fall back to auth display name or email
    if (user?.displayName) {
      return user.displayName.split(' ')[0]; // Get first name only
    }
    
    if (user?.email) {
      return user.email.split('@')[0]; // Use part before @ as name
    }
    
    return 'User';
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-6 right-6 z-50 btn-pill-secondary w-14 h-14 p-0 tap-effect"
        aria-label="Settings"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Settings className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="glass-card-strong h-full rounded-none rounded-l-3xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-primary mb-6">Settings</h2>
            
            {/* Compact User Info */}
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 mb-6">
                <User className="w-5 h-5 text-secondary" />
                <span className="font-medium text-primary">
                  {getDisplayName()}
                </span>
              </div>
            )}
            
            {/* Settings Options */}
            <div className="space-y-3">
              {/* Theme Setting */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
                <div className="flex items-center gap-3">
                  <Sun className={`w-5 h-5 ${isDarkMode ? 'text-secondary' : 'text-yellow-500'}`} />
                  <span className="font-medium text-primary">Theme</span>
                </div>
                <button
                  onClick={onToggleTheme}
                  className={`
                    w-12 h-6 rounded-full transition-all duration-300 relative
                    ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}
                  `}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <div className={`
                    w-5 h-5 bg-white rounded-full transition-transform duration-300 absolute top-0.5
                    ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}
                  `} />
                </button>
              </div>

              {/* Language Setting */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Language</span>
                </div>
                <span className="text-sm text-secondary">English</span>
              </div>

              {/* Profile Settings Button */}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors tap-effect"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Profile</span>
                </div>
                <span className="text-sm text-secondary">Edit →</span>
              </button>

              {/* Help/Onboarding Button */}
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors tap-effect"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Help & Tutorial</span>
                </div>
                <span className="text-sm text-secondary">Learn →</span>
              </button>

              {/* Logout Button */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-colors tap-effect"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-400" />
                    <span className="font-medium text-red-400">Sign Out</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Goals Settings Section */}
          <div className="flex-1 overflow-y-auto smooth-scroll p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-primary">Macro Goals</h3>
              </div>
              <GoalsSettings 
                currentGoals={goals}
                onGoalsUpdated={onGoalsUpdated}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      {showProfile && (
        <ProfileSettings onClose={() => setShowProfile(false)} />
      )}

      {/* Help Tutorial Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
          <div className="glass-card-strong m-4 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Help & Tutorial</h2>
              <button
                onClick={() => setShowOnboarding(false)}
                className="btn-pill-secondary w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-secondary">Tutorial content will be available here.</p>
          </div>
        </div>
      )}
    </>
  );
} 