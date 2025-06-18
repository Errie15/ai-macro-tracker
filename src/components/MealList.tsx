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
    if (confirm('Är du säker på att du vill ta bort denna måltid?')) {
      deleteMeal(mealId);
      onMealDeleted();
    }
  };

  if (meals.length === 0) {
    return (
      <div className="glass-card text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
          <Utensils className="w-8 h-8 text-white/60" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Inga måltider ännu</h3>
          <p className="text-white/60 text-sm">
            Lägg till din första måltid för att börja spåra dina makron
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          Måltider ({meals.length})
        </h3>
      </div>
      
      {/* Meal Cards */}
      <div className="space-y-3">
        {meals.map((meal, index) => (
          <div 
            key={meal.id}
            className="glass-card hover-lift tap-effect animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80 font-medium">
                  {formatTime(meal.timestamp)}
                </span>
              </div>
              
              <button
                onClick={() => handleDeleteMeal(meal.id)}
                className="btn-pill-secondary w-8 h-8 p-0 tap-effect hover:bg-red-500/20 hover:border-red-400/30"
                title="Ta bort måltid"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
            
            <p className="text-white font-medium mb-4 text-sm leading-relaxed">
              {meal.originalText}
            </p>
            
            {/* Macro Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-3 text-center border border-blue-400/20">
                <div className="text-lg font-black text-blue-300">
                  {meal.macros.protein}
                </div>
                <div className="text-blue-200/80 text-xs font-medium">
                  g protein
                </div>
              </div>
              
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-3 text-center border border-green-400/20">
                <div className="text-lg font-black text-green-300">
                  {meal.macros.carbs}
                </div>
                <div className="text-green-200/80 text-xs font-medium">
                  g kolhydrater
                </div>
              </div>
              
              <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-3 text-center border border-purple-400/20">
                <div className="text-lg font-black text-purple-300">
                  {meal.macros.fat}
                </div>
                <div className="text-purple-200/80 text-xs font-medium">
                  g fett
                </div>
              </div>
              
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-400/20">
                <div className="text-lg font-black text-orange-300">
                  {meal.macros.calories}
                </div>
                <div className="text-orange-200/80 text-xs font-medium">
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