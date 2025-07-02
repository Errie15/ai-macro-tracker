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

// Mobile and browser detection
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Get optimal recording format for the current device
const getOptimalRecordingFormat = (): { mimeType: string; fileExtension: string } => {
  const formats = [
    // iOS Safari prefers MP4/AAC
    { mimeType: 'audio/mp4', fileExtension: 'mp4' },
    { mimeType: 'audio/mp4;codecs=mp4a.40.2', fileExtension: 'mp4' },
    // Android and modern browsers prefer WebM/Opus
    { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm' },
    { mimeType: 'audio/webm', fileExtension: 'webm' },
    // Fallback options
    { mimeType: 'audio/ogg;codecs=opus', fileExtension: 'ogg' },
    { mimeType: 'audio/wav', fileExtension: 'wav' },
  ];

  // For iOS, prioritize MP4 formats
  if (isIOS()) {
    const mp4Formats = formats.filter(f => f.mimeType.includes('mp4'));
    const otherFormats = formats.filter(f => !f.mimeType.includes('mp4'));
    const prioritizedFormats = [...mp4Formats, ...otherFormats];
    
    for (const format of prioritizedFormats) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(format.mimeType)) {
        console.log('🎤 Selected format for iOS:', format.mimeType);
        return format;
      }
    }
  }

  // For other browsers, check in order
  for (const format of formats) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(format.mimeType)) {
      console.log('🎤 Selected format:', format.mimeType);
      return format;
    }
  }

  // Ultimate fallback
  console.warn('🎤 No supported formats detected, using default webm');
  return { mimeType: 'audio/webm', fileExtension: 'webm' };
};

// Get optimal audio constraints for the current device
const getOptimalAudioConstraints = (): MediaTrackConstraints => {
  const baseConstraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  if (isMobile()) {
    // Mobile-optimized constraints
    return {
      ...baseConstraints,
      sampleRate: { ideal: 16000 }, // Lower sample rate for mobile
      channelCount: { ideal: 1 }, // Mono for better performance
      // Don't set sampleSize on mobile - can cause issues
    };
  } else {
    // Desktop constraints
    return {
      ...baseConstraints,
      sampleRate: { ideal: 16000 },
      channelCount: { ideal: 1 },
      sampleSize: { ideal: 16 },
    };
  }
};

export class AIAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private voiceDetector: VoiceActivityDetector | null = null;
  private recordingFormat: { mimeType: string; fileExtension: string } | null = null;

  async startRecording(options: AudioRecordingOptions = {}, onSilenceDetected?: () => void): Promise<void> {
    const { maxDuration = 10 } = options;

    try {
      console.log('🎤 Device info - Mobile:', isMobile(), 'iOS:', isIOS(), 'Safari:', isSafari());
      
      // Get optimal recording format
      this.recordingFormat = getOptimalRecordingFormat();
      console.log('🎤 Using recording format:', this.recordingFormat);

      // Get microphone access with optimal constraints
      const audioConstraints = getOptimalAudioConstraints();
      console.log('🎤 Audio constraints:', audioConstraints);

      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audioConstraints
      });

      // Create MediaRecorder with the optimal format
      let mediaRecorderOptions: MediaRecorderOptions = {};
      
      // Only set mimeType if MediaRecorder supports it
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(this.recordingFormat.mimeType)) {
        mediaRecorderOptions.mimeType = this.recordingFormat.mimeType;
      }

      this.mediaRecorder = new MediaRecorder(this.stream, mediaRecorderOptions);
      
      console.log('🎤 MediaRecorder created with mimeType:', this.mediaRecorder.mimeType);

      this.audioChunks = [];

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('🎤 Audio chunk received, size:', event.data.size);
        }
      };

      // Handle recording errors
      this.mediaRecorder.onerror = (event) => {
        console.error('🎤 MediaRecorder error:', event);
      };

      // Start recording with smaller timeslice for mobile
      const timeslice = isMobile() ? 250 : 100; // Larger chunks for mobile
      this.mediaRecorder.start(timeslice);
      console.log('🎤 AI Audio Recording started with timeslice:', timeslice);

      // Set up voice activity detection if callback provided and not on mobile Safari
      // (VoiceActivityDetector can be unreliable on mobile Safari)
      if (onSilenceDetected && !isMobile()) {
        try {
          this.voiceDetector = new VoiceActivityDetector(25, 1500); // More sensitive settings
          await this.voiceDetector.start(this.stream, onSilenceDetected);
          console.log('🎤 Voice activity detection enabled');
        } catch (vadError) {
          console.warn('🎤 Voice activity detection failed, using fallback timeout:', vadError);
        }
      } else if (onSilenceDetected && isMobile()) {
        console.log('🎤 Skipping voice activity detection on mobile, using timeout instead');
        // On mobile, use a simple timeout instead of voice activity detection
        setTimeout(() => {
          console.log('🎤 Mobile auto-stop timeout reached');
          onSilenceDetected();
        }, 8000); // 8 seconds on mobile
      }

    } catch (error) {
      console.error('🎤 Failed to start AI audio recording:', error);
      
      // Enhanced error messaging for mobile
      let errorMessage = 'Failed to start AI recording. ';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow microphone access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No microphone found. Please check your device settings.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Audio recording is not supported on this device/browser.';
        } else {
          errorMessage += `Error: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
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
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.recordingFormat?.mimeType || 'audio/webm' 
        });
        this.cleanup();
        console.log('🎤 AI Audio Recording blob created, size:', audioBlob.size);
        resolve(audioBlob);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.recordingFormat?.mimeType || 'audio/webm' 
        });
        this.cleanup();
        console.log('🎤 AI Audio Recording stopped, blob size:', audioBlob.size, 'type:', audioBlob.type);
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
    this.recordingFormat = null;
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  getRecordingFormat(): { mimeType: string; fileExtension: string } | null {
    return this.recordingFormat;
  }
}

// Convert audio to text using AI
export async function transcribeAudio(audioBlob: Blob, language: string = 'auto'): Promise<SpeechResult> {
  try {
    console.log('🎤 Starting AI transcription, blob size:', audioBlob.size, 'type:', audioBlob.type);
    
    // Convert blob to base64 for API
    const base64Audio = await blobToBase64(audioBlob);
    
    // Determine format for API
    let format = 'webm';
    if (audioBlob.type.includes('mp4')) {
      format = 'mp4';
    } else if (audioBlob.type.includes('ogg')) {
      format = 'ogg';
    } else if (audioBlob.type.includes('wav')) {
      format = 'wav';
    }
    
    console.log('🎤 Sending to API with format:', format);
    
    // Call your AI API for transcription
    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64Audio,
        language: language, // Now supports 'auto', 'en-US', 'sv-SE', etc.
        format: format
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎤 Transcription API error:', response.status, errorText);
      throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
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
    reader.onerror = (error) => {
      console.error('🎤 Error converting blob to base64:', error);
      reject(error);
    };
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
      console.error('🎤 Web Speech API error:', event.error);
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      clearTimeout(timeout);
    };

    // Request microphone permission and start
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('🎤 Starting Web Speech API recognition');
        recognition.start();
      })
      .catch(reject);
  });
} 