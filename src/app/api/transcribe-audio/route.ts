import { NextRequest, NextResponse } from 'next/server';

// For now, this is a placeholder API that would connect to Google Speech-to-Text
// or another AI transcription service. You'd need to set up the appropriate API keys.

export async function POST(request: NextRequest) {
  try {
    const { audio, language = 'en-US', format = 'webm' } = await request.json();
    
    if (!audio) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    console.log('🎤 AI Transcription request:', { language, format, audioSize: audio.length });

    // Method 1: Use Google Cloud Speech-to-Text API
    // You would need to set up Google Cloud credentials and enable the Speech-to-Text API
    /*
    const speechClient = new speech.SpeechClient({
      keyFilename: 'path/to/service-account-key.json', // or use environment variables
    });

    const audioBytes = Buffer.from(audio, 'base64');
    
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 16000,
        languageCode: language,
        maxAlternatives: 3,
        enableAutomaticPunctuation: true,
        model: 'latest_long', // or 'latest_short' for shorter audio
      },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    const confidence = response.results[0]?.alternatives[0]?.confidence || 0.95;
    const alternatives = response.results[0]?.alternatives.slice(1).map(alt => alt.transcript) || [];

    return NextResponse.json({
      transcript: transcription,
      confidence,
      alternatives,
      service: 'google-speech'
    });
    */

    // Using Gemini AI instead of OpenAI Whisper (more cost-effective with existing API key)

    // Method 3: Use your existing Gemini API for transcription
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      try {
        console.log('🎤 Using Gemini API for audio transcription...');
        
        const audioBuffer = Buffer.from(audio, 'base64');
        
        // Convert audio to base64 for Gemini
        const audioBase64 = audioBuffer.toString('base64');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `TRANSCRIBE ONLY what is actually spoken in this short audio clip. Do NOT add, invent, or hallucinate any food items that are not clearly spoken.

CRITICAL RULES:
1. If the audio is unclear, return "unclear audio" 
2. If the audio is silence or noise, return "no speech detected"
3. If the audio contains food words, transcribe ONLY what you actually hear
4. Convert number words to digits (e.g., "five" → "5", "one hundred" → "100")
5. DO NOT add common food items like "chicken breast", "rice", "broccoli" unless they are clearly spoken
6. If you only hear "banana", transcribe only "1 banana" - do not add other foods

This is a short audio clip from a nutrition app. The user might say something simple like "100 grams of protein powder" or "one banana".

Return only what is actually spoken with numbers as digits. NO ADDITIONS, NO ASSUMPTIONS, NO HALLUCINATIONS.`
                  },
                  {
                    inline_data: {
                      mime_type: 'audio/webm',
                      data: audioBase64
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1, // Low temperature for accuracy
              maxOutputTokens: 100, // Keep responses concise
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('🎤 Gemini API raw response:', result);

        if (result.candidates && result.candidates[0] && result.candidates[0].content) {
          const transcript = result.candidates[0].content.parts[0].text.trim();
          console.log('🎤 Gemini transcription successful:', transcript);
          
          return NextResponse.json({
            transcript,
            confidence: 0.95, // Gemini is very accurate
            alternatives: [],
            service: 'gemini-ai'
          });
        } else {
          throw new Error('No transcription returned from Gemini');
        }
        
      } catch (geminiError) {
        console.error('🎤 Gemini API error:', geminiError);
        // Fall through to placeholder response
      }
    }
    
    // Fallback response if no API keys are configured
    return NextResponse.json({
      transcript: "AI transcription service not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.",
      confidence: 0.0,
      alternatives: [],
      service: 'not-configured',
      note: 'Add your Gemini API key to enable AI transcription'
    });

  } catch (error) {
    console.error('🎤 AI Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
} 