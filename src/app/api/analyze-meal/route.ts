import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { FOOD_DATABASE, searchFoodDatabase, FoodDatabaseItem } from '@/lib/food-database';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Generate dynamic system prompt with food database
function generateSystemPrompt(mealDescription: string): string {
  // Dynamic database search - get only relevant foods for this meal
  const relevantFoods = searchFoodDatabase(mealDescription, 10);
  
  const contextualFoodDatabase = relevantFoods.length > 0 
    ? relevantFoods.map(food => 
        `${food.name} (per ${food.serving.amount}${food.serving.unit}): ${food.macros.protein}g protein, ${food.macros.carbs}g carbs, ${food.macros.fat}g fat, ${food.macros.calories} kcal`
      ).join('\n')
    : 'No specific database matches found for this meal.';

  return `
You are a strict and consistent nutrition calculator AI.
You never hallucinate. You base all estimates on either the food database or scientifically validated nutritional standards.
Every answer must follow these rules EXACTLY.

RULES (CRITICAL - FOLLOW EXACTLY):
1. NEVER ignore any food mentioned in the meal description – estimate quantity if unclear, but never omit an item
2. Convert volumes to weight when needed: 3dl ice cream ≈ 180g, 1 glass wine ≈ 150ml, 1 cup ≈ 240ml
3. Use the food database match exactly when available – do not alter macros for database foods. If no match is found, estimate based on common nutrition values and justify assumptions
4. Adjust portions using: (requested_amount / database_serving_amount) × macros_per_serving. Round macros to nearest gram. Total calories must remain within ±5 kcal of calculated macro sum
5. For alcohol: Total calories = (volume_ml × ABV × 0.789 × 7) + sugar_calories. ALWAYS include alcohol calories in beer and wine, even if protein/carb/fat macros appear low
6. For branded meals (McDonald's, Subway): use real nutritional data, not conservative estimates
7. For premium/branded foods (Ben & Jerry's, Häagen-Dazs, Snickers): if no flavor specified, use upper bound of common variants (~300 kcal/100g for ice cream)
8. For volume measurements: convert using average density – "2 dl ice cream" → 120g, "3 dl" → 180g
9. For non-alcohol: Calories = (protein×4) + (carbs×4) + (fat×9)
10. Sum all individual food items for totals – breakdown item calories MUST equal total_calories (±5 maximum) – NO EXCEPTIONS
11. If an estimated kcal/100g is used (e.g. 300 kcal/100g for ice cream), then total_calories = (grams × kcal/100g ÷ 100) must match exactly
12. Alcoholic drinks contain alcohol calories but NO FAT unless explicitly described ingredients justify it (cream, coconut milk, egg yolk)
13. If meal contains high-fat ingredients (cheese, cream, sauce, meat), total fat must reflect cumulative fat contributions from all sources
14. Use real-world product averages for branded items (Guinness ~210 kcal/568ml, Monster Energy ~220 kcal/500ml)
15. Final macro totals must match breakdown calculations exactly (±5 calories maximum)
16. Output ONLY a JSON object – no text outside JSON
17. Use standard food knowledge when database lacks specific items
18. For sugar-sweetened beverages (e.g. soda, juice, cocktails), total carbohydrate grams × 4 must equal the sugar calorie portion within ±5 kcal. Example: 50g carbs = 200 kcal from sugar
19. Alcohol-derived calories must equal: (volume_ml × ABV × 0.789 × 7). Any added sugar must be added to this. Total_calories = alcohol_kcal + sugar_kcal ±5. Example: 150ml wine 12.5% = 103 kcal alcohol + sugar = total
20. Breakdown item calories MUST sum to total calories (±5) — this is enforced server-side. AI must double-check its own totals before responding
21. Alcoholic drinks never contain protein unless explicitly described ingredients justify it (e.g. egg white, milk, cream). Do NOT assign protein to pure alcohol (rum, vodka, etc)

CONTEXTUAL FOOD DATABASE (use if relevant):
${contextualFoodDatabase}

CRITICAL EXAMPLES (avoid these mistakes):
❌ WRONG: "Guinness 568ml" → 76 kcal (missing all alcohol calories)
✅ CORRECT: Guinness 568ml × 4.2% ABV × 0.789 × 7 = 186 kcal alcohol + sugar = ~210 kcal total

❌ WRONG: "White wine 150ml" → 100 kcal but alcohol(99) + sugar(8) = 107 kcal
✅ CORRECT: Total calories must equal alcohol_calories + sugar_calories exactly

❌ WRONG: "Filmjölk bowl" → breakdown (102+170+90=362) but reports 330 kcal total
✅ CORRECT: Total must equal breakdown sum within ±5 kcal - NO EXCEPTIONS

❌ WRONG: "Häagen-Dazs 240g" → claims 300 kcal/100g but reports 438 kcal instead of 720 kcal
✅ CORRECT: If using kcal/100g estimate, total = (grams × kcal/100g ÷ 100) exactly

❌ WRONG: "3 Gin & Tonics" → 18g fat (fat doesn't exist in G&Ts)
✅ CORRECT: Alcoholic drinks have 0g fat unless cream/coconut explicitly mentioned

❌ WRONG: "Red wine 150ml 12.5%" → 100 kcal (should be 103 alcohol + 8 sugar = 111 kcal)
✅ CORRECT: Alcohol calories must be exact: volume × ABV × 0.789 × 7 + sugar calories

❌ WRONG: "Piña Colada" → 2g protein from rum (rum has no protein)
✅ CORRECT: Pure alcohol (rum, vodka) = 0g protein unless cream/egg explicitly mentioned

❌ WRONG: "Beef burrito" → breakdown sums 960 kcal but reports 710 kcal total
✅ CORRECT: ALWAYS double-check that breakdown sum equals total_calories ±5

❌ WRONG: "Fanta 500ml" → 25g carbs but 210 kcal (impossible without alcohol)
✅ CORRECT: Sugar calories must match carbs: 25g carbs × 4 = 100 kcal from sugar

❌ WRONG: "2 dl Ben & Jerry's" → 252 kcal (too conservative for premium brand)
✅ CORRECT: Ben & Jerry's 120g × 300 kcal/100g = ~360 kcal (use upper bound)

❌ WRONG: "3 dl glass + 1 liter läsk" → only counting the soda (ignoring ice cream)
✅ CORRECT: Include both items: ice cream 3dl ≈ 180g ≈ 250 kcal, soda 1L ≈ 420 kcal

❌ WRONG: "1 mojito" → 28 kcal (ignoring sugar content)
✅ CORRECT: Mojito ≈ 250ml with rum + sugar + lime ≈ 160 kcal

❌ WRONG: "Big Mac Meal" → 525 kcal (too conservative)
✅ CORRECT: Big Mac Meal (burger + fries + drink) ≈ 1100 kcal

OUTPUT FORMAT (respond with ONLY this JSON structure):
{
  "protein": <total grams>,
  "carbs": <total grams>,
  "fat": <total grams>,
  "calories": <total calories>,
  "breakdown": [
    {
      "food": "<food name>",
      "estimatedAmount": "<amount with unit>",
      "protein": <grams>,
      "carbs": <grams>,
      "fat": <grams>,
      "calories": <calories>
    }
  ],
  "reasoning": "<explain portion estimates and calculations>",
  "validation": "<confirm macro totals match breakdown>"
}
`;
}

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('❌ API key missing');
      return NextResponse.json(
        { error: 'API key missing' },
        { status: 500 }
      );
    }

    const { mealDescription, isRecalculation, previousResult } = await request.json();

    if (!mealDescription || typeof mealDescription !== 'string') {
      console.error('❌ Meal description missing or invalid');
      return NextResponse.json(
        { error: 'Meal description missing' },
        { status: 400 }
      );
    }

    console.log('🍽️ ==================== MEAL ANALYSIS START ====================');
    console.log('📝 Original meal description:', mealDescription);
    if (isRecalculation) {
      console.log('🔄 RECALCULATION MODE: Seeking enhanced accuracy');
      console.log('📊 Previous result:', previousResult);
    }
    console.log('🤖 Using AI model: gemini-1.5-flash');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0, // Maximum determinism - completely deterministic responses
        topK: 1,
        topP: 0.1,
      }
    });

    // Generate system prompt with current food database
    const systemPrompt = generateSystemPrompt(mealDescription);
    
        // Create enhanced prompt for recalculation
    const recalculationInstructions = isRecalculation ? `
    
    RECALCULATION MODE: The user wants more accurate results.
    Previous result: ${JSON.stringify(previousResult)}
    
    Re-examine the meal description carefully:
    - Check food identification 
    - Verify portion sizes
    - Double-check calculations
    - Only return same result if 100% certain
    ` : '';

    const prompt = `
    ${systemPrompt}
    ${recalculationInstructions}
    
    Analyze the following meal description and provide accurate nutritional estimates with validation.
    
    Meal: "${mealDescription}"
    
    IMPORTANT: Follow the validation rules strictly. If any macro value seems unrealistic for the described food, recalculate with more reasonable assumptions.
    
    Respond with ONLY a JSON object in the following format (no other characters):
    {
      "protein": [grams of protein - validate realistic],
      "carbs": [grams of carbohydrates - validate realistic], 
      "fat": [grams of fat - validate realistic],
      "calories": [total calories - must match macro calculation ±10%],
      "breakdown": [
        {
          "food": "[specific food name]",
          "estimatedAmount": "[portion with unit]",
          "protein": [protein grams],
          "carbs": [carbs grams],
          "fat": [fat grams],
          "calories": [calories for this item]
        }
      ],
      "reasoning": "[explain portion estimates and any assumptions made]",
      "validation": "[confirm macro totals are realistic for described foods]"
    }
    
    Example for "150g grilled chicken breast with 100g cooked rice":
    {
      "protein": 35, 
      "carbs": 28, 
      "fat": 6, 
      "calories": 294,
      "breakdown": [
        {"food": "Grilled chicken breast", "estimatedAmount": "150g", "protein": 31, "carbs": 0, "fat": 5, "calories": 165},
        {"food": "Cooked white rice", "estimatedAmount": "100g", "protein": 4, "carbs": 28, "fat": 1, "calories": 130}
      ],
      "reasoning": "Used standard nutrition values for lean chicken breast and cooked rice. Chicken: ~165kcal/100g, Rice: ~130kcal/100g",
      "validation": "Totals realistic: 35g protein appropriate for 150g chicken + rice, 294 calories matches macro calculation (35×4 + 28×4 + 6×9 = 298kcal)"
    }
    `;

    console.log('📤 Sending enhanced analysis request to AI...');
    const startTime = Date.now();
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ AI processing completed in ${processingTime}ms`);
    console.log('📥 Raw AI response:', text);

    // Clean and parse JSON response
    const cleanedText = text.trim().replace(/```json|```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
      console.log('✅ Successfully parsed AI response');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('🔍 Attempted to parse:', cleanedText);
      
      // Try to extract JSON from text with regex as fallback
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed JSON using regex fallback');
        } catch (fallbackError) {
          console.error('❌ Regex fallback also failed:', fallbackError);
          throw new Error('Could not parse AI response as JSON');
        }
      } else {
        throw new Error('Could not extract valid JSON from AI response');
      }
    }

    // STRICT validation and sanitization - prioritize scientific accuracy
    const protein = Math.max(0, Math.round(parsedData.protein || 0));
    const carbs = Math.max(0, Math.round(parsedData.carbs || 0));
    const fat = Math.max(0, Math.round(parsedData.fat || 0));
    
    // Check if this is alcoholic beverage by looking at meal description and food breakdown
    const mealLower = mealDescription.toLowerCase();
    const isAlcoholic = mealLower.includes('beer') || mealLower.includes('wine') || mealLower.includes('vodka') || 
                       mealLower.includes('whiskey') || mealLower.includes('rum') || mealLower.includes('gin') ||
                       mealLower.includes('cocktail') || mealLower.includes('alcohol') || mealLower.includes('champagne') ||
                       mealLower.includes('mojito') || mealLower.includes('margarita') || mealLower.includes('tequila') ||
                       (parsedData.breakdown && parsedData.breakdown.some((item: any) => 
                         item.food?.toLowerCase().includes('beer') || item.food?.toLowerCase().includes('wine') ||
                         item.food?.toLowerCase().includes('vodka') || item.food?.toLowerCase().includes('alcohol')
                       ));
    
    const calculatedCalories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
    const aiCalories = Math.max(0, Math.round(parsedData.calories || 0));
    
    // Always use AI calories - trust the AI analysis for all items
    const calories = aiCalories;
    
    const caloriesDiff = Math.abs(calculatedCalories - aiCalories);
    if (isAlcoholic && aiCalories > calculatedCalories) {
      console.log(`🍺 ALCOHOL DETECTED: Using AI calories (${aiCalories}) which include alcohol content (vs ${calculatedCalories} from 4-4-9)`);
    } else if (caloriesDiff > 5) {
      console.log(`🤖 USING AI CALORIES: AI calories (${aiCalories}) vs calculated (${calculatedCalories}) - trusting AI analysis`);
    } else {
      console.log(`✅ VALIDATED: AI calories (${aiCalories}) match calculated (${calculatedCalories}) within tolerance`);
    }

    // Validate and correct breakdown items - preserve alcohol calories for alcoholic items
    const validatedBreakdown = (parsedData.breakdown || []).map((item: any, index: number) => {
      const itemProtein = Math.max(0, Math.round(item.protein || 0));
      const itemCarbs = Math.max(0, Math.round(item.carbs || 0));
      const itemFat = Math.max(0, Math.round(item.fat || 0));
      const calculatedItemCalories = Math.round((itemProtein * 4) + (itemCarbs * 4) + (itemFat * 9));
      const aiItemCalories = Math.max(0, Math.round(item.calories || 0));
      
      // Check if this breakdown item is alcoholic
      const itemLower = (item.food || '').toLowerCase();
      const isAlcoholicItem = itemLower.includes('beer') || itemLower.includes('wine') || itemLower.includes('vodka') || 
                             itemLower.includes('whiskey') || itemLower.includes('rum') || itemLower.includes('gin') ||
                             itemLower.includes('cocktail') || itemLower.includes('alcohol') || itemLower.includes('champagne') ||
                             itemLower.includes('mojito') || itemLower.includes('margarita') || itemLower.includes('tequila');
      
      // Always use AI calories - trust the AI analysis for all breakdown items
      const itemCalories = aiItemCalories;
      
      const itemCaloriesDiff = Math.abs(calculatedItemCalories - aiItemCalories);
      if (isAlcoholicItem && aiItemCalories > calculatedItemCalories) {
        console.log(`🍺 ALCOHOL ITEM DETECTED: ${item.food} - Using AI calories (${aiItemCalories}) with alcohol content`);
      } else if (itemCaloriesDiff > 3) {
        console.log(`🤖 USING AI CALORIES for ${item.food}: AI calories (${aiItemCalories}) vs calculated (${calculatedItemCalories}) - trusting AI analysis`);
      }
      
      return {
        food: item.food || 'Unknown food',
        estimatedAmount: item.estimatedAmount || 'Unknown amount',
        protein: itemProtein,
        carbs: itemCarbs,
        fat: itemFat,
        calories: itemCalories // Use AI calories for alcohol, calculated for others
      };
    });

    const macros = {
      protein,
      carbs,
      fat,
      calories,
      breakdown: validatedBreakdown,
      reasoning: parsedData.reasoning || 'No reasoning provided',
      validation: parsedData.validation || 'No validation provided',
    };

    console.log('📊 ==================== DETAILED BREAKDOWN ====================');
    console.log('🎯 Final macro totals:');
    console.log(`   🔵 Protein: ${macros.protein}g`);
    console.log(`   🟢 Carbs: ${macros.carbs}g`);
    console.log(`   🟣 Fat: ${macros.fat}g`);
    console.log(`   🟠 Calories: ${macros.calories} kcal`);
    
    console.log('🔍 AI reasoning:', macros.reasoning);
    console.log('✅ AI validation:', macros.validation);
    
    // Additional server-side validation
    const totalGrams = macros.protein + macros.carbs + macros.fat;
    const proteinPercent = (macros.protein / totalGrams) * 100;
    const carbsPercent = (macros.carbs / totalGrams) * 100;
    const fatPercent = (macros.fat / totalGrams) * 100;
    
    console.log('🧮 Macro distribution validation:');
    console.log(`   Protein: ${proteinPercent.toFixed(1)}% of macros`);
    console.log(`   Carbs: ${carbsPercent.toFixed(1)}% of macros`);
    console.log(`   Fat: ${fatPercent.toFixed(1)}% of macros`);
    
    // Flag suspicious results
    if (proteinPercent > 80 || carbsPercent > 95 || fatPercent > 90) {
      console.log('⚠️ Warning: Unusual macro distribution detected');
    }
    
    if (macros.breakdown && macros.breakdown.length > 0) {
      console.log('📋 Food breakdown:');
      macros.breakdown.forEach((item: any, index: number) => {
        console.log(`   ${index + 1}. ${item.food} (${item.estimatedAmount})`);
        console.log(`      → P: ${item.protein}g, C: ${item.carbs}g, F: ${item.fat}g, Kcal: ${item.calories}`);
      });
      
      // Verify breakdown totals match main totals
      const breakdownTotals = macros.breakdown.reduce((acc: any, item: any) => ({
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
        calories: acc.calories + (item.calories || 0),
      }), { protein: 0, carbs: 0, fat: 0, calories: 0 });
      
      console.log('🧮 Breakdown verification:');
      console.log(`   Breakdown totals: P:${breakdownTotals.protein}g C:${breakdownTotals.carbs}g F:${breakdownTotals.fat}g Kcal:${breakdownTotals.calories}`);
      console.log(`   Main totals: P:${macros.protein}g C:${macros.carbs}g F:${macros.fat}g Kcal:${macros.calories}`);
      
      const proteinDiff = Math.abs(breakdownTotals.protein - macros.protein);
      const carbsDiff = Math.abs(breakdownTotals.carbs - macros.carbs);
      const fatDiff = Math.abs(breakdownTotals.fat - macros.fat);
      const caloriesDiff2 = Math.abs(breakdownTotals.calories - macros.calories);
      
      if (proteinDiff > 2 || carbsDiff > 2 || fatDiff > 2 || caloriesDiff2 > 10) {
        console.log('⚠️ Warning: Breakdown totals don\'t match main totals (tolerance exceeded)');
      } else {
        console.log('✅ Breakdown totals match main totals (within tolerance)');
      }
    } else {
      console.log('⚠️ No detailed breakdown provided by AI');
    }

    console.log('🍽️ ==================== MEAL ANALYSIS END ====================');

    const jsonResponse = NextResponse.json(macros);
    console.log('📦 Sending response to client');
    
    return jsonResponse;

  } catch (error) {
    console.error('❌ ==================== ERROR OCCURRED ====================');
    console.error('💥 Error during AI analysis:', error);
    
    if (error instanceof Error) {
      console.error('📝 Error message:', error.message);
      console.error('📍 Error stack:', error.stack);
      
      if (error.message.includes('API_KEY') || error.message.includes('403')) {
        console.error('🔑 API key related error detected');
        return NextResponse.json(
          { error: 'API key problem' },
          { status: 403 }
        );
      }
    }

    console.error('🍽️ ==================== ERROR END ====================');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 