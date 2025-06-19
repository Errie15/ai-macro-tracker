import { AIResponse, MacroNutrients } from '@/types';
import { analyzeMeal } from './gemini';

interface FoodItem {
  name: string;
  amount?: number;
  unit?: string;
  grams?: number;
}

/**
 * Enhanced meal analysis that uses USDA data when possible
 */
export async function analyzeEnhancedMeal(mealDescription: string): Promise<AIResponse> {
  try {
    console.log('🔍 Starting enhanced meal analysis for:', mealDescription);

    // First try to extract individual foods from description
    const extractedFoods = await extractFoodsFromDescription(mealDescription);
    console.log('🔍 Original description:', mealDescription);
    console.log('🥘 Extracted foods:', extractedFoods);

    let totalMacros: MacroNutrients = {
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
    };

    let foundUSDAData = false;

    // Try to find nutrition data for each food
    for (const food of extractedFoods) {
      try {
        console.log(`🔎 Searching USDA data for: ${food.name} (${food.grams}g)`);
        
        // Skip USDA for now, use AI fallback
        // const usdaResult: { macros: MacroNutrients } | null = null;
        
        // Since USDA is disabled, we skip this entire block
        console.log(`❌ No USDA data found for: ${food.name} (USDA disabled)`);
      } catch (error) {
        console.error(`Error searching USDA for ${food.name}:`, error);
      }
    }

    // If we found any USDA data, use it
    if (foundUSDAData) {
      console.log('🎯 Using USDA-based data:', totalMacros);
      
      return {
        protein: Math.round(totalMacros.protein),
        carbs: Math.round(totalMacros.carbs),
        fat: Math.round(totalMacros.fat),
        calories: Math.round(totalMacros.calories),
        confidence: 0.9, // High precision with USDA data
      };
    }

    // Otherwise fall back to AI estimation
    console.log('🤖 Falling back to AI estimation');
    const aiResult = await analyzeMeal(mealDescription);
    
    return {
      ...aiResult,
      confidence: 0.6, // Lower precision for AI estimation
    };

  } catch (error) {
    console.error('Error in enhanced meal analysis:', error);
    
    // Last resort: use standard AI
    return await analyzeMeal(mealDescription);
  }
}

/**
 * Filter out non-food items
 */
function isValidFoodName(name: string): boolean {
  const lowercaseName = name.toLowerCase().trim();
  
  // Common non-food words to exclude
  const nonFoodWords = [
    'glass', 'cup', 'bowl', 'plate', 'piece', 'slice', 'bottle', 'can', 'serving',
    '%', 'fat', 'kcal', 'calories', 'grams', 'g', 'ml', 'liter', 'tbsp', 'tsp',
    'of', 'and', 'with', 'the', 'a', 'an', 'some', 'lots'
  ];
  
  // Must be at least 2 characters and not in non-food list
  return lowercaseName.length >= 2 && 
         !nonFoodWords.includes(lowercaseName) &&
         !/^\d+$/.test(lowercaseName) && // not just numbers
         !/^[%\d\s]+$/.test(lowercaseName); // not just % and numbers
}

/**
 * Extract individual foods from meal description
 */
async function extractFoodsFromDescription(description: string): Promise<FoodItem[]> {
  const foods: FoodItem[] = [];
  
  // Enhanced regex patterns for better food extraction - order matters!
  const patterns = [
    // "1 glass of milk 3% fat" - handle containers first to avoid splitting
    /(\d+)\s+(?:glass|cup|bowl|plate|piece|slice|bottle|can|serving)\s+of\s+([a-zA-Z\s%0-9]+)/gi,
    // "100g chicken breast" or "100 g chicken breast"
    /(\d+)\s*g\s+([a-zA-Z\s%0-9]+)/gi,
    // "chicken breast 150g"
    /([a-zA-Z\s%0-9]+)\s+(\d+)\s*g/gi,
    // "1 banana" or "2 apples" - only for clearly food items
    /(\d+)\s+(banana|apple|orange|egg|potato|avocado|chicken|beef|fish|salmon|rice|pasta|bread|cheese|yogurt|milk)\b/gi,
  ];

  // Process patterns in order - containers first to avoid splitting
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    let match;
    
    while ((match = pattern.exec(description)) !== null) {
      const [fullMatch, amountOrName, nameOrAmount] = match;
      
      // Check if this is a "X of Y" pattern (like "1 glass of milk")
      if (fullMatch.includes(' of ')) {
        const amount = parseInt(amountOrName);
        const foodName = nameOrAmount.trim();
        
        // Convert common serving sizes to grams
        let grams = 100; // default
        if (fullMatch.includes('glass') && foodName.includes('milk')) {
          grams = 240; // 1 glass of milk ≈ 240ml ≈ 240g
        } else if (fullMatch.includes('cup')) {
          grams = 200; // 1 cup ≈ 200g
        } else if (fullMatch.includes('bowl')) {
          grams = 300; // 1 bowl ≈ 300g
        }
        
        foods.push({
          name: foodName,
          grams: grams * amount,
        });
        
        // Remove this match from description to avoid re-matching
        description = description.replace(fullMatch, '');
        pattern.lastIndex = 0; // Reset regex
        break; // Move to next pattern
        
      } else if (/^\d+$/.test(amountOrName)) {
        // Format: "100g chicken"
        const foodName = nameOrAmount.trim();
        if (isValidFoodName(foodName)) {
          foods.push({
            name: foodName,
            grams: parseInt(amountOrName),
          });
        }
      } else {
        // Format: "chicken 100g"
        const foodName = amountOrName.trim();
        if (isValidFoodName(foodName)) {
          foods.push({
            name: foodName,
            grams: parseInt(nameOrAmount),
          });
        }
      }
    }
    pattern.lastIndex = 0; // Reset regex for next iteration
  }

  // If no specific amounts found, use whole description
  if (foods.length === 0) {
    // Split on comma or "and"
    const parts = description.split(/,|\sand\s/i);
    
    for (const part of parts) {
      const cleanPart = part.trim();
      if (cleanPart.length > 2) {
        foods.push({
          name: cleanPart,
          grams: 100, // Standard portion
        });
      }
    }
  }

  return foods;
}

/**
 * Test the enhanced function
 */
export const testEnhancedAI = {
  analyzeMeal: (description: string) => analyzeEnhancedMeal(description),
  
  examples: {
    simple: () => analyzeEnhancedMeal('100g chicken breast'),
    complex: () => analyzeEnhancedMeal('150g chicken breast, 100g rice, 1 banana'),
    mixed: () => analyzeEnhancedMeal('protein powder 30g, banana 120g, peanut butter 15g'),
    meal: () => analyzeEnhancedMeal('grilled chicken breast 200g, mashed potatoes 150g, gravy 50g'),
    milk: () => analyzeEnhancedMeal('1 glass of milk 3% fat'),
  }
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).testEnhancedAI = testEnhancedAI;
  console.log('Enhanced AI test functions available as window.testEnhancedAI');
  console.log('Example: window.testEnhancedAI.examples.simple()');
} 