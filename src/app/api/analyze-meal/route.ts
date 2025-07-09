import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateSystemPrompt(mealDescription: string): string {
  return `
Given a list of food items and their quantities, estimate the total macronutrients: protein (g), carbohydrates (g), fat (g), and calories (kcal).

CRITICAL: Use your most accurate knowledge of official nutritional data. For branded items, use the exact official nutritional information from the brand's website or USDA database.

Steps:
1. Parse each food item and its quantity
2. Normalize the food names to standard terms used in nutritional databases and for branded products
3. For branded items, use official nutritional data (McDonald's, KFC, Subway, etc.)
4. For generic items, use USDA or standard nutritional database values
5. Retrieve or estimate average macronutrient values per 100g or standard portion
6. Multiply the values by the specified quantity
7. Calculate total calories using the standard formula:
   - Protein: 4 kcal/g
   - Carbohydrates: 4 kcal/g
   - Fat: 9 kcal/g
   - For alcoholic beverages:
     * Step 1: Alcohol grams = volume_ml × ABV × 0.789
     * Step 2: Alcohol calories = alcohol_grams × 7
     * Step 3: Carb calories = carbs × 4
     * Step 4: Total calories = alcohol_calories + carb_calories
     * Beer: ~4-5g carbs per 100ml, Wine: ~2-4g carbs per 100ml
     * In your reasoning, clearly show: "Alcohol calories: X kcal, Carb calories: Y kcal, Total calories = X + Y = Z kcal"
     * DO NOT round, estimate, or reduce the total calories. The "calories" field MUST be exactly the sum from Step 4. If you calculate 183.5, use 184. If you calculate 223.5, use 224. Never use a lower or rounded-down value.

OFFICIAL NUTRITIONAL DATA - Use these exact values:
- McDonald's Big Mac: 580 kcal, 25.9g protein, 44g carbs, 32.8g fat
- McDonald's Quarter Pounder with Cheese: 520 kcal, 30g protein, 42g carbs, 26g fat
- KFC Original Recipe Chicken Breast: 320 kcal, 29g protein, 8g carbs, 19g fat
- Subway 6" Turkey Breast: 280 kcal, 18g protein, 46g carbs, 4g fat
- Burger King Whopper: 657 kcal, 28g protein, 49g carbs, 40g fat
- Domino's Medium Pepperoni Pizza (1 slice): 290 kcal, 12g protein, 30g carbs, 14g fat
- Starbucks Grande Caffe Latte: 190 kcal, 12g protein, 18g carbs, 7g fat
- Taco Bell Crunchy Taco: 170 kcal, 8g protein, 13g carbs, 10g fat

Respond in JSON format:
{
  "protein": number,
  "carbs": number,
  "fat": number,
  "calories": number,
  "breakdown": [
    {
      "food": "string",
      "estimatedAmount": "string",
      "protein": number,
      "carbs": number,
      "fat": number,
      "calories": number
    }
  ],
  "reasoning": "Explain how values were estimated",
  "validation": "Show calculation of total calories from macros"
}
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key missing' }, { status: 500 });
    }

    const { mealDescription, isRecalculation, previousResult } = await request.json();

    if (!mealDescription || typeof mealDescription !== 'string') {
      return NextResponse.json({ error: 'Meal description missing' }, { status: 400 });
    }

    const systemPrompt = generateSystemPrompt(mealDescription);

    const userPrompt = `
${isRecalculation ? `Recalculation request. Prior result: ${JSON.stringify(previousResult)}` : ''}

Meal: "${mealDescription}"

Analyze this meal and respond with valid JSON only.
`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0,
      max_tokens: 2000,
    });

    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    const cleanResult = result.replace(/```json\n?|```/g, '').trim();

    const parsed = JSON.parse(cleanResult);

    // Force breakdown to match AI reasoning calculations and preserve exact decimal values
    const correctedBreakdown = (parsed.breakdown || []).map((item: any) => {
      const itemName = item.food?.toLowerCase() || '';
      const isAlcoholic = itemName.includes('beer') || itemName.includes('öl') || itemName.includes('wine') || 
                         itemName.includes('vin') || itemName.includes('vodka') || itemName.includes('whiskey') ||
                         itemName.includes('rum') || itemName.includes('gin') || itemName.includes('tequila') ||
                         itemName.includes('brandy') || itemName.includes('champagne') || itemName.includes('prosecco');
      
      if (isAlcoholic) {
        const reasoning = parsed.reasoning || '';
        
        // Look for the final total calculation pattern: "= X kcal" or "Total calories = X + Y = Z kcal"
        const totalCalcPatterns = [
          // Match "80 + 149.1 = 229.1 kcal" format
          /(\d+\.?\d*)\s*\+\s*(\d+\.?\d*)\s*=\s*(\d+\.?\d*)\s*kcal/i,
          // Match "Total calories = 229.1 kcal" format
          /total\s+calories?\s*=\s*(\d+\.?\d*)\s*kcal/i,
          // Match final "= 229.1 kcal" format
          /=\s*(\d+\.?\d*)\s*kcal(?!.*=)/i,
          // Match "229.1 kcal" at end of calculation
          /(\d+\.?\d*)\s*kcal\s*$/i
        ];
        
        let correctCalories = item.calories;
        
        // Try to find the final calculation result
        for (const pattern of totalCalcPatterns) {
          const match = reasoning.match(pattern);
          if (match) {
            // For addition pattern, use the sum (third capture group)
            const calValue = pattern.source.includes('\\+') ? match[3] : match[1];
            correctCalories = Math.round(parseFloat(calValue));
            break;
          }
        }
        
        // If we still have the wrong value, try to calculate it ourselves from the reasoning
        if (correctCalories === item.calories && reasoning.includes('alcohol')) {
          // Extract alcohol and carb calories from reasoning
          const alcoholCalMatch = reasoning.match(/alcohol\s*calories?[:\s]*(\d+\.?\d*)/i);
          const carbCalMatch = reasoning.match(/carb\s*calories?[:\s]*(\d+\.?\d*)/i);
          
          if (alcoholCalMatch && carbCalMatch) {
            const alcoholCal = parseFloat(alcoholCalMatch[1]);
            const carbCal = parseFloat(carbCalMatch[1]);
            correctCalories = Math.round(alcoholCal + carbCal);
          }
        }
        
        return {
          ...item,
          calories: correctCalories
        };
      }
      
      return item;
    });

    // Calculate corrected totals from breakdown to ensure EXACT match - no rounding, preserve decimals
    const correctedTotals = correctedBreakdown.reduce((totals: any, item: any) => ({
      protein: totals.protein + (item.protein || 0),
      carbs: totals.carbs + (item.carbs || 0),
      fat: totals.fat + (item.fat || 0),
      calories: totals.calories + (item.calories || 0)
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

    // Ensure breakdown values are exactly what the AI calculated, no modifications
    const finalBreakdown = correctedBreakdown.map((item: any) => ({
      ...item,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      calories: item.calories || 0
    }));

    // Recalculate totals from finalBreakdown to ensure perfect match
    const finalTotals = finalBreakdown.reduce((totals: any, item: any) => ({
      protein: totals.protein + item.protein,
      carbs: totals.carbs + item.carbs,
      fat: totals.fat + item.fat,
      calories: totals.calories + item.calories
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

    const macros = {
      protein: finalTotals.protein,
      carbs: finalTotals.carbs,
      fat: finalTotals.fat,
      calories: finalTotals.calories,
      breakdown: finalBreakdown,
      reasoning: parsed.reasoning || 'No reasoning provided',
      validation: parsed.validation || 'No validation provided'
    };

    return NextResponse.json(macros);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}