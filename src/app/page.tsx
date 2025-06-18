'use client';

import { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { MacroGoals, MealEntry, MacroNutrients } from '@/types';
import { getMacroGoals, setMacroGoals, getAllMeals, getMealsByDate, getTodayDateString } from '@/lib/storage';
import MacroProgress from '@/components/MacroProgress';
import MealInput from '@/components/MealInput';
import HamburgerMenu from '@/components/HamburgerMenu';
import MealsPage from '@/components/MealsPage';
import CalendarPage from '@/components/CalendarPage';

export default function Home() {
  const [goals, setGoals] = useState<MacroGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 80
  });
  
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([]);
  const [totalMacros, setTotalMacros] = useState<MacroNutrients>({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
  });
  const [showMealInput, setShowMealInput] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'meals' | 'calendar'>('home');

  // Load data on component mount
  useEffect(() => {
    const savedGoals = getMacroGoals();
    setGoals(savedGoals);
    
    loadTodaysMeals();
    
    // Load theme preference
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme !== null) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Calculate total macros when meals change
  useEffect(() => {
    const newTotalMacros = todaysMeals.reduce(
      (total, meal) => ({
        protein: total.protein + meal.macros.protein,
        carbs: total.carbs + meal.macros.carbs,
        fat: total.fat + meal.macros.fat,
        calories: total.calories + meal.macros.calories,
      }),
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
    
    setTotalMacros(newTotalMacros);
  }, [todaysMeals]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const loadTodaysMeals = () => {
    const today = getTodayDateString();
    const meals = getMealsByDate(today);
    setTodaysMeals(meals);
  };

  const handleGoalsUpdated = (newGoals: MacroGoals) => {
    setGoals(newGoals);
    setMacroGoals(newGoals);
  };

  const handleMealAdded = () => {
    loadTodaysMeals();
    setShowMealInput(false);
  };

  const handleMealDeleted = () => {
    loadTodaysMeals();
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('isDarkMode', JSON.stringify(newTheme));
  };

  const handleNavigation = (page: 'home' | 'meals' | 'calendar') => {
    setCurrentPage(page);
    // Close meal input when navigating
    setShowMealInput(false);
  };

  const openMealInput = () => {
    setShowMealInput(true);
    // Navigate to home if not already there
    if (currentPage !== 'home') {
      setCurrentPage('home');
    }
  };

  // Render different pages
  if (currentPage === 'meals') {
    return (
      <>
        <HamburgerMenu
          goals={goals}
          todaysMeals={todaysMeals}
          onGoalsUpdated={handleGoalsUpdated}
          onMealDeleted={handleMealDeleted}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigate={handleNavigation}
          currentPage={currentPage}
        />
        <MealsPage
          meals={todaysMeals}
          onMealDeleted={handleMealDeleted}
          onBack={() => setCurrentPage('home')}
          onAddMeal={openMealInput}
        />
      </>
    );
  }

  if (currentPage === 'calendar') {
    return (
      <>
        <HamburgerMenu
          goals={goals}
          todaysMeals={todaysMeals}
          onGoalsUpdated={handleGoalsUpdated}
          onMealDeleted={handleMealDeleted}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigate={handleNavigation}
          currentPage={currentPage}
        />
        <CalendarPage
          onBack={() => setCurrentPage('home')}
          onAddMeal={openMealInput}
        />
      </>
    );
  }

  // Default home page
  return (
    <div className="min-h-screen smooth-scroll relative">
      <HamburgerMenu
        goals={goals}
        todaysMeals={todaysMeals}
        onGoalsUpdated={handleGoalsUpdated}
        onMealDeleted={handleMealDeleted}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />

      <div className="pt-20 pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-primary">AI Hälsocoach</span>
            </div>
            
            <h1 className="text-display">
              Spåra dina{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                makron
              </span>
            </h1>
            
            <p className="text-lg text-secondary max-w-md mx-auto">
              Använd AI för att analysera dina måltider och nå dina hälsomål
            </p>
          </div>

          {/* Add Meal Button - Large Pill */}
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={() => setShowMealInput(true)}
              className="btn-pill-primary text-lg px-8 py-4 w-full max-w-sm hover-lift tap-effect"
            >
              <Plus className="w-6 h-6" />
              Lägg till måltid
            </button>
          </div>

          {/* Today's Progress */}
          <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Dagens Framsteg</h2>
              <span className="text-sm text-tertiary">
                {todaysMeals.length} måltider
              </span>
            </div>
            
            <MacroProgress
              totalMacros={totalMacros}
              goals={goals}
            />
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      {!showMealInput && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setShowMealInput(true)}
            className="btn-pill-primary w-16 h-16 p-0 shadow-2xl hover-lift tap-effect"
            aria-label="Snabblägg till måltid"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Meal Input Modal */}
      {showMealInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md">
            <MealInput
              onMealAdded={handleMealAdded}
              onCancel={() => setShowMealInput(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 