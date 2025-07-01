import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    console.log('🎤 OpenAI Whisper transcription request:', { language, format, audioSize: audio.length });

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('🎤 OpenAI API key not configured, returning fallback response');
      return NextResponse.json({
        transcript: "AI transcription service not configured. Please add OPENAI_API_KEY to your .env.local file.",
        confidence: 0.0,
        alternatives: [],
        service: 'not-configured',
        note: 'Add your OpenAI API key to enable Whisper transcription'
      });
    }

    try {
      console.log('🎤 Using OpenAI Whisper for audio transcription...');
      
      // Convert base64 audio to Buffer
      const audioBuffer = Buffer.from(audio, 'base64');
      
      // Create a File object from the buffer
      const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
      
      // Use OpenAI Whisper API for transcription
      const response = await client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: language.split('-')[0], // Convert 'en-US' to 'en'
        prompt: 'This is a short audio clip from a nutrition app. The user might mention food items, quantities, or meal descriptions. Convert number words to digits (e.g., "five" → "5", "one hundred" → "100").',
        response_format: 'verbose_json',
        temperature: 0.1, // Low temperature for accuracy
      });

      const transcript = response.text?.trim() || '';
      const confidence = 0.95; // Whisper is very accurate
      
      console.log('🎤 OpenAI Whisper transcription successful:', transcript);
      
      return NextResponse.json({
        transcript,
        confidence,
        alternatives: [],
        service: 'openai-whisper',
        duration: response.duration,
      });
      
    } catch (whisperError) {
      console.error('🎤 OpenAI Whisper error:', whisperError);
      
      // Return error details for debugging
      return NextResponse.json(
        { 
          error: 'Whisper transcription failed',
          details: whisperError instanceof Error ? whisperError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('🎤 Audio transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
} 