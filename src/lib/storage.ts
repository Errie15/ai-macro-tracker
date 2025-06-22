import { MacroGoals, MealEntry, DailyProgress, UserProfile, WeightEntry } from '@/types';
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

const MACRO_GOALS_KEY = 'macro-tracker-goals';
const MEALS_KEY = 'macro-tracker-meals';
const USER_PROFILE_KEY = 'macro-tracker-profile';
const WEIGHT_ENTRIES_KEY = 'macro-tracker-weight';

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
    return getFromLocalStorage(MACRO_GOALS_KEY, {
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
    return getFromLocalStorage(MACRO_GOALS_KEY, {
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
    setToLocalStorage(MACRO_GOALS_KEY, goals);
    return;
  }

  try {
    const goalsRef = ref(db, `users/${user.uid}/goals`);
    await set(goalsRef, goals);
  } catch (error) {
    console.error('Error saving macro goals to Realtime Database:', error);
    // Fallback to localStorage
    setToLocalStorage(MACRO_GOALS_KEY, goals);
  }
}

// Meal Functions
export async function getAllMeals(): Promise<MealEntry[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    return getFromLocalStorage(MEALS_KEY, []);
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
    return getFromLocalStorage(MEALS_KEY, []);
  }
}

export async function getMealsByDate(date: string): Promise<MealEntry[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    const allMeals: MealEntry[] = getFromLocalStorage(MEALS_KEY, []);
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
    const allMeals: MealEntry[] = getFromLocalStorage(MEALS_KEY, []);
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
    const allMeals: MealEntry[] = getFromLocalStorage(MEALS_KEY, []);
    allMeals.push(mealWithId);
    setToLocalStorage(MEALS_KEY, allMeals);
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
    const allMeals: MealEntry[] = getFromLocalStorage(MEALS_KEY, []);
    allMeals.push(mealWithId);
    setToLocalStorage(MEALS_KEY, allMeals);
  }
}

export async function deleteMeal(mealId: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    const allMeals: MealEntry[] = getFromLocalStorage(MEALS_KEY, []);
    const filteredMeals = allMeals.filter((meal: MealEntry) => meal.id !== mealId);
    setToLocalStorage(MEALS_KEY, filteredMeals);
    return;
  }

  try {
    const mealRef = ref(db, `users/${user.uid}/meals/${mealId}`);
    await remove(mealRef);
  } catch (error) {
    console.error('Error deleting meal from Realtime Database:', error);
    // Fallback to localStorage
    const allMeals: MealEntry[] = getFromLocalStorage(MEALS_KEY, []);
    const filteredMeals = allMeals.filter((meal: MealEntry) => meal.id !== mealId);
    setToLocalStorage(MEALS_KEY, filteredMeals);
  }
}

// Utility function to get today's date string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// User Profile functions
export const getUserProfile = (): UserProfile => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(USER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading user profile:', error);
    return {};
  }
};

export const setUserProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

// Weight tracking functions
export async function addWeightEntry(weight: number, date: string, note?: string): Promise<void> {
  const user = await getCurrentUser();
  
  const weightEntry: WeightEntry = {
    id: Date.now().toString(),
    weight,
    date,
    timestamp: new Date().toISOString(),
    note
  };
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    const allEntries: WeightEntry[] = getFromLocalStorage(WEIGHT_ENTRIES_KEY, []);
    allEntries.push(weightEntry);
    setToLocalStorage(WEIGHT_ENTRIES_KEY, allEntries);
    return;
  }

  try {
    const weightRef = ref(db, `users/${user.uid}/weight`);
    const weightData: any = {
      weight: weightEntry.weight,
      date: weightEntry.date,
      timestamp: weightEntry.timestamp
    };
    
    // Only include note if it has a value (Firebase doesn't allow undefined)
    if (weightEntry.note !== undefined && weightEntry.note !== null && weightEntry.note !== '') {
      weightData.note = weightEntry.note;
    }
    
    await push(weightRef, weightData);
  } catch (error) {
    console.error('Error adding weight entry to Realtime Database:', error);
    // Fallback to localStorage
    const allEntries: WeightEntry[] = getFromLocalStorage(WEIGHT_ENTRIES_KEY, []);
    allEntries.push(weightEntry);
    setToLocalStorage(WEIGHT_ENTRIES_KEY, allEntries);
  }
}

export async function getWeightEntries(): Promise<WeightEntry[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    return getFromLocalStorage(WEIGHT_ENTRIES_KEY, []);
  }

  try {
    const weightRef = ref(db, `users/${user.uid}/weight`);
    const weightQuery = query(weightRef, orderByChild('date'));
    const snapshot = await get(weightQuery);
    
    if (snapshot.exists()) {
      const weightData = snapshot.val();
      return Object.entries(weightData).map(([key, value]: [string, any]) => ({
        id: key,
        ...value
      } as WeightEntry)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching weight entries from Realtime Database:', error);
    // Fallback to localStorage
    return getFromLocalStorage(WEIGHT_ENTRIES_KEY, []);
  }
}

export async function getWeightEntryByDate(date: string): Promise<WeightEntry | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    const allEntries: WeightEntry[] = getFromLocalStorage(WEIGHT_ENTRIES_KEY, []);
    return allEntries.find(entry => entry.date === date) || null;
  }

  try {
    const weightRef = ref(db, `users/${user.uid}/weight`);
    const weightQuery = query(weightRef, orderByChild('date'), equalTo(date));
    const snapshot = await get(weightQuery);
    
    if (snapshot.exists()) {
      const weightData = snapshot.val();
      const entries = Object.entries(weightData).map(([key, value]: [string, any]) => ({
        id: key,
        ...value
      } as WeightEntry));
      
      // Return the most recent entry for that date if multiple exist
      return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching weight entry by date from Realtime Database:', error);
    // Fallback to localStorage
    const allEntries: WeightEntry[] = getFromLocalStorage(WEIGHT_ENTRIES_KEY, []);
    return allEntries.find(entry => entry.date === date) || null;
  }
}

export async function deleteWeightEntry(entryId: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Fallback to localStorage for non-authenticated users
    const allEntries: WeightEntry[] = getFromLocalStorage(WEIGHT_ENTRIES_KEY, []);
    const filteredEntries = allEntries.filter((entry: WeightEntry) => entry.id !== entryId);
    setToLocalStorage(WEIGHT_ENTRIES_KEY, filteredEntries);
    return;
  }

  try {
    const entryRef = ref(db, `users/${user.uid}/weight/${entryId}`);
    await remove(entryRef);
  } catch (error) {
    console.error('Error deleting weight entry from Realtime Database:', error);
    // Fallback to localStorage
    const allEntries: WeightEntry[] = getFromLocalStorage(WEIGHT_ENTRIES_KEY, []);
    const filteredEntries = allEntries.filter((entry: WeightEntry) => entry.id !== entryId);
    setToLocalStorage(WEIGHT_ENTRIES_KEY, filteredEntries);
  }
}

// Helper function to get dates with data
export async function getDatesWithData(): Promise<{
  mealsData: Set<string>;
  weightData: Set<string>;
  allData: Set<string>;
}> {
  const [meals, weightEntries] = await Promise.all([
    getAllMeals(),
    getWeightEntries()
  ]);
  
  const mealsData = new Set<string>();
  const weightData = new Set<string>();
  const allData = new Set<string>();
  
  // Add dates with meals
  meals.forEach(meal => {
    mealsData.add(meal.date);
    allData.add(meal.date);
  });
  
  // Add dates with weight entries
  weightEntries.forEach(entry => {
    weightData.add(entry.date);
    allData.add(entry.date);
  });
  
  return { mealsData, weightData, allData };
} 