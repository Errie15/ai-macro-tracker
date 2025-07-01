'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2, Mic, MessageCircle, RotateCcw, AudioWaveform } from 'lucide-react';
import { analyzeEnhancedMeal } from '@/lib/enhanced-gemini';
import { addMeal } from '@/lib/storage';
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

  const [isAIRecording, setIsAIRecording] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'down' | 'left' | 'right' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const aiRecorderRef = useRef<AIAudioRecorder | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    try {
      setIsAIRecording(true);
      console.log('🎤 Starting AI-powered voice recording...');

      // Create AI recorder instance
      aiRecorderRef.current = new AIAudioRecorder();
      
      // Start recording with voice activity detection
      await aiRecorderRef.current.startRecording({ 
        maxDuration: 30 // High value, voice detection will stop before this
      }, () => {
        // Voice activity detection callback - stop when silence is detected
        console.log('🎤 Voice activity detection triggered stop');
        handleAIRecordingStop();
      });

      // Fallback timeout in case voice detection fails
      aiTimeoutRef.current = setTimeout(async () => {
        console.log('🎤 Fallback timeout triggered (5s max)');
        await handleAIRecordingStop();
      }, 5000); // 5 seconds max fallback

    } catch (error) {
      console.error('🎤 Failed to start AI recording:', error);
      setIsAIRecording(false);
      alert('Failed to start AI recording. Please check microphone permissions.');
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
      } catch (stopError) {
        console.error('🎤 Error stopping recording:', stopError);
        setIsAIRecording(false);
        alert('Failed to stop recording. Please try again.');
        return;
      }
      
      // Transcribe using AI
      const result = await transcribeAudio(audioBlob);
      
      console.log('🎤 AI Transcription result:', result);
      
      if (result.transcript && result.transcript.trim()) {
        // Convert number words to digits
        const processedTranscript = convertNumbersToDigits(result.transcript);
        console.log('🎤 Processed transcript (numbers converted):', processedTranscript);
        
        const currentText = mealText.trim();
        const newText = currentText ? `${currentText} ${processedTranscript}` : processedTranscript;
        setMealText(newText);
        console.log('🎤 AI transcription added to meal text:', processedTranscript);
      } else {
        alert('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('🎤 AI transcription error:', error);
      alert('AI transcription failed. Please try again or type manually.');
    } finally {
      setIsAIRecording(false);
      
      // Clean up timeout reference
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    }
  };

  const stopAIVoiceInput = async () => {
    console.log('🎤 Manual stop requested...');
    
    // Clear the auto-stop timeout since we're stopping manually
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    
    await handleAIRecordingStop();
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
              placeholder="Describe your meal here... e.g. '50g protein powder, one banana and 10g peanut butter'"
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
              
              <button
                type="button"
                onClick={isAIRecording ? stopAIVoiceInput : startAIVoiceInput}
                disabled={isAnalyzing}
                className={`btn-pill-secondary w-12 h-12 p-0 tap-effect ${
                  isAIRecording ? 'bg-blue-500/20 border-blue-400/30' : ''
                }`}
                title="AI Voice input (OpenAI Whisper) - English/Swedish"
              >
                <Mic className={`w-5 h-5 ${
                  isAIRecording ? 'text-blue-400 animate-pulse' : ''
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

      {/* AI Recording Feedback */}
      {isAIRecording && (
        <div className="glass-card bg-blue-500/20 border-blue-400/30 animate-scale-in">
          <div className="flex items-center justify-center gap-3 text-blue-300">
            <div className="relative">
              <Mic className="w-6 h-6" />
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Recording...</p>
              <p className="text-sm opacity-80">Powered by OpenAI Whisper • English/Swedish • Auto-detection</p>
            </div>
            <button
              onClick={stopAIVoiceInput}
              className="btn-pill-secondary px-3 py-1 text-sm tap-effect"
            >
              Stop
            </button>
          </div>
        </div>
      )}


    </div>
  );
}