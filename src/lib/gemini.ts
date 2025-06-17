import { AIResponse } from '@/types';

export async function analyzeMeal(mealDescription: string): Promise<AIResponse> {
  try {
    console.log('Skickar måltid till API:', mealDescription);
    
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mealDescription }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Okänt fel' }));
      throw new Error(`API-fel (${response.status}): ${errorData.error || 'Okänt fel'}`);
    }

    const macros = await response.json();
    console.log('Fick makros från API:', macros);

    // Validera att vi fick korrekt data
    if (typeof macros.protein !== 'number' || 
        typeof macros.carbs !== 'number' || 
        typeof macros.fat !== 'number' || 
        typeof macros.calories !== 'number') {
      throw new Error('Ogiltig data från API');
    }

    return {
      protein: Math.max(0, Math.round(macros.protein)),
      carbs: Math.max(0, Math.round(macros.carbs)),
      fat: Math.max(0, Math.round(macros.fat)),
      calories: Math.max(0, Math.round(macros.calories)),
    };

  } catch (error) {
    console.error('Fel vid AI-analys:', error);
    
    if (error instanceof Error) {
      console.error('Felmeddelande:', error.message);
      
      // Visa användarvänligt felmeddelande
      if (error.message.includes('403')) {
        alert('Fel med API-nyckel. Kontrollera din .env.local fil.');
      } else if (error.message.includes('500')) {
        alert('Serverfel. Försök igen om en stund.');
      } else if (error.message.includes('Failed to fetch')) {
        alert('Nätverksfel. Kontrollera din anslutning och att servern körs.');
      } else {
        alert(`Fel vid analys: ${error.message}`);
      }
    }
    
    // Fallback-värden om AI:n inte fungerar
    return {
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
    };
  }
} 