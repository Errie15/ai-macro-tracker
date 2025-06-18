'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2, Mic, MessageCircle, RotateCcw } from 'lucide-react';
import { analyzeMeal } from '@/lib/gemini';
import { addMeal } from '@/lib/storage';
import { MealEntry } from '@/types';

interface MealInputProps {
  onMealAdded: () => void;
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
      const macros = await analyzeMeal(mealText.trim());
      
      const newMeal: MealEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        originalText: mealText.trim(),
        macros,
      };

      addMeal(newMeal);
      setMealText('');
      onMealAdded();
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Error analyzing meal. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Röstigenkänning stöds inte i denna webbläsare');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Röstigenkänning stöds inte i denna webbläsare');
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'sv-SE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMealText(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event) => {
      console.error('Röstigenkänningsfel:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
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
                  title="Rensa fält"
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
                title="Röstinmatning"
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
                <div className="flex items-center justify-center gap-3 ai-thinking">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-bold">AI analyserar...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
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