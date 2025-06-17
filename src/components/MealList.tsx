'use client';

import { Trash2, Clock } from 'lucide-react';
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
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Dagens Måltider</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Inga måltider registrerade ännu</p>
          <p className="text-sm text-gray-500 mt-2">
            Använd formuläret ovan för att logga din första måltid
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Dagens Måltider ({meals.length})
      </h2>
      
      <div className="space-y-3">
        {meals.map((meal) => (
          <div 
            key={meal.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatTime(meal.timestamp)}
                  </span>
                </div>
                
                <p className="text-gray-900 font-medium mb-3">
                  {meal.originalText}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="font-semibold text-blue-800">
                      {meal.macros.protein}g
                    </div>
                    <div className="text-blue-600 text-xs">Protein</div>
                  </div>
                  
                  <div className="text-center p-2 bg-green-100 rounded">
                    <div className="font-semibold text-green-800">
                      {meal.macros.carbs}g
                    </div>
                    <div className="text-green-600 text-xs">Kolhydrater</div>
                  </div>
                  
                  <div className="text-center p-2 bg-purple-100 rounded">
                    <div className="font-semibold text-purple-800">
                      {meal.macros.fat}g
                    </div>
                    <div className="text-purple-600 text-xs">Fett</div>
                  </div>
                  
                  <div className="text-center p-2 bg-orange-100 rounded">
                    <div className="font-semibold text-orange-800">
                      {meal.macros.calories}
                    </div>
                    <div className="text-orange-600 text-xs">kcal</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteMeal(meal.id)}
                className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Ta bort måltid"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 