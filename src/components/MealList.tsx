'use client';

import { Trash2, Clock, History, Utensils } from 'lucide-react';
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
      <div className="card micro-bounce">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <History className="w-6 h-6 text-macro-carbs" />
            Dagens Måltider
          </h2>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Utensils className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-300 text-lg font-medium mb-2">Inga måltider registrerade ännu</p>
          <p className="text-slate-400">
            Använd AI-assistenten ovan för att logga din första måltid
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card micro-bounce">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <History className="w-6 h-6 text-macro-carbs" />
          Dagens Måltider ({meals.length})
        </h2>
        <div className="swipe-hint">
          ← → Swipe för historik
        </div>
      </div>
      
      <div className="space-y-4 custom-scrollbar max-h-96 overflow-y-auto">
        {meals.map((meal, index) => (
          <div 
            key={meal.id}
            className="relative bg-dark-700/20 backdrop-blur-sm border border-dark-600/30 rounded-soft p-6 hover:bg-dark-700/30 hover:border-dark-500/50 transition-all duration-300 micro-bounce reveal"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Glass overlay */}
            <div className="glass-overlay" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 space-y-4">
                {/* Time and meal info */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-dark-600/40 rounded-pill backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-macro-protein" />
                    <span className="text-sm text-slate-300 font-medium">
                      {formatTime(meal.timestamp)}
                    </span>
                  </div>
                </div>
                
                {/* Meal description */}
                <p className="text-slate-100 font-medium text-lg leading-relaxed">
                  {meal.originalText}
                </p>
                
                {/* Bento-style macro display */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bento-card bento-protein p-4 min-h-[80px]">
                    <div className="glass-overlay" />
                    <div className="relative z-10 text-center">
                      <div className="text-lg font-black text-macro-protein count-up">
                        {meal.macros.protein}g
                      </div>
                      <div className="text-slate-300 text-xs font-medium mt-1">Protein</div>
                    </div>
                  </div>
                  
                  <div className="bento-card bento-carbs p-4 min-h-[80px]">
                    <div className="glass-overlay" />
                    <div className="relative z-10 text-center">
                      <div className="text-lg font-black text-macro-carbs count-up">
                        {meal.macros.carbs}g
                      </div>
                      <div className="text-slate-300 text-xs font-medium mt-1">Kolhydrater</div>
                    </div>
                  </div>
                  
                  <div className="bento-card bento-fat p-4 min-h-[80px]">
                    <div className="glass-overlay" />
                    <div className="relative z-10 text-center">
                      <div className="text-lg font-black text-macro-fat count-up">
                        {meal.macros.fat}g
                      </div>
                      <div className="text-slate-300 text-xs font-medium mt-1">Fett</div>
                    </div>
                  </div>
                  
                  <div className="bento-card bento-calories p-4 min-h-[80px]">
                    <div className="glass-overlay" />
                    <div className="relative z-10 text-center">
                      <div className="text-lg font-black text-macro-calories count-up">
                        {meal.macros.calories}
                      </div>
                      <div className="text-slate-300 text-xs font-medium mt-1">kcal</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delete button with better accessibility */}
              <button
                onClick={() => handleDeleteMeal(meal.id)}
                className="ml-4 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full transition-all duration-200 micro-bounce micro-glow border border-red-500/20 hover:border-red-500/40 backdrop-blur-sm min-w-[48px] min-h-[48px] flex items-center justify-center"
                title="Ta bort måltid"
                aria-label="Ta bort måltid"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary footer */}
      {meals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dark-600/30">
          <p className="text-center text-slate-400 text-sm">
            Totalt {meals.length} måltid{meals.length !== 1 ? 'er' : ''} registrerade idag
          </p>
        </div>
      )}
    </div>
  );
} 