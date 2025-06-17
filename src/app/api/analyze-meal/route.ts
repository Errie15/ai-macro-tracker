import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// System prompt som definierar AI:ns beteende och expertis
const SYSTEM_PROMPT = `
Du är en expert inom näringsanalys och svenska livsmedel. Din uppgift är att analysera måltidsbeskrivningar och ge exakta uppskattningar av makronutrienter.

EXPERTIS:
- Du har djup kunskap om svenska livsmedel och deras näringsinnehåll
- Du förstår vanliga portionsstorlekar och mätenheter
- Du kan hantera både exakta mått (gram, ml) och ungefärliga beskrivningar
- Du tar hänsyn till tillagningssätt som påverkar näringsinnehåll

REGLER:
1. Använd alltid svenska livsmedelsdata som referens
2. Vid osäkerhet, välj den mest sannolika portionsstorleken för en genomsnittlig vuxen
3. Räkna med vanliga portioner: 1 banan ≈ 120g, 1 ägg ≈ 50g, 1 skiva bröd ≈ 30g
4. Inkludera näringsämnen från alla ingredienser, inklusive matlagningsfett
5. Avrunda till hela gram/kalorier
6. Svara ENDAST med JSON-format, inga andra tecken

PORTIONSSTORLEKAR (som referens):
- Proteinpulver: 1 skopa = 30g
- Fisk/kött: 1 portion = 100-150g
- Ris/pasta: 1 portion torrvara = 80-100g
- Bröd: 1 skiva = 30g
- Frukt: 1 medelstor = 120-150g
- Grönsaker: 1 portion = 80-100g
`;

export async function POST(request: NextRequest) {
  try {
    // Kontrollera API-nyckel
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('API-nyckel saknas');
      return NextResponse.json(
        { error: 'API-nyckel saknas' },
        { status: 500 }
      );
    }

    const { mealDescription } = await request.json();

    if (!mealDescription || typeof mealDescription !== 'string') {
      return NextResponse.json(
        { error: 'Måltidsbeskrivning saknas' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    ${SYSTEM_PROMPT}
    
    Analysera följande måltidsbeskrivning och ge en exakt uppskattning av näringsinnehållet.
    
    Måltid: "${mealDescription}"
    
    Svara med ENDAST ett JSON-objekt i följande format (inga andra tecken):
    {
      "protein": [gram protein],
      "carbs": [gram kolhydrater], 
      "fat": [gram fett],
      "calories": [totala kalorier]
    }
    
    Exempel på korrekt format:
    {"protein": 25, "carbs": 45, "fat": 12, "calories": 380}
    `;

    console.log('Skickar prompt till AI...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('AI-svar:', text);

    // Rensa och parsa JSON-svaret
    const cleanedText = text.trim().replace(/```json|```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Försökte parsa:', cleanedText);
      
      // Försök extrahera JSON från text med regex som fallback
      const jsonMatch = cleanedText.match(/\{[^}]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Kunde inte parsa AI-svar som JSON');
      }
    }

    // Validera och sanera data
    const macros = {
      protein: Math.max(0, Math.round(parsedData.protein || 0)),
      carbs: Math.max(0, Math.round(parsedData.carbs || 0)),
      fat: Math.max(0, Math.round(parsedData.fat || 0)),
      calories: Math.max(0, Math.round(parsedData.calories || 0)),
    };

    console.log('Returnerar macros:', macros);

    return NextResponse.json(macros);

  } catch (error) {
    console.error('Fel vid AI-analys:', error);
    
    if (error instanceof Error) {
      console.error('Felmeddelande:', error.message);
      
      if (error.message.includes('API_KEY') || error.message.includes('403')) {
        return NextResponse.json(
          { error: 'API-nyckel problem' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Intern serverfel' },
      { status: 500 }
    );
  }
} 