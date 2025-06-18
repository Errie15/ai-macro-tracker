import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// System prompt that defines AI behavior and expertise
const SYSTEM_PROMPT = `
You are an expert in nutritional analysis and food composition. Your task is to analyze meal descriptions and provide accurate estimates of macronutrients.

EXPERTISE:
- You have deep knowledge of foods and their nutritional content
- You understand common portion sizes and measurement units
- You can handle both exact measurements (grams, ml) and approximate descriptions
- You account for cooking methods that affect nutritional content

RULES:
1. Use comprehensive food database as reference
2. When uncertain, choose the most likely portion size for an average adult
3. Use common portions: 1 banana ≈ 120g, 1 egg ≈ 50g, 1 slice bread ≈ 30g
4. Include nutrients from all ingredients, including cooking fats
5. Round to whole grams/calories
6. Respond ONLY in JSON format, no other characters

PORTION SIZES (as reference):
- Protein powder: 1 scoop = 30g
- Fish/meat: 1 portion = 100-150g
- Rice/pasta: 1 portion dry = 80-100g
- Bread: 1 slice = 30g
- Fruit: 1 medium = 120-150g
- Vegetables: 1 portion = 80-100g
`;

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('API key missing');
      return NextResponse.json(
        { error: 'API key missing' },
        { status: 500 }
      );
    }

    const { mealDescription } = await request.json();

    if (!mealDescription || typeof mealDescription !== 'string') {
      return NextResponse.json(
        { error: 'Meal description missing' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    ${SYSTEM_PROMPT}
    
    Analyze the following meal description and provide an accurate estimate of the nutritional content.
    
    Meal: "${mealDescription}"
    
    Respond with ONLY a JSON object in the following format (no other characters):
    {
      "protein": [grams of protein],
      "carbs": [grams of carbohydrates], 
      "fat": [grams of fat],
      "calories": [total calories]
    }
    
    Example of correct format:
    {"protein": 25, "carbs": 45, "fat": 12, "calories": 380}
    `;

    console.log('Sending prompt to AI...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('AI response:', text);

    // Clean and parse JSON response
    const cleanedText = text.trim().replace(/```json|```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', cleanedText);
      
      // Try to extract JSON from text with regex as fallback
      const jsonMatch = cleanedText.match(/\{[^}]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Validate and sanitize data
    const macros = {
      protein: Math.max(0, Math.round(parsedData.protein || 0)),
      carbs: Math.max(0, Math.round(parsedData.carbs || 0)),
      fat: Math.max(0, Math.round(parsedData.fat || 0)),
      calories: Math.max(0, Math.round(parsedData.calories || 0)),
    };

    console.log('Returning macros:', macros);

    const jsonResponse = NextResponse.json(macros);
    console.log('JSON response created successfully');
    
    return jsonResponse;

  } catch (error) {
    console.error('Error during AI analysis:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      
      if (error.message.includes('API_KEY') || error.message.includes('403')) {
        return NextResponse.json(
          { error: 'API key problem' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 