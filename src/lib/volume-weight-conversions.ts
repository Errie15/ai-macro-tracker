// Volume to weight conversions for common Swedish ingredients
// All weights are in grams per deciliter (dl)

export const volumeWeightConversions: Record<string, number> = {
  // Grains and cereals
  'havregryn': 35,
  'oats': 35,
  'cornflakes': 25,
  'müsli': 45,
  'granola': 50,
  'quinoa': 75,
  'bulgur': 70,
  'couscous': 65,
  'ris': 80,
  'rice': 80,
  'kokt ris': 150,
  'cooked rice': 150,
  'pasta': 70,
  'makaroner': 70,
  'kokt pasta': 140,
  'cooked pasta': 140,
  
  // Flours and powders
  'mjöl': 60,
  'flour': 60,
  'vetemjöl': 60,
  'wheat flour': 60,
  'mandelmjöl': 45,
  'almond flour': 45,
  'kokosmjöl': 50,
  'coconut flour': 50,
  'bakpulver': 110,
  'baking powder': 110,
  'bikarbonat': 110,
  'baking soda': 110,
  'kakao': 40,
  'cocoa powder': 40,
  'proteinpulver': 50,
  'protein powder': 50,
  
  // Sugars and sweeteners
  'socker': 85,
  'sugar': 85,
  'strösocker': 85,
  'granulated sugar': 85,
  'florsocker': 60,
  'powdered sugar': 60,
  'farinsocker': 80,
  'brown sugar': 80,
  'honung': 140,
  'honey': 140,
  'sirap': 140,
  'syrup': 140,
  'lönnsirap': 130,
  'maple syrup': 130,
  
  // Nuts and seeds
  'mandel': 65,
  'almonds': 65,
  'valnötter': 50,
  'walnuts': 50,
  'hasselnötter': 60,
  'hazelnuts': 60,
  'cashewnötter': 60,
  'cashews': 60,
  'jordnötter': 70,
  'peanuts': 70,
  'solrosfrön': 60,
  'sunflower seeds': 60,
  'pumpafrön': 55,
  'pumpkin seeds': 55,
  'chiafrön': 70,
  'chia seeds': 70,
  'linfrön': 65,
  'flax seeds': 65,
  'sesamfrön': 65,
  'sesame seeds': 65,
  
  // Legumes
  'linser': 85,
  'lentils': 85,
  'kokta linser': 110,
  'cooked lentils': 110,
  'kikärtor': 75,
  'chickpeas': 75,
  'kokta kikärtor': 120,
  'cooked chickpeas': 120,
  'svarta bönor': 80,
  'black beans': 80,
  'vita bönor': 80,
  'white beans': 80,
  'kokta bönor': 120,
  'cooked beans': 120,
  
  // Berries and dried fruits
  'blåbär': 65,
  'blueberries': 65,
  'hallon': 55,
  'raspberries': 55,
  'jordgubbar': 60,
  'strawberries': 60,
  'björnbär': 60,
  'blackberries': 60,
  'tranbär': 50,
  'cranberries': 50,
  'russin': 65,
  'raisins': 65,
  'dadlar': 85,
  'dates': 85,
  'fikon': 75,
  'figs': 75,
  
  // Vegetables (chopped/diced)
  'lök': 60,
  'onion': 60,
  'vitlök': 70,
  'garlic': 70,
  'morötter': 55,
  'carrots': 55,
  'potatis': 65,
  'potatoes': 65,
  'tomat': 60,
  'tomatoes': 60,
  'gurka': 55,
  'cucumber': 55,
  'paprika': 50,
  'bell pepper': 50,
  'broccoli': 35,
  'blomkål': 40,
  'cauliflower': 40,
  'zucchini': 50,
  
  // Liquids (for reference, though these should be obvious)
  'vatten': 100,
  'water': 100,
  'mjölk': 103,
  'milk': 103,
  'grädde': 100,
  'cream': 100,
  'filmjölk': 103,
  'buttermilk': 103,
  'yoghurt': 110,
  'greek yogurt': 120,
  'turkisk yoghurt': 120,
  'olja': 92,
  'oil': 92,
  'olivolja': 92,
  'olive oil': 92,
  'smör': 95,
  'butter': 95,
  
  // Nut butters and spreads
  'jordnötssmör': 110,
  'peanut butter': 110,
  'mandelsmör': 105,
  'almond butter': 105,
  'nutella': 120,
  'marmelad': 130,
  'jam': 130,
  
  // Spices and seasonings (small amounts)
  'salt': 120,
  'peppar': 50,
  'pepper': 50,
  'kanel': 45,
  'cinnamon': 45,
  'vanilj': 45,
  'vanilla': 45,
  'kardemumma': 50,
  'cardamom': 50,
};

// Function to get weight from volume for a specific ingredient
export function getWeightFromVolume(ingredient: string, volumeInDl: number): number {
  const normalizedIngredient = ingredient.toLowerCase().trim();
  
  // Try exact match first
  if (volumeWeightConversions[normalizedIngredient]) {
    return volumeWeightConversions[normalizedIngredient] * volumeInDl;
  }
  
  // Try partial matches for compound ingredients
  for (const [key, weight] of Object.entries(volumeWeightConversions)) {
    if (normalizedIngredient.includes(key) || key.includes(normalizedIngredient)) {
      return weight * volumeInDl;
    }
  }
  
  // Default fallback (should rarely be used)
  console.warn(`No conversion found for ingredient: ${ingredient}`);
  return 60 * volumeInDl; // Conservative default
}

// Function to get all conversions as a formatted string for AI prompt
export function getConversionsForPrompt(): string {
  const entries = Object.entries(volumeWeightConversions);
  const grouped = entries.reduce((acc, [ingredient, weight]) => {
    const category = getCategoryForIngredient(ingredient);
    if (!acc[category]) acc[category] = [];
    acc[category].push(`- 1 dl ${ingredient} = ${weight}g`);
    return acc;
  }, {} as Record<string, string[]>);
  
  let result = '';
  for (const [category, items] of Object.entries(grouped)) {
    result += `\n${category}:\n${items.join('\n')}\n`;
  }
  
  return result;
}

function getCategoryForIngredient(ingredient: string): string {
  if (['havregryn', 'oats', 'cornflakes', 'müsli', 'granola', 'quinoa', 'bulgur', 'couscous', 'ris', 'rice', 'pasta', 'makaroner'].includes(ingredient)) {
    return 'Grains & Cereals';
  }
  if (['mjöl', 'flour', 'vetemjöl', 'mandelmjöl', 'kokosmjöl', 'bakpulver', 'kakao', 'proteinpulver'].includes(ingredient)) {
    return 'Flours & Powders';
  }
  if (['socker', 'sugar', 'strösocker', 'florsocker', 'farinsocker', 'honung', 'sirap', 'lönnsirap'].includes(ingredient)) {
    return 'Sugars & Sweeteners';
  }
  if (['mandel', 'almonds', 'valnötter', 'walnuts', 'hasselnötter', 'cashewnötter', 'jordnötter', 'solrosfrön', 'pumpafrön', 'chiafrön', 'linfrön', 'sesamfrön'].includes(ingredient)) {
    return 'Nuts & Seeds';
  }
  if (['linser', 'lentils', 'kikärtor', 'chickpeas', 'svarta bönor', 'vita bönor'].includes(ingredient)) {
    return 'Legumes';
  }
  if (['blåbär', 'blueberries', 'hallon', 'jordgubbar', 'björnbär', 'tranbär', 'russin', 'dadlar', 'fikon'].includes(ingredient)) {
    return 'Berries & Dried Fruits';
  }
  if (['vatten', 'mjölk', 'grädde', 'filmjölk', 'yoghurt', 'olja', 'olivolja', 'smör'].includes(ingredient)) {
    return 'Liquids & Fats';
  }
  return 'Other';
} 