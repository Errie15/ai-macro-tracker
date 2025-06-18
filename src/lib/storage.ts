import { MacroGoals, MealEntry } from '@/types';
import { 
  ref, 
  get, 
  set, 
  push, 
  remove,
  query,
  orderByChild,
  equalTo,
  orderByKey
} from 'firebase/database';
import { db } from './firebase';

// Get current user - will be imported dynamically to avoid SSR issues
async function getCurrentUser() {
  try {
    const { auth } = await import('./firebase');
    return auth.currentUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Fallback to localStorage for non-authenticated users or errors
function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
}

function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage for key ${key}:`, error);
  }
}

// Macro Goals Functions
export async function getMacroGoals(): Promise<MacroGoals> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    return getFromLocalStorage('macro_goals', {
      protein: 150,
      carbs: 200,
      fat: 70,
      calories: 2000,
    });
  }

  try {
    const goalsRef = ref(db, `users/${user.uid}/goals`);
    const snapshot = await get(goalsRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as MacroGoals;
    } else {
      // Return default goals if none exist
      const defaultGoals: MacroGoals = {
        protein: 150,
        carbs: 200,
        fat: 70,
        calories: 2000,
      };
      await setMacroGoals(defaultGoals); // Save default goals
      return defaultGoals;
    }
  } catch (error) {
    console.error('Error fetching macro goals from Realtime Database:', error);
    // Fallback to localStorage
    return getFromLocalStorage('macro_goals', {
      protein: 150,
      carbs: 200,
      fat: 70,
      calories: 2000,
    });
  }
}

export async function setMacroGoals(goals: MacroGoals): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    setToLocalStorage('macro_goals', goals);
    return;
  }

  try {
    const goalsRef = ref(db, `users/${user.uid}/goals`);
    await set(goalsRef, goals);
  } catch (error) {
    console.error('Error saving macro goals to Realtime Database:', error);
    // Fallback to localStorage
    setToLocalStorage('macro_goals', goals);
  }
}

// Meal Functions
export async function getAllMeals(): Promise<MealEntry[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    return getFromLocalStorage('meals', []);
  }

  try {
    const mealsRef = ref(db, `users/${user.uid}/meals`);
    const mealsQuery = query(mealsRef, orderByChild('timestamp'));
    const snapshot = await get(mealsQuery);
    
    if (snapshot.exists()) {
      const mealsData = snapshot.val();
      // Convert object with keys to array
      return Object.entries(mealsData).map(([key, value]: [string, any]) => ({
        id: key,
        ...value
      } as MealEntry)).reverse(); // Reverse to get newest first
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching meals from Realtime Database:', error);
    // Fallback to localStorage
    return getFromLocalStorage('meals', []);
  }
}

export async function getMealsByDate(date: string): Promise<MealEntry[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    const allMeals: MealEntry[] = getFromLocalStorage('meals', []);
    return allMeals.filter((meal: MealEntry) => meal.date === date);
  }

  try {
    const mealsRef = ref(db, `users/${user.uid}/meals`);
    const mealsQuery = query(mealsRef, orderByChild('date'), equalTo(date));
    const snapshot = await get(mealsQuery);
    
    if (snapshot.exists()) {
      const mealsData = snapshot.val();
      
      // Convert object with keys to array and sort by timestamp
      // Use the Firebase-generated key as the meal ID
      return Object.entries(mealsData)
        .map(([key, value]: [string, any]) => ({
          id: key, // Use Firebase key as ID for deletion
          ...value
        } as MealEntry))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching meals by date from Realtime Database:', error);
    // Fallback to localStorage
    const allMeals: MealEntry[] = getFromLocalStorage('meals', []);
    return allMeals.filter((meal: MealEntry) => meal.date === date);
  }
}

export async function addMeal(meal: MealEntry): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    // Generate an ID for localStorage
    const mealWithId = {
      ...meal,
      id: Date.now().toString()
    };
    const allMeals: MealEntry[] = getFromLocalStorage('meals', []);
    allMeals.push(mealWithId);
    setToLocalStorage('meals', allMeals);
    return;
  }

  try {
    const mealsRef = ref(db, `users/${user.uid}/meals`);
    // Don't include the id field when saving to Firebase - let Firebase generate the key
    const mealData = {
      originalText: meal.originalText,
      macros: meal.macros,
      date: meal.date,
      timestamp: new Date().toISOString()
    };
    // Push creates a new child with auto-generated key
    await push(mealsRef, mealData);
  } catch (error) {
    console.error('Error adding meal to Realtime Database:', error);
    // Fallback to localStorage
    const mealWithId = {
      ...meal,
      id: Date.now().toString()
    };
    const allMeals: MealEntry[] = getFromLocalStorage('meals', []);
    allMeals.push(mealWithId);
    setToLocalStorage('meals', allMeals);
  }
}

export async function deleteMeal(mealId: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    const allMeals: MealEntry[] = getFromLocalStorage('meals', []);
    const filteredMeals = allMeals.filter((meal: MealEntry) => meal.id !== mealId);
    setToLocalStorage('meals', filteredMeals);
    return;
  }

  try {
    const mealRef = ref(db, `users/${user.uid}/meals/${mealId}`);
    await remove(mealRef);
  } catch (error) {
    console.error('Error deleting meal from Realtime Database:', error);
    // Fallback to localStorage
    const allMeals: MealEntry[] = getFromLocalStorage('meals', []);
    const filteredMeals = allMeals.filter((meal: MealEntry) => meal.id !== mealId);
    setToLocalStorage('meals', filteredMeals);
  }
}

// Utility function to get today's date string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
} 