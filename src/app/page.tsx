'use client';

import { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { MacroGoals, MealEntry, MacroNutrients } from '@/types';
import { getMacroGoals, setMacroGoals, getAllMeals, getMealsByDate, getTodayDateString } from '@/lib/storage';
import MacroProgress from '@/components/MacroProgress';
import MealInput from '@/components/MealInput';
import SettingsMenu from '@/components/SettingsMenu';
import BottomNavigation from '@/components/BottomNavigation';
import MealsPage from '@/components/MealsPage';
import CalendarPage from '@/components/CalendarPage';
import ProtectedRoute from '@/components/ProtectedRoute';

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
      <ProtectedRoute>
        <div className="min-h-screen smooth-scroll relative pb-12">
          <SettingsMenu
            goals={goals}
            onGoalsUpdated={handleGoalsUpdated}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
          <MealsPage
            meals={todaysMeals}
            onMealDeleted={handleMealDeleted}
            onBack={() => setCurrentPage('home')}
            onAddMeal={openMealInput}
          />
          <BottomNavigation
            currentPage={currentPage}
            onNavigate={handleNavigation}
            onAddMeal={openMealInput}
            mealsCount={todaysMeals.length}
          />
        </div>
      </ProtectedRoute>
    );
  }

  if (currentPage === 'calendar') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen smooth-scroll relative pb-12">
          <SettingsMenu
            goals={goals}
            onGoalsUpdated={handleGoalsUpdated}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
          <CalendarPage
            onBack={() => setCurrentPage('home')}
            onAddMeal={openMealInput}
          />
          <BottomNavigation
            currentPage={currentPage}
            onNavigate={handleNavigation}
            onAddMeal={openMealInput}
            mealsCount={todaysMeals.length}
          />
        </div>
      </ProtectedRoute>
    );
  }

  // Default home page
  return (
    <ProtectedRoute>
      <div className="min-h-screen smooth-scroll relative pb-12">
        <SettingsMenu
          goals={goals}
          onGoalsUpdated={handleGoalsUpdated}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        <div className="pt-20 pb-8 px-4">
          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Today's Progress */}
            <div className="animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Today&apos;s Progress</h2>
                <span className="text-sm text-tertiary">
                  {todaysMeals.length} meals
                </span>
              </div>
              
              <MacroProgress
                totalMacros={totalMacros}
                goals={goals}
              />
            </div>

          </div>
        </div>

        <BottomNavigation
          currentPage={currentPage}
          onNavigate={handleNavigation}
          onAddMeal={openMealInput}
          mealsCount={todaysMeals.length}
        />

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
    </ProtectedRoute>
  );
} 