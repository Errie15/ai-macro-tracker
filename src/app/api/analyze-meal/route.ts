import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateDetailedReasoning(mealDescription: string, ingredients: any[], macros: any): string {
  let reasoning = `Analysis of "${mealDescription}"\n\n`;
  
  // Explain the estimation process
  const hasAlcohol = macros.alcohol_info && macros.alcohol_info.alcohol > 0;
  const formula = hasAlcohol 
    ? `calories = (4 × protein) + (4 × carbohydrates) + (9 × fat) + (7 × alcohol)`
    : `calories = (4 × protein) + (4 × carbohydrates) + (9 × fat)`;
  
  reasoning += `Estimation method: Based on standard nutritional databases and typical serving sizes for similar foods. Calories are calculated mathematically using the formula: ${formula}. `;
  
  if (ingredients.length === 1) {
    const ingredient = ingredients[0];
    const alcoholText = ingredient.alcohol > 0 ? `, and ${ingredient.alcohol}g alcohol` : '';
    reasoning += `For ${ingredient.name}, I estimated a ${ingredient.quantity} portion contains ${ingredient.protein}g protein, ${ingredient.carbohydrates}g carbohydrates, ${ingredient.fat}g fat${alcoholText}, which calculates to ${ingredient.calories} calories.`;
  } else {
    reasoning += `This meal contains ${ingredients.length} different ingredients:\n`;
    ingredients.forEach((ingredient, index) => {
      const alcoholText = ingredient.alcohol > 0 ? `, ${ingredient.alcohol}g alcohol` : '';
      reasoning += `${index + 1}. ${ingredient.name} (${ingredient.quantity}): ${ingredient.protein}g protein, ${ingredient.carbohydrates}g carbohydrates, ${ingredient.fat}g fat${alcoholText} = ${ingredient.calories} calories\n`;
    });
    const totalAlcoholText = hasAlcohol ? `, ${macros.alcohol_info.alcohol}g alcohol` : '';
    reasoning += `Total: ${macros.protein}g protein, ${macros.carbs}g carbohydrates, ${macros.fat}g fat${totalAlcoholText} = ${macros.calories} calories.`;
  }
  
  return reasoning;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { mealDescription } = await request.json();

    if (!mealDescription) {
      return new Response(JSON.stringify({ error: 'No meal description provided' }), { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
                {
          role: 'system',
          content: `You are a nutritional advisor who helps people estimate macronutrients in meals.

IMPORTANT: Do NOT estimate calories directly. Only estimate protein, carbohydrates, fat, and alcohol (when present). Calories will be calculated automatically using the formula: calories = (4 × protein) + (4 × carbohydrates) + (9 × fat) + (7 × alcohol).

You receive a meal description, and you should:

1. Break down the meal into separate ingredients (e.g., "1 egg", "1 banana", "50g rye bread", "1 beer").

2. For each ingredient, estimate ONLY:
   - protein (g)
   - carbohydrates (g)
   - fat (g)
   - alcohol (g) - ONLY if the ingredient contains alcohol (beer, wine, spirits, etc.)

3. Sum these to total values for the entire meal.

4. Present the result in the following JSON format (NO calories field):
5. Respond with ONLY valid JSON. No explanations.

{
  "ingredients": [
    {
      "name": "string",
      "quantity": "string", 
      "protein": number,
      "carbohydrates": number,
      "fat": number,
      "alcohol": number
    }
  ],
  "total": {
    "protein": number,
    "carbohydrates": number,
    "fat": number,
    "alcohol": number
  }
}

Make realistic estimates based on standard nutritional databases. If the user doesn't specify exact grams, base estimates on standard portions. For alcoholic beverages, estimate the alcohol content in grams (not percentage). Remember: Never guess calories - only estimate the macronutrients and alcohol content.`
        },
        {
          role: 'user',
          content: `Meal: "${mealDescription}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 400,
    });

    const result = response.choices[0].message.content;
    if (!result) {
      return new Response(JSON.stringify({ error: 'Empty response from OpenAI' }), { status: 500 });
    }

    const json = result.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(json);

    // Calculate calories using the formula: calories = (4 × protein) + (4 × carbs) + (9 × fat) + (7 × alcohol)
    const calculateCalories = (protein: number, carbs: number, fat: number, alcohol: number = 0): number => {
      return Math.round((4 * protein) + (4 * carbs) + (9 * fat) + (7 * alcohol));
    };

    // Add calculated calories to each ingredient
    const ingredientsWithCalories = parsed.ingredients.map((ingredient: any) => ({
      ...ingredient,
      calories: calculateCalories(ingredient.protein, ingredient.carbohydrates, ingredient.fat, ingredient.alcohol || 0)
    }));

    // Calculate total calories
    const totalCalories = calculateCalories(parsed.total.protein, parsed.total.carbohydrates, parsed.total.fat, parsed.total.alcohol || 0);

    // Transform the response to match the frontend's expected format
    const basicResponse = {
      protein: parsed.total.protein,
      carbs: parsed.total.carbohydrates, // Convert "carbohydrates" to "carbs"
      fat: parsed.total.fat,
      calories: totalCalories,
      ...(parsed.total.alcohol > 0 && { alcohol_info: { alcohol: parsed.total.alcohol } }),
      breakdown: ingredientsWithCalories.map((ingredient: any) => ({
        food: ingredient.name,
        estimatedAmount: ingredient.quantity,
        protein: ingredient.protein,
        carbs: ingredient.carbohydrates, // Convert "carbohydrates" to "carbs"
        fat: ingredient.fat,
        calories: ingredient.calories,
        source: 'AI estimation + calculated calories',
        serving_info: ingredient.quantity,
        ...(ingredient.alcohol > 0 && { alcohol: ingredient.alcohol })
      }))
    };

    // Add detailed reasoning
    const transformedResponse = {
      ...basicResponse,
      reasoning: generateDetailedReasoning(mealDescription, ingredientsWithCalories, basicResponse)
    };

    return new Response(JSON.stringify(transformedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Nutrition analysis error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}