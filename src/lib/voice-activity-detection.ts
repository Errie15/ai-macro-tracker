export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;
  private silenceStart: number | null = null;
  private isDetecting = false;
  private onSilenceDetected: (() => void) | null = null;

  constructor(
    private silenceThreshold = 30, // Volume threshold below which is considered silence
    private silenceDuration = 1500 // How long silence before triggering stop (1.5 seconds)
  ) {}

  async start(stream: MediaStream, onSilenceDetected: () => void): Promise<void> {
    this.onSilenceDetected = onSilenceDetected;
    this.isDetecting = true;
    this.silenceStart = null;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;
      
      // Connect stream to analyser
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      // Set up data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      console.log('🎤 Voice activity detection started');
      this.detectVoiceActivity();
      
    } catch (error) {
      console.error('🎤 Failed to start voice activity detection:', error);
      throw error;
    }
  }

  private detectVoiceActivity(): void {
    if (!this.isDetecting || !this.analyser || !this.dataArray) {
      return;
    }

    // Get current audio data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    const now = Date.now();
    
    if (average < this.silenceThreshold) {
      // We're in silence
      if (this.silenceStart === null) {
        this.silenceStart = now;
        console.log('🎤 Silence started, volume:', average.toFixed(1));
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
        console.log('🎤 Voice activity resumed, volume:', average.toFixed(1));
        this.silenceStart = null;
      }
    }

    // Continue monitoring
    this.animationFrame = requestAnimationFrame(() => this.detectVoiceActivity());
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
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
    this.onSilenceDetected = null;
  }

  isActive(): boolean {
    return this.isDetecting;
  }
} 