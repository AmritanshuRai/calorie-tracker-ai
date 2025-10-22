export const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    multiplier: 1.2,
    description: 'Little or no exercise',
  },
  {
    id: 'lightly_active',
    label: 'Lightly Active',
    multiplier: 1.375,
    description: 'Exercise 1-3 days/week',
  },
  {
    id: 'moderately_active',
    label: 'Moderately Active',
    multiplier: 1.55,
    description: 'Exercise 3-5 days/week',
  },
  {
    id: 'very_active',
    label: 'Very Active',
    multiplier: 1.725,
    description: 'Exercise 6-7 days/week',
  },
  {
    id: 'extra_active',
    label: 'Extra Active',
    multiplier: 1.9,
    description: 'Very hard exercise & physical job',
  },
];

export const GOALS = [
  {
    id: 'weight_loss',
    label: 'Weight Loss',
    emoji: '📉',
    description: 'Lose weight sustainably',
  },
  {
    id: 'improved_health',
    label: 'Improved Health',
    emoji: '💪',
    description: 'Maintain weight & get healthier',
  },
  {
    id: 'weight_gain',
    label: 'Weight Gain',
    emoji: '📈',
    description: 'Gain weight & build muscle',
  },
];

export const NUTRIENTS = {
  calories: { label: 'Calories', unit: 'kcal', color: 'text-orange-500' },
  protein: { label: 'Protein', unit: 'g', color: 'text-blue-500' },
  carbs: { label: 'Carbs', unit: 'g', color: 'text-green-500' },
  fats: { label: 'Fat', unit: 'g', color: 'text-yellow-500' },
};

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙' },
  { id: 'snacks', label: 'Snacks', emoji: '🍪' },
];

// Free logs limit for new users
export const FREE_LOGS_LIMIT = 15;
