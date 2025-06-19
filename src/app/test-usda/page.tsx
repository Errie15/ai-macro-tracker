'use client';

import { useState } from 'react';
import { searchFoods, getFoodDetails, searchAndGetNutrition } from '@/lib/usda-api';
import { analyzeEnhancedMeal } from '@/lib/enhanced-gemini';
import { FoodSearchItem, USDAFood, MacroNutrients } from '@/types';

export default function TestUSDAPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [nutritionData, setNutritionData] = useState<MacroNutrients | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Söker efter:', searchQuery);
      const results = await searchFoods({ query: searchQuery, pageSize: 10 });
      setSearchResults(results);
      console.log('✅ Sökresultat:', results);
    } catch (err) {
      console.error('❌ Sökfel:', err);
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDetails = async (fdcId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Hämtar detaljer för FDC ID:', fdcId);
      const food = await getFoodDetails(fdcId);
      setSelectedFood(food);
      console.log('✅ Matdetaljer:', food);
    } catch (err) {
      console.error('❌ Detaljersfel:', err);
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setLoading(false);
    }
  };

  const handleGetNutrition = async (query: string, grams: number = 100) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🥗 Hämtar näringsinfo för:', query, grams + 'g');
      const result = await searchAndGetNutrition(query, grams);
      if (result) {
        setNutritionData(result.macros);
        console.log('✅ Näringsdata:', result);
      } else {
        setError('Ingen data hittades');
      }
    } catch (err) {
      console.error('❌ Näringsfel:', err);
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancedAnalysis = async (description: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🤖 Förbättrad analys för:', description);
      const result = await analyzeEnhancedMeal(description);
      setEnhancedResult(result);
      console.log('✅ Förbättrad analys:', result);
    } catch (err) {
      console.error('❌ Analysfel:', err);
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">USDA API Test</h1>
          
          {/* Sökfunktion */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Sök Livsmedel</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök efter livsmedel (t.ex. chicken breast, banana)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Söker...' : 'Sök'}
              </button>
            </div>
          </div>

          {/* Snabbtest-knappar */}
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Snabbtest</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGetNutrition('chicken breast', 150)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Kyckling 150g
              </button>
              <button
                onClick={() => handleGetNutrition('banana', 120)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Banan 120g
              </button>
              <button
                onClick={() => handleGetNutrition('brown rice', 100)}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Brunt ris 100g
              </button>
              <button
                onClick={() => handleEnhancedAnalysis('150g chicken breast, 100g rice, 1 banana')}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Förbättrad AI Analys
              </button>
            </div>
          </div>

          {/* Fel-meddelande */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Fel:</strong> {error}
            </div>
          )}

          {/* Sökresultat */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Sökresultat ({searchResults.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((food) => (
                  <div
                    key={food.fdcId}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleGetDetails(food.fdcId)}
                  >
                    <div className="font-medium text-gray-800">{food.description}</div>
                    {food.brandName && (
                      <div className="text-sm text-gray-600">Märke: {food.brandName}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      FDC ID: {food.fdcId} | Typ: {food.dataType}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matdetaljer */}
          {selectedFood && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Matdetaljer</h3>
              <div className="text-gray-700">
                <div><strong>Namn:</strong> {selectedFood.description}</div>
                {selectedFood.brandName && (
                  <div><strong>Märke:</strong> {selectedFood.brandName}</div>
                )}
                <div><strong>FDC ID:</strong> {selectedFood.fdcId}</div>
                <div><strong>Typ:</strong> {selectedFood.dataType}</div>
                <div><strong>Näringsämnen:</strong> {selectedFood.foodNutrients.length} st</div>
              </div>
            </div>
          )}

          {/* Näringsdata */}
          {nutritionData && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Näringsdata per portion</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{nutritionData.calories}</div>
                  <div className="text-sm text-gray-600">Kalorier</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{nutritionData.protein}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{nutritionData.carbs}g</div>
                  <div className="text-sm text-gray-600">Kolhydrater</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{nutritionData.fat}g</div>
                  <div className="text-sm text-gray-600">Fett</div>
                </div>
              </div>
            </div>
          )}

          {/* Förbättrad AI-analys */}
          {enhancedResult && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Förbättrad AI-analys (Konfidensgrad: {enhancedResult.confidence || 'N/A'})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{enhancedResult.calories}</div>
                  <div className="text-sm text-gray-600">Kalorier</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{enhancedResult.protein}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{enhancedResult.carbs}g</div>
                  <div className="text-sm text-gray-600">Kolhydrater</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{enhancedResult.fat}g</div>
                  <div className="text-sm text-gray-600">Fett</div>
                </div>
              </div>
            </div>
          )}

          {/* Konsol-testning */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Konsol-testning</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Öppna utvecklarverktygen (F12) och testa:</p>
              <code className="bg-gray-100 px-2 py-1 rounded">window.testUSDA.examples.searchChicken()</code><br/>
              <code className="bg-gray-100 px-2 py-1 rounded">window.testUSDA.examples.getBananaNutrition()</code><br/>
              <code className="bg-gray-100 px-2 py-1 rounded">window.testUSDA.search(&quot;chocolate&quot;)</code><br/>
              <code className="bg-gray-100 px-2 py-1 rounded">window.testEnhancedAI.examples.simple()</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 