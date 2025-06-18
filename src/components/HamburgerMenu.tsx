'use client';

import { useState } from 'react';
import { Menu, X, Target, Calendar, Sun, Moon } from 'lucide-react';
import { MacroGoals, MealEntry } from '@/types';
import GoalsSettings from './GoalsSettings';
import MealList from './MealList';

interface HamburgerMenuProps {
  goals: MacroGoals;
  todaysMeals: MealEntry[];
  onGoalsUpdated: (goals: MacroGoals) => void;
  onMealDeleted: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate: (page: 'home' | 'meals' | 'calendar') => void;
  currentPage: string;
}

export default function HamburgerMenu({ 
  goals, 
  todaysMeals, 
  onGoalsUpdated, 
  onMealDeleted,
  isDarkMode,
  onToggleTheme,
  onNavigate,
  currentPage
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'goals' | 'meals'>('goals');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavigation = (page: 'home' | 'meals' | 'calendar') => {
    onNavigate(page);
    closeMenu();
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-6 left-6 z-50 btn-pill-secondary w-14 h-14 p-0 tap-effect"
        aria-label="Öppna meny"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
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
        fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="glass-card-strong h-full rounded-none rounded-r-3xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">Meny</h2>
              <button
                onClick={onToggleTheme}
                className="btn-pill-secondary w-12 h-12 p-0"
                aria-label={isDarkMode ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Navigation Menu */}
            <div className="space-y-3">
              <button
                onClick={() => handleNavigation('home')}
                className={`
                  w-full flex items-center gap-3 py-3 px-4 rounded-2xl 
                  transition-all duration-200 text-left font-medium
                  ${currentPage === 'home' 
                    ? 'bg-white/20 text-primary' 
                    : 'text-secondary hover:text-primary hover:bg-white/10'
                  }
                `}
              >
                <Target className="w-5 h-5" />
                Hem
              </button>
              
              <button
                onClick={() => handleNavigation('meals')}
                className={`
                  w-full flex items-center gap-3 py-3 px-4 rounded-2xl 
                  transition-all duration-200 text-left font-medium
                  ${currentPage === 'meals' 
                    ? 'bg-white/20 text-primary' 
                    : 'text-secondary hover:text-primary hover:bg-white/10'
                  }
                `}
              >
                <Calendar className="w-5 h-5" />
                Dagens Måltider
                <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                  {todaysMeals.length}
                </span>
              </button>
              
              <button
                onClick={() => handleNavigation('calendar')}
                className={`
                  w-full flex items-center gap-3 py-3 px-4 rounded-2xl 
                  transition-all duration-200 text-left font-medium
                  ${currentPage === 'calendar' 
                    ? 'bg-white/20 text-primary' 
                    : 'text-secondary hover:text-primary hover:bg-white/10'
                  }
                `}
              >
                <Calendar className="w-5 h-5" />
                Kalender
                <span className="ml-auto text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                  Snart
                </span>
              </button>
            </div>
          </div>

          {/* Goals Settings Section */}
          <div className="flex-1 overflow-y-auto smooth-scroll p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Inställningar
              </h3>
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