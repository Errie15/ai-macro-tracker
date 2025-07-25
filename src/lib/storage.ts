import { MacroGoals, MealEntry, DailyProgress, UserProfile, WeightEntry, OnboardingState, UserConsent, ConsentData } from '@/types';
import { 
  ref, 
  get, 
  set, 
  push, 
  remove,
  query,
  orderByChild,
  equalTo,
  orderByKey,
  update
} from 'firebase/database';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';

const MACRO_GOALS_KEY = 'macro-tracker-goals';
const MEALS_KEY = 'macro-tracker-meals';
const USER_PROFILE_KEY = 'macro-tracker-profile';
const WEIGHT_ENTRIES_KEY = 'macro-tracker-weight';
const ONBOARDING_KEY = 'macro-tracker-onboarding';
const CONSENT_KEY = 'macro-tracker-consent';

// Helper function to get current authenticated user
async function getCurrentUser(): Promise<any> {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Macro Goals Functions
export async function getMacroGoals(): Promise<MacroGoals> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Return default goals for non-authenticated users
    return {
      protein: 150,
      carbs: 200,
      fat: 70,
      calories: 2000,
    };
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
    return {
      protein: 150,
      carbs: 200,
      fat: 70,
      calories: 2000,
    };
  }
}

export async function setMacroGoals(goals: MacroGoals): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Cannot save macro goals: user not authenticated');
    return;
  }

  try {
    const goalsRef = ref(db, `users/${user.uid}/goals`);
    await set(goalsRef, goals);
  } catch (error) {
    console.error('Error saving macro goals to Realtime Database:', error);
    throw error;
  }
}

// Meal Functions
export async function getAllMeals(): Promise<MealEntry[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Return empty array for non-authenticated users
    return [];
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
    return [];
  }
}

export async function getMealsByDate(date: string): Promise<MealEntry[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Return empty array for non-authenticated users
    return [];
  }

  try {
    const mealsRef = ref(db, `users/${user.uid}/meals`);
    const mealsQuery = query(mealsRef, orderByChild('date'), equalTo(date));
    const snapshot = await get(mealsQuery);
    
    if (snapshot.exists()) {
      const mealsData = snapshot.val();
      console.log('📋 Raw meals data from database:', mealsData);
      
      // Convert object with keys to array and sort by timestamp
      // Use the Firebase-generated key as the meal ID
      const meals = Object.entries(mealsData)
        .map(([key, value]: [string, any]) => {
          const meal = {
            id: key, // Use Firebase key as ID for deletion
            ...value
          } as MealEntry;
          
          console.log(`📝 Processed meal ${key}:`, {
            hasBreakdown: !!(meal.breakdown && meal.breakdown.length > 0),
            breakdownLength: meal.breakdown ? meal.breakdown.length : 0,
            hasReasoning: !!meal.reasoning,
            hasValidation: !!meal.validation
          });
          
          return meal;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
      console.log('✅ Final processed meals:', meals.length);
      return meals;
    } else {
      console.log('📭 No meals found for date:', date);
      return [];
    }
  } catch (error) {
    console.error('Error fetching meals by date from Realtime Database:', error);
    return [];
  }
}

export async function addMeal(meal: MealEntry): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Cannot save meal: user not authenticated');
    return;
  }

  try {
    const mealsRef = ref(db, `users/${user.uid}/meals`);
    // Don't include the id field when saving to Firebase - let Firebase generate the key
    // Include all meal data including breakdown, reasoning, and validation
    const mealData = {
      originalText: meal.originalText,
      macros: meal.macros,
      date: meal.date,
      timestamp: new Date().toISOString(),
      breakdown: meal.breakdown || null,
      reasoning: meal.reasoning || null,
      validation: meal.validation || null,
    };
    
    console.log('💾 Saving meal data to database:', mealData);
    
    // Push creates a new child with auto-generated key
    await push(mealsRef, mealData);
    
    console.log('✅ Meal saved successfully with breakdown data');
  } catch (error) {
    console.error('Error adding meal to Realtime Database:', error);
    throw error;
  }
}

export async function deleteMeal(mealId: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Cannot delete meal: user not authenticated');
    return;
  }

  try {
    const mealRef = ref(db, `users/${user.uid}/meals/${mealId}`);
    await remove(mealRef);
  } catch (error) {
    console.error('Error deleting meal from Realtime Database:', error);
    throw error;
  }
}

export async function updateMeal(mealId: string, updates: Partial<MealEntry>): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Cannot update meal: user not authenticated');
    return;
  }

  try {
    console.log('🔄 Updating meal in database:', { mealId, updates });
    const mealRef = ref(db, `users/${user.uid}/meals/${mealId}`);
    await update(mealRef, updates);
    console.log('✅ Meal updated successfully in database');
  } catch (error) {
    console.error('Error updating meal in Realtime Database:', error);
    throw error;
  }
}

// Utility function to get today's date string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// User Profile functions
export async function getUserProfile(): Promise<UserProfile> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.log('📭 No user authenticated, returning empty profile');
    return {};
  }

  try {
    console.log('📖 Loading profile from Firebase for user:', user.uid);
    const profileRef = ref(db, `users/${user.uid}/profile`);
    const snapshot = await get(profileRef);
    
    if (snapshot.exists()) {
      const profileData = snapshot.val() as UserProfile;
      console.log('✅ Profile loaded from Firebase:', profileData);
      return profileData;
    } else {
      console.log('📭 No profile found in Firebase, returning empty profile');
      return {};
    }
  } catch (error) {
    console.error('❌ Error fetching user profile from Realtime Database:', error);
    return {};
  }
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Cannot save profile: user not authenticated');
    return;
  }

  try {
    console.log('💾 Saving profile to Firebase for user:', user.uid);
    console.log('📊 Profile data:', profile);
    const profileRef = ref(db, `users/${user.uid}/profile`);
    await set(profileRef, profile);
    console.log('✅ Profile saved successfully to Firebase');
  } catch (error) {
    console.error('❌ Error saving user profile to Realtime Database:', error);
    console.error('Error details:', error);
    throw error;
  }
}

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
    console.warn('Cannot save weight entry: user not authenticated');
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
    throw error;
  }
}

export async function getWeightEntries(): Promise<WeightEntry[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Return empty array for non-authenticated users
    return [];
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
    return [];
  }
}

export async function getWeightEntryByDate(date: string): Promise<WeightEntry | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Return null for non-authenticated users
    return null;
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
    return null;
  }
}

export async function deleteWeightEntry(entryId: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Cannot delete weight entry: user not authenticated');
    return;
  }

  try {
    const entryRef = ref(db, `users/${user.uid}/weight/${entryId}`);
    await remove(entryRef);
  } catch (error) {
    console.error('Error deleting weight entry from Realtime Database:', error);
    throw error;
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

// Onboarding Functions
export async function getOnboardingState(): Promise<OnboardingState> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Return default onboarding state for non-authenticated users
    return {
      isCompleted: false,
      currentStep: 0,
      completedSteps: []
    };
  }

  try {
    const onboardingRef = ref(db, `users/${user.uid}/onboarding`);
    const snapshot = await get(onboardingRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as OnboardingState;
    } else {
      // Return default onboarding state for new users
      const defaultState: OnboardingState = {
        isCompleted: false,
        currentStep: 0,
        completedSteps: []
      };
      return defaultState;
    }
  } catch (error) {
    console.error('Error fetching onboarding state from Realtime Database:', error);
    return {
      isCompleted: false,
      currentStep: 0,
      completedSteps: []
    };
  }
}

export async function setOnboardingState(state: OnboardingState): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Cannot save onboarding state: user not authenticated');
    return;
  }

  try {
    const onboardingRef = ref(db, `users/${user.uid}/onboarding`);
    await set(onboardingRef, state);
  } catch (error) {
    console.error('Error saving onboarding state to Realtime Database:', error);
    throw error;
  }
}

export async function isUserOnboarded(): Promise<boolean> {
  const onboardingState = await getOnboardingState();
  return onboardingState.isCompleted;
}

// Theme Settings Functions
export async function getUserTheme(): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Get from localStorage for non-authenticated users
    try {
      const stored = localStorage.getItem('macro-tracker-theme');
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Could not load theme from localStorage:', error);
      return false;
    }
  }

  try {
    const themeRef = ref(db, `users/${user.uid}/preferences/theme`);
    const snapshot = await get(themeRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as boolean;
    } else {
      // Return default theme (light mode) for new users
      return false;
    }
  } catch (error) {
    console.error('Error fetching theme preference from Realtime Database:', error);
    return false;
  }
}

export async function setUserTheme(isDarkMode: boolean): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Store in localStorage for non-authenticated users
    try {
      localStorage.setItem('macro-tracker-theme', JSON.stringify(isDarkMode));
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
    return;
  }

  try {
    const themeRef = ref(db, `users/${user.uid}/preferences/theme`);
    await set(themeRef, isDarkMode);
  } catch (error) {
    console.error('Error saving theme preference to Realtime Database:', error);
    throw error;
  }
}

// Language Preference Functions
export async function getUserLanguage(): Promise<string> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Get from localStorage for non-authenticated users
    try {
      const stored = localStorage.getItem('macro-tracker-language');
      return stored ? JSON.parse(stored) : 'en-US';
    } catch (error) {
      console.warn('Could not load language from localStorage:', error);
      return 'en-US';
    }
  }

  try {
    const languageRef = ref(db, `users/${user.uid}/preferences/language`);
    const snapshot = await get(languageRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as string;
    } else {
      // Default to English
      return 'en-US';
    }
  } catch (error) {
    console.error('Error fetching language preference from Realtime Database:', error);
    return 'en-US';
  }
}

export async function setUserLanguage(language: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Store in localStorage for non-authenticated users
    try {
      localStorage.setItem('macro-tracker-language', JSON.stringify(language));
    } catch (error) {
      console.warn('Could not save language to localStorage:', error);
    }
    return;
  }

  try {
    const languageRef = ref(db, `users/${user.uid}/preferences/language`);
    await set(languageRef, language);
  } catch (error) {
    console.error('Error saving language preference to Realtime Database:', error);
    throw error;
  }
}

// Consent Functions
export async function getUserConsent(): Promise<UserConsent> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { hasConsented: false };
  }

  try {
    const consentRef = ref(db, `users/${user.uid}/consent`);
    const snapshot = await get(consentRef);
    
    if (snapshot.exists()) {
      const consentData = snapshot.val() as ConsentData;
      return {
        hasConsented: consentData.privacyPolicyAccepted && consentData.termsOfServiceAccepted,
        consentData
      };
    } else {
      return { hasConsented: false };
    }
  } catch (error) {
    console.error('Error fetching user consent from Realtime Database:', error);
    return { hasConsented: false };
  }
}

export async function setUserConsent(privacyAccepted: boolean, termsAccepted: boolean, version?: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Cannot save user consent: user not authenticated');
    return;
  }

  const consentData: ConsentData = {
    privacyPolicyAccepted: privacyAccepted,
    termsOfServiceAccepted: termsAccepted,
    consentDate: new Date().toISOString(),
    consentVersion: version || '1.0'
  };

  try {
    const consentRef = ref(db, `users/${user.uid}/consent`);
    await set(consentRef, consentData);
  } catch (error) {
    console.error('Error saving user consent to Realtime Database:', error);
    throw error;
  }
}

export async function hasUserConsented(): Promise<boolean> {
  const consent = await getUserConsent();
  return consent.hasConsented;
} 