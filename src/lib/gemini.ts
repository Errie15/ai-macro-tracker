import { AIResponse } from '@/types';

export async function analyzeMeal(mealDescription: string): Promise<AIResponse> {
  try {
    console.log('Sending meal to API:', mealDescription);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mealDescription }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      throw new Error(`API Error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    let macros;
    try {
      macros = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse:', responseText);
      throw new Error('Invalid JSON response from API');
    }

    console.log('Received macros from API:', macros);

    // Validate that we got correct data
    if (typeof macros.protein !== 'number' || 
        typeof macros.carbs !== 'number' || 
        typeof macros.fat !== 'number' || 
        typeof macros.calories !== 'number') {
      console.error('Invalid data structure:', macros);
      throw new Error('Invalid data from API');
    }

    const result = {
      protein: Math.max(0, Math.round(macros.protein)),
      carbs: Math.max(0, Math.round(macros.carbs)),
      fat: Math.max(0, Math.round(macros.fat)),
      calories: Math.max(0, Math.round(macros.calories)),
    };

    console.log('Returning processed result:', result);
    return result;

  } catch (error) {
    console.error('Error in AI analysis:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      
      // Show user-friendly error messages
      if (error.name === 'AbortError') {
        alert('Request timed out. Please try again.');
      } else if (error.message.includes('403')) {
        alert('API key error. Check your .env.local file.');
      } else if (error.message.includes('500')) {
        alert('Server error. Try again in a moment.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        alert('Network error. Check your connection and that the server is running.');
      } else {
        alert(`Analysis error: ${error.message}`);
      }
    }
    
    // Return fallback values if AI doesn't work
    return {
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
    };
  }
} 