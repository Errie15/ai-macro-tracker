import { USDASearchResponse, USDAFood, FoodSearchItem, MacroNutrients } from '@/types';

const USDA_API_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';

// Nutrient Numbers from USDA database (these are the 'number' field values)
const NUTRIENT_NUMBERS = {
  PROTEIN: 203,      // Protein (g)
  CARBS: 205,        // Carbohydrate, by difference (g)
  FAT: 204,          // Total lipid (fat) (g)
  CALORIES: 208,     // Energy (kcal)
  FIBER: 291,        // Fiber, total dietary (g)
  SUGARS: 269,       // Sugars, total including NLEA (g)
  SODIUM: 307,       // Sodium, Na (mg)
} as const;

export interface SearchFoodOptions {
  query: string;
  dataTypes?: string[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: 'dataType.keyword' | 'description.keyword' | 'fdcId' | 'publishedDate';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search for foods in USDA FoodData Central
 */
export async function searchFoods(options: SearchFoodOptions): Promise<FoodSearchItem[]> {
  try {
    const {
      query,
      dataTypes = ['Branded', 'Foundation', 'SR Legacy'],
      pageSize = 25,
      pageNumber = 1,
      sortBy = 'dataType.keyword',
      sortOrder = 'asc'
    } = options;

    console.log('Searching USDA API:', { query, dataTypes, pageSize });

    const searchBody = {
      query,
      dataType: dataTypes,
      pageSize,
      pageNumber,
      sortBy,
      sortOrder
    };

    const response = await fetch(`${USDA_API_BASE_URL}/foods/search?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('USDA API error:', response.status, errorText);
      throw new Error(`USDA API error (${response.status}): ${errorText}`);
    }

    const data: USDASearchResponse = await response.json();
    console.log('USDA search results:', data.totalHits, 'hits');

    // Konvertera till enklare format
    const foods: FoodSearchItem[] = data.foods.map(food => ({
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName,
      dataType: food.dataType,
      servingInfo: food.brandOwner ? `${food.brandOwner}` : undefined,
    }));

    return foods;
  } catch (error) {
    console.error('Error searching foods:', error);
    throw error;
  }
}

/**
 * Get detailed nutrition info for a specific food
 */
export async function getFoodDetails(fdcId: number): Promise<USDAFood> {
  try {
    console.log('Fetching food details for FDC ID:', fdcId);

    const response = await fetch(`${USDA_API_BASE_URL}/food/${fdcId}?api_key=${API_KEY}&format=full&nutrients=203,204,205,208`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('USDA API error:', response.status, errorText);
      throw new Error(`USDA API error (${response.status}): ${errorText}`);
    }

    const food: USDAFood = await response.json();
    console.log('Fetched food details:', food.description);

    return food;
  } catch (error) {
    console.error('Error fetching food details:', error);
    throw error;
  }
}

/**
 * Extract macronutrients from USDA food data
 */
export function extractMacrosFromUSDAFood(food: USDAFood, portionGrams: number = 100): MacroNutrients {
  const nutrients = food.foodNutrients;
  
  // Find nutrients per 100g - check both direct number field and nested nutrient.number
  const getNutrientValue = (nutrientNumber: number): number => {
    // Try both possible data structures
    let nutrient = nutrients.find(n => 
      n.nutrientId === nutrientNumber || 
      (n as any).number === nutrientNumber ||
      (n as any).nutrient?.number === nutrientNumber.toString() ||
      (n as any).nutrient?.id === nutrientNumber
    );
    
    const value = nutrient?.value || (nutrient as any)?.amount || 0;
    console.log(`Nutrient ${nutrientNumber}:`, nutrient ? `${value} ${nutrient.unitName || (nutrient as any)?.nutrient?.unitName}` : 'not found');
    return value;
  };

  console.log('Available nutrients:', nutrients.map(n => 
    `${n.nutrientId || (n as any).number || (n as any).nutrient?.number}: ${n.nutrientName || (n as any).name || (n as any).nutrient?.name} = ${n.value || (n as any).amount} ${n.unitName || (n as any).nutrient?.unitName}`
  ));

  const protein = getNutrientValue(NUTRIENT_NUMBERS.PROTEIN);
  const carbs = getNutrientValue(NUTRIENT_NUMBERS.CARBS);
  const fat = getNutrientValue(NUTRIENT_NUMBERS.FAT);
  const calories = getNutrientValue(NUTRIENT_NUMBERS.CALORIES);

  console.log('Raw nutrient values:', { protein, carbs, fat, calories });

  // Scale according to portion (USDA data is per 100g by default)
  const scaleFactor = portionGrams / 100;

  const macros: MacroNutrients = {
    protein: Math.round(protein * scaleFactor * 10) / 10,
    carbs: Math.round(carbs * scaleFactor * 10) / 10,
    fat: Math.round(fat * scaleFactor * 10) / 10,
    calories: Math.round(calories * scaleFactor),
  };

  console.log(`Extracted macros for ${portionGrams}g of ${food.description}:`, macros);

  return macros;
}

/**
 * Use simple heuristics to pick the best food match from search results
 */
function pickBestFoodMatch(originalQuery: string, searchResults: FoodSearchItem[]): FoodSearchItem {
  // If only one result, return it
  if (searchResults.length === 1) {
    return searchResults[0];
  }

  const queryLower = originalQuery.toLowerCase();
  let bestMatch = searchResults[0];
  let bestScore = 0;

  for (const food of searchResults) {
    const descLower = food.description.toLowerCase();
    let score = 0;

    // Exact word matches get high scores
    const queryWords = queryLower.split(/\s+/);
    const descWords = descLower.split(/\s+/);
    
    for (const qWord of queryWords) {
      if (qWord.length <= 2) continue; // Skip very short words
      
      for (const dWord of descWords) {
        if (dWord.includes(qWord) || qWord.includes(dWord)) {
          score += qWord === dWord ? 10 : 5; // Exact match vs partial
        }
      }
    }

    // Penalize obviously wrong matches
    if (queryLower.includes('milk') && descLower.includes('meat')) {
      score -= 50;
    }
    if (queryLower.includes('chicken') && descLower.includes('milk')) {
      score -= 50;
    }

    // Prefer generic foods over branded
    if (!food.brandName) {
      score += 2;
    }

    // Prefer shorter, simpler descriptions
    score -= descLower.length / 20;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = food;
    }
  }

  console.log(`Selected best match: ${bestMatch.description} (score: ${bestScore})`);
  return bestMatch;
}

/**
 * Search and get nutrition info for a food in one step
 */
export async function searchAndGetNutrition(
  query: string, 
  portionGrams: number = 100
): Promise<{ food: USDAFood; macros: MacroNutrients } | null> {
  try {
    console.log('Searching and getting nutrition info for:', query);

    // Search for multiple foods to give AI options
    const searchResults = await searchFoods({ query, pageSize: 10 });
    
    if (searchResults.length === 0) {
      console.log('No food found for:', query);
      return null;
    }

    console.log(`Found ${searchResults.length} potential matches for "${query}"`);
    
    // Use heuristics to pick the best match
    const bestMatch = pickBestFoodMatch(query, searchResults);
    console.log('Selected best match:', bestMatch.description);

    // Get detailed info
    const food = await getFoodDetails(bestMatch.fdcId);
    
    // Extract macros
    const macros = extractMacrosFromUSDAFood(food, portionGrams);

    return { food, macros };
  } catch (error) {
    console.error('Error searching and getting nutrition info:', error);
    return null;
  }
}

// Debug function to inspect API response structure
export async function debugUSDAFood(query: string): Promise<void> {
  try {
    console.log('🔍 Debugging USDA API for:', query);
    
    // First search
    const searchResults = await searchFoods({ query, pageSize: 1 });
    if (searchResults.length === 0) {
      console.log('❌ No search results found');
      return;
    }
    
    console.log('🔍 Search result:', searchResults[0]);
    
    // Get detailed food info
    const food = await getFoodDetails(searchResults[0].fdcId);
    console.log('📊 Full food object:', food);
    console.log('📊 Food nutrients array length:', food.foodNutrients?.length);
    console.log('📊 First few nutrients:', food.foodNutrients?.slice(0, 5));
    
    // Check different possible nutrient structures
    food.foodNutrients?.forEach((nutrient, index) => {
      if (index < 10) { // Only log first 10 to avoid spam
        console.log(`Nutrient ${index}:`, {
          'nutrient.nutrientId': nutrient.nutrientId,
          'nutrient.number': (nutrient as any).number,
          'nutrient.nutrient?.number': (nutrient as any).nutrient?.number,
          'nutrient.nutrient?.id': (nutrient as any).nutrient?.id,
          'nutrient.name': nutrient.nutrientName || (nutrient as any).name || (nutrient as any).nutrient?.name,
          'nutrient.value': nutrient.value || (nutrient as any).amount,
          'nutrient.unit': nutrient.unitName || (nutrient as any).nutrient?.unitName
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Helper function to test API in console
export const testUSDAAPI = {
  search: (query: string) => searchFoods({ query }),
  getFood: (fdcId: number) => getFoodDetails(fdcId),
  getNutrition: (query: string, grams: number = 100) => searchAndGetNutrition(query, grams),
  debug: (query: string) => debugUSDAFood(query),
  
  // Examples for testing
  examples: {
    searchChicken: () => searchFoods({ query: 'chicken breast' }),
    searchBanana: () => searchFoods({ query: 'banana' }),
    getChickenNutrition: () => searchAndGetNutrition('chicken breast cooked', 150),
    getBananaNutrition: () => searchAndGetNutrition('banana', 120),
    getMilkNutrition: () => searchAndGetNutrition('milk', 240),
    debugMozzarella: () => debugUSDAFood('mozzarella'),
    testMilkSearch: () => searchAndGetNutrition('100 ml of milk', 100),
  }
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).testUSDA = testUSDAAPI;
  (window as any).debugUSDA = debugUSDAFood;
  console.log('USDA API test functions available as window.testUSDA');
  console.log('Debug function available as window.debugUSDA');
  console.log('Examples:');
  console.log('  window.testUSDA.examples.searchChicken()');
  console.log('  window.testUSDA.debug("mozzarella")');
  console.log('  window.debugUSDA("chicken breast")');
} 