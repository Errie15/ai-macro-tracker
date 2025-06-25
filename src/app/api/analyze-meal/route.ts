import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// System prompt that defines AI behavior and expertise
const SYSTEM_PROMPT = `
You are a precision nutrition analyst with access to validated USDA nutritional databases. Your goal is to provide the most accurate and scientifically realistic macronutrient breakdown possible.

CORE PRINCIPLES:
1. ACCURACY: Use only real, validated nutritional data from USDA or equivalent scientific sources
2. CONSISTENCY: Identical inputs must always produce identical outputs
3. SCIENTIFIC REALISM: All values must be physiologically and nutritionally realistic
4. NEVER GUESS: Always calculate calories using the formula: (protein × 4) + (carbs × 4) + (fat × 9)

VALIDATED USDA NUTRITIONAL DATA (USE THESE EXACT VALUES):
Salmon, Atlantic, farmed, cooked (per 100g): 25g protein, 0g carbs, 12g fat, 206 kcal
Sweet potato, baked (per 100g): 2g protein, 20g carbs, 0.1g fat, 90 kcal
Broccoli, cooked, boiled (per 100g): 3g protein, 7g carbs, 0.4g fat, 34 kcal
Olive oil (per 1 tbsp/13.5g): 0g protein, 0g carbs, 13.5g fat, 119 kcal
Rice, white, long-grain, cooked (per 100g): 4g protein, 28g carbs, 0.3g fat, 130 kcal
Chicken breast, skinless, roasted (per 100g): 31g protein, 0g carbs, 3.6g fat, 165 kcal
Pasta, cooked, enriched (per 100g): 5g protein, 25g carbs, 1.1g fat, 131 kcal
Avocado, raw (per 100g): 2g protein, 9g carbs, 15g fat, 160 kcal
Eggs, whole, cooked, hard-boiled (per 100g): 13g protein, 1g carbs, 11g fat, 155 kcal
Greek yogurt, plain, non-fat (per 100g): 10g protein, 4g carbs, 0g fat, 59 kcal

STANDARD PORTION SIZES (SCIENTIFICALLY VALIDATED):
- Fish fillet (salmon, cod, tuna): 150g (standard restaurant/home serving)
- Chicken breast: 150g (single breast portion)
- Sweet potato, medium: 150g (typical medium potato)
- Rice/pasta, cooked: 150g (standard side portion)
- Vegetables, cooked: 100g (standard vegetable serving)
- Olive oil drizzle: 1 tbsp (13.5g - measured tablespoon)
- Nuts: 30g (standard snack portion)
- Bread slice: 30g (average slice weight)
- Avocado: 100g (half medium avocado)
- Eggs: 50g per egg (large egg)

MANDATORY CALCULATION RULES:
1. ALWAYS use the exact USDA values provided above
2. ALWAYS calculate calories using: (protein × 4) + (carbs × 4) + (fat × 9)
3. NEVER use approximated or guessed calorie values
4. Round final totals to whole numbers
5. Validate that calculated calories match the 4-4-9 formula within ±2 kcal

CONSISTENCY REQUIREMENTS:
- Same meal description = identical results every time
- Use exact portion sizes from the standard table
- Apply identical nutritional values for identical foods
- Never vary based on "cooking style" unless explicitly different

SCIENTIFIC VALIDATION:
- Protein: 10-40g per 100g for protein sources
- Carbohydrates: 0-80g per 100g (highest in grains/starches)
- Fat: 0-90g per 100g (highest in oils/nuts)
- Total macros must be physiologically realistic for described foods

ANALYSIS WORKFLOW:
1. Identify each distinct food item mentioned
2. Apply standard portion size from validated table
3. Calculate macros using exact USDA values
4. Sum all components
5. Calculate total calories using 4-4-9 formula
6. Validate scientific realism
7. Confirm consistency with previous analyses

STRICT JSON RESPONSE FORMAT:
{
  "protein": <total grams - whole number>,
  "carbs": <total grams - whole number>,
  "fat": <total grams - whole number>,
  "calories": <calculated using 4-4-9 formula - whole number>,
  "breakdown": [
    {
      "food": "<exact food name from USDA database>",
      "estimatedAmount": "<standard portion + unit>",
      "protein": <grams>,
      "carbs": <grams>,
      "fat": <grams>,
      "calories": <calculated using 4-4-9 formula>
    }
  ],
  "reasoning": "<explanation using USDA values and standard portions>",
  "validation": "<confirmation of 4-4-9 calculation and scientific realism>"
}

EXAMPLE FOR ABSOLUTE CONSISTENCY:
Input: "Grilled salmon fillet with roasted sweet potatoes and steamed broccoli, drizzled with olive oil"

Expected Output:
- Salmon (150g): 38g protein, 0g carbs, 18g fat, 308 kcal
- Sweet potato (150g): 3g protein, 30g carbs, 0g fat, 135 kcal
- Broccoli (100g): 3g protein, 7g carbs, 0g fat, 34 kcal
- Olive oil (13.5g): 0g protein, 0g carbs, 14g fat, 119 kcal
TOTAL: 44g protein, 37g carbs, 32g fat, 596 kcal
Validation: (44×4 + 37×4 + 32×9) = 612 kcal ≈ 596 kcal ✓

CRITICAL REQUIREMENTS:
- NEVER invent foods not mentioned
- NEVER approximate calories - always calculate
- NEVER vary results for identical inputs
- ALWAYS use validated USDA nutritional data
- ALWAYS prioritize scientific accuracy over convenience
`;

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

    const { mealDescription } = await request.json();

    if (!mealDescription || typeof mealDescription !== 'string') {
      console.error('❌ Meal description missing or invalid');
      return NextResponse.json(
        { error: 'Meal description missing' },
        { status: 400 }
      );
    }

    console.log('🍽️ ==================== MEAL ANALYSIS START ====================');
    console.log('📝 Original meal description:', mealDescription);
    console.log('🤖 Using AI model: gemini-1.5-flash');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for more consistent/deterministic responses
        topK: 1,
        topP: 0.1,
      }
    });

    const prompt = `
    ${SYSTEM_PROMPT}
    
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
    
    // ALWAYS calculate calories using 4-4-9 formula - NEVER trust AI calories
    const calculatedCalories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
    const aiCalories = Math.max(0, Math.round(parsedData.calories || 0));
    
    // Use calculated calories ALWAYS - this ensures scientific accuracy
    const calories = calculatedCalories;
    
    const caloriesDiff = Math.abs(calculatedCalories - aiCalories);
    if (caloriesDiff > 5) {
      console.log(`🧮 CORRECTED: AI calories (${aiCalories}) replaced with calculated (${calculatedCalories}) using 4-4-9 formula`);
    } else {
      console.log(`✅ VALIDATED: AI calories (${aiCalories}) match calculated (${calculatedCalories}) within tolerance`);
    }

    // Validate and correct breakdown items using 4-4-9 formula
    const validatedBreakdown = (parsedData.breakdown || []).map((item: any, index: number) => {
      const itemProtein = Math.max(0, Math.round(item.protein || 0));
      const itemCarbs = Math.max(0, Math.round(item.carbs || 0));
      const itemFat = Math.max(0, Math.round(item.fat || 0));
      const calculatedItemCalories = Math.round((itemProtein * 4) + (itemCarbs * 4) + (itemFat * 9));
      const aiItemCalories = Math.max(0, Math.round(item.calories || 0));
      
      const itemCaloriesDiff = Math.abs(calculatedItemCalories - aiItemCalories);
      if (itemCaloriesDiff > 3) {
        console.log(`🧮 CORRECTED breakdown item ${index + 1} (${item.food}): AI calories (${aiItemCalories}) → calculated (${calculatedItemCalories})`);
      }
      
      return {
        food: item.food || 'Unknown food',
        estimatedAmount: item.estimatedAmount || 'Unknown amount',
        protein: itemProtein,
        carbs: itemCarbs,
        fat: itemFat,
        calories: calculatedItemCalories // Always use calculated calories
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