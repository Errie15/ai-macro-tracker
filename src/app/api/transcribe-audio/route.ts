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

// Map audio formats to appropriate file extensions and MIME types
const getAudioFormatInfo = (format: string): { extension: string; mimeType: string } => {
  const formatMap: { [key: string]: { extension: string; mimeType: string } } = {
    'mp4': { extension: 'mp4', mimeType: 'audio/mp4' },
    'webm': { extension: 'webm', mimeType: 'audio/webm' },
    'ogg': { extension: 'ogg', mimeType: 'audio/ogg' },
    'wav': { extension: 'wav', mimeType: 'audio/wav' },
    'm4a': { extension: 'm4a', mimeType: 'audio/mp4' }, // M4A is MP4 audio
  };
  
  return formatMap[format.toLowerCase()] || { extension: 'webm', mimeType: 'audio/webm' };
};

export async function POST(request: NextRequest) {
  try {
    const { audio, language = 'en-US', format = 'webm' } = await request.json();
    
    console.log('🎤 Transcription request - Language:', language, 'Format:', format);
    
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
      console.log('🎤 Audio buffer size:', audioBuffer.length, 'bytes');
      
      // Get format info
      const formatInfo = getAudioFormatInfo(format);
      console.log('🎤 Format info:', formatInfo);
      
      // Create File object with proper MIME type
      const audioFile = new File([audioBuffer], `audio.${formatInfo.extension}`, { 
        type: formatInfo.mimeType 
      });
      
      console.log('🎤 Created audio file - Name:', audioFile.name, 'Type:', audioFile.type, 'Size:', audioFile.size);
      
      // Language mapping and auto-detection
      let whisperLanguage: string | undefined;
      let prompt = 'This is audio from a nutrition tracking app. Please transcribe clearly, converting number words to digits (e.g., "one hundred" to "100").';
      
      if (language === 'auto') {
        whisperLanguage = undefined;
        console.log('🎤 Using auto language detection');
      } else if (language.startsWith('sv')) {
        whisperLanguage = 'sv';
        prompt = 'Detta är ljud från en näringsapp. Transkribera tydligt och konvertera siffror till digits (t.ex. "hundra" till "100").';
        console.log('🎤 Using Swedish language');
      } else {
        whisperLanguage = language.split('-')[0];
        console.log('🎤 Using language:', whisperLanguage);
      }
      
      // Use OpenAI Whisper API for transcription (optimized for speed)
      const whisperRequest: any = {
        file: audioFile,
        model: 'whisper-1',
        prompt: prompt,
        response_format: 'text', // Faster than verbose_json
        temperature: 0.1, // Slightly higher for better handling of nutrition terms
      };
      
      // Only add language if not auto-detecting
      if (whisperLanguage) {
        whisperRequest.language = whisperLanguage;
      }
      
      console.log('🎤 Sending request to Whisper API...');
      const startTime = Date.now();
      
      const response = await client.audio.transcriptions.create(whisperRequest);
      
      const endTime = Date.now();
      console.log('🎤 Whisper API response time:', endTime - startTime, 'ms');

      const transcript = (typeof response === 'string' ? response : response.text)?.trim() || '';
      console.log('🎤 Whisper transcription result:', transcript);
      
      // Enhanced response with format info
      return NextResponse.json({
        transcript,
        confidence: 0.95,
        alternatives: [],
        service: 'openai-whisper',
        duration: endTime - startTime,
        format: formatInfo.extension,
        originalFormat: format,
        audioSize: audioBuffer.length,
      });
      
    } catch (whisperError) {
      console.error('🎤 OpenAI Whisper detailed error:', whisperError);
      console.error('🎤 Error name:', whisperError instanceof Error ? whisperError.name : 'Unknown');
      console.error('🎤 Error message:', whisperError instanceof Error ? whisperError.message : 'Unknown');
      
      // Log the actual error from OpenAI if available
      if (whisperError && typeof whisperError === 'object' && 'error' in whisperError) {
        console.error('🎤 OpenAI error details:', JSON.stringify(whisperError.error, null, 2));
      }
      
      // Provide more specific error messages
      let errorMessage = 'Whisper transcription failed';
      let statusCode = 500;
      
      if (whisperError instanceof Error) {
        if (whisperError.message.includes('file format')) {
          errorMessage = `Unsupported audio format: ${format}. Please try again or use a different recording method.`;
          statusCode = 400;
        } else if (whisperError.message.includes('file size')) {
          errorMessage = 'Audio file too large. Please record a shorter clip.';
          statusCode = 400;
        } else if (whisperError.message.includes('quota')) {
          errorMessage = 'OpenAI API quota exceeded. Please try again later.';
          statusCode = 429;
        } else if (whisperError.message.includes('api key')) {
          errorMessage = 'OpenAI API key invalid. Please check configuration.';
          statusCode = 401;
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: whisperError instanceof Error ? whisperError.message : 'Unknown error',
          errorName: whisperError instanceof Error ? whisperError.name : 'Unknown',
          format: format,
          suggestion: 'Try using the red microphone button (Web Speech API) as an alternative.'
        },
        { status: statusCode }
      );
    }

  } catch (error) {
    console.error('🎤 Audio transcription outer error:', error);
    console.error('🎤 Outer error details:', error instanceof Error ? error.message : 'Unknown');
    
    return NextResponse.json(
      { 
        error: 'Transcription service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please try again or use the red microphone button (Web Speech API) as an alternative.'
      },
      { status: 500 }
    );
  }
} 