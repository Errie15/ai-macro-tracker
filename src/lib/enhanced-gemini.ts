import { AIResponse, MacroNutrients } from '@/types';
import { analyzeMeal } from './gemini';
import { getAllMeals } from './storage';

interface FoodItem {
  name: string;
  amount?: number;
  unit?: string;
  grams?: number;
}

interface QuantityInfo {
  hasExplicitQuantities: boolean;
  extractedQuantities: { item: string; quantity: string }[];
}

/**
 * Enhanced meal analysis that prevents cross-meal contamination
 * CRITICAL RULE: Never override explicit quantities from current input
 */
export async function analyzeEnhancedMeal(mealDescription: string): Promise<AIResponse> {
  try {
    console.log('🔍 Starting enhanced meal analysis for:', mealDescription);

    // STEP 1: Check if current input has explicit quantities
    const quantityInfo = analyzeQuantities(mealDescription);
    console.log('📏 Quantity analysis:', quantityInfo);

    // STEP 2: Only check for previous meals if NO explicit quantities in current input
    if (!quantityInfo.hasExplicitQuantities) {
      console.log('🔍 No explicit quantities found - checking for previous similar meals...');
      const previousMeal = await findPreviousMeal(mealDescription, quantityInfo);
      
      if (previousMeal) {
        console.log('🎯 Found previous analysis for vague description, using saved values');
        console.log(`📋 Previous meal: "${previousMeal.originalText}"`);
        console.log(`🔄 Reusing values: P:${previousMeal.macros.protein}g C:${previousMeal.macros.carbs}g F:${previousMeal.macros.fat}g Kcal:${previousMeal.macros.calories}`);
        return {
          protein: previousMeal.macros.protein,
          carbs: previousMeal.macros.carbs,
          fat: previousMeal.macros.fat,
          calories: previousMeal.macros.calories,
          breakdown: previousMeal.breakdown || [],
          reasoning: `Using previously saved analysis for similar vague description: "${previousMeal.originalText}"`,
          validation: 'Values from previous analysis of similar meal',
          confidence: 0.90,
          ...(previousMeal.macros.alcohol_info && { alcohol_info: previousMeal.macros.alcohol_info }),
        };
      }
    } else {
      console.log('⚠️ EXPLICIT QUANTITIES DETECTED - Using current input only, ignoring previous meals');
      console.log('📊 Current quantities:', quantityInfo.extractedQuantities);
    }

    // STEP 3: Use AI analysis with strict quantity preservation
    console.log('🤖 Proceeding with AI analysis (respecting current input quantities)');
    const aiResult = await analyzeMeal(mealDescription);
    
    console.log('🍺 AI result from analyzeMeal:', aiResult);
    console.log('🍺 AI result alcohol_info:', aiResult.alcohol_info);
    
    return {
      ...aiResult,
      confidence: quantityInfo.hasExplicitQuantities ? 0.85 : 0.70,
      breakdown: aiResult.breakdown,
      reasoning: aiResult.reasoning,
      validation: aiResult.validation,
      ...(aiResult.alcohol_info && { alcohol_info: aiResult.alcohol_info }),
    };

  } catch (error) {
    console.error('Error in enhanced meal analysis:', error);
    throw error;
  }
}

/**
 * Analyze if the meal description contains explicit quantities
 * CRITICAL: This determines whether we can reuse previous meals or not
 */
function analyzeQuantities(description: string): QuantityInfo {
  const extractedQuantities: { item: string; quantity: string }[] = [];
  
  // Patterns that indicate explicit quantities (comprehensive, multi-language)
  const explicitQuantityPatterns = [
    // Weight measurements: "100g", "150 grams", "2.5 kg"
    /(\d+(?:\.\d+)?)\s*(?:g|gram|grams|kg|kilo|kilograms?)\s+([a-zA-ZäöåæøÅÄÖ\s]+)/gi,
    /([a-zA-ZäöåæøÅÄÖ\s]+)\s+(\d+(?:\.\d+)?)\s*(?:g|gram|grams|kg|kilo|kilograms?)/gi,
    
    // Volume measurements: "250ml", "2 liters", "1 cup", "3 tablespoons"
    /(\d+(?:\.\d+)?)\s*(?:ml|mL|cl|dl|l|liter|liters?|cups?|tbsp|tablespoons?|tsp|teaspoons?|msk|tsk)\s+([a-zA-ZäöåæøÅÄÖ\s]+)/gi,
    /([a-zA-ZäöåæøÅÄÖ\s]+)\s+(\d+(?:\.\d+)?)\s*(?:ml|mL|cl|dl|l|liter|liters?|cups?|tbsp|tablespoons?|tsp|teaspoons?|msk|tsk)/gi,
    
    // Count-based quantities - UNIVERSAL PATTERN (any number + any word)
    // This catches "2 bananer", "3 äpplen", "5 crackers", etc.
    /(\d+(?:\.\d+)?)\s+([a-zA-ZäöåæøÅÄÖ]+(?:\w+)?)/gi,
    
    // Serving sizes: "1 serving", "2 portions", "half a portion"
    /(\d+(?:\.\d+)?|half|quarter|halv|kvart)\s+(?:servings?|portions?|portioner?)\s+(?:of\s+|av\s+)?([a-zA-ZäöåæøÅÄÖ\s]+)/gi,
    
    // Container-based with numbers: "2 glasses of milk", "3 bowls of rice", "1 glas mjölk"
    /(\d+(?:\.\d+)?)\s+(?:glasses?|bowls?|plates?|cups?|glas|skål|tallrik|kopp)\s+(?:of\s+|av\s+)?([a-zA-ZäöåæøÅÄÖ\s]+)/gi,
  ];

  let hasExplicit = false;
  
  for (const pattern of explicitQuantityPatterns) {
    let match;
    while ((match = pattern.exec(description)) !== null) {
      hasExplicit = true;
      
      // Handle different match formats
      if (match[1] && match[2]) {
        // First number/quantity, then food item
        const quantity = match[1];
        const item = match[2].trim();
        extractedQuantities.push({ item, quantity });
        console.log(`📏 Found explicit quantity: ${quantity} ${item}`);
      }
    }
    pattern.lastIndex = 0; // Reset regex
  }

  return {
    hasExplicitQuantities: hasExplicit,
    extractedQuantities
  };
}

/**
 * Find a previously analyzed meal - ONLY for vague descriptions without explicit quantities
 * CRITICAL: This should never override explicit quantities from current input
 */
async function findPreviousMeal(description: string, quantityInfo: QuantityInfo) {
  try {
    // SAFETY CHECK: Never reuse meals when current input has explicit quantities
    if (quantityInfo.hasExplicitQuantities) {
      console.log('🚨 SAFETY CHECK: Current input has explicit quantities - blocking previous meal reuse');
      return null;
    }

    const allMeals = await getAllMeals();
    
    // Normalize the description for comparison (keep this for vague descriptions)
    const normalizedDescription = normalizeDescriptionForVagueMatch(description);
    
    // Look for exact matches of vague descriptions only
    for (const meal of allMeals) {
      const mealQuantityInfo = analyzeQuantities(meal.originalText);
      
      // Only match against meals that ALSO have no explicit quantities
      if (!mealQuantityInfo.hasExplicitQuantities) {
        const normalizedMealText = normalizeDescriptionForVagueMatch(meal.originalText);
        
        // Check for exact match of vague descriptions
        if (normalizedMealText === normalizedDescription) {
          console.log(`🎯 Found exact vague match: "${meal.originalText}"`);
          return meal;
        }
        
        // Check for very similar match (90% similarity for vague descriptions only)
        const similarity = calculateSimilarity(normalizedDescription, normalizedMealText);
        if (similarity > 0.90) {
          console.log(`🎯 Found similar vague match (${(similarity * 100).toFixed(1)}%): "${meal.originalText}"`);
          return meal;
        }
      }
    }
    
    console.log('📭 No previous vague meal analysis found');
    return null;
  } catch (error) {
    console.error('Error searching for previous meals:', error);
    return null;
  }
}

/**
 * Normalize description ONLY for vague meal matching (preserves food names)
 */
function normalizeDescriptionForVagueMatch(description: string): string {
  return description
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\b(a|an|the|with|and|of|some)\b/g, '') // Remove common words but keep quantities
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
    // Test explicit quantities (should never reuse previous meals)
    explicit: () => analyzeEnhancedMeal('2 bananas'), // Should use exactly 2, not reuse "5 bananas"
    explicitMixed: () => analyzeEnhancedMeal('150g chicken breast, 100g rice'), // Should use exact amounts
    
    // Test vague descriptions (can reuse previous meals)
    vague: () => analyzeEnhancedMeal('some chicken and rice'), // Can reuse similar vague meal
    vagueContainer: () => analyzeEnhancedMeal('a bowl of pasta'), // Can reuse similar vague meal
    
    // Test cases that prevent contamination
    contamination: () => analyzeEnhancedMeal('3 eggs'), // Should not reuse "5 eggs" from history
  }
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).testEnhancedAI = testEnhancedAI;
  console.log('Enhanced AI test functions available as window.testEnhancedAI');
  console.log('Example: window.testEnhancedAI.examples.explicit()');
} 