'use client';

import { useState, useEffect } from 'react';
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 AI Makro Tracker
          </h1>
          <p className="text-gray-700">
            Spåra dina makron enkelt med AI-driven näringsanalys
          </p>
        </div>

        {/* Goals Settings Button */}
        <div className="mb-6 flex justify-center">
          <GoalsSettings 
            currentGoals={goals}
            onGoalsUpdated={handleGoalsUpdated}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <MacroProgress 
              totalMacros={totalMacros}
              goals={goals}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <MealInput onMealAdded={handleMealAdded} />
            
            <MealList 
              meals={todaysMeals}
              onMealDeleted={handleMealDeleted}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>AI Makro Tracker - Enkel makrospårning med artificiell intelligens</p>
        </div>
      </div>
    </div>
  );
} 