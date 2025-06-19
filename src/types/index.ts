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