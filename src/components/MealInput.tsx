'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2, Mic, MessageCircle, RotateCcw, AudioWaveform } from 'lucide-react';
import { analyzeEnhancedMeal } from '@/lib/enhanced-gemini';
import { addMeal } from '@/lib/storage';
import { MealEntry } from '@/types';

interface MealInputProps {
  onMealAdded: () => void | Promise<void>;
  onCancel?: () => void;
}

export default function MealInput({ onMealAdded, onCancel }: MealInputProps) {
  const [mealText, setMealText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'down' | 'left' | 'right' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    // Enhanced settings for better English recognition
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Try to set additional properties for better recognition (if supported)
    try {
      (recognition as any).serviceURI = undefined; // Use default service
    } catch (e) {
      // Property not supported, continue
    }
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      recognition.stop();
      setIsListening(false);
      console.log('🎤 Voice recognition timed out after 10 seconds');
    }, 10000);

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started (English - en-US)');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      clearTimeout(timeoutId);
      console.log('🎤 Voice recognition results received:', event.results);
      
      // Get the best result
      const results = Array.from(event.results[0]);
      const bestResult = results[0];
      const transcript = bestResult.transcript;
      const confidence = bestResult.confidence;
      
      console.log(`🎤 Best result: "${transcript}" (confidence: ${(confidence * 100).toFixed(1)}%)`);
      
      // Show all alternatives in console for debugging
      if (results.length > 1) {
        console.log('🎤 Alternative results:');
        results.slice(1).forEach((result, index) => {
          console.log(`   ${index + 2}. "${result.transcript}" (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
        });
      }
      
      // Always use the result regardless of confidence (Web Speech API confidence is unreliable)
      const currentText = mealText.trim();
      const newText = currentText ? `${currentText} ${transcript}` : transcript;
      setMealText(newText);
      console.log(`🎤 Added to meal text: "${transcript}" (confidence: ${(confidence * 100).toFixed(1)}%)`);
      
      // Log confidence for debugging but don't block the result
      if (confidence < 0.5) {
        console.log('🎤 Note: Low confidence from Web Speech API, but still using result');
      }
    };

    recognition.onerror = (event) => {
      clearTimeout(timeoutId);
      console.error('🎤 Voice recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = 'Speech recognition error. ';
      switch (event.error) {
        case 'no-speech':
          errorMessage += 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage += 'Microphone problem. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage += 'Microphone access denied. Please allow microphone in your browser.';
          break;
        case 'network':
          errorMessage += 'Network error. Please check your internet connection.';
          break;
        case 'service-not-allowed':
          errorMessage += 'Speech recognition service is not available.';
          break;
        default:
          errorMessage += `Unknown error: ${event.error}`;
      }
      alert(errorMessage);
    };

    recognition.onend = () => {
      clearTimeout(timeoutId);
      console.log('🎤 Voice recognition ended');
      setIsListening(false);
    };

    // Request microphone permission first
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(() => {
        console.log('🎤 Starting voice recognition with enhanced English settings');
        recognition.start();
      })
      .catch((error) => {
        console.error('🎤 Microphone permission denied:', error);
        alert('Microphone access is required for speech recognition. Please allow microphone access in your browser and try again.');
      });
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
                onClick={startVoiceInput}
                disabled={isAnalyzing || isListening}
                className={`btn-pill-secondary w-12 h-12 p-0 tap-effect ${
                  isListening ? 'bg-red-500/20 border-red-400/30' : ''
                }`}
                title="Voice input"
              >
                <Mic className={`w-5 h-5 ${
                  isListening ? 'text-red-400 animate-pulse' : ''
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

      {/* Voice Feedback */}
      {isListening && (
        <div className="glass-card bg-red-500/20 border-red-400/30 animate-scale-in">
          <div className="flex items-center justify-center gap-3 text-red-300">
            <div className="relative">
              <Mic className="w-6 h-6" />
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30" />
            </div>
            <div>
                              <p className="font-bold text-lg">Listening...</p>
              <p className="text-sm opacity-80">Speak now to describe your meal</p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}