export interface AudioRecordingOptions {
  maxDuration?: number; // in seconds
  sampleRate?: number;
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  alternatives?: string[];
}

import { VoiceActivityDetector } from './voice-activity-detection';

export class AIAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private voiceDetector: VoiceActivityDetector | null = null;

  async startRecording(options: AudioRecordingOptions = {}, onSilenceDetected?: () => void): Promise<void> {
    const { maxDuration = 10 } = options;

    try {
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Optimal for speech recognition
          channelCount: 1,   // Mono
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
      console.log('🎤 AI Audio Recording started');

      // Set up voice activity detection if callback provided
      if (onSilenceDetected) {
        try {
          this.voiceDetector = new VoiceActivityDetector(30, 1500); // 30 volume threshold, 1.5s silence
          await this.voiceDetector.start(this.stream, onSilenceDetected);
          console.log('🎤 Voice activity detection enabled');
        } catch (vadError) {
          console.warn('🎤 Voice activity detection failed, using fallback timeout:', vadError);
        }
      }

    } catch (error) {
      console.error('🎤 Failed to start AI audio recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      // If already stopped, create blob from existing chunks
      if (this.mediaRecorder.state === 'inactive') {
        console.log('🎤 MediaRecorder already stopped, creating blob from existing chunks');
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        console.log('🎤 AI Audio Recording blob created, size:', audioBlob.size);
        resolve(audioBlob);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        console.log('🎤 AI Audio Recording stopped, blob size:', audioBlob.size);
        resolve(audioBlob);
      };

      // Add error handler
      this.mediaRecorder.onerror = (event) => {
        console.error('🎤 MediaRecorder error during stop:', event);
        reject(new Error('MediaRecorder error during stop'));
      };

      try {
        this.mediaRecorder.stop();
      } catch (error) {
        console.error('🎤 Error calling stop():', error);
        reject(error);
      }
    });
  }

  private cleanup(): void {
    if (this.voiceDetector) {
      this.voiceDetector.stop();
      this.voiceDetector = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// Convert audio to text using AI
export async function transcribeAudio(audioBlob: Blob): Promise<SpeechResult> {
  try {
    console.log('🎤 Starting AI transcription...');
    
    // Convert blob to base64 for API
    const base64Audio = await blobToBase64(audioBlob);
    
    // Call your AI API for transcription
    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64Audio,
        language: 'en-US',
        format: 'webm'
      }),
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('🎤 AI Transcription result:', result);

    return {
      transcript: result.transcript,
      confidence: result.confidence || 0.95,
      alternatives: result.alternatives || []
    };

  } catch (error) {
    console.error('🎤 AI Transcription error:', error);
    throw error;
  }
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Alternative: Use Web Speech API with better error handling
export async function transcribeWithWebSpeech(options: {
  language?: string;
  maxDuration?: number;
}): Promise<SpeechResult> {
  const { language = 'en-US', maxDuration = 10 } = options;

  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }
    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    const timeout = setTimeout(() => {
      recognition.stop();
      reject(new Error('Speech recognition timeout'));
    }, maxDuration * 1000);

    recognition.onresult = (event) => {
      clearTimeout(timeout);
      const results = Array.from(event.results[0]);
      const bestResult = results[0];
      
      resolve({
        transcript: bestResult.transcript,
        confidence: bestResult.confidence || 0.5,
        alternatives: results.slice(1).map(r => r.transcript)
      });
    };

    recognition.onerror = (event) => {
      clearTimeout(timeout);
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      clearTimeout(timeout);
    };

    // Request microphone permission and start
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => recognition.start())
      .catch(reject);
  });
} 