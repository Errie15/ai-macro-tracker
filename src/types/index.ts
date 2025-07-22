export interface MacroGoals {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  alcohol_info?: {
    alcohol?: number; // grams of alcohol from individual meals
    total_alcohol_calories: number; // calculated calories from alcohol
  };
}

export interface FoodBreakdown {
  food: string;
  estimatedAmount: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  source?: string;
  serving_info?: string;
  alcohol?: number; // grams of alcohol for alcoholic items
}

export interface AIResponse extends MacroNutrients {
  confidence?: number;
  breakdown?: FoodBreakdown[];
  reasoning?: string;
  validation?: string;
}

export interface MealEntry {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD format
  originalText: string;
  macros: MacroNutrients;
  breakdown?: FoodBreakdown[];
  reasoning?: string;
  validation?: string;
}

export interface DailyProgress {
  date: string;
  totalMacros: MacroNutrients;
  goals: MacroGoals;
  meals: MealEntry[];
}

// Onboarding types
export interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  completedSteps: string[];
}

export type OnboardingStep = 'consent' | 'username' | 'macros' | 'tutorial' | 'personal' | 'macros-suggested' | 'tour';

// Consent and GDPR compliance types
export interface ConsentData {
  privacyPolicyAccepted: boolean;
  termsOfServiceAccepted: boolean;
  consentDate: string; // ISO string
  consentVersion?: string; // Version of terms/privacy policy
}

export interface UserConsent {
  hasConsented: boolean;
  consentData?: ConsentData;
}

// Profile and user data types
export interface UserProfile {
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other' | '';
  height?: number; // in cm
  weight?: number; // in kg
  age?: number;
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitnessGoals?: FitnessGoal[];
  fitnessGoal?: 'lose_fat' | 'build_muscle' | 'maintain'; // Simplified fitness goal for onboarding
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface FitnessGoal {
  id: string;
  type: 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'improve_endurance' | 'get_stronger' | 'improve_health' | 'other';
  description?: string;
  targetDate?: string; // YYYY-MM-DD format
  isActive: boolean;
}

export interface WeightEntry {
  id: string;
  weight: number; // in kg
  date: string; // YYYY-MM-DD format
  timestamp: string; // ISO string
  note?: string;
}

export interface DayDetail {
  date: string;
  meals: MealEntry[];
  weightEntry?: WeightEntry;
  dailyProgress: DailyProgress;
  userGoals: FitnessGoal[];
}

// USDA FoodData Central API types
export interface USDANutrient {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  derivationCode?: string;
  derivationDescription?: string;
  value?: number;
  // Alternative structure for AbridgedFoodNutrient
  number?: number;
  name?: string;
  amount?: number;
  // Nested nutrient structure for detailed food items
  nutrient?: {
    id: number;
    number: string;
    name: string;
    unitName: string;
  };
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  marketCountry?: string;
  foodCategory?: string;
  modifiedDate?: string;
  availableDate?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients: USDANutrient[];
}

export interface USDASearchResult {
  fdcId: number;
  description: string;
  dataType?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  score?: number;
}

export interface USDASearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  pageList: number[];
  foodSearchCriteria: {
    query: string;
    dataType: string[];
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortOrder: string;
  };
  foods: USDASearchResult[];
}

export interface FoodSearchItem {
  fdcId: number;
  description: string;
  brandName?: string;
  dataType?: string;
  servingInfo?: string;
} 