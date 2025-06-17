'use client';

import { useState } from 'react';
import { Plus, Loader2, Mic } from 'lucide-react';
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
      console.error('Fel vid tillägg av måltid:', error);
      alert('Fel vid analys av måltid. Försök igen.');
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
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Lägg Till Måltid</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            placeholder="Beskriv din måltid, t.ex. '50g proteinpulver, en banan och 10g jordnötssmör'"
            className="input-field min-h-[100px] resize-none pr-12"
            disabled={isAnalyzing}
          />
          
          <button
            type="button"
            onClick={startVoiceInput}
            disabled={isAnalyzing || isListening}
            className="absolute right-3 top-3 p-2 text-gray-500 hover:text-primary-600 disabled:opacity-50"
            title="Röstinmatning"
          >
            <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : ''}`} />
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!mealText.trim() || isAnalyzing}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyserar...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Lägg Till Måltid
            </>
          )}
        </button>
      </form>
      
      {isListening && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">
            🎤 Lyssnar... Tala nu!
          </p>
        </div>
      )}
    </div>
  );
} 