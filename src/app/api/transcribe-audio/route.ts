import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Polyfill for File in Node.js environments where it's not available
if (typeof globalThis.File === 'undefined') {
  const { File: NodeFile } = require('node:buffer');
  globalThis.File = NodeFile;
}

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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        transcript: "AI transcription service not configured. Please add OPENAI_API_KEY to your .env.local file.",
        confidence: 0.0,
        alternatives: [],
        service: 'not-configured',
        note: 'Add your OpenAI API key to enable Whisper transcription'
      });
    }

    try {
      // Convert base64 audio to Buffer and create File object
      const audioBuffer = Buffer.from(audio, 'base64');
      const audioFile = new File([audioBuffer], 'audio.webm', { 
        type: 'audio/webm' 
      });
      
      // Language mapping and auto-detection
      let whisperLanguage: string | undefined;
      let prompt = 'Nutrition app audio. Convert numbers to digits.';
      
      if (language === 'auto') {
        whisperLanguage = undefined;
      } else if (language.startsWith('sv')) {
        whisperLanguage = 'sv';
      } else {
        whisperLanguage = language.split('-')[0];
      }
      
      // Use OpenAI Whisper API for transcription (optimized for speed)
      const whisperRequest: any = {
        file: audioFile,
        model: 'whisper-1',
        prompt: prompt,
        response_format: 'text', // Faster than verbose_json
        temperature: 0,
      };
      
      // Only add language if not auto-detecting
      if (whisperLanguage) {
        whisperRequest.language = whisperLanguage;
      }
      
      const response = await client.audio.transcriptions.create(whisperRequest);

      const transcript = (typeof response === 'string' ? response : response.text)?.trim() || '';
      console.log('🎤 Whisper transcription:', transcript);
      
      return NextResponse.json({
        transcript,
        confidence: 0.95,
        alternatives: [],
        service: 'openai-whisper',
        duration: 0,
      });
      
    } catch (whisperError) {
      console.error('🎤 OpenAI Whisper detailed error:', whisperError);
      console.error('🎤 Error name:', whisperError instanceof Error ? whisperError.name : 'Unknown');
      console.error('🎤 Error message:', whisperError instanceof Error ? whisperError.message : 'Unknown');
      
      // Log the actual error from OpenAI if available
      if (whisperError && typeof whisperError === 'object' && 'error' in whisperError) {
        console.error('🎤 OpenAI error details:', JSON.stringify(whisperError.error, null, 2));
      }
      
      return NextResponse.json(
        { 
          error: 'Whisper transcription failed',
          details: whisperError instanceof Error ? whisperError.message : 'Unknown error',
          errorName: whisperError instanceof Error ? whisperError.name : 'Unknown'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('🎤 Audio transcription error:', error);
    console.error('🎤 Outer error details:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
} 