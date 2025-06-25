import { AIResponse, MacroNutrients } from '@/types';
import { analyzeMeal } from './gemini';
import { getAllMeals } from './storage';

interface FoodItem {
  name: string;
  amount?: number;
  unit?: string;
  grams?: number;
}

/**
 * Enhanced meal analysis that checks for previously saved meals first, then uses AI
 */
export async function analyzeEnhancedMeal(mealDescription: string): Promise<AIResponse> {
  try {
    console.log('🔍 Starting enhanced meal analysis for:', mealDescription);

    // First, check if we have analyzed this exact meal before
    const previousMeal = await findPreviousMeal(mealDescription);
    if (previousMeal) {
      console.log('🎯 Found previous analysis for this meal, using saved values for consistency');
      console.log(`📋 Previous meal: "${previousMeal.originalText}"`);
      console.log(`🔄 Reusing values: P:${previousMeal.macros.protein}g C:${previousMeal.macros.carbs}g F:${previousMeal.macros.fat}g Kcal:${previousMeal.macros.calories}`);
      return {
        protein: previousMeal.macros.protein,
        carbs: previousMeal.macros.carbs,
        fat: previousMeal.macros.fat,
        calories: previousMeal.macros.calories,
        breakdown: previousMeal.breakdown || [],
        reasoning: previousMeal.reasoning || 'Using previously saved analysis for consistency',
        validation: previousMeal.validation || 'Values from previous analysis',
        confidence: 0.95, // High confidence for previously saved data
      };
    }

    // If no previous meal found, extract foods for logging (USDA search disabled)
    const extractedFoods = await extractFoodsFromDescription(mealDescription);
    console.log('🔍 Original description:', mealDescription);
    console.log('🥘 Extracted foods:', extractedFoods);

    // USDA search is completely disabled - skip to AI analysis
    for (const food of extractedFoods) {
      console.log(`🔎 Searching USDA data for: ${food.name} (${food.grams}g)`);
      console.log(`❌ No USDA data found for: ${food.name} (USDA disabled)`);
    }

    // Use AI estimation directly
    console.log('🤖 Falling back to AI estimation');
    const aiResult = await analyzeMeal(mealDescription);
    
    return {
      ...aiResult,
      confidence: aiResult.confidence || 0.6, // Lower precision for AI estimation
      breakdown: aiResult.breakdown,
      reasoning: aiResult.reasoning,
      validation: aiResult.validation,
    };

  } catch (error) {
    console.error('Error in enhanced meal analysis:', error);
    
    // Re-throw the error instead of falling back to standard AI to prevent zero-value meals
    throw error;
  }
}

/**
 * Find a previously analyzed meal with similar description
 */
async function findPreviousMeal(description: string) {
  try {
    const allMeals = await getAllMeals();
    
    // Normalize the description for comparison
    const normalizedDescription = normalizeDescription(description);
    
    // Look for exact or very similar matches
    for (const meal of allMeals) {
      const normalizedMealText = normalizeDescription(meal.originalText);
      
      // Check for exact match first
      if (normalizedMealText === normalizedDescription) {
        console.log(`🎯 Found exact match: "${meal.originalText}"`);
        return meal;
      }
      
      // Check for very similar match (85% similarity for high confidence)
      const similarity = calculateSimilarity(normalizedDescription, normalizedMealText);
      if (similarity > 0.85) {
        console.log(`🎯 Found similar match (${(similarity * 100).toFixed(1)}%): "${meal.originalText}"`);
        return meal;
      }
    }
    
    console.log('📭 No previous analysis found for this meal');
    return null;
  } catch (error) {
    console.error('Error searching for previous meals:', error);
    return null;
  }
}

/**
 * Normalize description for comparison
 */
function normalizeDescription(description: string): string {
  return description
    .toLowerCase()
    .trim()
    .replace(/[^\w\s%]/g, '') // Remove punctuation but keep %
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\b(a|an|the|with|and|of|one|1)\b/g, '') // Remove common words and numbers
    .replace(/\bglass\b/g, 'glass') // Normalize container words
    .replace(/\bcup\b/g, 'cup')
    .replace(/\bmilk\b/g, 'milk')
    .replace(/\bfat\b/g, 'fat')
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .trim();
}

/**
 * Calculate similarity between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(' ').filter(w => w.length > 2);
  const words2 = str2.split(' ').filter(w => w.length > 2);
  
  if (words1.length === 0 && words2.length === 0) return 1;
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
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