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
}

export interface MealEntry {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD format
  originalText: string;
  macros: MacroNutrients;
}

export interface DailyProgress {
  date: string;
  totalMacros: MacroNutrients;
  goals: MacroGoals;
  meals: MealEntry[];
}

export interface AIResponse {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  confidence?: number;
} 