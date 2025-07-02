export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;
  private silenceStart: number | null = null;
  private isDetecting = false;
  private onSilenceDetected: (() => void) | null = null;
  private isMobile: boolean = false;

  constructor(
    private silenceThreshold = 30, // Volume threshold below which is considered silence
    private silenceDuration = 1500 // How long silence before triggering stop (1.5 seconds)
  ) {
    // Detect mobile devices
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Adjust settings for mobile
    if (this.isMobile) {
      this.silenceThreshold = Math.max(20, silenceThreshold - 10); // Lower threshold for mobile
      this.silenceDuration = Math.max(2000, silenceDuration + 500); // Longer duration for mobile
      console.log('🎤 Mobile detected - adjusted VAD settings:', {
        threshold: this.silenceThreshold,
        duration: this.silenceDuration
      });
    }
  }

  async start(stream: MediaStream, onSilenceDetected: () => void): Promise<void> {
    this.onSilenceDetected = onSilenceDetected;
    this.isDetecting = true;
    this.silenceStart = null;

    try {
      // Create audio context with mobile-friendly settings
      const audioContextOptions: AudioContextOptions = {};
      
      if (this.isMobile) {
        // Mobile-specific audio context settings
        audioContextOptions.sampleRate = 16000; // Lower sample rate for mobile
      }

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)(audioContextOptions);
      
      // Resume audio context if suspended (common on mobile)
      if (this.audioContext.state === 'suspended') {
        console.log('🎤 Resuming suspended audio context');
        await this.audioContext.resume();
      }
      
      // Create analyser with mobile-optimized settings
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.isMobile ? 128 : 256; // Smaller FFT size for mobile
      this.analyser.smoothingTimeConstant = this.isMobile ? 0.5 : 0.3; // More smoothing on mobile
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      // Connect stream to analyser
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      // Set up data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      console.log('🎤 Voice activity detection started', {
        mobile: this.isMobile,
        fftSize: this.analyser.fftSize,
        bufferLength: bufferLength,
        sampleRate: this.audioContext.sampleRate
      });
      
      this.detectVoiceActivity();
      
    } catch (error) {
      console.error('🎤 Failed to start voice activity detection:', error);
      
      // More specific error handling for mobile
      if (error instanceof Error) {
        if (error.name === 'NotSupportedError') {
          throw new Error('Audio analysis not supported on this device');
        } else if (error.name === 'InvalidStateError') {
          throw new Error('Audio context in invalid state - try refreshing the page');
        }
      }
      
      throw error;
    }
  }

  private detectVoiceActivity(): void {
    if (!this.isDetecting || !this.analyser || !this.dataArray || !this.audioContext) {
      return;
    }

    // Check if audio context is still running
    if (this.audioContext.state !== 'running') {
      console.warn('🎤 Audio context not running, attempting to resume');
      this.audioContext.resume().catch(err => {
        console.error('🎤 Failed to resume audio context:', err);
      });
    }

    // Get current audio data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume (mobile-optimized calculation)
    let sum = 0;
    const dataLength = this.dataArray.length;
    
    if (this.isMobile) {
      // On mobile, focus on mid-range frequencies for better voice detection
      const startIdx = Math.floor(dataLength * 0.1);
      const endIdx = Math.floor(dataLength * 0.6);
      let count = 0;
      
      for (let i = startIdx; i < endIdx; i++) {
        sum += this.dataArray[i];
        count++;
      }
      sum = count > 0 ? sum / count : 0;
    } else {
      // Desktop: use full frequency range
      sum = this.dataArray.reduce((acc, value) => acc + value, 0) / dataLength;
    }
    
    const average = sum;
    const now = Date.now();
    
    // Mobile-specific volume normalization
    const normalizedAverage = this.isMobile ? Math.min(average * 1.2, 255) : average;
    
    if (normalizedAverage < this.silenceThreshold) {
      // We're in silence
      if (this.silenceStart === null) {
        this.silenceStart = now;
        if (!this.isMobile) { // Reduce logging on mobile for performance
          console.log('🎤 Silence started, volume:', normalizedAverage.toFixed(1));
        }
      } else if (now - this.silenceStart > this.silenceDuration) {
        // We've been silent long enough
        console.log('🎤 Silence detected for', this.silenceDuration, 'ms, stopping recording');
        this.stop();
        this.onSilenceDetected?.();
        return;
      }
    } else {
      // We have voice activity
      if (this.silenceStart !== null) {
        if (!this.isMobile) { // Reduce logging on mobile for performance
          console.log('🎤 Voice activity resumed, volume:', normalizedAverage.toFixed(1));
        }
        this.silenceStart = null;
      }
    }

    // Continue monitoring with mobile-optimized frame rate
    const frameRate = this.isMobile ? 250 : 100; // Lower frame rate on mobile
    setTimeout(() => {
      this.animationFrame = requestAnimationFrame(() => this.detectVoiceActivity());
    }, frameRate);
  }

  stop(): void {
    console.log('🎤 Stopping voice activity detection');
    this.isDetecting = false;
    this.silenceStart = null;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.audioContext) {
      // Don't close audio context immediately on mobile - can cause issues
      if (!this.isMobile) {
        this.audioContext.close().catch(err => {
          console.warn('🎤 Error closing audio context:', err);
        });
      } else {
        // On mobile, just suspend the context
        this.audioContext.suspend().catch(err => {
          console.warn('🎤 Error suspending audio context:', err);
        });
      }
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
    this.onSilenceDetected = null;
  }

  isActive(): boolean {
    return this.isDetecting;
  }

  // Get current volume level (useful for debugging)
  getCurrentVolume(): number {
    if (!this.analyser || !this.dataArray) {
      return 0;
    }
    
    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    return this.isMobile ? Math.min(average * 1.2, 255) : average;
  }

  // Update settings dynamically
  updateSettings(threshold?: number, duration?: number): void {
    if (threshold !== undefined) {
      this.silenceThreshold = this.isMobile ? Math.max(20, threshold - 10) : threshold;
    }
    if (duration !== undefined) {
      this.silenceDuration = this.isMobile ? Math.max(2000, duration + 500) : duration;
    }
    
    console.log('🎤 VAD settings updated:', {
      threshold: this.silenceThreshold,
      duration: this.silenceDuration,
      mobile: this.isMobile
    });
  }
} 