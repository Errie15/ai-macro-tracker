import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FoodItem {
  name: string;
  quantity: string;
  nutritionData?: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    source: string;
    serving_info: string;
    searchResults: string;
  };
}

async function performRealWebSearch(query: string): Promise<string> {
  try {
    // Using Brave Search API for actual search results
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Brave Search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract web results from Brave Search API
    const results = data.web?.results?.slice(0, 5)?.map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.description
    })) || [];
    
    return JSON.stringify(results);
  } catch (error) {
    console.error('Brave Search failed:', error);
    return JSON.stringify([]);
  }
}

async function searchFoodNutrition(foodQuery: string): Promise<{
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  source: string;
  serving_info: string;
  searchResults: string;
} | null> {
  try {
    // Use AI to generate optimized search queries
    const searchQueries = await generateOptimizedSearchQueries(foodQuery);

    let officialSourceResult: any = null;
    let fallbackResult: any = null;

    for (let i = 0; i < searchQueries.length; i++) {
      const searchQuery = searchQueries[i];
      console.log(`🔍 SEARCH ATTEMPT ${i + 1}/${searchQueries.length}: "${searchQuery}"`);
      
      const realSearchResults = await performRealWebSearch(searchQuery);
      
      console.log(`📊 RAW BRAVE SEARCH RESULTS:`, realSearchResults);
      
      if (!realSearchResults || realSearchResults === '[]') {
        console.log(`❌ No results for query ${i + 1}`);
        continue;
      }

      // Parse and examine results
      const results = JSON.parse(realSearchResults);
      if (results.length === 0) {
        console.log(`📭 Empty results array for query ${i + 1}`);
        continue;
      }

      console.log(`✅ Found ${results.length} search results for query ${i + 1}`);
      
      // Log all search results for debugging
      results.forEach((result: any, index: number) => {
        console.log(`📋 RESULT ${index + 1}:`, {
          title: result.title?.substring(0, 150),
          url: result.url,
          description: result.description?.substring(0, 300)
        });
      });

      // Use AI to extract nutrition data from search results
      console.log(`🤖 SENDING TO AI FOR EXTRACTION...`);
    const nutritionResponse = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
            content: `You are a nutritional expert. Extract accurate nutritional information from the provided web search results. ONLY use the information found in these search results.

TRUSTED SOURCE PRIORITY (in order):
1. USDA FoodData Central (fdc.nal.usda.gov) - highest priority
2. FatSecret (fatsecret.com) - very reliable
3. Cronometer (cronometer.com) - professional nutrition tracking
4. SELF NutritionData (nutritiondata.self.com) - science-based
5. MyFitnessPal (myfitnesspal.com) - large user database
6. Other reputable nutrition databases

EXTRACTION RULES:
- ALWAYS prioritize USDA and FatSecret if available
- Look for nutritional values per 100g or per 100ml
- Extract ONLY what you can clearly see in the search results
- Convert units if needed (kJ to kcal: 1 kcal = 4.184 kJ)
- Handle Swedish/English: "kalorier"=calories, "protein"=protein, "fett"=fat, "kolhydrater"=carbs

Return JSON format with the exact values found:
{
  "protein": number,
  "carbs": number, 
  "fat": number,
  "calories": number,
  "source": "website name from search results",
  "serving_info": "serving size from search results"
}

If the search results don't contain clear nutritional information from trusted sources, return null.`
          },
          {
            role: 'user',
            content: `Extract nutritional information for "${foodQuery}" from these web search results:

${realSearchResults}

PRIORITY: Look for USDA, FatSecret, Cronometer, or other trusted nutrition databases first. Only extract data if you can find clear nutritional values from these reliable sources.

Examples of trusted data:
- "61 calories in 100 ml" from FatSecret
- "Per 100g: 257 calories, 1.1g protein" from USDA
- Clear nutrition facts from established databases`
          }
      ],
      temperature: 0,
      max_tokens: 4000,
    });

    const result = nutritionResponse.choices[0].message.content;
      console.log(`🤖 AI EXTRACTION RESULT:`, result);
      
      if (result && result.toLowerCase() !== 'null') {
        try {
          const cleanResult = result.replace(/```json\n?|```/g, '').trim();
          const parsed = JSON.parse(cleanResult);
          
          // Check if parsed is null or doesn't have required properties
          if (!parsed || typeof parsed !== 'object') {
            console.log(`❌ AI returned null or invalid object`);
            continue;
          }
          
          console.log(`✅ SUCCESSFULLY EXTRACTED NUTRITION DATA:`, parsed);
          
          // Check if we found trusted nutrition database source
          const isTrustedSource = parsed.source && (
            parsed.source.includes('fdc.nal.usda.gov') ||
            parsed.source.includes('usda.gov') ||
            parsed.source.includes('fatsecret.com') ||
            parsed.source.includes('cronometer.com') ||
            parsed.source.includes('nutritiondata.self.com') ||
            parsed.source.includes('USDA') ||
            parsed.source.includes('FatSecret') ||
            parsed.source.includes('Cronometer')
          );
          
          const isReliableSource = parsed.source && (
            parsed.source.includes('myfitnesspal.com') ||
            parsed.source.includes('MyFitnessPal') ||
            parsed.source.includes('nutritionix.com') ||
            parsed.source.includes('Nutritionix')
          );
          
          console.log(`🏛️ Is trusted source (USDA/FatSecret)? ${isTrustedSource} (${parsed.source})`);
          console.log(`📊 Is reliable source (MyFitnessPal)? ${isReliableSource} (${parsed.source})`);
          
          const nutritionData = {
            protein: parsed.protein || 0,
            carbs: parsed.carbs || 0,
            fat: parsed.fat || 0,
            calories: parsed.calories || 0,
            source: parsed.source || 'web search',
            serving_info: parsed.serving_info || 'per 100g',
            searchResults: realSearchResults
          };
          
          // Prioritize trusted sources first
          if (isTrustedSource) {
            console.log(`🏆 FOUND TRUSTED SOURCE - prioritizing this result`);
            officialSourceResult = nutritionData;
            // Don't break here, continue to see if we find more trusted sources
          } else if (isReliableSource && !fallbackResult) {
            // Store reliable sources as fallback
            console.log(`📋 Found reliable source as fallback`);
            fallbackResult = nutritionData;
          } else if (!fallbackResult) {
            // Store other sources as last resort fallback
            console.log(`📋 Found other source as fallback`);
            fallbackResult = nutritionData;
          }
        } catch (parseError) {
          console.log(`❌ Failed to parse AI response:`, parseError);
        }
      } else {
        console.log(`❌ AI could not extract nutrition data from these results`);
      }
      
      // Add minimal delay between searches
      if (i < searchQueries.length - 1 && !officialSourceResult) {
        console.log(`⏱️ Brief pause before next search...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms
      }
      
      // Stop early if we found a trusted source
      if (officialSourceResult) {
        console.log(`🎯 Found trusted source early, stopping search`);
        break;
      }
    }

    // Return official source if found, otherwise fallback
    if (officialSourceResult) {
      console.log(`🏆 USING TRUSTED SOURCE RESULT:`, officialSourceResult);
      return officialSourceResult;
    } else if (fallbackResult) {
      console.log(`📋 USING FALLBACK RESULT:`, fallbackResult);
      return fallbackResult;
    }

    // If no trusted sources found, use AI estimation as last resort
    console.log(`🤖 No trusted sources found, attempting AI estimation...`);
    try {
      const aiEstimationResponse = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a nutritional expert. Since no trusted nutrition databases were found, provide a reasonable estimation for the nutritional content of the food item.

ESTIMATION RULES:
- Use your knowledge of similar foods and ingredients
- Be conservative and realistic in estimates
- Consider the food type, ingredients, and typical serving sizes
- Provide per 100g or per 100ml values
- Mark clearly that this is an AI estimation

SPECIFIC FOOD KNOWLEDGE:
- Oat milk (like Oatly): ~60-65 kcal, 1-1.5g protein, 7-8g carbs, 3-4g fat per 100ml
- Regular milk (3%): ~60-65 kcal, 3-4g protein, 4-5g carbs, 3-4g fat per 100ml
- Almond milk: ~15-20 kcal, 0.5-1g protein, 1-2g carbs, 1-2g fat per 100ml
- Soy milk: ~40-50 kcal, 3-4g protein, 2-3g carbs, 2-3g fat per 100ml

Return JSON format:
{
  "protein": number,
  "carbs": number,
  "fat": number,
  "calories": number,
  "source": "AI estimation",
  "serving_info": "per 100g or per 100ml"
}

Only provide estimates for common foods. If you cannot make a reasonable estimate, return null.`
          },
          {
            role: 'user',
            content: `Provide nutritional estimation for: "${foodQuery}"

Since no trusted nutrition databases were found, please estimate the nutritional content based on typical values for this type of food.`
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
      });

      const aiResult = aiEstimationResponse.choices[0].message.content;
      console.log(`🤖 AI ESTIMATION RESULT:`, aiResult);
      
      if (aiResult && aiResult.toLowerCase() !== 'null') {
        try {
          const cleanResult = aiResult.replace(/```json\n?|```/g, '').trim();
          const parsed = JSON.parse(cleanResult);
          
          if (parsed && typeof parsed === 'object' && parsed.calories) {
            console.log(`🧠 USING AI ESTIMATION:`, parsed);
            return {
              protein: parsed.protein || 0,
              carbs: parsed.carbs || 0,
              fat: parsed.fat || 0,
              calories: parsed.calories || 0,
              source: 'AI estimation (no trusted sources found)',
              serving_info: parsed.serving_info || 'per 100g',
              searchResults: JSON.stringify([])
            };
          }
        } catch (parseError) {
          console.log(`❌ Failed to parse AI estimation:`, parseError);
        }
      }
    } catch (error) {
      console.error('❌ AI estimation failed:', error);
    }

    // If all search queries failed, return null (no fallback)
    console.log(`❌ ALL SEARCH STRATEGIES AND AI ESTIMATION FAILED`);
    return null;
  } catch (error) {
    console.error('❌ SEARCH FUNCTION ERROR:', error);
    return null;
  }
}

async function generateOptimizedSearchQueries(foodQuery: string): Promise<string[]> {
  try {
    console.log(`🔍 Analyzing food query for better search terms: "${foodQuery}"`);
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition search expert. Analyze the food query and generate optimized search terms for finding nutritional information.

ANALYSIS TASKS:
1. Identify the food type and brand (if any)
2. Add relevant synonyms and alternative names
3. Include cooking methods if applicable
4. Add nutritional database names that might have this food
5. Include both Swedish and English terms if relevant
6. Clarify vague terms (e.g., "chicken" → "chicken breast")

SEARCH OPTIMIZATION RULES:
- Add "nutrition facts", "calories", "protein", "carbs", "fat" keywords
- Include "per 100g" or "per 100ml" for serving size
- Mention trusted databases: FatSecret, USDA, MyFitnessPal
- For brands, include both brand name and generic term
- For foreign foods, include English translations
- For vague terms, specify most common preparations

EXAMPLES:
Input: "Oatly Havredryck iKaffe" 
Output: ["Oatly oat milk barista edition nutrition facts calories FatSecret", "Oatly havredryck ikaffe oat drink nutrition per 100ml", "oat milk barista coffee nutrition facts MyFitnessPal"]

Input: "chicken"
Output: ["chicken breast skinless nutrition facts calories per 100g USDA", "grilled chicken breast nutrition FatSecret", "chicken breast raw nutrition facts"]

Input: "mjölk 3%"
Output: ["milk 3% fat nutrition facts calories per 100ml", "whole milk 3% fat nutrition USDA FatSecret", "mjölk 3% fett nutrition facts Sweden"]

Return JSON array of 3 optimized search queries (reduced for speed):
["search query 1", "search query 2", "search query 3"]`
        },
        {
          role: 'user',
          content: `Analyze this food query and generate 3 optimized search terms for finding nutritional information: "${foodQuery}"

Consider:
- What type of food is this?
- Is it a brand name? If so, what's the generic term?
- Are there common synonyms or alternative names?
- What cooking method might be implied?
- Which nutrition databases would likely have this food?

Generate 3 search queries that will find accurate nutritional data from trusted sources.`
        }
      ],
      temperature: 0.1,
      max_tokens: 500, // Reduced for speed
    });

    const result = response.choices[0].message.content;
    console.log(`🧠 AI SEARCH OPTIMIZATION RESULT:`, result);
    
    if (result) {
      try {
        const cleanResult = result.replace(/```json\n?|```/g, '').trim();
        const queries = JSON.parse(cleanResult);
        if (Array.isArray(queries) && queries.length > 0) {
          console.log(`✅ Generated ${queries.length} optimized search queries`);
          return queries.slice(0, 3); // Limit to 3 for speed
        }
      } catch (parseError) {
        console.log(`❌ Failed to parse AI search optimization:`, parseError);
      }
    }
    
    // Fallback to basic queries if AI fails
    return [
      `"${foodQuery}" nutrition facts calories protein fat carbs`,
      `${foodQuery} nutritional information FatSecret MyFitnessPal`,
      `${foodQuery} calories nutrition USDA database`
    ];
  } catch (error) {
    console.error('❌ AI search optimization failed:', error);
    
    // Fallback to basic queries
    return [
      `"${foodQuery}" nutrition facts calories protein fat carbs`,
      `${foodQuery} nutritional information FatSecret MyFitnessPal`,
      `${foodQuery} calories nutrition USDA database`
    ];
  }
}

async function parseMealIntoFoodItems(mealDescription: string): Promise<FoodItem[]> {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Parse a meal description into individual food items with quantities. 

CRITICAL: Extract the exact quantity (number + unit) that the user specified.

Return JSON array with this exact format:
[{"name": "food name without quantity", "quantity": "exact amount with unit (e.g., '500ml', '200g', '1 piece')"}]

Examples:
- "budvar 500 ml" → [{"name": "budvar", "quantity": "500ml"}]
- "arla mjölk 3% fett 200 ml" → [{"name": "arla mjölk 3% fett", "quantity": "200ml"}]
- "100g chicken breast" → [{"name": "chicken breast", "quantity": "100g"}]`
        },
        {
          role: 'user',
          content: `Parse this meal: "${mealDescription}"\n\nReturn JSON array with food name (without quantity) and exact quantity specified by user.`
        }
      ],
      temperature: 0,
      max_tokens: 500,
    });

    const result = response.choices[0].message.content;
    if (result) {
      const cleanResult = result.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanResult);
      console.log(`🍽️ PARSED FOOD ITEMS:`, parsed);
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Failed to parse meal:', error);
    return [];
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Set longer timeout for complex nutrition analysis
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - analysis taking too long')), 120000); // 2 minutes
    });

    const analysisPromise = async (): Promise<NextResponse> => {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API key missing' }, { status: 500 });
      }

      if (!process.env.BRAVE_SEARCH_API_KEY) {
        return NextResponse.json({ error: 'Brave Search API key missing - real web search not available' }, { status: 500 });
      }

      const { mealDescription } = await request.json();

      if (!mealDescription || typeof mealDescription !== 'string') {
        return NextResponse.json({ error: 'Meal description missing' }, { status: 400 });
      }

      console.log(`🍽️ Starting nutrition analysis for: "${mealDescription}"`);

      // Parse meal into individual food items
      const foodItems = await parseMealIntoFoodItems(mealDescription);
      console.log(`📋 Parsed into ${foodItems.length} food items`);
      
      // Perform nutrition searches in parallel for better speed
      console.log(`🔍 Starting parallel nutrition searches...`);
      const searchPromises = foodItems.map(async (foodItem, index) => {
        try {
          console.log(`🔍 Searching nutrition for item ${index + 1}/${foodItems.length}: ${foodItem.name}`);
          const nutritionData = await searchFoodNutrition(foodItem.name);
          if (nutritionData) {
            foodItem.nutritionData = nutritionData;
            console.log(`✅ Found nutrition data for ${foodItem.name}`);
            return { success: true, item: foodItem.name };
          } else {
            console.log(`❌ No nutrition data found for ${foodItem.name}`);
            return { success: false, item: foodItem.name };
          }
        } catch (error) {
          console.error(`❌ Failed to search nutrition for ${foodItem.name}:`, error);
          return { success: false, item: foodItem.name, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      // Wait for all searches to complete
      const searchResults = await Promise.all(searchPromises);
      const successCount = searchResults.filter(r => r.success).length;
      console.log(`📊 Search complete: ${successCount}/${foodItems.length} items found nutrition data`);

      // If no nutrition data found for any items, provide helpful message
      if (successCount === 0) {
        console.log(`⚠️ No nutrition data found for any food items - providing helpful response`);
        return NextResponse.json({
          protein: 0,
          carbs: 0,
          fat: 0,
          calories: 0,
          breakdown: foodItems.map(item => ({
            food: item.name,
            estimatedAmount: item.quantity,
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: 0,
            source: 'No nutrition data found',
            serving_info: 'unknown'
          })),
          reasoning: `No nutritional data was found for any of the food items: ${foodItems.map(item => item.name).join(', ')}. This could be due to complex meal descriptions, foreign food names, or network issues. Try entering individual food items separately or use simpler descriptions.`,
          debug: {
            totalItemsFound: foodItems.length,
            itemsWithData: 0,
            searchResults: searchResults
          }
        });
      }

      // Create data section from search results
      const realWebSearchDataSection = foodItems
        .filter(item => item.nutritionData)
        .map(item => 
          `- ${item.name} (${item.quantity}): ${item.nutritionData!.calories} kcal, ${item.nutritionData!.protein}g protein, ${item.nutritionData!.carbs}g carbs, ${item.nutritionData!.fat}g fat
  Serving: ${item.nutritionData!.serving_info}
  Web Source: ${item.nutritionData!.source}`
        )
        .join('\n');

      console.log(`🧮 Calculating final nutrition totals...`);
      console.log(`📊 Items with nutrition data: ${foodItems.filter(item => item.nutritionData).length}/${foodItems.length}`);

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a nutritional expert. Use ONLY the web search nutritional data provided to analyze meals and calculate total macronutrients.

${realWebSearchDataSection ? `WEB SEARCH NUTRITIONAL DATA:\n${realWebSearchDataSection}\n` : 'NO NUTRITIONAL DATA FOUND FROM WEB SEARCH'}

CRITICAL CALCULATION RULES:
1. Use ONLY the web search data provided above
2. ALWAYS scale nutritional values based on the user's specified quantity vs the found serving size
3. For example: If web data shows "per 100ml" but user wants "500ml", multiply ALL values by 5
4. If web data shows "per 100g" but user wants "200g", multiply ALL values by 2
5. Pay close attention to units (ml, g, pieces, etc.) and quantities

If no data is available, return zeros and explain that web search failed.

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
      "calories": number,
      "source": "exact web source or 'web search failed'",
      "serving_info": "exact serving size or 'unknown'"
    }
  ],
  "reasoning": "Explain calculations using web search data, including how you scaled values from the found serving size to the user's specified quantity"
}`
          },
          {
            role: 'user',
            content: `Analyze this meal: "${mealDescription}"

Food items identified: ${JSON.stringify(foodItems.map(item => ({ name: item.name, quantity: item.quantity, hasWebSearchData: !!item.nutritionData })))}

IMPORTANT: Calculate the total macronutrients using ONLY the web search data provided above. 

For each food item:
1. Look at the web search data serving size (e.g., "per 100ml", "per 100g")
2. Compare it to the user's specified quantity (e.g., "500ml", "200g")
3. Scale the nutritional values accordingly (multiply by the ratio)

Example: If web data shows 60 kcal per 100ml but user wants 500ml, the result should be 300 kcal (60 × 5).

If no web search data was found for any item, return zeros and explain the limitation.`
          }
        ],
        temperature: 0,
        max_tokens: 1500,
      });

      const result = response.choices[0].message.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const cleanResult = result.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanResult);

      console.log(`🎯 Analysis complete for: "${mealDescription}"`);
      console.log(`📈 Final totals: ${parsed.calories} kcal, ${parsed.protein}g protein, ${parsed.carbs}g carbs, ${parsed.fat}g fat`);

      // Add debugging information to the response
      const responseWithDebug = {
        ...parsed,
        debug: {
          searchDebug: foodItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            searchPerformed: !!item.nutritionData,
            searchResult: item.nutritionData ? {
              source: item.nutritionData.source,
              serving_info: item.nutritionData.serving_info,
              values: {
                protein: item.nutritionData.protein,
                carbs: item.nutritionData.carbs,
                fat: item.nutritionData.fat,
                calories: item.nutritionData.calories
              }
            } : null
          })),
          totalItemsFound: foodItems.length,
          itemsWithData: foodItems.filter(item => item.nutritionData).length
        }
      };

      return NextResponse.json(responseWithDebug);
    };

    // Race between analysis and timeout
    const result = await Promise.race([analysisPromise(), timeoutPromise]);
    return result;
  } catch (err) {
    console.error('API error:', err);
    if (err instanceof Error && err.message.includes('timeout')) {
      return NextResponse.json({ 
        error: 'Analysis timeout - meal was too complex. Try entering fewer items at once.',
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0,
        breakdown: [],
        reasoning: 'Request timed out due to complexity. Please try entering fewer food items at once.'
      }, { status: 408 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}