import { MacroGoals, MealEntry } from '@/types';

const STORAGE_KEYS = {
  MACRO_GOALS: 'macro_goals',
  MEALS: 'meals',
} as const;

// Hjälpfunktion för att säkert använda localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Fel vid hämtning från localStorage för nyckel ${key}:`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Fel vid sparande till localStorage för nyckel ${key}:`, error);
  }
}

// Makromål-funktioner
export function getMacroGoals(): MacroGoals {
  return getFromStorage(STORAGE_KEYS.MACRO_GOALS, {
    protein: 150,
    carbs: 200,
    fat: 70,
    calories: 2000,
  });
}

export function setMacroGoals(goals: MacroGoals): void {
  setToStorage(STORAGE_KEYS.MACRO_GOALS, goals);
}

// Måltids-funktioner
export function getAllMeals(): MealEntry[] {
  return getFromStorage(STORAGE_KEYS.MEALS, []);
}

export function getMealsByDate(date: string): MealEntry[] {
  const allMeals = getAllMeals();
  return allMeals.filter(meal => meal.date === date);
}

export function addMeal(meal: MealEntry): void {
  const allMeals = getAllMeals();
  allMeals.push(meal);
  setToStorage(STORAGE_KEYS.MEALS, allMeals);
}

export function deleteMeal(mealId: string): void {
  const allMeals = getAllMeals();
  const filteredMeals = allMeals.filter(meal => meal.id !== mealId);
  setToStorage(STORAGE_KEYS.MEALS, filteredMeals);
}

// Hjälpfunktion för att få idag's datum
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
} 