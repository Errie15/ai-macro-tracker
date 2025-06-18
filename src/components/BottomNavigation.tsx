'use client';

import { Plus, TrendingUp, Utensils, Calendar } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: 'home' | 'meals' | 'calendar') => void;
  onAddMeal: () => void;
  mealsCount: number;
}

export default function BottomNavigation({ 
  currentPage, 
  onNavigate, 
  onAddMeal,
  mealsCount 
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="glass-card-strong rounded-none rounded-t-2xl border-b-0">
        <div className="flex items-center justify-around px-4 py-0">
          
          {/* Calendar Button */}
          <button
            onClick={() => onNavigate('calendar')}
            className={`
              flex flex-col items-center gap-0 py-1 px-2 rounded-xl transition-all duration-200 min-w-[60px]
              ${currentPage === 'calendar' 
                ? 'bg-white/20 text-blue-400' 
                : 'text-secondary hover:text-primary hover:bg-white/10'
              }
            `}
            aria-label="Calendar"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Calendar</span>
          </button>

          {/* Meals Button */}
          <button
            onClick={() => onNavigate('meals')}
            className={`
              flex flex-col items-center gap-0 py-1 px-2 rounded-xl transition-all duration-200 relative min-w-[60px]
              ${currentPage === 'meals' 
                ? 'bg-white/20 text-blue-400' 
                : 'text-secondary hover:text-primary hover:bg-white/10'
              }
            `}
            aria-label="Meals"
          >
            <Utensils className="w-4 h-4" />
            <span className="text-xs font-medium">Meals</span>
            {mealsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {mealsCount > 9 ? '9+' : mealsCount}
              </span>
            )}
          </button>

          {/* Progress Button */}
          <button
            onClick={() => onNavigate('home')}
            className={`
              flex flex-col items-center gap-0 py-1 px-2 rounded-xl transition-all duration-200 min-w-[60px]
              ${currentPage === 'home' 
                ? 'bg-white/20 text-blue-400' 
                : 'text-secondary hover:text-primary hover:bg-white/10'
              }
            `}
            aria-label="Progress"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Progress</span>
          </button>

          {/* Add Button */}
          <button
            onClick={onAddMeal}
            className="flex flex-col items-center gap-0 py-1 px-2 rounded-xl transition-all duration-200 min-w-[60px]
                     bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600
                     text-white hover:scale-105 active:scale-95"
            aria-label="Add Meal"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
} 