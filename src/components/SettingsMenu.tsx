'use client';

import { useState } from 'react';
import { Settings, X, Target, Globe, Sun, Moon, User, LogOut } from 'lucide-react';
import { MacroGoals } from '@/types';
import GoalsSettings from './GoalsSettings';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, logout } = useAuth();

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
            
            {/* User Info */}
            {user && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-secondary" />
                  <div>
                    <span className="font-medium text-primary block">
                      {user.isAnonymous ? 'Guest User' : (user.displayName || user.email || 'User')}
                    </span>
                    {!user.isAnonymous && user.email && (
                      <span className="text-xs text-secondary">{user.email}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-secondary hover:text-red-400"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Settings Options */}
            <div className="space-y-3">
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

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-primary">Language</span>
                </div>
                <span className="text-sm text-secondary">English</span>
              </div>
            </div>
          </div>

          {/* Goals Settings Section */}
          <div className="flex-1 overflow-y-auto smooth-scroll p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-primary">Set Goals</h3>
              </div>
              <GoalsSettings 
                currentGoals={goals}
                onGoalsUpdated={onGoalsUpdated}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 