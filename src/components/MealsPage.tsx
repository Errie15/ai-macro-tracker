'use client';

import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import { MealEntry } from '@/types';
import MealList from './MealList';

interface MealsPageProps {
  meals: MealEntry[];
  onMealDeleted: () => void;
  onMealUpdated?: () => void;
  onBack: () => void;
  onAddMeal: () => void;
}

export default function MealsPage({ meals, onMealDeleted, onMealUpdated, onBack, onAddMeal }: MealsPageProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const totalCalories = meals.reduce((sum, meal) => sum + meal.macros.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.macros.protein, 0);

  return (
    <div className="min-h-screen smooth-scroll relative">
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 animate-fade-in">
            <button
              onClick={onBack}
              className="btn-pill-secondary w-12 h-12 p-0 tap-effect hover-lift"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-display">Today&apos;s Meals</h1>
              <p className="text-tertiary capitalize">{today}</p>
            </div>
            

          </div>



          {/* Meals List */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            {meals.length > 0 ? (
              <MealList meals={meals} onMealDeleted={onMealDeleted} onMealUpdated={onMealUpdated} />
            ) : (
              <div className="glass-card text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-tertiary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">No meals yet</h3>
                  <p className="text-tertiary text-sm mb-4">
                    Start your day by logging your first meal
                  </p>
                  <button
                    onClick={onAddMeal}
                    className="btn-pill-primary"
                  >
                    <Plus className="w-5 h-5" />
                    Add Meal
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>


    </div>
  );
} 