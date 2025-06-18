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
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  
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

  // Load basic data on component mount (theme only)
  useEffect(() => {
    async function loadBasicData() {
      try {
        console.log('🔄 Page loaded, starting to load basic data...');
        
        // Load theme preference
        const savedTheme = localStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
        
        console.log('✅ Basic data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading basic data:', error);
      }
    }

    loadBasicData();
  }, []);

  // Load goals and meals when auth is ready
  useEffect(() => {
    async function loadDataWhenReady() {
      if (!loading) {
        console.log('🔐 Auth is ready! User:', user?.uid || 'No user');
        
        // Load goals
        try {
          console.log('🔄 Loading goals...');
          const savedGoals = await getMacroGoals();
          setGoals(savedGoals);
          console.log('✅ Goals loaded:', savedGoals);
        } catch (error) {
          console.error('❌ Error loading goals:', error);
        }
        
        // Load today's meals
        try {
          console.log('🔄 Loading today\'s meals...');
          const today = getTodayDateString();
          console.log('📅 Loading meals for date:', today);
          const meals = await getMealsByDate(today);
          console.log('📋 Found meals:', meals.length, meals);
          setTodaysMeals(meals);
          console.log('✅ Meals set in state');
        } catch (error) {
          console.error('❌ Error loading today\'s meals:', error);
        }
        
        console.log('✅ Data loading complete');
      } else {
        console.log('⏳ Still waiting for auth to load...');
      }
    }

    loadDataWhenReady();
  }, [loading, user]);

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

  const loadTodaysMeals = async () => {
    try {
      const today = getTodayDateString();
      console.log('📅 Loading meals for date:', today);
      const meals = await getMealsByDate(today);
      console.log('📋 Found meals:', meals.length, meals);
      setTodaysMeals(meals);
      console.log('✅ Meals set in state');
    } catch (error) {
      console.error('❌ Error loading today\'s meals:', error);
    }
  };

  const handleGoalsUpdated = async (newGoals: MacroGoals) => {
    try {
      console.log('🎯 Updating goals:', newGoals);
      setGoals(newGoals);
      await setMacroGoals(newGoals);
      console.log('✅ Goals updated successfully');
    } catch (error) {
      console.error('❌ Error updating goals:', error);
    }
  };

  const handleMealAdded = async () => {
    await loadTodaysMeals();
    setShowMealInput(false);
  };

  const handleMealDeleted = async () => {
    try {
      await loadTodaysMeals();
    } catch (error) {
      console.error('Error reloading meals after deletion:', error);
    }
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