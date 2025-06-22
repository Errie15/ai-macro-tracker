'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Scale, Target, Plus, Trash2, Edit3, TrendingUp } from 'lucide-react';
import { MacroGoals, MealEntry, WeightEntry, UserProfile, MacroNutrients } from '@/types';
import { 
  getMealsByDate, 
  getWeightEntryByDate, 
  addWeightEntry, 
  deleteWeightEntry,
  getMacroGoals,
  deleteMeal,
  getWeightEntries
} from '@/lib/storage';
import { getUserProfile } from '@/lib/storage';
import MacroProgress from './MacroProgress';
import MealList from './MealList';
import WeightChart from './WeightChart';

interface DayDetailPageProps {
  date: string; // YYYY-MM-DD format
  onBack: () => void;
  onAddMeal: () => void;
}

export default function DayDetailPage({ date, onBack, onAddMeal }: DayDetailPageProps) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [weightEntry, setWeightEntry] = useState<WeightEntry | null>(null);
  const [allWeightEntries, setAllWeightEntries] = useState<WeightEntry[]>([]);
  const [goals, setGoals] = useState<MacroGoals>({ protein: 150, carbs: 200, fat: 70, calories: 2000 });
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateTotalMacros = (meals: MealEntry[]): MacroNutrients => {
    return meals.reduce(
      (total, meal) => ({
        protein: total.protein + meal.macros.protein,
        carbs: total.carbs + meal.macros.carbs,
        fat: total.fat + meal.macros.fat,
        calories: total.calories + meal.macros.calories,
      }),
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mealsData, weightData, allWeightData, goalsData, profileData] = await Promise.all([
        getMealsByDate(date),
        getWeightEntryByDate(date),
        getWeightEntries(),
        getMacroGoals(),
        Promise.resolve(getUserProfile())
      ]);

      setMeals(mealsData);
      setWeightEntry(weightData);
      setAllWeightEntries(allWeightData);
      setGoals(goalsData);
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error loading day data:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddWeight = async () => {
    if (!newWeight) return;
    
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) return;

    try {
      await addWeightEntry(weight, date);
      const [updatedWeight, allWeightData] = await Promise.all([
        getWeightEntryByDate(date),
        getWeightEntries()
      ]);
      setWeightEntry(updatedWeight);
      setAllWeightEntries(allWeightData);
      setIsAddingWeight(false);
      setNewWeight('');
    } catch (error) {
      console.error('Error adding weight:', error);
    }
  };

  const handleDeleteWeight = async () => {
    if (!weightEntry) return;
    
    if (window.confirm('Are you sure you want to delete this weight entry?')) {
      try {
        await deleteWeightEntry(weightEntry.id);
        setWeightEntry(null);
      } catch (error) {
        console.error('Error deleting weight:', error);
      }
    }
  };

  const handleDeleteMeal = async () => {
    // Reload meals after deletion
    const updatedMeals = await getMealsByDate(date);
    setMeals(updatedMeals);
  };

  const totalMacros = calculateTotalMacros(meals);
  const activeGoals = userProfile.fitnessGoals?.filter(goal => goal.isActive) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="ai-thinking w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen smooth-scroll relative">
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 animate-fade-in">
            <button
              onClick={onBack}
              className="btn-pill-secondary w-12 h-12 p-0 tap-effect hover-lift"
              aria-label="Back to calendar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-display">{formatDate(date)}</h1>
              <p className="text-tertiary">Daily overview</p>
            </div>
          </div>

          {/* Fitness Goals */}
          {activeGoals.length > 0 && (
            <div className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-primary">Active Goals</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeGoals.map(goal => (
                  <div key={goal.id} className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20">
                    <div className="font-medium text-primary text-sm">
                      {goal.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    {goal.description && (
                      <div className="text-xs text-secondary mt-1">{goal.description}</div>
                    )}
                    {goal.targetDate && (
                      <div className="text-xs text-tertiary mt-1">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Macro Progress */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-primary">Macro Progress</h2>
            </div>
                         <MacroProgress 
               totalMacros={totalMacros} 
               goals={goals}
             />
          </div>

          {/* Weight Section */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-primary">Weight Progress</h2>
              </div>
              
              <button
                onClick={() => setIsAddingWeight(true)}
                className="btn-pill-primary px-3 py-1 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Weight
              </button>
            </div>

            {isAddingWeight && (
              <div className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-orange-400/20">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="input-field-small w-full"
                      placeholder="70.5"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddWeight}
                      className="btn-pill-primary px-4 py-2 text-sm"
                    >
                      Save Weight
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingWeight(false);
                        setNewWeight('');
                      }}
                      className="btn-pill-secondary px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <WeightChart weightEntries={allWeightEntries} />
          </div>

          {/* Meals Section */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Meals</h2>
              <button
                onClick={onAddMeal}
                className="btn-pill-primary px-3 py-1 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Meal
              </button>
            </div>

            {meals.length > 0 ? (
                             <MealList 
                 meals={meals} 
                 onMealDeleted={handleDeleteMeal}
               />
            ) : (
              <div className="text-center py-8 text-tertiary">
                <div className="text-6xl mb-3">🍽️</div>
                <p className="text-lg">No meals recorded for this day</p>
                <p className="text-sm">Add your first meal to start tracking!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
} 