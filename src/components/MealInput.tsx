'use client';

import { useState } from 'react';
import { MessageCircle, Mic, MicOff, Brain, Sparkles, Send } from 'lucide-react';
import { analyzeMeal } from '@/lib/gemini';
import { addMeal } from '@/lib/storage';
import { MealEntry } from '@/types';

interface MealInputProps {
  onMealAdded: () => void;
}

export default function MealInput({ onMealAdded }: MealInputProps) {
  const [mealText, setMealText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAIThinking, setShowAIThinking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mealText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setShowAIThinking(true);
    
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
      
      // Success feedback
      setTimeout(() => {
        setShowAIThinking(false);
      }, 1000);
      
    } catch (error) {
      console.error('Fel vid tillägg av måltid:', error);
      alert('Fel vid analys av måltid. Försök igen.');
      setShowAIThinking(false);
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

  return (
    <div className="space-y-6">
      {/* Central Input Zone */}
      <div className="central-input group">
        {/* AI Assistant Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3 p-3 bg-dark-700/30 backdrop-blur-md rounded-pill">
            <Brain className="w-6 h-6 text-macro-protein animate-pulse-soft" />
            <span className="text-slate-200 font-bold text-lg">
              AI Nutritionist
            </span>
            <Sparkles className="w-5 h-5 text-macro-carbs" />
          </div>
        </div>

        {/* Chat Bubble Style Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            {/* Chat Bubble */}
            <div className="chat-bubble">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-macro-protein/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-6 h-6 text-macro-protein" />
                </div>
                
                <div className="flex-1">
                  <textarea
                    value={mealText}
                    onChange={(e) => setMealText(e.target.value)}
                    placeholder="Hej! Berätta vad du har ätit... t.ex. 'grillad kyckling med ris och broccoli'"
                    className="w-full bg-transparent border-none outline-none text-slate-200 placeholder-slate-400 resize-none text-lg leading-relaxed min-h-[80px] font-medium"
                    disabled={isAnalyzing}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={isAnalyzing || isListening}
              className={`absolute -bottom-2 right-6 w-16 h-16 rounded-full backdrop-blur-md transition-all duration-300 micro-bounce micro-glow ${
                isListening 
                  ? 'bg-red-500/20 border-2 border-red-400 text-red-300 animate-pulse' 
                  : 'bg-macro-protein/20 border-2 border-macro-protein/50 text-macro-protein hover:bg-macro-protein/30 hover:border-macro-protein hover:scale-110'
              }`}
              title={isListening ? 'Lyssnar...' : 'Röstinmatning'}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 mx-auto animate-bounce" />
              ) : (
                <Mic className="w-8 h-8 mx-auto" />
              )}
            </button>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!mealText.trim() || isAnalyzing}
              className="btn-primary flex items-center gap-3 text-xl px-12 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="w-6 h-6 animate-spin-slow" />
                  Analyserar med AI...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Analysera Måltid
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Gesture Hint */}
        <div className="absolute top-4 right-4 text-slate-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          💬 Tala eller skriv
        </div>
      </div>

      {/* AI Thinking Animation */}
      {showAIThinking && (
        <div className="ai-thinking reveal">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-macro-protein/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-6 h-6 text-macro-protein animate-pulse" />
            </div>
            <div className="text-slate-300 font-medium">AI analyserar din måltid</div>
            <div className="flex gap-1">
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Voice Input Feedback */}
      {isListening && (
        <div className="card micro-bounce bg-red-500/10 border-red-400/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Mic className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-red-300 font-bold text-lg">🎤 Jag lyssnar...</p>
              <p className="text-red-400 text-sm">Berätta vad du har ätit</p>
            </div>
            <div className="ml-auto flex gap-1">
              <div className="w-2 h-8 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-6 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-10 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-4 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {!mealText && !isAnalyzing && !isListening && (
        <div className="space-y-3 reveal">
          <p className="text-slate-400 text-center font-medium">💡 Snabba förslag:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Ägg och havregrynsgröt",
              "Kycklingfilé med pasta",
              "Lax med quinoa",
              "Proteinshake med banan"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setMealText(suggestion)}
                className="px-4 py-2 bg-dark-700/30 hover:bg-dark-600/40 text-slate-300 hover:text-slate-200 rounded-pill text-sm font-medium transition-all duration-200 backdrop-blur-sm micro-bounce border border-dark-600/30 hover:border-macro-protein/50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 