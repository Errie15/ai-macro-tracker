'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2, Mic, MessageCircle, RotateCcw, AudioWaveform, Globe } from 'lucide-react';
import { analyzeEnhancedMeal } from '@/lib/enhanced-gemini';
import { addMeal, getUserLanguage, setUserLanguage } from '@/lib/storage';
import { MealEntry } from '@/types';
import { AIAudioRecorder, transcribeAudio } from '@/lib/ai-speech';

// Convert written numbers to digits (supports English and Swedish)
const convertNumbersToDigits = (text: string): string => {
  const numberWords: { [key: string]: string } = {
    // English numbers
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13', 
    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
    'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
    'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
    'eighty': '80', 'ninety': '90', 'hundred': '100', 'thousand': '1000',
    // Swedish numbers
    'noll': '0', 'ett': '1', 'en': '1', 'två': '2', 'tre': '3', 'fyra': '4',
    'fem': '5', 'sex': '6', 'sju': '7', 'åtta': '8', 'nio': '9',
    'tio': '10', 'elva': '11', 'tolv': '12', 'tretton': '13',
    'fjorton': '14', 'femton': '15', 'sexton': '16', 'sjutton': '17',
    'arton': '18', 'nitton': '19', 'tjugo': '20', 'trettio': '30',
    'fyrtio': '40', 'femtio': '50', 'sextio': '60', 'sjuttio': '70',
    'åttio': '80', 'nittio': '90', 'hundra': '100', 'tusen': '1000'
  };

  let result = text;
  
  // Handle English compound numbers like "twenty five" -> "25"
  result = result.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(one|two|three|four|five|six|seven|eight|nine)\b/gi, (match, tens, ones) => {
    const tensNum = numberWords[tens.toLowerCase()] || tens;
    const onesNum = numberWords[ones.toLowerCase()] || ones;
    return (parseInt(tensNum) + parseInt(onesNum)).toString();
  });

  // Handle Swedish compound numbers like "tjugo fem" -> "25"
  result = result.replace(/\b(tjugo|trettio|fyrtio|femtio|sextio|sjuttio|åttio|nittio)\s+(ett|en|två|tre|fyra|fem|sex|sju|åtta|nio)\b/gi, (match, tens, ones) => {
    const tensNum = numberWords[tens.toLowerCase()] || tens;
    const onesNum = numberWords[ones.toLowerCase()] || ones;
    return (parseInt(tensNum) + parseInt(onesNum)).toString();
  });

  // Handle "X hundred Y" -> "XY0" (e.g., "one hundred fifty" -> "150")
  result = result.replace(/\b(one|two|three|four|five|six|seven|eight|nine)\s+hundred\s+(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\b/gi, (match, hundreds, remainder) => {
    const hundredsNum = parseInt(numberWords[hundreds.toLowerCase()] || hundreds) * 100;
    const remainderNum = parseInt(numberWords[remainder.toLowerCase()] || remainder);
    return (hundredsNum + remainderNum).toString();
  });

  // Handle "X hundra Y" -> "XY0" (e.g., "ett hundra femtio" -> "150")
  result = result.replace(/\b(ett|en|två|tre|fyra|fem|sex|sju|åtta|nio)\s+hundra\s+(tjugo|trettio|fyrtio|femtio|sextio|sjuttio|åttio|nittio|tio|elva|tolv|tretton|fjorton|femton|sexton|sjutton|arton|nitton)\b/gi, (match, hundreds, remainder) => {
    const hundredsNum = parseInt(numberWords[hundreds.toLowerCase()] || hundreds) * 100;
    const remainderNum = parseInt(numberWords[remainder.toLowerCase()] || remainder);
    return (hundredsNum + remainderNum).toString();
  });

  // Handle simple "X hundred" -> "X00"
  result = result.replace(/\b(one|two|three|four|five|six|seven|eight|nine)\s+hundred\b/gi, (match, num) => {
    const numValue = numberWords[num.toLowerCase()] || num;
    return (parseInt(numValue) * 100).toString();
  });

  // Handle simple "X hundra" -> "X00"
  result = result.replace(/\b(ett|en|två|tre|fyra|fem|sex|sju|åtta|nio)\s+hundra\b/gi, (match, num) => {
    const numValue = numberWords[num.toLowerCase()] || num;
    return (parseInt(numValue) * 100).toString();
  });

  // Replace individual number words
  Object.keys(numberWords).forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, numberWords[word]);
  });

  return result;
};

interface MealInputProps {
  onMealAdded: () => void | Promise<void>;
  onCancel?: () => void;
}

export default function MealInput({ onMealAdded, onCancel }: MealInputProps) {
  const [mealText, setMealText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState('en-US');

  const [isAIRecording, setIsAIRecording] = useState(false);
  const [isWebSpeechRecording, setIsWebSpeechRecording] = useState(false);
  const [showWebSpeechFallback, setShowWebSpeechFallback] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'down' | 'left' | 'right' | null>(null);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const aiRecorderRef = useRef<AIAudioRecorder | null>(null);
  const webSpeechRef = useRef<SpeechRecognition | null>(null);

  // Load user language preference
  useEffect(() => {
    getUserLanguage().then(userLanguage => {
      setLanguage(userLanguage);
    });
  }, []);

  // Prevent iOS zoom and other behaviors when recording is active
  useEffect(() => {
    if (isRecordingActive) {
      // Prevent zoom on the entire viewport during recording
      const viewport = document.querySelector('meta[name=viewport]');
      const originalContent = viewport?.getAttribute('content');
      
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }
      
      // Add CSS to prevent text selection and context menus
      document.body.style.userSelect = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
      (document.body.style as any).webkitTouchCallout = 'none';
      
      return () => {
        // Restore original viewport settings
        if (viewport && originalContent) {
          viewport.setAttribute('content', originalContent);
        } else if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1');
        }
        
        // Restore text selection
        document.body.style.userSelect = '';
        (document.body.style as any).webkitUserSelect = '';
        (document.body.style as any).webkitTouchCallout = '';
      };
    }
  }, [isRecordingActive]);

  const toggleLanguage = async () => {
    const newLanguage = language === 'en-US' ? 'sv-SE' : 'en-US';
    try {
      await setUserLanguage(newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Special handlers to prevent iOS zoom and other behaviors during recording
  const handleRecordingTouchStart = (e: React.TouchEvent, startFunction: () => void) => {
    e.preventDefault(); // Prevent iOS zoom, context menu, etc.
    e.stopPropagation(); // Don't bubble up
    startFunction();
  };

  const handleRecordingTouchEnd = (e: React.TouchEvent, stopFunction: () => void) => {
    e.preventDefault(); // Prevent iOS behaviors
    e.stopPropagation(); // Don't bubble up
    stopFunction();
  };

  const handleRecordingTouchCancel = (e: React.TouchEvent, stopFunction: () => void) => {
    e.preventDefault(); // Prevent iOS behaviors
    e.stopPropagation(); // Don't bubble up
    stopFunction();
  };

  // Prevent context menu during recording
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isRecordingActive) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mealText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    
    try {
      console.log('Starting enhanced AI analysis...');
      const analysisResult = await analyzeEnhancedMeal(mealText.trim());
      console.log('Enhanced AI analysis complete, received result:', analysisResult);
      
      const newMeal: MealEntry = {
        id: '', // Will be set by Firebase when saved
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        originalText: mealText.trim(),
        macros: {
          protein: analysisResult.protein,
          carbs: analysisResult.carbs,
          fat: analysisResult.fat,
          calories: analysisResult.calories,
        },
        breakdown: analysisResult.breakdown,
        reasoning: analysisResult.reasoning,
        validation: analysisResult.validation,
      };

      console.log('Saving meal to database...');
      await addMeal(newMeal);
      console.log('Meal saved successfully');
      
      setMealText('');
      console.log('Calling onMealAdded...');
      await Promise.resolve(onMealAdded());
      console.log('onMealAdded completed');
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Error analyzing meal. Please try again.');
    } finally {
      console.log('Setting isAnalyzing to false');
      setIsAnalyzing(false);
    }
  };

  const startAIVoiceInput = async () => {
    if (isAIRecording) return; // Prevent multiple starts
    
    try {
      setIsAIRecording(true);
      setIsRecordingActive(true); // Prevent iOS zoom/interactions
      console.log('🎤 Starting push-to-talk AI recording...');

      // Create AI recorder instance
      aiRecorderRef.current = new AIAudioRecorder();
      
      // Start recording without voice activity detection for push-to-talk
      await aiRecorderRef.current.startRecording({ 
        maxDuration: 60 // Long timeout, user controls when to stop
      });

    } catch (error) {
      console.error('🎤 Failed to start AI recording:', error);
      setIsAIRecording(false);
      setIsRecordingActive(false);
      
      // Only show fallback for permission issues, not other errors
      if (error instanceof Error && error.message.includes('permissions')) {
        setShowWebSpeechFallback(true);
      }
      
      // Just log errors, don't annoy user with alerts
      console.log('🎤 AI recording start failed, but not showing alert to user');
    }
  };

  const handleAIRecordingStop = async () => {
    if (!aiRecorderRef.current) {
      console.log('🎤 No recorder instance');
      setIsAIRecording(false);
      return;
    }

    // Don't check isAIRecording state - just try to stop if we have a recorder
    // The state might be out of sync due to timing issues
    console.log('🎤 Attempting to stop AI recording (ignoring state check)');
    
    try {
      console.log('🎤 Stopping AI recording and starting transcription...');
      console.log('🎤 Recorder state:', aiRecorderRef.current.isRecording() ? 'recording' : 'not recording');
      
      // Always try to stop, even if isRecording() returns false
      // The MediaRecorder might still have data
      let audioBlob;
      try {
        audioBlob = await aiRecorderRef.current.stopRecording();
        console.log('🎤 Successfully stopped recording, got blob size:', audioBlob.size);
        
        // Check if we got valid audio data - but don't show error, just log
        if (!audioBlob || audioBlob.size === 0) {
          console.warn('🎤 No audio data captured, skipping transcription');
          return;
        }
      } catch (stopError) {
        console.error('🎤 Unexpected error stopping recording:', stopError);
        setIsAIRecording(false);
        
        // Just log the error, don't annoy user with alerts
        console.log('🎤 Recording stop had issues, but continuing silently');
        return;
      }
      
      // Transcribe using AI with user's selected language
      const result = await transcribeAudio(audioBlob, language);
      
      console.log('🎤 AI Transcription result:', result);
      
      if (result.transcript && result.transcript.trim()) {
        // Convert number words to digits
        const processedTranscript = convertNumbersToDigits(result.transcript);
        console.log('🎤 Processed transcript (numbers converted):', processedTranscript);
        
        const currentText = mealText.trim();
        const newText = currentText ? `${currentText} ${processedTranscript}` : processedTranscript;
        setMealText(newText);
        console.log('🎤 AI transcription added to meal text:', processedTranscript);
        
        // Reset fallback state on successful transcription
        setShowWebSpeechFallback(false);
      } else {
        // Just log, don't show annoying alert
        console.log('🎤 No speech detected in transcription, but not showing error to user');
        // Don't automatically show fallback - let user decide
      }
    } catch (error) {
      console.error('🎤 AI transcription error:', error);
      
      // Just log the error - don't show annoying popups to user
      console.log('🎤 Transcription failed, but not bothering user with alerts');
      
      // Only show fallback if it's a real technical issue, not just failed transcription
      if (error instanceof Error && error.message.includes('network')) {
        setShowWebSpeechFallback(true);
      }
    } finally {
      setIsAIRecording(false);
      setIsRecordingActive(false);
    }
  };

  const stopAIVoiceInput = async () => {
    if (!isAIRecording) return; // Prevent multiple stops
    
    console.log('🎤 Push-to-talk stop requested...');
    setIsRecordingActive(false); // Re-enable iOS interactions
    await handleAIRecordingStop();
  };

  // Web Speech API functions (fallback/alternative)
  const startWebSpeechInput = async () => {
    if (isWebSpeechRecording) return; // Prevent multiple starts
    
    try {
      setIsWebSpeechRecording(true);
      setIsRecordingActive(true); // Prevent iOS zoom/interactions
      console.log('🎤 Starting push-to-talk Web Speech API...');

      // Check if Web Speech API is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Web Speech API not supported in this browser');
      }

      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not available');
      }
      webSpeechRef.current = new SpeechRecognition();

      const recognition = webSpeechRef.current;
      recognition.lang = language;
      recognition.continuous = true; // Keep listening while button is held
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        console.log('🎤 Web Speech recognition started');
      };

      recognition.onresult = (event) => {
        console.log('🎤 Web Speech recognition result received');
        const results = Array.from(event.results[0]);
        const bestResult = results[0];
        
        if (bestResult && bestResult.transcript.trim()) {
          const processedTranscript = convertNumbersToDigits(bestResult.transcript);
          console.log('🎤 Web Speech transcript:', processedTranscript);
          
          const currentText = mealText.trim();
          const newText = currentText ? `${currentText} ${processedTranscript}` : processedTranscript;
          setMealText(newText);
        } else {
          // Just log, don't show alert
          console.log('🎤 Web Speech: No speech detected, but not showing alert');
        }
        
        setIsWebSpeechRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('🎤 Web Speech recognition error:', event.error);
        setIsWebSpeechRecording(false);
        setIsRecordingActive(false);
        
        // Just log errors, don't show alerts unless it's a permission issue
        if (event.error === 'not-allowed') {
          alert('Microphone permission needed. Please allow access and try again.');
        } else {
          console.log('🎤 Web Speech error:', event.error, '- not showing alert to user');
        }
      };

      recognition.onend = () => {
        console.log('🎤 Web Speech recognition ended');
        setIsWebSpeechRecording(false);
        setIsRecordingActive(false);
      };

      // Request microphone permission and start
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognition.start();

    } catch (error) {
      console.error('🎤 Failed to start Web Speech recording:', error);
      setIsWebSpeechRecording(false);
      setIsRecordingActive(false);
      
      // Only show alert for permission issues
      if (error instanceof Error && error.message.includes('permissions')) {
        alert('Please allow microphone access and try again.');
      } else {
        console.log('🎤 Web Speech start failed, but not showing alert to user');
      }
    }
  };

  const stopWebSpeechInput = () => {
    if (!isWebSpeechRecording) return; // Prevent multiple stops
    
    console.log('🎤 Stopping push-to-talk Web Speech recognition...');
    setIsRecordingActive(false); // Re-enable iOS interactions
    if (webSpeechRef.current) {
      webSpeechRef.current.stop();
    }
    setIsWebSpeechRecording(false);
  };

  const clearInput = () => {
    setMealText('');
    textareaRef.current?.focus();
  };

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    const threshold = 50;
    
    if (Math.abs(deltaY) > threshold && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 0) {
        setSwipeDirection('down');
      }
    } else if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        setSwipeDirection('right');
      } else {
        setSwipeDirection('left');
      }
    }
  };

  const handleTouchEnd = () => {
    if (swipeDirection === 'down') {
      clearInput();
    }
    // TODO: Implement history navigation for left/right swipes
    
    touchStartRef.current = null;
    setTimeout(() => setSwipeDirection(null), 300);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Main Input Card */}
      <div className="glass-card-strong relative overflow-hidden">
        {/* Swipe indicators */}
        <div className={`swipe-indicator ${swipeDirection === 'down' ? 'active' : ''}`} />
        <div className={`swipe-indicator left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/30 to-transparent ${swipeDirection === 'left' ? 'active' : ''}`} />
        <div className={`swipe-indicator right-0 w-1 h-full bg-gradient-to-b from-transparent via-white/30 to-transparent ${swipeDirection === 'right' ? 'active' : ''}`} />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Field */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              placeholder={language === 'en-US' 
                ? "Describe your meal here... e.g. '50g protein powder, one banana and 10g peanut butter'"
                : "Beskriv din måltid här... t.ex. '50g proteinpulver, en banan och 10g jordnötssmör'"
              }
              className="input-field-large"
              disabled={isAnalyzing}
              rows={4}
            />
            
            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {mealText && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="btn-pill-secondary w-12 h-12 p-0 tap-effect"
                  title="Clear field"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
              
              {/* Language Toggle Button */}
              <button
                type="button"
                onClick={toggleLanguage}
                className={`btn-pill-secondary w-12 h-12 p-0 tap-effect ${
                  language === 'sv-SE' ? 'bg-yellow-500/20 border-yellow-400/30' : ''
                }`}
                title={`Voice Language: ${language === 'en-US' ? 'English' : 'Swedish'} (click to switch)`}
              >
                <div className="flex flex-col items-center justify-center">
                  <Globe className={`w-4 h-4 ${language === 'sv-SE' ? 'text-yellow-400' : ''}`} />
                  <span className={`text-xs font-bold ${language === 'sv-SE' ? 'text-yellow-400' : ''}`}>
                    {language === 'en-US' ? 'EN' : 'SV'}
                  </span>
                </div>
              </button>
              
              {/* Web Speech API Button (Red) - Only show as fallback */}
              {showWebSpeechFallback && (
                <button
                  type="button"
                  onMouseDown={startWebSpeechInput}
                  onMouseUp={stopWebSpeechInput}
                  onMouseLeave={stopWebSpeechInput}
                                  onTouchStart={(e) => handleRecordingTouchStart(e, startWebSpeechInput)}
                onTouchEnd={(e) => handleRecordingTouchEnd(e, stopWebSpeechInput)}
                onTouchCancel={(e) => handleRecordingTouchCancel(e, stopWebSpeechInput)}
                onContextMenu={handleContextMenu}
                  disabled={isAnalyzing || isAIRecording}
                  className={`btn-pill-secondary w-12 h-12 p-0 select-none transition-all duration-150 ${
                    isWebSpeechRecording ? 'bg-red-500/30 border-red-400/50 scale-95 shadow-lg' : 'hover:scale-105'
                  }`}
                  style={{ 
                    touchAction: isRecordingActive ? 'none' : 'manipulation',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  title="Hold to record with Web Speech API (fallback)"
                >
                  <Mic className={`w-5 h-5 ${
                    isWebSpeechRecording ? 'text-red-400 animate-pulse' : 'text-red-400'
                  }`} />
                </button>
              )}
              
              {/* AI Voice Input Button (Blue) - Push to Talk */}
              <button
                type="button"
                onMouseDown={startAIVoiceInput}
                onMouseUp={stopAIVoiceInput}
                onMouseLeave={stopAIVoiceInput}
                onTouchStart={(e) => handleRecordingTouchStart(e, startAIVoiceInput)}
                onTouchEnd={(e) => handleRecordingTouchEnd(e, stopAIVoiceInput)}
                onTouchCancel={(e) => handleRecordingTouchCancel(e, stopAIVoiceInput)}
                onContextMenu={handleContextMenu}
                disabled={isAnalyzing || isWebSpeechRecording}
                className={`btn-pill-secondary w-12 h-12 p-0 select-none transition-all duration-150 ${
                  isAIRecording ? 'bg-blue-500/30 border-blue-400/50 scale-95 shadow-lg' : 'hover:scale-105'
                }`}
                style={{ 
                  touchAction: isRecordingActive ? 'none' : 'manipulation',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                title="Hold to record with AI (OpenAI Whisper)"
              >
                <Mic className={`w-5 h-5 ${
                  isAIRecording ? 'text-blue-400 animate-pulse' : 'text-blue-400'
                }`} />
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn-pill-secondary flex-1 tap-effect"
                disabled={isAnalyzing}
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={!mealText.trim() || isAnalyzing}
              className="btn-pill-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed tap-effect"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2 ai-thinking">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-bold text-sm">Analyzing...</span>
                </div>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  <span className="font-bold">Add Meal</span>
                  <MessageCircle className="w-5 h-5 opacity-70" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Fallback notification */}
      {showWebSpeechFallback && !isWebSpeechRecording && !isAIRecording && (
        <div className="glass-card bg-amber-500/10 border-amber-400/20 animate-scale-in">
          <div className="flex items-center gap-3 text-amber-300">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <p className="text-sm">
              <span className="font-semibold">Alternative available:</span> Try the red microphone button for Web Speech API
            </p>
          </div>
        </div>
      )}

      {/* Web Speech API Recording Feedback - Only show when using fallback */}
      {isWebSpeechRecording && showWebSpeechFallback && (
        <div className="glass-card bg-red-500/20 border-red-400/30 animate-scale-in">
          <div className="flex items-center justify-center gap-3 text-red-300">
            <div className="relative">
              <Mic className="w-6 h-6" />
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30" />
            </div>
            <div className="flex-1 text-center">
              <p className="font-bold text-lg">🎤 Listening...</p>
              <p className="text-sm opacity-80">
                Release button to stop • {language === 'en-US' ? 'English' : 'Swedish'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Recording Feedback */}
      {isAIRecording && (
        <div className="glass-card bg-blue-500/20 border-blue-400/30 animate-scale-in">
          <div className="flex items-center justify-center gap-3 text-blue-300">
            <div className="relative">
              <Mic className="w-6 h-6" />
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30" />
            </div>
            <div className="flex-1 text-center">
              <p className="font-bold text-lg">🎤 Recording...</p>
              <p className="text-sm opacity-80">
                Release button to stop • {language === 'en-US' ? 'English' : 'Swedish'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}