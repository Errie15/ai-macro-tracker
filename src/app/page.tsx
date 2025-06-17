'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Zap, Moon, Sun } from 'lucide-react';
import MacroProgress from '@/components/MacroProgress';
import MealInput from '@/components/MealInput';
import GoalsSettings from '@/components/GoalsSettings';
import MealList from '@/components/MealList';
import { MacroGoals, MacroNutrients, MealEntry } from '@/types';
import { getMacroGoals, getMealsByDate, getTodayDateString } from '@/lib/storage';

export default function HomePage() {
  const [goals, setGoals] = useState<MacroGoals>({
    protein: 150,
    carbs: 200,
    fat: 70,
    calories: 2000,
  });
  
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([]);
  const [totalMacros, setTotalMacros] = useState<MacroNutrients>({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
  });
  const [isLightMode, setIsLightMode] = useState(false);

  // Ladda data från localStorage
  useEffect(() => {
    const savedGoals = getMacroGoals();
    setGoals(savedGoals);
    
    loadTodaysMeals();
  }, []);

  // Uppdatera totala makron när måltider ändras
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

  const loadTodaysMeals = () => {
    const today = getTodayDateString();
    const meals = getMealsByDate(today);
    setTodaysMeals(meals);
  };

  const handleMealAdded = () => {
    loadTodaysMeals();
  };

  const handleMealDeleted = () => {
    loadTodaysMeals();
  };

  const handleGoalsUpdated = (newGoals: MacroGoals) => {
    setGoals(newGoals);
  };

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.documentElement.classList.toggle('light');
    document.body.classList.toggle('light');
  };

  return (
    <div className="min-h-screen p-4 pb-20 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Exaggerated Minimalism */}
        <div className="text-center space-y-6 pt-8 pb-4 thumb-reach">
          <div className="flex items-center justify-center space-x-4">
            <h1 className="text-5xl md:text-6xl font-black text-slate-100 tracking-tight">
              AI Makro
            </h1>
            <div className="animate-pulse">
              <Sparkles className="w-12 h-12 text-macro-protein" />
            </div>
          </div>
          <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Din personliga wellness-coach
            <br />
            <span className="text-macro-carbs font-semibold">alltid i fickan</span>
          </p>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-secondary micro-bounce micro-glow"
            aria-label="Växla tema"
          >
            {isLightMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
        </div>

        {/* Large Central Input Zone - Hero Section */}
        <div className="thumb-reach reveal">
          <MealInput onMealAdded={handleMealAdded} />
        </div>

        {/* Bento-style Layout for Macronutrients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 reveal">
          <MacroProgress 
            totalMacros={totalMacros}
            goals={goals}
          />
        </div>

        {/* Settings and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 reveal">
          {/* Goals Settings Card */}
          <div className="lg:col-span-1">
            <div className="card micro-bounce">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-macro-protein" />
                  Mål
                </h2>
              </div>
              <GoalsSettings 
                currentGoals={goals}
                onGoalsUpdated={handleGoalsUpdated}
              />
            </div>
          </div>

          {/* Today's Summary Card */}
          <div className="lg:col-span-2">
            <div className="card micro-bounce">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-macro-carbs" />
                  Dagens Sammanfattning
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-dark-700/30 rounded-soft backdrop-blur-sm">
                  <div className="text-2xl font-bold text-macro-protein count-up">
                    {Math.round((totalMacros.protein / goals.protein) * 100)}%
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Protein</div>
                </div>
                
                <div className="text-center p-4 bg-dark-700/30 rounded-soft backdrop-blur-sm">
                  <div className="text-2xl font-bold text-macro-carbs count-up">
                    {Math.round((totalMacros.carbs / goals.carbs) * 100)}%
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Kolhydrater</div>
                </div>
                
                <div className="text-center p-4 bg-dark-700/30 rounded-soft backdrop-blur-sm">
                  <div className="text-2xl font-bold text-macro-fat count-up">
                    {Math.round((totalMacros.fat / goals.fat) * 100)}%
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Fett</div>
                </div>
                
                <div className="text-center p-4 bg-dark-700/30 rounded-soft backdrop-blur-sm">
                  <div className="text-2xl font-bold text-macro-calories count-up">
                    {Math.round((totalMacros.calories / goals.calories) * 100)}%
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Kalorier</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal History with Glassmorphism */}
        <div className="reveal">
          <MealList 
            meals={todaysMeals}
            onMealDeleted={handleMealDeleted}
          />
        </div>

        {/* Gesture Hints */}
        <div className="fixed bottom-4 right-4 text-slate-400 text-sm space-y-1 swipe-hint">
          <div>↕ Swipe för att scrolla</div>
          <div>← → Swipe för historik</div>
        </div>

        {/* Footer with Human Touch */}
        <div className="text-center pt-8 pb-4 thumb-reach">
          <p className="text-slate-400 font-medium">
            Byggd med kärlek för din hälsa 💚
          </p>
          <p className="text-slate-500 text-sm mt-2">
            AI-driven näring • Personlig coaching • Alltid tillgänglig
          </p>
        </div>
      </div>
    </div>
  );
} 