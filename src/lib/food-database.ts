export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string;
  serving: {
    amount: number;
    unit: string;
    description: string;
  };
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  verified: boolean;
  source: string;
}

export const FOOD_DATABASE: FoodDatabaseItem[] = [
  // PROTEINS - MEAT & POULTRY
  {
    id: 'chicken-breast-raw',
    name: 'Chicken Breast, Raw',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g raw' },
    macros: { protein: 23, carbs: 0, fat: 3.6, calories: 165 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'chicken-breast-grilled',
    name: 'Chicken Breast, Grilled',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'chicken-thigh-skinless',
    name: 'Chicken Thigh, Skinless',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 26, carbs: 0, fat: 5.7, calories: 109 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'ground-beef-lean-93-7',
    name: 'Ground Beef, 93% Lean',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 22, carbs: 0, fat: 7, calories: 152 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'ground-beef-85-15',
    name: 'Ground Beef, 85% Lean',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 25, carbs: 0, fat: 15, calories: 250 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pork-tenderloin',
    name: 'Pork Tenderloin, Lean',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 26, carbs: 1, fat: 3.5, calories: 143 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'turkey-breast-sliced',
    name: 'Turkey Breast, Sliced',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g deli meat' },
    macros: { protein: 29, carbs: 1, fat: 1, calories: 135 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'beef-sirloin-steak',
    name: 'Beef Sirloin Steak, Lean',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 26, carbs: 0, fat: 6, calories: 158 },
    verified: true,
    source: 'USDA'
  },

  // PROTEINS - FISH & SEAFOOD
  {
    id: 'salmon-atlantic-farmed',
    name: 'Salmon, Atlantic, Farmed',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 25, carbs: 0, fat: 12, calories: 206 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'salmon-wild-coho',
    name: 'Salmon, Wild Coho',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 28, carbs: 0, fat: 6, calories: 146 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'tuna-yellowfin',
    name: 'Tuna, Yellowfin',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 25, carbs: 0, fat: 1, calories: 109 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'tuna-canned-water',
    name: 'Tuna, Canned in Water',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g drained' },
    macros: { protein: 25, carbs: 0, fat: 1, calories: 116 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cod-atlantic',
    name: 'Cod, Atlantic',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 23, carbs: 0, fat: 1, calories: 105 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'shrimp-cooked',
    name: 'Shrimp, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 24, carbs: 0, fat: 1, calories: 99 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'tilapia-cooked',
    name: 'Tilapia, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 26, carbs: 0, fat: 3, calories: 129 },
    verified: true,
    source: 'USDA'
  },

  // PROTEINS - DAIRY & EGGS
  {
    id: 'eggs-whole-large',
    name: 'Eggs, Whole, Large',
    category: 'Dairy & Eggs',
    serving: { amount: 50, unit: 'g', description: '1 large egg' },
    macros: { protein: 6, carbs: 1, fat: 5, calories: 70 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'egg-whites',
    name: 'Egg Whites',
    category: 'Dairy & Eggs',
    serving: { amount: 100, unit: 'g', description: '100g (~3 egg whites)' },
    macros: { protein: 11, carbs: 1, fat: 0, calories: 52 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'greek-yogurt-nonfat',
    name: 'Greek Yogurt, Non-fat',
    category: 'Dairy & Eggs',
    serving: { amount: 100, unit: 'g', description: '100g' },
    macros: { protein: 10, carbs: 4, fat: 0, calories: 59 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'greek-yogurt-whole-milk',
    name: 'Greek Yogurt, Whole Milk',
    category: 'Dairy & Eggs',
    serving: { amount: 100, unit: 'g', description: '100g' },
    macros: { protein: 9, carbs: 4, fat: 5, calories: 97 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cottage-cheese-lowfat',
    name: 'Cottage Cheese, Low-fat',
    category: 'Dairy & Eggs',
    serving: { amount: 100, unit: 'g', description: '100g' },
    macros: { protein: 11, carbs: 3, fat: 1, calories: 72 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'milk-whole',
    name: 'Milk, Whole',
    category: 'Dairy & Eggs',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 8, carbs: 12, fat: 8, calories: 149 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'milk-skim',
    name: 'Milk, Skim',
    category: 'Dairy & Eggs',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 8, carbs: 12, fat: 0, calories: 83 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cheese-cheddar',
    name: 'Cheese, Cheddar',
    category: 'Dairy & Eggs',
    serving: { amount: 28, unit: 'g', description: '1 oz slice' },
    macros: { protein: 7, carbs: 1, fat: 9, calories: 113 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cheese-mozzarella-part-skim',
    name: 'Mozzarella, Part-skim',
    category: 'Dairy & Eggs',
    serving: { amount: 28, unit: 'g', description: '1 oz' },
    macros: { protein: 7, carbs: 1, fat: 5, calories: 72 },
    verified: true,
    source: 'USDA'
  },

  // CARBOHYDRATES - GRAINS
  {
    id: 'rice-white-cooked',
    name: 'Rice, White, Long-grain, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 4, carbs: 28, fat: 0, calories: 130 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'rice-brown-cooked',
    name: 'Rice, Brown, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 3, carbs: 23, fat: 1, calories: 112 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'quinoa-cooked',
    name: 'Quinoa, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 4, carbs: 22, fat: 2, calories: 120 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'oats-rolled-dry',
    name: 'Oats, Rolled, Dry',
    category: 'Grains',
    serving: { amount: 40, unit: 'g', description: '1/2 cup dry' },
    macros: { protein: 5, carbs: 27, fat: 3, calories: 150 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pasta-cooked',
    name: 'Pasta, Enriched, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 5, carbs: 25, fat: 1, calories: 131 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'bread-whole-wheat',
    name: 'Bread, Whole Wheat',
    category: 'Grains',
    serving: { amount: 28, unit: 'g', description: '1 slice' },
    macros: { protein: 4, carbs: 12, fat: 2, calories: 81 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'bread-white',
    name: 'Bread, White',
    category: 'Grains',
    serving: { amount: 28, unit: 'g', description: '1 slice' },
    macros: { protein: 3, carbs: 14, fat: 1, calories: 75 },
    verified: true,
    source: 'USDA'
  },

  // CARBOHYDRATES - VEGETABLES
  {
    id: 'sweet-potato-baked',
    name: 'Sweet Potato, Baked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g with skin' },
    macros: { protein: 2, carbs: 20, fat: 0, calories: 90 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'potato-russet-baked',
    name: 'Potato, Russet, Baked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g with skin' },
    macros: { protein: 2, carbs: 21, fat: 0, calories: 93 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'broccoli-cooked',
    name: 'Broccoli, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g steamed' },
    macros: { protein: 3, carbs: 7, fat: 0, calories: 34 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'spinach-cooked',
    name: 'Spinach, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 3, carbs: 4, fat: 0, calories: 23 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'asparagus-cooked',
    name: 'Asparagus, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 2, carbs: 4, fat: 0, calories: 22 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'bell-pepper-red',
    name: 'Bell Pepper, Red',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g raw' },
    macros: { protein: 1, carbs: 7, fat: 0, calories: 31 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'carrots-cooked',
    name: 'Carrots, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 1, carbs: 8, fat: 0, calories: 35 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'green-beans-cooked',
    name: 'Green Beans, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 2, carbs: 7, fat: 0, calories: 35 },
    verified: true,
    source: 'USDA'
  },

  // FATS & OILS
  {
    id: 'olive-oil',
    name: 'Olive Oil',
    category: 'Fats & Oils',
    serving: { amount: 14, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 0, fat: 14, calories: 119 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'coconut-oil',
    name: 'Coconut Oil',
    category: 'Fats & Oils',
    serving: { amount: 14, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 0, fat: 14, calories: 121 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'butter',
    name: 'Butter',
    category: 'Fats & Oils',
    serving: { amount: 14, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 0, fat: 11, calories: 102 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'Fats & Oils',
    serving: { amount: 100, unit: 'g', description: '100g (~1/2 medium)' },
    macros: { protein: 2, carbs: 9, fat: 15, calories: 160 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~23 nuts)' },
    macros: { protein: 6, carbs: 6, fat: 14, calories: 164 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'walnuts',
    name: 'Walnuts',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~14 halves)' },
    macros: { protein: 4, carbs: 4, fat: 18, calories: 185 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'peanut-butter',
    name: 'Peanut Butter, Natural',
    category: 'Nuts & Seeds',
    serving: { amount: 32, unit: 'g', description: '2 tablespoons' },
    macros: { protein: 8, carbs: 8, fat: 16, calories: 190 },
    verified: true,
    source: 'USDA'
  },

  // FRUITS
  {
    id: 'banana-medium',
    name: 'Banana, Medium',
    category: 'Fruits',
    serving: { amount: 118, unit: 'g', description: '1 medium banana' },
    macros: { protein: 1, carbs: 27, fat: 0, calories: 105 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'apple-medium',
    name: 'Apple, Medium',
    category: 'Fruits',
    serving: { amount: 182, unit: 'g', description: '1 medium apple' },
    macros: { protein: 0, carbs: 25, fat: 0, calories: 95 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'berries-blueberry',
    name: 'Blueberries',
    category: 'Fruits',
    serving: { amount: 148, unit: 'g', description: '1 cup' },
    macros: { protein: 1, carbs: 21, fat: 0, calories: 84 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'berries-strawberry',
    name: 'Strawberries',
    category: 'Fruits',
    serving: { amount: 152, unit: 'g', description: '1 cup sliced' },
    macros: { protein: 1, carbs: 11, fat: 0, calories: 49 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'orange-medium',
    name: 'Orange, Medium',
    category: 'Fruits',
    serving: { amount: 154, unit: 'g', description: '1 medium orange' },
    macros: { protein: 1, carbs: 15, fat: 0, calories: 62 },
    verified: true,
    source: 'USDA'
  },

  // LEGUMES & BEANS
  {
    id: 'black-beans-cooked',
    name: 'Black Beans, Cooked',
    category: 'Legumes',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 9, carbs: 23, fat: 0, calories: 132 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'chickpeas-cooked',
    name: 'Chickpeas, Cooked',
    category: 'Legumes',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 8, carbs: 27, fat: 3, calories: 164 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'lentils-cooked',
    name: 'Lentils, Cooked',
    category: 'Legumes',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 9, carbs: 20, fat: 0, calories: 116 },
    verified: true,
    source: 'USDA'
  },

  // BEVERAGES - NON-ALCOHOLIC
  {
    id: 'water',
    name: 'Water',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'coffee-black',
    name: 'Coffee, Black',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 2 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'tea-green',
    name: 'Tea, Green',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 2 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'orange-juice',
    name: 'Orange Juice',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 2, carbs: 26, fat: 0, calories: 112 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    category: 'Beverages',
    serving: { amount: 355, unit: 'ml', description: '1 can (12 oz)' },
    macros: { protein: 0, carbs: 39, fat: 0, calories: 140 },
    verified: true,
    source: 'Coca-Cola Company'
  },
  {
    id: 'diet-coke',
    name: 'Diet Coke',
    category: 'Beverages',
    serving: { amount: 355, unit: 'ml', description: '1 can (12 oz)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
    verified: true,
    source: 'Coca-Cola Company'
  },

  // ALCOHOLIC BEVERAGES - PROPERLY CALCULATED (Alcohol = 7 kcal/g)
  {
    id: 'beer-regular-355ml',
    name: 'Beer, Regular (5% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 355, unit: 'ml', description: '1 can/bottle (12 oz)' },
    macros: { protein: 2, carbs: 13, fat: 0, calories: 153 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'beer-regular-500ml',
    name: 'Beer, Regular (5% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 500, unit: 'ml', description: '500ml bottle/can' },
    macros: { protein: 3, carbs: 18, fat: 0, calories: 215 },
    verified: true,
    source: 'Calculated from USDA'
  },
  {
    id: 'beer-strong-500ml',
    name: 'Beer, Strong (5.2% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 500, unit: 'ml', description: '500ml bottle/can' },
    macros: { protein: 3, carbs: 18, fat: 0, calories: 225 },
    verified: true,
    source: 'Calculated (5.2% = ~21g alcohol = ~147 kcal + 18g carbs = 72 kcal)'
  },
  {
    id: 'beer-light-355ml',
    name: 'Beer, Light (4% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 355, unit: 'ml', description: '1 can/bottle (12 oz)' },
    macros: { protein: 1, carbs: 5, fat: 0, calories: 103 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'beer-light-500ml',
    name: 'Beer, Light (4% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 500, unit: 'ml', description: '500ml bottle/can' },
    macros: { protein: 1, carbs: 7, fat: 0, calories: 145 },
    verified: true,
    source: 'Calculated (4% = ~16g alcohol = ~112 kcal + 7g carbs = 28 kcal)'
  },
  {
    id: 'beer-ipa-500ml',
    name: 'Beer, IPA (6-7% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 500, unit: 'ml', description: '500ml bottle/can' },
    macros: { protein: 3, carbs: 20, fat: 0, calories: 270 },
    verified: true,
    source: 'Calculated (6.5% = ~26g alcohol = ~182 kcal + 20g carbs = 80 kcal)'
  },
  {
    id: 'wine-red-150ml',
    name: 'Wine, Red (12-13% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 150, unit: 'ml', description: '1 glass (standard)' },
    macros: { protein: 0, carbs: 4, fat: 0, calories: 125 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'wine-white-150ml',
    name: 'Wine, White (12-13% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 150, unit: 'ml', description: '1 glass (standard)' },
    macros: { protein: 0, carbs: 4, fat: 0, calories: 121 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'wine-bottle-750ml',
    name: 'Wine, Bottle (12-13% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 750, unit: 'ml', description: '1 bottle (750ml)' },
    macros: { protein: 1, carbs: 20, fat: 0, calories: 625 },
    verified: true,
    source: 'Calculated (12.5% = ~75g alcohol = ~525 kcal + 20g carbs = 80 kcal)'
  },
  {
    id: 'vodka-shot-44ml',
    name: 'Vodka, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 44, unit: 'ml', description: '1 shot (1.5 oz)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 97 },
    verified: true,
    source: 'USDA (40% = ~14g alcohol = ~97 kcal)'
  },
  {
    id: 'vodka-100ml',
    name: 'Vodka, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 100, unit: 'ml', description: '100ml (10 cl)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 220 },
    verified: true,
    source: 'Calculated (40% = ~32g alcohol = ~224 kcal)'
  },
  {
    id: 'vodka-200ml',
    name: 'Vodka, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 200, unit: 'ml', description: '200ml (20 cl)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 441 },
    verified: true,
    source: 'Calculated (40% = ~63g alcohol = ~441 kcal)'
  },
  {
    id: 'vodka-250ml',
    name: 'Vodka, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 250, unit: 'ml', description: '250ml (25 cl)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 551 },
    verified: true,
    source: 'Calculated (40% = ~79g alcohol = ~551 kcal)'
  },
  {
    id: 'vodka-500ml',
    name: 'Vodka, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 500, unit: 'ml', description: '500ml (50 cl)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 1102 },
    verified: true,
    source: 'Calculated (40% = ~158g alcohol = ~1102 kcal)'
  },
  {
    id: 'whiskey-shot-44ml',
    name: 'Whiskey, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 44, unit: 'ml', description: '1 shot (1.5 oz)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 97 },
    verified: true,
    source: 'Calculated (40% = ~14g alcohol = ~97 kcal)'
  },
  {
    id: 'whiskey-100ml',
    name: 'Whiskey, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 100, unit: 'ml', description: '100ml (10 cl)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 220 },
    verified: true,
    source: 'Calculated (40% = ~32g alcohol = ~224 kcal)'
  },
  {
    id: 'rum-shot-44ml',
    name: 'Rum, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 44, unit: 'ml', description: '1 shot (1.5 oz)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 97 },
    verified: true,
    source: 'Calculated (40% = ~14g alcohol = ~97 kcal)'
  },
  {
    id: 'rum-100ml',
    name: 'Rum, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 100, unit: 'ml', description: '100ml (10 cl)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 220 },
    verified: true,
    source: 'Calculated (40% = ~32g alcohol = ~224 kcal)'
  },
  {
    id: 'gin-shot-44ml',
    name: 'Gin, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 44, unit: 'ml', description: '1 shot (1.5 oz)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 97 },
    verified: true,
    source: 'Calculated (40% = ~14g alcohol = ~97 kcal)'
  },
  {
    id: 'gin-100ml',
    name: 'Gin, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 100, unit: 'ml', description: '100ml (10 cl)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 220 },
    verified: true,
    source: 'Calculated (40% = ~32g alcohol = ~224 kcal)'
  },
  {
    id: 'cocktail-mojito',
    name: 'Mojito (Rum, Sugar, Lime)',
    category: 'Alcoholic Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cocktail' },
    macros: { protein: 0, carbs: 24, fat: 0, calories: 193 },
    verified: true,
    source: 'Calculated (40ml rum = ~97 kcal + 24g sugar = 96 kcal)'
  },
  {
    id: 'cocktail-margarita',
    name: 'Margarita (Tequila, Triple Sec, Lime)',
    category: 'Alcoholic Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cocktail' },
    macros: { protein: 0, carbs: 18, fat: 0, calories: 242 },
    verified: true,
    source: 'Calculated (60ml spirits = ~170 kcal + 18g carbs = 72 kcal)'
  },
  {
    id: 'champagne-150ml',
    name: 'Champagne (12% ABV)',
    category: 'Alcoholic Beverages',
    serving: { amount: 150, unit: 'ml', description: '1 glass (flute)' },
    macros: { protein: 0, carbs: 3, fat: 0, calories: 95 },
    verified: true,
    source: 'Calculated (12% = ~15g alcohol = ~105 kcal + 3g carbs = 12 kcal)'
  },

  // TEQUILA
  {
    id: 'tequila-40-44ml',
    name: 'Tequila, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 44, unit: 'ml', description: '1 shot (1.5 oz)' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 97 },
    verified: true,
    source: 'Calculated (44ml × 40% × 0.789 × 7 = 97 kcal)'
  },
  {
    id: 'tequila-40-100ml',
    name: 'Tequila, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 100, unit: 'ml', description: '100ml' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 220 },
    verified: true,
    source: 'Calculated (100ml × 40% × 0.789 × 7 = 220 kcal)'
  },
  {
    id: 'tequila-40-200ml',
    name: 'Tequila, 40% ABV',
    category: 'Alcoholic Beverages',
    serving: { amount: 200, unit: 'ml', description: '200ml' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 441 },
    verified: true,
    source: 'Calculated (200ml × 40% × 0.789 × 7 = 441 kcal)'
  },

  // FAST FOOD - GENERIC
  {
    id: 'cheeseburger-generic',
    name: 'Cheeseburger, Generic',
    category: 'Fast Food',
    serving: { amount: 1, unit: 'item', description: '1 cheeseburger' },
    macros: { protein: 20, carbs: 35, fat: 18, calories: 365 },
    verified: true,
    source: 'USDA Generic Fast Food Cheeseburger'
  },
  {
    id: 'hamburger-generic',
    name: 'Hamburger, Generic',
    category: 'Fast Food',
    serving: { amount: 1, unit: 'item', description: '1 hamburger' },
    macros: { protein: 18, carbs: 35, fat: 14, calories: 320 },
    verified: true,
    source: 'USDA Generic Fast Food Hamburger'
  },

  // FAST FOOD - McDONALD'S
  {
    id: 'mcdonalds-big-mac',
    name: "McDonald's Big Mac",
    category: 'Fast Food',
    serving: { amount: 1, unit: 'item', description: '1 sandwich' },
    macros: { protein: 25, carbs: 46, fat: 33, calories: 563 },
    verified: true,
    source: "McDonald's Nutrition"
  },
  {
    id: 'mcdonalds-quarter-pounder',
    name: "McDonald's Quarter Pounder with Cheese",
    category: 'Fast Food',
    serving: { amount: 1, unit: 'item', description: '1 sandwich' },
    macros: { protein: 30, carbs: 43, fat: 28, calories: 520 },
    verified: true,
    source: "McDonald's Nutrition"
  },
  {
    id: 'mcdonalds-chicken-mcnuggets-10pc',
    name: "McDonald's Chicken McNuggets",
    category: 'Fast Food',
    serving: { amount: 10, unit: 'pieces', description: '10 pieces' },
    macros: { protein: 23, carbs: 16, fat: 20, calories: 320 },
    verified: true,
    source: "McDonald's Nutrition"
  },
  {
    id: 'mcdonalds-fries-medium',
    name: "McDonald's French Fries",
    category: 'Fast Food',
    serving: { amount: 1, unit: 'medium', description: 'Medium order' },
    macros: { protein: 4, carbs: 43, fat: 16, calories: 320 },
    verified: true,
    source: "McDonald's Nutrition"
  },

  // PIZZA
  {
    id: 'pizza-pepperoni-slice',
    name: 'Pizza, Pepperoni, Regular Crust',
    category: 'Fast Food',
    serving: { amount: 1, unit: 'slice', description: '1 slice (1/8 of 14" pizza)' },
    macros: { protein: 12, carbs: 26, fat: 10, calories: 230 },
    verified: true,
    source: 'Generic Chain Pizza'
  },
  {
    id: 'pizza-cheese-slice',
    name: 'Pizza, Cheese, Regular Crust',
    category: 'Fast Food',
    serving: { amount: 1, unit: 'slice', description: '1 slice (1/8 of 14" pizza)' },
    macros: { protein: 10, carbs: 27, fat: 8, calories: 200 },
    verified: true,
    source: 'Generic Chain Pizza'
  },

  // ADDITIONAL PROTEIN SOURCES
  {
    id: 'protein-powder-whey',
    name: 'Protein Powder, Whey',
    category: 'Supplements',
    serving: { amount: 30, unit: 'g', description: '1 scoop' },
    macros: { protein: 24, carbs: 3, fat: 1, calories: 120 },
    verified: true,
    source: 'Generic Whey Protein'
  },
  {
    id: 'tofu-firm',
    name: 'Tofu, Firm',
    category: 'Plant Proteins',
    serving: { amount: 100, unit: 'g', description: '100g' },
    macros: { protein: 15, carbs: 4, fat: 8, calories: 144 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'tempeh',
    name: 'Tempeh',
    category: 'Plant Proteins',
    serving: { amount: 100, unit: 'g', description: '100g' },
    macros: { protein: 19, carbs: 9, fat: 11, calories: 192 },
    verified: true,
    source: 'USDA'
  },

  // CONDIMENTS & SAUCES
  {
    id: 'ketchup',
    name: 'Ketchup',
    category: 'Condiments',
    serving: { amount: 17, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 4, fat: 0, calories: 17 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'mustard-yellow',
    name: 'Mustard, Yellow',
    category: 'Condiments',
    serving: { amount: 5, unit: 'g', description: '1 teaspoon' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 3 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'mayo-regular',
    name: 'Mayonnaise, Regular',
    category: 'Condiments',
    serving: { amount: 14, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 0, fat: 11, calories: 94 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'ranch-dressing',
    name: 'Ranch Dressing',
    category: 'Condiments',
    serving: { amount: 15, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 1, fat: 7, calories: 73 },
    verified: true,
    source: 'Generic Brand'
  },

  // SNACKS
  {
    id: 'chips-potato-regular',
    name: 'Potato Chips, Regular',
    category: 'Snacks',
    serving: { amount: 28, unit: 'g', description: '1 oz (~15 chips)' },
    macros: { protein: 2, carbs: 15, fat: 10, calories: 152 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'crackers-saltine',
    name: 'Crackers, Saltine',
    category: 'Snacks',
    serving: { amount: 12, unit: 'g', description: '4 crackers' },
    macros: { protein: 1, carbs: 9, fat: 1, calories: 52 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'popcorn-air-popped',
    name: 'Popcorn, Air-popped',
    category: 'Snacks',
    serving: { amount: 8, unit: 'g', description: '1 cup popped' },
    macros: { protein: 1, carbs: 6, fat: 0, calories: 31 },
    verified: true,
    source: 'USDA'
  },

  // ICE CREAM & DESSERTS
  {
    id: 'ice-cream-vanilla',
    name: 'Ice Cream, Vanilla',
    category: 'Desserts',
    serving: { amount: 66, unit: 'g', description: '1/2 cup' },
    macros: { protein: 2, carbs: 16, fat: 7, calories: 137 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'chocolate-dark-70',
    name: 'Dark Chocolate, 70% Cacao',
    category: 'Desserts',
    serving: { amount: 28, unit: 'g', description: '1 oz' },
    macros: { protein: 3, carbs: 13, fat: 12, calories: 170 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cookies-chocolate-chip',
    name: 'Cookies, Chocolate Chip',
    category: 'Desserts',
    serving: { amount: 16, unit: 'g', description: '1 medium cookie' },
    macros: { protein: 1, carbs: 10, fat: 4, calories: 78 },
    verified: true,
    source: 'USDA'
  },

  // BREAKFAST ITEMS
  {
    id: 'pancakes-plain',
    name: 'Pancakes, Plain',
    category: 'Breakfast',
    serving: { amount: 1, unit: 'item', description: '1 medium pancake (4" dia)' },
    macros: { protein: 2, carbs: 14, fat: 2, calories: 86 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'waffle-plain',
    name: 'Waffle, Plain',
    category: 'Breakfast',
    serving: { amount: 1, unit: 'item', description: '1 round waffle (7" dia)' },
    macros: { protein: 6, carbs: 25, fat: 8, calories: 218 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'bacon-cooked',
    name: 'Bacon, Cooked',
    category: 'Breakfast',
    serving: { amount: 8, unit: 'g', description: '1 slice' },
    macros: { protein: 3, carbs: 0, fat: 3, calories: 43 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'sausage-breakfast',
    name: 'Breakfast Sausage',
    category: 'Breakfast',
    serving: { amount: 13, unit: 'g', description: '1 link' },
    macros: { protein: 5, carbs: 0, fat: 8, calories: 92 },
    verified: true,
    source: 'USDA'
  },

  // CEREALS
  {
    id: 'cereal-cheerios',
    name: 'Cheerios',
    category: 'Breakfast',
    serving: { amount: 28, unit: 'g', description: '1 cup' },
    macros: { protein: 3, carbs: 20, fat: 2, calories: 100 },
    verified: true,
    source: 'General Mills'
  },
  {
    id: 'cereal-corn-flakes',
    name: 'Corn Flakes',
    category: 'Breakfast',
    serving: { amount: 28, unit: 'g', description: '1 cup' },
    macros: { protein: 2, carbs: 24, fat: 0, calories: 100 },
    verified: true,
    source: "Kellogg's"
  },

  // SOUPS
  {
    id: 'soup-chicken-noodle',
    name: 'Chicken Noodle Soup',
    category: 'Soups',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 3, carbs: 9, fat: 2, calories: 62 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'soup-tomato',
    name: 'Tomato Soup',
    category: 'Soups',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 2, carbs: 17, fat: 2, calories: 90 },
    verified: true,
    source: 'USDA'
  },

  // ENERGY DRINKS
  {
    id: 'redbull-regular',
    name: 'Red Bull Energy Drink',
    category: 'Beverages',
    serving: { amount: 250, unit: 'ml', description: '1 can (8.4 oz)' },
    macros: { protein: 1, carbs: 27, fat: 0, calories: 110 },
    verified: true,
    source: 'Red Bull'
  },
  {
    id: 'monster-energy',
    name: 'Monster Energy Drink',
    category: 'Beverages',
    serving: { amount: 473, unit: 'ml', description: '1 can (16 oz)' },
    macros: { protein: 0, carbs: 54, fat: 0, calories: 210 },
    verified: true,
    source: 'Monster Energy'
  },

  // ADDITIONAL POPULAR FOODS
  {
    id: 'ramen-instant-prepared',
    name: 'Instant Ramen, Prepared',
    category: 'Prepared Foods',
    serving: { amount: 1, unit: 'package', description: '1 package prepared' },
    macros: { protein: 5, carbs: 26, fat: 7, calories: 188 },
    verified: true,
    source: 'Generic Brand'
  },
  {
    id: 'mac-cheese-boxed',
    name: 'Macaroni and Cheese, Boxed',
    category: 'Prepared Foods',
    serving: { amount: 70, unit: 'g', description: '1 cup prepared' },
    macros: { protein: 11, carbs: 48, fat: 13, calories: 320 },
    verified: true,
    source: 'Generic Brand'
  },

  // ADDITIONAL MEAT & POULTRY
  {
    id: 'lamb-leg-roasted',
    name: 'Lamb, Leg, Roasted',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 29, carbs: 0, fat: 9, calories: 191 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'duck-breast-roasted',
    name: 'Duck Breast, Roasted',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 23, carbs: 0, fat: 11, calories: 201 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'venison-ground',
    name: 'Venison, Ground',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 30, carbs: 0, fat: 7, calories: 187 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'turkey-ground-93-7',
    name: 'Turkey, Ground, 93% Lean',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 29, carbs: 0, fat: 5, calories: 168 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'chicken-drumstick',
    name: 'Chicken Drumstick, with Skin',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 28, carbs: 0, fat: 7, calories: 172 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'chicken-wing',
    name: 'Chicken Wing, with Skin',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 30, carbs: 0, fat: 20, calories: 290 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'ham-sliced-lean',
    name: 'Ham, Sliced, Lean',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g deli meat' },
    macros: { protein: 22, carbs: 1, fat: 5, calories: 145 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pork-chop-center-cut',
    name: 'Pork Chop, Center Cut',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 28, carbs: 0, fat: 8, calories: 186 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'ribeye-steak',
    name: 'Ribeye Steak',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 25, carbs: 0, fat: 17, calories: 250 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'filet-mignon',
    name: 'Filet Mignon',
    category: 'Meat & Poultry',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 29, carbs: 0, fat: 8, calories: 186 },
    verified: true,
    source: 'USDA'
  },

  // ADDITIONAL FISH & SEAFOOD
  {
    id: 'halibut-cooked',
    name: 'Halibut, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 27, carbs: 0, fat: 3, calories: 140 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'mahi-mahi-cooked',
    name: 'Mahi-Mahi, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 24, carbs: 0, fat: 1, calories: 109 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'sea-bass-cooked',
    name: 'Sea Bass, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 24, carbs: 0, fat: 3, calories: 124 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'sardines-canned',
    name: 'Sardines, Canned in Oil',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g drained' },
    macros: { protein: 25, carbs: 0, fat: 11, calories: 208 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'mackerel-cooked',
    name: 'Mackerel, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 26, carbs: 0, fat: 17, calories: 262 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'crab-cooked',
    name: 'Crab, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 20, carbs: 0, fat: 2, calories: 97 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'lobster-cooked',
    name: 'Lobster, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 26, carbs: 0, fat: 1, calories: 112 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'scallops-cooked',
    name: 'Scallops, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 24, carbs: 5, fat: 1, calories: 137 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'mussels-cooked',
    name: 'Mussels, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 18, carbs: 4, fat: 2, calories: 111 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'oysters-cooked',
    name: 'Oysters, Cooked',
    category: 'Fish & Seafood',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 9, carbs: 5, fat: 2, calories: 79 },
    verified: true,
    source: 'USDA'
  },

  // ADDITIONAL DAIRY & EGGS
  {
    id: 'ricotta-part-skim',
    name: 'Ricotta Cheese, Part-skim',
    category: 'Dairy & Eggs',
    serving: { amount: 100, unit: 'g', description: '100g' },
    macros: { protein: 11, carbs: 3, fat: 8, calories: 138 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'feta-cheese',
    name: 'Feta Cheese',
    category: 'Dairy & Eggs',
    serving: { amount: 28, unit: 'g', description: '1 oz' },
    macros: { protein: 4, carbs: 1, fat: 6, calories: 75 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'goat-cheese',
    name: 'Goat Cheese',
    category: 'Dairy & Eggs',
    serving: { amount: 28, unit: 'g', description: '1 oz' },
    macros: { protein: 5, carbs: 0, fat: 6, calories: 75 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'swiss-cheese',
    name: 'Swiss Cheese',
    category: 'Dairy & Eggs',
    serving: { amount: 28, unit: 'g', description: '1 oz slice' },
    macros: { protein: 8, carbs: 1, fat: 8, calories: 106 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'parmesan-cheese',
    name: 'Parmesan Cheese, Grated',
    category: 'Dairy & Eggs',
    serving: { amount: 15, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 4, carbs: 0, fat: 2, calories: 32 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cream-cheese',
    name: 'Cream Cheese',
    category: 'Dairy & Eggs',
    serving: { amount: 28, unit: 'g', description: '1 oz' },
    macros: { protein: 2, carbs: 1, fat: 10, calories: 99 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'sour-cream',
    name: 'Sour Cream',
    category: 'Dairy & Eggs',
    serving: { amount: 30, unit: 'g', description: '2 tablespoons' },
    macros: { protein: 1, carbs: 1, fat: 5, calories: 52 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'heavy-cream',
    name: 'Heavy Cream',
    category: 'Dairy & Eggs',
    serving: { amount: 15, unit: 'ml', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 0, fat: 6, calories: 52 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'almond-milk-unsweetened',
    name: 'Almond Milk, Unsweetened',
    category: 'Dairy & Eggs',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 1, carbs: 1, fat: 3, calories: 37 },
    verified: true,
    source: 'Generic Brand'
  },
  {
    id: 'oat-milk',
    name: 'Oat Milk',
    category: 'Dairy & Eggs',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 3, carbs: 16, fat: 5, calories: 120 },
    verified: true,
    source: 'Generic Brand'
  },

  // ADDITIONAL GRAINS & STARCHES
  {
    id: 'barley-cooked',
    name: 'Barley, Pearl, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 2, carbs: 22, fat: 0, calories: 123 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'bulgur-cooked',
    name: 'Bulgur, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 3, carbs: 19, fat: 0, calories: 83 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'couscous-cooked',
    name: 'Couscous, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 4, carbs: 23, fat: 0, calories: 112 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'farro-cooked',
    name: 'Farro, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 5, carbs: 26, fat: 1, calories: 130 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'millet-cooked',
    name: 'Millet, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 3, carbs: 23, fat: 1, calories: 119 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'buckwheat-cooked',
    name: 'Buckwheat, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 3, carbs: 20, fat: 1, calories: 92 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'wild-rice-cooked',
    name: 'Wild Rice, Cooked',
    category: 'Grains',
    serving: { amount: 100, unit: 'g', description: '100g cooked' },
    macros: { protein: 4, carbs: 21, fat: 0, calories: 101 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'bagel-plain',
    name: 'Bagel, Plain',
    category: 'Grains',
    serving: { amount: 89, unit: 'g', description: '1 medium bagel' },
    macros: { protein: 11, carbs: 55, fat: 2, calories: 277 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'english-muffin',
    name: 'English Muffin, Plain',
    category: 'Grains',
    serving: { amount: 57, unit: 'g', description: '1 muffin' },
    macros: { protein: 5, carbs: 26, fat: 1, calories: 134 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'tortilla-flour-8inch',
    name: 'Tortilla, Flour, 8 inch',
    category: 'Grains',
    serving: { amount: 32, unit: 'g', description: '1 tortilla' },
    macros: { protein: 3, carbs: 18, fat: 3, calories: 104 },
    verified: true,
    source: 'USDA'
  },

  // ADDITIONAL VEGETABLES
  {
    id: 'brussels-sprouts-cooked',
    name: 'Brussels Sprouts, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 3, carbs: 9, fat: 0, calories: 36 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cauliflower-cooked',
    name: 'Cauliflower, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 2, carbs: 4, fat: 0, calories: 23 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cabbage-cooked',
    name: 'Cabbage, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 1, carbs: 6, fat: 0, calories: 23 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'kale-cooked',
    name: 'Kale, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 2, carbs: 7, fat: 1, calories: 28 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'collard-greens-cooked',
    name: 'Collard Greens, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 2, carbs: 5, fat: 0, calories: 26 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'artichoke-cooked',
    name: 'Artichoke, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 3, carbs: 11, fat: 0, calories: 45 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'eggplant-cooked',
    name: 'Eggplant, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 1, carbs: 9, fat: 0, calories: 35 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'zucchini-cooked',
    name: 'Zucchini, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 1, carbs: 4, fat: 0, calories: 20 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'mushrooms-cooked',
    name: 'Mushrooms, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g sautéed' },
    macros: { protein: 3, carbs: 5, fat: 0, calories: 28 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'corn-yellow-cooked',
    name: 'Corn, Yellow, Cooked',
    category: 'Vegetables',
    serving: { amount: 100, unit: 'g', description: '100g boiled' },
    macros: { protein: 3, carbs: 21, fat: 1, calories: 96 },
    verified: true,
    source: 'USDA'
  },

  // ADDITIONAL FRUITS
  {
    id: 'mango-fresh',
    name: 'Mango, Fresh',
    category: 'Fruits',
    serving: { amount: 165, unit: 'g', description: '1 cup sliced' },
    macros: { protein: 1, carbs: 25, fat: 0, calories: 99 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pineapple-fresh',
    name: 'Pineapple, Fresh',
    category: 'Fruits',
    serving: { amount: 165, unit: 'g', description: '1 cup chunks' },
    macros: { protein: 1, carbs: 22, fat: 0, calories: 82 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'kiwi-fresh',
    name: 'Kiwi, Fresh',
    category: 'Fruits',
    serving: { amount: 69, unit: 'g', description: '1 medium kiwi' },
    macros: { protein: 1, carbs: 11, fat: 0, calories: 42 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'peach-fresh',
    name: 'Peach, Fresh',
    category: 'Fruits',
    serving: { amount: 150, unit: 'g', description: '1 medium peach' },
    macros: { protein: 1, carbs: 14, fat: 0, calories: 58 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pear-fresh',
    name: 'Pear, Fresh',
    category: 'Fruits',
    serving: { amount: 178, unit: 'g', description: '1 medium pear' },
    macros: { protein: 1, carbs: 25, fat: 0, calories: 101 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'grapes-red',
    name: 'Grapes, Red',
    category: 'Fruits',
    serving: { amount: 151, unit: 'g', description: '1 cup' },
    macros: { protein: 1, carbs: 16, fat: 0, calories: 62 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'watermelon-fresh',
    name: 'Watermelon, Fresh',
    category: 'Fruits',
    serving: { amount: 152, unit: 'g', description: '1 cup diced' },
    macros: { protein: 1, carbs: 12, fat: 0, calories: 46 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cantaloupe-fresh',
    name: 'Cantaloupe, Fresh',
    category: 'Fruits',
    serving: { amount: 177, unit: 'g', description: '1 cup diced' },
    macros: { protein: 1, carbs: 13, fat: 0, calories: 54 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'plum-fresh',
    name: 'Plum, Fresh',
    category: 'Fruits',
    serving: { amount: 66, unit: 'g', description: '1 medium plum' },
    macros: { protein: 0, carbs: 8, fat: 0, calories: 30 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'cherries-sweet',
    name: 'Cherries, Sweet',
    category: 'Fruits',
    serving: { amount: 154, unit: 'g', description: '1 cup with pits' },
    macros: { protein: 2, carbs: 19, fat: 0, calories: 87 },
    verified: true,
    source: 'USDA'
  },

  // ADDITIONAL NUTS & SEEDS
  {
    id: 'cashews',
    name: 'Cashews',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~18 nuts)' },
    macros: { protein: 5, carbs: 9, fat: 12, calories: 157 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pistachios',
    name: 'Pistachios',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~49 nuts)' },
    macros: { protein: 6, carbs: 8, fat: 13, calories: 159 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'brazil-nuts',
    name: 'Brazil Nuts',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~6 nuts)' },
    macros: { protein: 4, carbs: 3, fat: 19, calories: 186 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pecans',
    name: 'Pecans',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~19 halves)' },
    macros: { protein: 3, carbs: 4, fat: 20, calories: 196 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'macadamia-nuts',
    name: 'Macadamia Nuts',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~10-12 nuts)' },
    macros: { protein: 2, carbs: 4, fat: 21, calories: 204 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'hazelnuts',
    name: 'Hazelnuts',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~21 nuts)' },
    macros: { protein: 4, carbs: 5, fat: 17, calories: 178 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pine-nuts',
    name: 'Pine Nuts',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz' },
    macros: { protein: 4, carbs: 4, fat: 19, calories: 191 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'sunflower-seeds',
    name: 'Sunflower Seeds',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~1/4 cup)' },
    macros: { protein: 6, carbs: 6, fat: 14, calories: 164 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'pumpkin-seeds',
    name: 'Pumpkin Seeds',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~85 seeds)' },
    macros: { protein: 5, carbs: 5, fat: 12, calories: 151 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'chia-seeds',
    name: 'Chia Seeds',
    category: 'Nuts & Seeds',
    serving: { amount: 28, unit: 'g', description: '1 oz (~2 tbsp)' },
    macros: { protein: 5, carbs: 12, fat: 9, calories: 138 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'flax-seeds',
    name: 'Flax Seeds, Ground',
    category: 'Nuts & Seeds',
    serving: { amount: 10, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 2, carbs: 3, fat: 4, calories: 55 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'sesame-seeds',
    name: 'Sesame Seeds',
    category: 'Nuts & Seeds',
    serving: { amount: 9, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 2, carbs: 2, fat: 4, calories: 52 },
    verified: true,
    source: 'USDA'
  },

  // BASIC & COMMON SNACKS
  {
    id: 'oreo-cookies',
    name: 'Oreo Cookies',
    category: 'Snacks',
    serving: { amount: 3, unit: 'cookies', description: '3 cookies (34g)' },
    macros: { protein: 2, carbs: 25, fat: 7, calories: 160 },
    verified: true,
    source: 'Nabisco'
  },
  {
    id: 'kit-kat-bar',
    name: 'Kit Kat Bar',
    category: 'Snacks',
    serving: { amount: 1, unit: 'bar', description: '1 bar (42g)' },
    macros: { protein: 3, carbs: 27, fat: 11, calories: 210 },
    verified: true,
    source: 'Hershey'
  },
  {
    id: 'snickers-bar',
    name: 'Snickers Bar',
    category: 'Snacks',
    serving: { amount: 1, unit: 'bar', description: '1 bar (52g)' },
    macros: { protein: 4, carbs: 33, fat: 12, calories: 250 },
    verified: true,
    source: 'Mars'
  },
  {
    id: 'pringles-chips',
    name: 'Pringles Original',
    category: 'Snacks',
    serving: { amount: 15, unit: 'chips', description: '15 chips (30g)' },
    macros: { protein: 2, carbs: 15, fat: 10, calories: 150 },
    verified: true,
    source: 'Pringles'
  },
  {
    id: 'doritos-nacho',
    name: 'Doritos Nacho Cheese',
    category: 'Snacks',
    serving: { amount: 28, unit: 'g', description: '1 oz (~12 chips)' },
    macros: { protein: 2, carbs: 16, fat: 8, calories: 140 },
    verified: true,
    source: 'Frito-Lay'
  },
  {
    id: 'cheetos-crunchy',
    name: 'Cheetos Crunchy',
    category: 'Snacks',
    serving: { amount: 28, unit: 'g', description: '1 oz (~21 pieces)' },
    macros: { protein: 2, carbs: 15, fat: 10, calories: 150 },
    verified: true,
    source: 'Frito-Lay'
  },
  {
    id: 'granola-bar-nature-valley',
    name: 'Nature Valley Granola Bar',
    category: 'Snacks',
    serving: { amount: 2, unit: 'bars', description: '2 bars (42g)' },
    macros: { protein: 4, carbs: 29, fat: 6, calories: 190 },
    verified: true,
    source: 'General Mills'
  },
  {
    id: 'protein-bar-clif',
    name: 'Clif Protein Bar',
    category: 'Snacks',
    serving: { amount: 1, unit: 'bar', description: '1 bar (68g)' },
    macros: { protein: 20, carbs: 23, fat: 5, calories: 250 },
    verified: true,
    source: 'Clif Bar'
  },
  {
    id: 'trail-mix-basic',
    name: 'Trail Mix (Nuts, Raisins)',
    category: 'Snacks',
    serving: { amount: 30, unit: 'g', description: '1 oz (~1/4 cup)' },
    macros: { protein: 4, carbs: 13, fat: 8, calories: 131 },
    verified: true,
    source: 'Generic'
  },
  {
    id: 'beef-jerky',
    name: 'Beef Jerky',
    category: 'Snacks',
    serving: { amount: 28, unit: 'g', description: '1 oz' },
    macros: { protein: 14, carbs: 3, fat: 1, calories: 80 },
    verified: true,
    source: 'Generic Brand'
  },
  {
    id: 'string-cheese',
    name: 'String Cheese',
    category: 'Snacks',
    serving: { amount: 1, unit: 'stick', description: '1 stick (28g)' },
    macros: { protein: 8, carbs: 1, fat: 6, calories: 80 },
    verified: true,
    source: 'Generic Brand'
  },
  {
    id: 'goldfish-crackers',
    name: 'Goldfish Crackers',
    category: 'Snacks',
    serving: { amount: 30, unit: 'g', description: '55 crackers' },
    macros: { protein: 3, carbs: 20, fat: 5, calories: 140 },
    verified: true,
    source: 'Pepperidge Farm'
  },
  {
    id: 'animal-crackers',
    name: 'Animal Crackers',
    category: 'Snacks',
    serving: { amount: 30, unit: 'g', description: '16 crackers' },
    macros: { protein: 2, carbs: 22, fat: 4, calories: 130 },
    verified: true,
    source: 'Generic Brand'
  },
  {
    id: 'rice-cakes-plain',
    name: 'Rice Cakes, Plain',
    category: 'Snacks',
    serving: { amount: 1, unit: 'cake', description: '1 rice cake (9g)' },
    macros: { protein: 1, carbs: 7, fat: 0, calories: 35 },
    verified: true,
    source: 'Generic Brand'
  },

  // BASIC INGREDIENTS & COOKING STAPLES
  {
    id: 'flour-all-purpose',
    name: 'Flour, All-purpose',
    category: 'Cooking Staples',
    serving: { amount: 125, unit: 'g', description: '1 cup' },
    macros: { protein: 13, carbs: 95, fat: 1, calories: 455 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'sugar-granulated',
    name: 'Sugar, Granulated',
    category: 'Cooking Staples',
    serving: { amount: 12, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 12, fat: 0, calories: 48 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'brown-sugar',
    name: 'Brown Sugar, Packed',
    category: 'Cooking Staples',
    serving: { amount: 15, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 15, fat: 0, calories: 52 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'honey',
    name: 'Honey',
    category: 'Cooking Staples',
    serving: { amount: 21, unit: 'g', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 17, fat: 0, calories: 64 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'maple-syrup-pure',
    name: 'Maple Syrup, Pure',
    category: 'Cooking Staples',
    serving: { amount: 20, unit: 'ml', description: '1 tablespoon' },
    macros: { protein: 0, carbs: 13, fat: 0, calories: 52 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'salt',
    name: 'Salt',
    category: 'Cooking Staples',
    serving: { amount: 6, unit: 'g', description: '1 teaspoon' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'black-pepper',
    name: 'Black Pepper',
    category: 'Cooking Staples',
    serving: { amount: 2, unit: 'g', description: '1 teaspoon' },
    macros: { protein: 0, carbs: 1, fat: 0, calories: 5 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'garlic-fresh',
    name: 'Garlic, Fresh',
    category: 'Cooking Staples',
    serving: { amount: 3, unit: 'g', description: '1 clove' },
    macros: { protein: 0, carbs: 1, fat: 0, calories: 4 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'onion-yellow',
    name: 'Onion, Yellow',
    category: 'Vegetables',
    serving: { amount: 110, unit: 'g', description: '1 medium onion' },
    macros: { protein: 1, carbs: 10, fat: 0, calories: 44 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'tomato-fresh',
    name: 'Tomato, Fresh',
    category: 'Vegetables',
    serving: { amount: 123, unit: 'g', description: '1 medium tomato' },
    macros: { protein: 1, carbs: 5, fat: 0, calories: 22 },
    verified: true,
    source: 'USDA'
  },

  // ADDITIONAL BEVERAGES
  {
    id: 'coconut-water',
    name: 'Coconut Water',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 2, carbs: 9, fat: 0, calories: 46 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'kombucha',
    name: 'Kombucha',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 7, fat: 0, calories: 30 },
    verified: true,
    source: 'Generic Brand'
  },
  {
    id: 'sports-drink',
    name: 'Sports Drink (Gatorade)',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 14, fat: 0, calories: 50 },
    verified: true,
    source: 'Gatorade'
  },
  {
    id: 'chocolate-milk',
    name: 'Chocolate Milk, Low-fat',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 8, carbs: 26, fat: 3, calories: 158 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'protein-shake-whey',
    name: 'Protein Shake, Whey with Water',
    category: 'Beverages',
    serving: { amount: 1, unit: 'scoop', description: '1 scoop in water' },
    macros: { protein: 24, carbs: 3, fat: 1, calories: 120 },
    verified: true,
    source: 'Generic Brand'
  },
  {
    id: 'smoothie-green',
    name: 'Green Smoothie (Spinach, Banana, Apple)',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 2, carbs: 25, fat: 0, calories: 100 },
    verified: true,
    source: 'Typical Recipe'
  },
  {
    id: 'tea-black',
    name: 'Tea, Black',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 1, fat: 0, calories: 2 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'tea-herbal',
    name: 'Herbal Tea',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 0, fat: 0, calories: 2 },
    verified: true,
    source: 'USDA'
  },
  {
    id: 'lemonade',
    name: 'Lemonade',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 28, fat: 0, calories: 112 },
    verified: true,
    source: 'Generic Recipe'
  },
  {
    id: 'iced-tea-sweet',
    name: 'Iced Tea, Sweet',
    category: 'Beverages',
    serving: { amount: 240, unit: 'ml', description: '1 cup' },
    macros: { protein: 0, carbs: 22, fat: 0, calories: 88 },
    verified: true,
    source: 'Generic Recipe'
  },
];

// Helper functions for searching and filtering
export function searchFoodDatabase(query: string, limit: number = 20): FoodDatabaseItem[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return FOOD_DATABASE.slice(0, limit);

  const matches = FOOD_DATABASE.filter(food => 
    food.name.toLowerCase().includes(searchTerm) ||
    food.category.toLowerCase().includes(searchTerm)
  );

  return matches.slice(0, limit);
}

export function getFoodsByCategory(category: string): FoodDatabaseItem[] {
  return FOOD_DATABASE.filter(food => 
    food.category.toLowerCase() === category.toLowerCase()
  );
}

export function getFoodById(id: string): FoodDatabaseItem | undefined {
  return FOOD_DATABASE.find(food => food.id === id);
}

export function getAllCategories(): string[] {
  const categories = new Set(FOOD_DATABASE.map(food => food.category));
  return Array.from(categories).sort();
}

export function calculateMacrosForAmount(food: FoodDatabaseItem, amount: number, unit: string): {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
} {
  // Convert requested amount to the food's serving size for calculation
  let multiplier = 1;
  
  if (food.serving.unit === 'g' && unit === 'g') {
    multiplier = amount / food.serving.amount;
  } else if (food.serving.unit === 'ml' && unit === 'ml') {
    multiplier = amount / food.serving.amount;
  } else if (food.serving.unit === unit) {
    multiplier = amount / food.serving.amount;
  }
  // Add more unit conversions as needed

  return {
    protein: Math.round(food.macros.protein * multiplier),
    carbs: Math.round(food.macros.carbs * multiplier),
    fat: Math.round(food.macros.fat * multiplier),
    calories: Math.round(food.macros.calories * multiplier)
  };
} 