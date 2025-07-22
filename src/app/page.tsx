'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { MacroGoals, MealEntry, MacroNutrients } from '@/types';
import { getMacroGoals, setMacroGoals, getAllMeals, getMealsByDate, getTodayDateString } from '@/lib/storage';
import MacroProgress from '@/components/MacroProgress';
import MealInput from '@/components/MealInput';
import SettingsMenu from '@/components/SettingsMenu';
import BottomNavigation from '@/components/BottomNavigation';
import MealsPage from '@/components/MealsPage';
import CalendarPage from '@/components/CalendarPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import InstallPrompt from '@/components/InstallPrompt';
import AdBanner from '@/components/AdBanner';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading, refreshTrigger } = useAuth();
  
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

  // Load theme on component mount
  useEffect(() => {
    async function loadTheme() {
      try {
        console.log('🔄 Page loaded, starting to load theme...');
        
        // Load theme preference from Firebase
        const { getUserTheme } = await import('@/lib/storage');
        const savedTheme = await getUserTheme();
        setIsDarkMode(savedTheme);
        
        console.log('✅ Theme loaded successfully');
      } catch (error) {
        console.error('❌ Error loading theme:', error);
        // Default to dark mode on error
        setIsDarkMode(true);
      }
    }

    loadTheme();
  }, []);

  // Load goals and meals when auth is ready
  useEffect(() => {
    async function loadDataWhenReady() {
      if (!loading) {
        console.log('🔐 Auth is ready! User:', user?.uid || 'No user');
        
        // Load goals first
        try {
          console.log('🔄 Loading goals...');
          const savedGoals = await getMacroGoals();
          console.log('📊 Goals loaded from database:', savedGoals);
          setGoals(savedGoals);
          console.log('✅ Goals set in state');
        } catch (error) {
          console.error('❌ Error loading goals:', error);
        }
        
        // Then load meals
        console.log('🔄 Loading today\'s meals...');
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
        
        console.log('✅ All data loading complete');
      } else {
        console.log('⏳ Still waiting for auth to load...');
      }
    }

    loadDataWhenReady();
  }, [loading, user]);

  // Reload goals when onboarding completes (refreshTrigger changes)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('🔄 Refresh trigger activated! Reloading macro goals after onboarding...');
      const reloadGoals = async () => {
        try {
          const savedGoals = await getMacroGoals();
          console.log('📊 Fresh goals loaded after onboarding:', savedGoals);
          setGoals(savedGoals);
          console.log('✅ Goals refreshed in UI');
        } catch (error) {
          console.error('❌ Error reloading goals after onboarding:', error);
        }
      };
      reloadGoals();
    }
  }, [refreshTrigger]);

  // Auto-refresh at midnight to reset daily progress
  useEffect(() => {
    const checkForNewDay = () => {
      const now = new Date();
      const currentDateString = getTodayDateString();
      
      // Check if we have meals loaded and if the date has changed
      if (todaysMeals.length > 0) {
        const lastMealDate = todaysMeals[0]?.date;
        if (lastMealDate && lastMealDate !== currentDateString) {
          console.log('🌅 New day detected! Refreshing daily progress...');
          loadTodaysMeals(); // This will load meals for the new day (should be empty)
        }
      }
    };

    // Calculate milliseconds until next midnight
    const getMillisecondsUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime() - now.getTime();
    };

    let dailyInterval: NodeJS.Timeout | null = null;

    // Set timeout for exact midnight reset
    const msUntilMidnight = getMillisecondsUntilMidnight();
    const midnightTimeout = setTimeout(() => {
      console.log('🌙 Midnight reached! Resetting daily progress...');
      loadTodaysMeals(); // Reset to new day's meals (empty)
      
      // Set up daily interval for subsequent midnights
      dailyInterval = setInterval(() => {
        console.log('🌙 Daily reset at midnight...');
        loadTodaysMeals();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntilMidnight);

    // Also check every minute for date changes (backup)
    const checkInterval = setInterval(checkForNewDay, 60000);

    // Check when the page becomes visible (user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForNewDay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(checkInterval);
      if (dailyInterval) {
        clearInterval(dailyInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate total macros when meals change
  useEffect(() => {
    console.log('🔄 Calculating total macros from meals:', todaysMeals.length);
    
    const newTotalMacros = todaysMeals.reduce(
      (total, meal) => {
        console.log('📊 Processing meal:', meal.originalText, 'with macros:', meal.macros);
        
        // Calculate combined alcohol info if any meals have alcohol
        let combinedAlcoholInfo = total.alcohol_info;
        if (meal.macros.alcohol_info) {
          console.log('🍺 Found alcohol info in meal:', meal.macros.alcohol_info);
          if (!combinedAlcoholInfo) {
            combinedAlcoholInfo = {
              total_alcohol_calories: 0
            };
          }
          
          // Calculate alcohol calories from grams: 7 kcal per gram of alcohol
          if (meal.macros.alcohol_info.alcohol) {
            const alcoholCalories = meal.macros.alcohol_info.alcohol * 7;
            combinedAlcoholInfo.total_alcohol_calories += alcoholCalories;
          }
          console.log('🍺 Combined alcohol info now:', combinedAlcoholInfo);
        }

        return {
          protein: total.protein + meal.macros.protein,
          carbs: total.carbs + meal.macros.carbs,
          fat: total.fat + meal.macros.fat,
          calories: total.calories + meal.macros.calories,
          alcohol_info: combinedAlcoholInfo
        };
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0, alcohol_info: undefined } as MacroNutrients
    );
    
    console.log('📊 Final total macros calculated:', newTotalMacros);
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
      console.log('🎯 Updating goals in main page:', newGoals);
      setGoals(newGoals);
      await setMacroGoals(newGoals);
      console.log('✅ Goals updated and saved successfully');
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

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    try {
      const { setUserTheme } = await import('@/lib/storage');
      await setUserTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
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
            onMealUpdated={handleMealDeleted}
            onBack={() => setCurrentPage('home')}
            onAddMeal={openMealInput}
          />
          <BottomNavigation
            currentPage={currentPage}
            onNavigate={handleNavigation}
            onAddMeal={openMealInput}
            mealsCount={todaysMeals.length}
          />
          <InstallPrompt />
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
          <InstallPrompt />
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

            {/* Strategic ad placement - non-intrusive banner */}
            <div className="animate-slide-up">
              <AdBanner 
                adSlot="1234567890"
                adFormat="auto"
                className="mt-8 mb-4 rounded-2xl overflow-hidden opacity-70 hover:opacity-90 transition-opacity"
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

        <InstallPrompt />

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