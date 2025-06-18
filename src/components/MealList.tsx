'use client';

import { Trash2, Clock, Utensils } from 'lucide-react';
import { MealEntry } from '@/types';
import { deleteMeal } from '@/lib/storage';

interface MealListProps {
  meals: MealEntry[];
  onMealDeleted: () => void;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('sv-SE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default function MealList({ meals, onMealDeleted }: MealListProps) {
  const handleDeleteMeal = (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal?')) {
      deleteMeal(mealId);
      onMealDeleted();
    }
  };

  if (meals.length === 0) {
    return (
      <div className="glass-card text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
          <Utensils className="w-8 h-8 text-tertiary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">No meals yet</h3>
          <p className="text-tertiary text-sm">
            Add your first meal to start tracking your macros
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary">
          Meals ({meals.length})
        </h3>
      </div>
      
      {/* Meal Cards */}
      <div className="space-y-3">
        {meals.map((meal, index) => (
          <div 
            key={meal.id}
            className="glass-card-compact hover-lift tap-effect animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-tertiary" />
                <span className="text-sm text-secondary font-medium">
                  {formatTime(meal.timestamp)}
                </span>
              </div>
              
              <button
                onClick={() => handleDeleteMeal(meal.id)}
                className="text-tertiary hover:text-red-400 transition-colors tap-effect p-1"
                title="Delete meal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-primary font-medium mb-3 text-sm leading-relaxed">
              {meal.originalText}
            </p>
            
            {/* Macro Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <div className="macro-card macro-card-protein">
                <div className="text-base font-black">
                  {meal.macros.protein}
                </div>
                <div className="text-xs font-medium opacity-75">
                  g protein
                </div>
              </div>
              
              <div className="macro-card macro-card-carbs">
                <div className="text-base font-black">
                  {meal.macros.carbs}
                </div>
                <div className="text-xs font-medium opacity-75">
                  g carbs
                </div>
              </div>
              
              <div className="macro-card macro-card-fat">
                <div className="text-base font-black">
                  {meal.macros.fat}
                </div>
                <div className="text-xs font-medium opacity-75">
                  g fat
                </div>
              </div>
              
              <div className="macro-card macro-card-calories">
                <div className="text-base font-black">
                  {meal.macros.calories}
                </div>
                <div className="text-xs font-medium opacity-75">
                  kcal
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 