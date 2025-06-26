'use client';

import { useState } from 'react';
import { Trash2, Clock, Utensils, ChevronDown, ChevronRight, Brain, Info, Edit3, Save, X, RefreshCw } from 'lucide-react';
import { MealEntry, MacroNutrients, FoodBreakdown } from '@/types';
import { deleteMeal, updateMeal } from '@/lib/storage';

interface MealListProps {
  meals: MealEntry[];
  onMealDeleted: () => void;
  onMealUpdated?: () => void;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('sv-SE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default function MealList({ meals, onMealDeleted, onMealUpdated }: MealListProps) {
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [editingMeals, setEditingMeals] = useState<Set<string>>(new Set());
  const [editingFoods, setEditingFoods] = useState<Set<string>>(new Set());
  const [editValues, setEditValues] = useState<{ [mealId: string]: MacroNutrients }>({});
  const [editFoodValues, setEditFoodValues] = useState<{ [key: string]: FoodBreakdown }>({});
  const [recalculatingMeals, setRecalculatingMeals] = useState<Set<string>>(new Set());

  const toggleMealExpansion = (mealId: string) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealId)) {
      newExpanded.delete(mealId);
    } else {
      newExpanded.add(mealId);
    }
    setExpandedMeals(newExpanded);
  };

  const startEditingMeal = (meal: MealEntry) => {
    const newEditing = new Set(editingMeals);
    newEditing.add(meal.id);
    setEditingMeals(newEditing);
    setEditValues(prev => ({
      ...prev,
      [meal.id]: { ...meal.macros }
    }));
  };

  const cancelEditingMeal = (mealId: string) => {
    const newEditing = new Set(editingMeals);
    newEditing.delete(mealId);
    setEditingMeals(newEditing);
    setEditValues(prev => {
      const { [mealId]: _, ...rest } = prev;
      return rest;
    });
  };

  const startEditingFood = (mealId: string, foodIndex: number, food: FoodBreakdown) => {
    const key = `${mealId}-${foodIndex}`;
    const newEditing = new Set(editingFoods);
    newEditing.add(key);
    setEditingFoods(newEditing);
    setEditFoodValues(prev => ({
      ...prev,
      [key]: { ...food }
    }));
  };

  const cancelEditingFood = (mealId: string, foodIndex: number) => {
    const key = `${mealId}-${foodIndex}`;
    const newEditing = new Set(editingFoods);
    newEditing.delete(key);
    setEditingFoods(newEditing);
    setEditFoodValues(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const saveEditedFood = async (meal: MealEntry, foodIndex: number) => {
    const key = `${meal.id}-${foodIndex}`;
    const updatedFood = editFoodValues[key];
    if (!updatedFood || !meal.breakdown) return;

    try {
      console.log('🔄 Updating individual food item:', { mealId: meal.id, foodIndex, updatedFood });
      
      const newBreakdown = [...meal.breakdown];
      newBreakdown[foodIndex] = updatedFood;
      
      const newTotalMacros = newBreakdown.reduce((total, food) => ({
        protein: total.protein + food.protein,
        carbs: total.carbs + food.carbs,
        fat: total.fat + food.fat,
        calories: total.calories + food.calories,
      }), { protein: 0, carbs: 0, fat: 0, calories: 0 });
      
      await updateMeal(meal.id, {
        breakdown: newBreakdown,
        macros: newTotalMacros
      });
      
      cancelEditingFood(meal.id, foodIndex);
      
      if (onMealUpdated) {
        onMealUpdated();
      }
      
      console.log('✅ Food item updated successfully');
    } catch (error) {
      console.error('Error updating food item:', error);
      alert('Error updating food item. Please try again.');
    }
  };

  const saveEditedMeal = async (meal: MealEntry) => {
    const newMacros = editValues[meal.id];
    if (!newMacros) return;

    try {
      console.log('🔄 Updating meal macros:', { mealId: meal.id, newMacros });
      
      await updateMeal(meal.id, {
        macros: newMacros
      });
      
      cancelEditingMeal(meal.id);
      
      if (onMealUpdated) {
        onMealUpdated();
      }
      
      console.log('✅ Meal macros updated successfully');
    } catch (error) {
      console.error('Error updating meal:', error);
      alert('Error updating meal. Please try again.');
    }
  };

  const updateEditValue = (mealId: string, field: keyof MacroNutrients, value: number) => {
    setEditValues(prev => {
      const updatedMacros = {
        ...prev[mealId],
        [field]: Math.max(0, value)
      };
      
      // Auto-calculate calories when protein, carbs, or fat changes
      if (field === 'protein' || field === 'carbs' || field === 'fat') {
        const protein = field === 'protein' ? value : (updatedMacros.protein || 0);
        const carbs = field === 'carbs' ? value : (updatedMacros.carbs || 0);
        const fat = field === 'fat' ? value : (updatedMacros.fat || 0);
        
        // Calculate calories using 4-4-9 formula
        updatedMacros.calories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
        
        console.log(`🧮 Auto-calculated meal calories: ${updatedMacros.calories} kcal (P:${protein}g C:${carbs}g F:${fat}g)`);
      }
      
      return {
        ...prev,
        [mealId]: updatedMacros
      };
    });
  };

  const updateEditFoodValue = (mealId: string, foodIndex: number, field: keyof FoodBreakdown, value: string | number) => {
    const key = `${mealId}-${foodIndex}`;
    setEditFoodValues(prev => {
      const updatedFood = {
        ...prev[key],
        [field]: typeof value === 'number' ? Math.max(0, value) : value
      };
      
      // Auto-calculate calories when protein, carbs, or fat changes
      if (field === 'protein' || field === 'carbs' || field === 'fat') {
        const protein = field === 'protein' ? (typeof value === 'number' ? value : 0) : (updatedFood.protein || 0);
        const carbs = field === 'carbs' ? (typeof value === 'number' ? value : 0) : (updatedFood.carbs || 0);
        const fat = field === 'fat' ? (typeof value === 'number' ? value : 0) : (updatedFood.fat || 0);
        
        // Calculate calories using 4-4-9 formula
        updatedFood.calories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
        
        console.log(`🧮 Auto-calculated calories for ${updatedFood.food}: ${updatedFood.calories} kcal (P:${protein}g C:${carbs}g F:${fat}g)`);
      }
      
      return {
        ...prev,
        [key]: updatedFood
      };
    });
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteMeal(mealId);
        onMealDeleted();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Error deleting meal. Please try again.');
      }
    }
  };

  const recalculateMealWithAI = async (meal: MealEntry) => {
    setRecalculatingMeals(prev => new Set(prev).add(meal.id));
    
    try {
      console.log('🤖 Recalculating meal with AI for enhanced accuracy:', meal.originalText);
      
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealDescription: meal.originalText,
          isRecalculation: true,
          previousResult: {
            protein: meal.macros.protein,
            carbs: meal.macros.carbs,
            fat: meal.macros.fat,
            calories: meal.macros.calories
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze meal');
      }

      const aiResponse = await response.json();
      
      // Update the meal with new AI analysis
      await updateMeal(meal.id, {
        macros: {
          protein: aiResponse.protein,
          carbs: aiResponse.carbs,
          fat: aiResponse.fat,
          calories: aiResponse.calories
        },
        breakdown: aiResponse.breakdown || [],
        reasoning: aiResponse.reasoning || '',
        validation: aiResponse.validation || ''
      });
      
      if (onMealUpdated) {
        onMealUpdated();
      }
      
      console.log('✅ Meal recalculated successfully with enhanced accuracy');
    } catch (error) {
      console.error('Error recalculating meal:', error);
      alert('Error recalculating meal. Please try again.');
    } finally {
      setRecalculatingMeals(prev => {
        const newSet = new Set(prev);
        newSet.delete(meal.id);
        return newSet;
      });
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
        {meals.map((meal, index) => {
          const isExpanded = expandedMeals.has(meal.id);
          const isEditing = editingMeals.has(meal.id);
          const isRecalculating = recalculatingMeals.has(meal.id);
          const hasBreakdown = meal.breakdown && meal.breakdown.length > 0;
          const currentMacros = isEditing ? editValues[meal.id] : meal.macros;
          
          return (
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
                
                <div className="flex items-center gap-2">
                  {/* Edit button */}
                  {!isEditing ? (
                    <button
                      onClick={() => startEditingMeal(meal)}
                      className="text-tertiary hover:text-yellow-400 transition-colors tap-effect p-1"
                      title="Edit macro values"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => saveEditedMeal(meal)}
                        className="text-tertiary hover:text-green-400 transition-colors tap-effect p-1"
                        title="Save changes"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => cancelEditingMeal(meal.id)}
                        className="text-tertiary hover:text-red-400 transition-colors tap-effect p-1"
                        title="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Recalculate with AI button */}
                  <button
                    onClick={() => recalculateMealWithAI(meal)}
                    disabled={isRecalculating}
                    className={`text-tertiary transition-colors tap-effect p-1 ${
                      isRecalculating 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:text-purple-400'
                    }`}
                    title="Recalculate with AI"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                  </button>
                  
                  {/* AI analysis button */}
                  <button
                    onClick={() => toggleMealExpansion(meal.id)}
                    className={`text-tertiary transition-colors tap-effect p-1 flex items-center gap-1 ${
                      hasBreakdown ? 'hover:text-blue-400' : 'hover:text-gray-500 opacity-50'
                    }`}
                    title={hasBreakdown ? "Show AI analysis" : "No detailed analysis available"}
                  >
                    <Brain className="w-4 h-4" />
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
              
              <button
                onClick={() => handleDeleteMeal(meal.id)}
                className="text-tertiary hover:text-red-400 transition-colors tap-effect p-1"
                    title="Delete meal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
                </div>
            </div>
            
            <p className="text-primary font-medium mb-3 text-sm leading-relaxed">
              {meal.originalText}
            </p>
            
              {/* Macro Grid - Editable when in edit mode */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
                {isEditing ? (
                  /* Edit mode - Input fields */
                  <>
                    <div className="macro-card macro-card-protein flex flex-col">
                      <input
                        type="number"
                        value={currentMacros?.protein || 0}
                        onChange={(e) => updateEditValue(meal.id, 'protein', parseInt(e.target.value) || 0)}
                        className="text-base font-black bg-transparent text-center w-full outline-none"
                        min="0"
                      />
                      <div className="text-xs font-medium opacity-75">g protein</div>
                    </div>
                    
                    <div className="macro-card macro-card-carbs flex flex-col">
                      <input
                        type="number"
                        value={currentMacros?.carbs || 0}
                        onChange={(e) => updateEditValue(meal.id, 'carbs', parseInt(e.target.value) || 0)}
                        className="text-base font-black bg-transparent text-center w-full outline-none"
                        min="0"
                      />
                      <div className="text-xs font-medium opacity-75">g carbs</div>
                    </div>
                    
                    <div className="macro-card macro-card-fat flex flex-col">
                      <input
                        type="number"
                        value={currentMacros?.fat || 0}
                        onChange={(e) => updateEditValue(meal.id, 'fat', parseInt(e.target.value) || 0)}
                        className="text-base font-black bg-transparent text-center w-full outline-none"
                        min="0"
                      />
                      <div className="text-xs font-medium opacity-75">g fat</div>
                </div>
                    
                                        <div className="macro-card macro-card-calories flex flex-col">
                      <input
                        type="number"
                        value={currentMacros?.calories || 0}
                        onChange={(e) => updateEditValue(meal.id, 'calories', parseInt(e.target.value) || 0)}
                        className="text-base font-black bg-transparent text-center w-full outline-none opacity-60"
                        min="0"
                        disabled
                        title="Auto-calculated from macros (P×4 + C×4 + F×9)"
                      />
                      <div className="text-xs font-medium opacity-75">kcal (auto)</div>
                    </div>
                  </>
                ) : (
                  /* View mode - Normal display */
                  <>
                    <div className="macro-card macro-card-protein">
                      <div className="text-base font-black">{currentMacros?.protein}</div>
                      <div className="text-xs font-medium opacity-75">g protein</div>
              </div>
              
              <div className="macro-card macro-card-carbs">
                      <div className="text-base font-black">{currentMacros?.carbs}</div>
                      <div className="text-xs font-medium opacity-75">g carbs</div>
                    </div>
                    
                    <div className="macro-card macro-card-fat">
                      <div className="text-base font-black">{currentMacros?.fat}</div>
                      <div className="text-xs font-medium opacity-75">g fat</div>
                </div>
                    
                    <div className="macro-card macro-card-calories">
                      <div className="text-base font-black">{currentMacros?.calories}</div>
                      <div className="text-xs font-medium opacity-75">kcal</div>
                </div>
                  </>
                )}
              </div>
              
              {/* Editing hint */}
              {isEditing && (
                <div className="text-xs text-yellow-400 text-center mb-2">
                  ✏️ Editing macro values - calories auto-calculated (P×4 + C×4 + F×9)
                </div>
              )}

              {/* Expanded AI Analysis */}
              {isExpanded && (
                <div className="border-t border-white/10 pt-3 mt-3 space-y-3 animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-semibold text-primary">AI Analysis</h4>
                  </div>
                  
                  {hasBreakdown ? (
                    <>
                      {/* AI Reasoning */}
                      {meal.reasoning && (
                        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-3 h-3 text-blue-400" />
                            <span className="text-xs font-medium text-blue-400">AI Analysis</span>
                          </div>
                          <p className="text-xs text-secondary leading-relaxed">
                            {meal.reasoning}
                          </p>
                        </div>
                      )}
                      
                      {/* Food Breakdown - Now with individual edit functionality */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-tertiary mb-2">Identified Foods:</div>
                        {meal.breakdown?.map((item, itemIndex) => {
                          const foodKey = `${meal.id}-${itemIndex}`;
                          const isEditingFood = editingFoods.has(foodKey);
                          const currentFood = isEditingFood ? editFoodValues[foodKey] : item;
                          
                          return (
                            <div key={itemIndex} className="bg-white/5 rounded-lg p-2 border border-white/10">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                  {isEditingFood ? (
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        value={currentFood?.food || ''}
                                        onChange={(e) => updateEditFoodValue(meal.id, itemIndex, 'food', e.target.value)}
                                        className="text-xs font-medium text-primary bg-transparent border border-white/20 rounded px-2 py-1 w-full"
                                        placeholder="Food name"
                                      />
                                      <input
                                        type="text"
                                        value={currentFood?.estimatedAmount || ''}
                                        onChange={(e) => updateEditFoodValue(meal.id, itemIndex, 'estimatedAmount', e.target.value)}
                                        className="text-xs text-tertiary bg-transparent border border-white/20 rounded px-2 py-1 w-full"
                                        placeholder="Portion size"
                                      />
                                    </div>
                                  ) : (
                                    <>
                                      <div className="text-xs font-medium text-primary">{item.food}</div>
                                      <div className="text-xs text-tertiary">{item.estimatedAmount}</div>
                                    </>
                                  )}
                                </div>
                                
                                {/* Edit button for individual food */}
                                <div className="ml-2">
                                  {!isEditingFood ? (
                                    <button
                                      onClick={() => startEditingFood(meal.id, itemIndex, item)}
                                      className="text-tertiary hover:text-yellow-400 transition-colors tap-effect p-1"
                                      title="Edit this food item"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => saveEditedFood(meal, itemIndex)}
                                        className="text-tertiary hover:text-green-400 transition-colors tap-effect p-1"
                                        title="Save food changes"
                                      >
                                        <Save className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => cancelEditingFood(meal.id, itemIndex)}
                                        className="text-tertiary hover:text-red-400 transition-colors tap-effect p-1"
                                        title="Cancel food editing"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                </div>
              </div>
              
                              {/* Individual food macros - Editable */}
                              <div className="grid grid-cols-4 gap-1 mt-2">
                                {isEditingFood ? (
                                  /* Edit mode for food macros */
                                  <>
                                    <div className="text-center">
                                      <input
                                        type="number"
                                        value={currentFood?.protein || 0}
                                        onChange={(e) => updateEditFoodValue(meal.id, itemIndex, 'protein', parseInt(e.target.value) || 0)}
                                        className="text-xs font-bold text-blue-400 bg-transparent text-center w-full border border-blue-400/30 rounded px-1"
                                        min="0"
                                      />
                                      <div className="text-xs text-tertiary opacity-60">P</div>
                                    </div>
                                    <div className="text-center">
                                      <input
                                        type="number"
                                        value={currentFood?.carbs || 0}
                                        onChange={(e) => updateEditFoodValue(meal.id, itemIndex, 'carbs', parseInt(e.target.value) || 0)}
                                        className="text-xs font-bold text-green-400 bg-transparent text-center w-full border border-green-400/30 rounded px-1"
                                        min="0"
                                      />
                                      <div className="text-xs text-tertiary opacity-60">C</div>
                                    </div>
                                    <div className="text-center">
                                      <input
                                        type="number"
                                        value={currentFood?.fat || 0}
                                        onChange={(e) => updateEditFoodValue(meal.id, itemIndex, 'fat', parseInt(e.target.value) || 0)}
                                        className="text-xs font-bold text-purple-400 bg-transparent text-center w-full border border-purple-400/30 rounded px-1"
                                        min="0"
                                      />
                                      <div className="text-xs text-tertiary opacity-60">F</div>
                                    </div>
                                                                         <div className="text-center">
                                       <input
                                         type="number"
                                         value={currentFood?.calories || 0}
                                         onChange={(e) => updateEditFoodValue(meal.id, itemIndex, 'calories', parseInt(e.target.value) || 0)}
                                         className="text-xs font-bold text-orange-400 bg-transparent text-center w-full border border-orange-400/30 rounded px-1 opacity-60"
                                         min="0"
                                         disabled
                                         title="Auto-calculated from macros (P×4 + C×4 + F×9)"
                                       />
                                       <div className="text-xs text-tertiary opacity-60">auto</div>
                                     </div>
                                  </>
                                ) : (
                                  /* View mode for food macros */
                                  <>
                                    <div className="text-center">
                                      <div className="text-xs font-bold text-blue-400">{item.protein}g</div>
                                      <div className="text-xs text-tertiary opacity-60">P</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs font-bold text-green-400">{item.carbs}g</div>
                                      <div className="text-xs text-tertiary opacity-60">C</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs font-bold text-purple-400">{item.fat}g</div>
                                      <div className="text-xs text-tertiary opacity-60">F</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs font-bold text-orange-400">{item.calories}</div>
                                      <div className="text-xs text-tertiary opacity-60">kcal</div>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                                                             {/* Editing hint for food */}
                               {isEditingFood && (
                                 <div className="text-xs text-yellow-400 text-center mt-2">
                                   ✏️ Editing food item - calories auto-calculated, meal totals will update
                                 </div>
                               )}
                            </div>
                          );
                        })}
                      </div>
                      


                    </>
                  ) : (
                    /* No breakdown data available */
                    <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">AI Analysis Unavailable</span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed mb-3">
                        The AI could not estimate the nutritional values for this meal. You can manually edit the macro values using the edit button above. Once saved, the AI will remember this meal for future use.
                      </p>
                      <div className="text-xs text-blue-400">
                        💡 Click the edit button ✏️ to add your own macro values
                      </div>
                </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 