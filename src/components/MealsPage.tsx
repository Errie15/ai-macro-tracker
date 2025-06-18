'use client';

import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import { MealEntry } from '@/types';
import MealList from './MealList';

interface MealsPageProps {
  meals: MealEntry[];
  onMealDeleted: () => void;
  onBack: () => void;
  onAddMeal: () => void;
}

export default function MealsPage({ meals, onMealDeleted, onBack, onAddMeal }: MealsPageProps) {
  const today = new Date().toLocaleDateString('sv-SE', { 
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
              aria-label="Tillbaka"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-display">Dagens Måltider</h1>
              <p className="text-tertiary capitalize">{today}</p>
            </div>
            
            <button
              onClick={onAddMeal}
              className="btn-pill-primary w-12 h-12 p-0 tap-effect hover-lift"
              aria-label="Lägg till måltid"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{meals.length}</div>
                <div className="text-sm text-tertiary">Måltider</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{totalCalories}</div>
                <div className="text-sm text-tertiary">kcal totalt</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{totalProtein}g</div>
                <div className="text-sm text-tertiary">Protein</div>
              </div>
            </div>
          </div>

          {/* Meals List */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            {meals.length > 0 ? (
              <MealList meals={meals} onMealDeleted={onMealDeleted} />
            ) : (
              <div className="glass-card text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-tertiary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Inga måltider ännu</h3>
                  <p className="text-tertiary text-sm mb-4">
                    Börja dagen genom att logga din första måltid
                  </p>
                  <button
                    onClick={onAddMeal}
                    className="btn-pill-primary"
                  >
                    <Plus className="w-5 h-5" />
                    Lägg Till Måltid
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="glass-card bg-blue-500/10 border-blue-400/20 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Calendar className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Tips</h4>
                <p className="text-sm text-secondary">
                  Använd röstinmatning för att snabbt logga måltider. Säg bara &quot;två ägg och en skiva bröd&quot; så analyserar AI:n resten!
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={onAddMeal}
          className="btn-pill-primary w-16 h-16 p-0 shadow-2xl hover-lift tap-effect"
          aria-label="Snabblägg till måltid"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
} 