'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Info, Clock } from 'lucide-react';
import { searchFoods, getFoodDetails, extractMacrosFromUSDAFood } from '@/lib/usda-api';
import { FoodSearchItem, USDAFood, MacroNutrients } from '@/types';
import { addMeal } from '@/lib/storage';

interface FoodSearchProps {
  onFoodAdded: () => void;
  onClose: () => void;
}

export default function FoodSearch({ onFoodAdded, onClose }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [portionGrams, setPortionGrams] = useState(100);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  // Sök efter mat med fördröjning
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchFoods({ 
          query: searchQuery,
          pageSize: 10 
        });
        setSearchResults(results);
      } catch (error) {
        console.error('Fel vid matsökning:', error);
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFoodSelect = async (food: FoodSearchItem) => {
    setIsLoadingDetails(true);
    try {
      const fullFood = await getFoodDetails(food.fdcId);
      setSelectedFood(fullFood);
    } catch (error) {
      console.error('Error fetching food details:', error);
      alert('Kunde inte hämta matinformation');
    }
    setIsLoadingDetails(false);
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;

    setIsAddingMeal(true);
    try {
      const macros = extractMacrosFromUSDAFood(selectedFood, portionGrams);
      
      const mealEntry = {
        id: '',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        originalText: `${portionGrams}g ${selectedFood.description}`,
        macros,
      };

      await addMeal(mealEntry);
      onFoodAdded();
      setSelectedFood(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Fel vid tillägg av mat:', error);
      alert('Kunde inte lägga till maten');
    }
    setIsAddingMeal(false);
  };

  const getCurrentMacros = (): MacroNutrients | null => {
    if (!selectedFood) return null;
    return extractMacrosFromUSDAFood(selectedFood, portionGrams);
  };

  const currentMacros = getCurrentMacros();

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Huvudkort */}
      <div className="glass-card-strong">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Sök Livsmedel</h2>
          <button
            onClick={onClose}
            className="btn-pill-secondary w-10 h-10 p-0"
          >
            ×
          </button>
        </div>

        {/* Sökfält */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök efter livsmedel (t.ex. kyckling, banan, bröd)..."
            className="input-field pl-12"
          />
          {isSearching && (
            <Clock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 animate-spin" />
          )}
        </div>

        {/* Sökresultat */}
        {searchResults.length > 0 && !selectedFood && (
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Sökresultat:</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((food) => (
                <button
                  key={food.fdcId}
                  onClick={() => handleFoodSelect(food)}
                  disabled={isLoadingDetails}
                  className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-left transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">{food.description}</h4>
                      {food.brandName && (
                        <p className="text-sm text-white/70 mt-1">{food.brandName}</p>
                      )}
                      {food.dataType && (
                        <span className="inline-block px-2 py-1 bg-white/20 rounded-lg text-xs text-white/80 mt-2">
                          {food.dataType}
                        </span>
                      )}
                    </div>
                    <Info className="w-5 h-5 text-white/60" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Food details and portion settings */}
        {selectedFood && (
          <div className="space-y-6">
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedFood.description}</h3>
              {selectedFood.brandName && (
                <p className="text-white/70 mb-2">Märke: {selectedFood.brandName}</p>
              )}
              {selectedFood.ingredients && (
                <p className="text-sm text-white/60 mb-3">
                  Ingredienser: {selectedFood.ingredients.substring(0, 100)}...
                </p>
              )}
            </div>

            {/* Portionsinställning */}
            <div className="space-y-4">
              <label className="block text-white font-medium">
                Portion (gram):
              </label>
              <input
                type="number"
                value={portionGrams}
                onChange={(e) => setPortionGrams(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field w-32"
                min="1"
                step="1"
              />
            </div>

            {/* Näringsinformation */}
            {currentMacros && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <div className="text-2xl font-bold text-blue-400">{currentMacros.calories}</div>
                  <div className="text-sm text-white/70">Kalorier</div>
                </div>
                <div className="p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                  <div className="text-2xl font-bold text-green-400">{currentMacros.protein}g</div>
                  <div className="text-sm text-white/70">Protein</div>
                </div>
                <div className="p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
                  <div className="text-2xl font-bold text-yellow-400">{currentMacros.carbs}g</div>
                  <div className="text-sm text-white/70">Kolhydrater</div>
                </div>
                <div className="p-4 bg-purple-500/20 rounded-xl border border-purple-400/30">
                  <div className="text-2xl font-bold text-purple-400">{currentMacros.fat}g</div>
                  <div className="text-sm text-white/70">Fett</div>
                </div>
              </div>
            )}

            {/* Knapprad */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedFood(null);
                  setSearchResults([]);
                }}
                className="btn-pill-secondary flex-1"
              >
                Tillbaka
              </button>
              <button
                onClick={handleAddFood}
                disabled={isAddingMeal}
                className="btn-pill-primary flex-1 flex items-center justify-center gap-2"
              >
                {isAddingMeal ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                Lägg till måltid
              </button>
            </div>
          </div>
        )}

        {/* Ingen data */}
        {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-8 text-white/60">
            <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Inga livsmedel hittades för &quot;{searchQuery}&quot;</p>
            <p className="text-sm mt-2">Prova att söka på engelska eller använda andra sökord</p>
          </div>
        )}
      </div>
    </div>
  );
} 