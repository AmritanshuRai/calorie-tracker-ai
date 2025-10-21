/**
 * Calculate daily micronutrient requirements based on user profile
 * Uses RDA (Recommended Dietary Allowance) and AI (Adequate Intake) guidelines
 * Adjusts for pregnancy, lactation, lifestyle factors, and diet preferences
 */

export const calculateDailyMicronutrients = (userData) => {
  const {
    gender,
    age,
    currentWeight,
    dailyCalorieTarget,
    goal,
    healthConditions = [],
    // New health profile data
    pregnancyStatus,
    trimester,
    menstrualCycle,
    smokingStatus,
    cigarettesPerDay,
    alcoholFrequency,
    caffeineIntake,
    sunExposure,
    climate,
    skinTone,
    sleepHours,
    stressLevel,
    waterIntake,
    medications = [],
    previousDeficiencies = [],
    exerciseTypes = [],
    exerciseIntensity,
    dietPreference,
    activityLevel,
  } = userData;

  // Initialize requirements object
  const requirements = {};

  // ========== VITAMINS ==========

  // Vitamin A (mcg RAE)
  requirements.vitaminA = gender === 'male' ? 900 : 700;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.vitaminA = 770;
  } else if (pregnancyStatus === 'lactating') {
    requirements.vitaminA = 1300;
  }

  // Vitamin D (mcg)
  requirements.vitaminD = age >= 71 ? 20 : 15;

  // Adjust for sun exposure
  if (sunExposure === 'minimal') {
    requirements.vitaminD += 10; // Increase to 25-30 mcg
  } else if (sunExposure === 'high') {
    requirements.vitaminD -= 5; // Can reduce slightly
  }

  // Adjust for skin tone (darker skin needs more)
  if (['dark_brown', 'very_dark'].includes(skinTone)) {
    requirements.vitaminD += 10;
  } else if (['brown', 'olive'].includes(skinTone)) {
    requirements.vitaminD += 5;
  }

  // Adjust for climate
  if (['cold', 'very_cold'].includes(climate)) {
    requirements.vitaminD += 5;
  }

  // Special case: Minimal sun + Fatty liver = higher needs
  if (sunExposure === 'minimal' && healthConditions.includes('fatty_liver')) {
    requirements.vitaminD = Math.max(requirements.vitaminD, 37.5); // 1500 IU minimum
  }

  if (
    pregnancyStatus === 'pregnant' ||
    pregnancyStatus === 'lactating' ||
    pregnancyStatus === 'both'
  ) {
    requirements.vitaminD = Math.max(requirements.vitaminD, 15);
  }

  // Vitamin E (mg)
  requirements.vitaminE = 15;
  if (pregnancyStatus === 'lactating') requirements.vitaminE = 19;
  if (smokingStatus === 'current') requirements.vitaminE += 2;

  // Vitamin K (mcg) - weight-based
  requirements.vitaminK = currentWeight * 1; // 1 mcg/kg
  if (gender === 'male')
    requirements.vitaminK = Math.max(requirements.vitaminK, 120);
  if (gender === 'female')
    requirements.vitaminK = Math.max(requirements.vitaminK, 90);

  // Vitamin C (mg)
  requirements.vitaminC = gender === 'male' ? 90 : 75;
  if (smokingStatus === 'current') {
    requirements.vitaminC += 35; // Smokers need significantly more
  }
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.vitaminC = 85;
  } else if (pregnancyStatus === 'lactating') {
    requirements.vitaminC = 120;
  }
  if (stressLevel === 'high') requirements.vitaminC += 25;
  if (stressLevel === 'severe') requirements.vitaminC += 50;
  if (['very_active', 'extra_active'].includes(activityLevel)) {
    requirements.vitaminC += 25;
  }

  // Hot climate adjustment (oxidative stress from heat)
  if (['hot_dry', 'hot_humid'].includes(climate)) {
    requirements.vitaminC += 15;
  }

  // Liver protection (fatty liver, cirrhosis)
  if (
    healthConditions.includes('fatty_liver') ||
    healthConditions.includes('liver_disease')
  ) {
    requirements.vitaminC = Math.max(requirements.vitaminC, 100); // Minimum 100mg for liver protection
  }

  // B Vitamins (calorie-based formulas)

  // Vitamin B1 - Thiamine (mg)
  requirements.vitaminB1 = dailyCalorieTarget * 0.0005;
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'regular') {
    requirements.vitaminB1 *= 1.3; // 30% increase for regular drinkers
  }

  // Vitamin B2 - Riboflavin (mg)
  requirements.vitaminB2 = dailyCalorieTarget * 0.00055;
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'regular') {
    requirements.vitaminB2 *= 1.2;
  }

  // Vitamin B3 - Niacin (mg NE)
  requirements.vitaminB3 = dailyCalorieTarget * 0.0065;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.vitaminB3 = 18;
  } else if (pregnancyStatus === 'lactating') {
    requirements.vitaminB3 = 17;
  }

  // Muscle metabolism & exercise
  if (
    ['strength', 'hiit', 'cardio', 'sports'].some((type) =>
      exerciseTypes.includes(type)
    )
  ) {
    requirements.vitaminB3 += 2; // Extra for muscle metabolism
  }

  // Cholesterol & cardiovascular support (high blood pressure, fatty liver)
  if (
    healthConditions.includes('high_blood_pressure') ||
    healthConditions.includes('high_cholesterol') ||
    healthConditions.includes('fatty_liver')
  ) {
    requirements.vitaminB3 = Math.max(requirements.vitaminB3, 16); // Minimum 16mg for cardiovascular support
  }

  // Vitamin B5 - Pantothenic Acid (mg)
  requirements.vitaminB5 = 5;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both')
    requirements.vitaminB5 = 6;
  if (pregnancyStatus === 'lactating') requirements.vitaminB5 = 7;

  // Vitamin B6 - Pyridoxine (mg)
  requirements.vitaminB6 = age > 50 ? (gender === 'male' ? 1.7 : 1.5) : 1.3;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.vitaminB6 = 1.9;
  } else if (pregnancyStatus === 'lactating') {
    requirements.vitaminB6 = 2.0;
  }
  if (medications.includes('Birth control pills'))
    requirements.vitaminB6 += 0.5;
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'regular') {
    requirements.vitaminB6 *= 1.2;
  }

  // Vitamin B9 - Folate (mcg DFE)
  requirements.vitaminB9 = 400;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.vitaminB9 = 600; // Critical for fetal development
  } else if (pregnancyStatus === 'lactating') {
    requirements.vitaminB9 = 500;
  }
  if (gender === 'female' && age >= 15 && age <= 50) {
    requirements.vitaminB9 = Math.max(requirements.vitaminB9, 400); // Childbearing age
  }
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'regular') {
    requirements.vitaminB9 *= 1.2;
  }

  // Vitamin B12 - Cobalamin (mcg)
  requirements.vitaminB12 = 2.4;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.vitaminB12 = 2.6;
  } else if (pregnancyStatus === 'lactating') {
    requirements.vitaminB12 = 2.8;
  }
  if (age >= 65)
    requirements.vitaminB12 = Math.max(requirements.vitaminB12, 2.4);
  if (
    medications.includes('Antacids') ||
    medications.includes('Proton pump inhibitors (PPIs)')
  ) {
    requirements.vitaminB12 *= 1.5; // PPIs reduce B12 absorption
  }
  if (medications.includes('Metformin')) {
    requirements.vitaminB12 *= 1.3;
  }
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'regular') {
    requirements.vitaminB12 *= 1.2;
  }
  // Adjust for diet preference
  if (['vegan', 'vegetarian'].includes(dietPreference)) {
    requirements.vitaminB12 *= 1.5; // Plant-based diets lack B12
  }

  // ========== MINERALS ==========

  // Calcium (mg)
  requirements.calcium =
    (age > 50 && gender === 'female') || age > 70 ? 1200 : 1000;
  if (
    pregnancyStatus === 'pregnant' ||
    pregnancyStatus === 'lactating' ||
    pregnancyStatus === 'both'
  ) {
    requirements.calcium = 1000;
  }
  if (
    medications.includes('Antacids') ||
    medications.includes('Proton pump inhibitors (PPIs)')
  ) {
    requirements.calcium *= 1.2; // Reduced absorption
  }
  if (caffeineIntake === 'high') requirements.calcium += 100;
  if (['very_active', 'extra_active'].includes(activityLevel)) {
    requirements.calcium += 200; // Weight-bearing exercise
  }
  // Adjust for diet preference
  if (['vegan', 'vegetarian'].includes(dietPreference)) {
    requirements.calcium += 100; // May have lower bioavailability
  }

  // Iron (mg)
  if (gender === 'female' && age >= 15 && age < 50) {
    requirements.iron = 18; // Menstruating women
    if (menstrualCycle === 'heavy') {
      requirements.iron += 5; // Heavy flow increases needs
    }
  } else {
    requirements.iron = 8;
  }
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.iron = 27; // Critical increase during pregnancy
  } else if (pregnancyStatus === 'lactating') {
    requirements.iron = 9;
  }
  if (
    ['very_active', 'extra_active'].includes(activityLevel) ||
    exerciseTypes.includes('cardio')
  ) {
    requirements.iron += 3; // Athletes lose iron through sweat
  }
  if (caffeineIntake === 'high' || caffeineIntake === 'moderate') {
    requirements.iron += 2; // Caffeine reduces absorption
  }
  // Adjust for diet preference
  if (['vegan', 'vegetarian'].includes(dietPreference)) {
    requirements.iron *= 1.8; // Non-heme iron has lower bioavailability
  }

  // Magnesium (mg) - weight-based
  requirements.magnesium = currentWeight * 5.5;
  if (gender === 'male') {
    requirements.magnesium = age > 30 ? 420 : 400;
  } else {
    requirements.magnesium = age > 30 ? 320 : 310;
  }
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.magnesium = age < 19 ? 400 : 350;
  } else if (pregnancyStatus === 'lactating') {
    requirements.magnesium = age < 19 ? 360 : 310;
  }
  if (
    healthConditions.includes('diabetes') ||
    healthConditions.includes('type_2_diabetes')
  ) {
    requirements.magnesium += 50; // Helps with glucose control
  }
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'regular') {
    requirements.magnesium += 50;
  }
  if (stressLevel === 'high' || stressLevel === 'severe') {
    requirements.magnesium += 50;
  }
  if (sleepHours < 6) {
    requirements.magnesium += 50; // Helps with sleep
  }
  if (medications.includes('Diuretics')) {
    requirements.magnesium += 75; // Diuretics deplete magnesium
  }

  // Phosphorus (mg)
  requirements.phosphorus = 700;
  if (
    pregnancyStatus === 'pregnant' ||
    pregnancyStatus === 'lactating' ||
    pregnancyStatus === 'both'
  ) {
    requirements.phosphorus = 700;
  }

  // Potassium (mg)
  requirements.potassium = gender === 'male' ? 3400 : 2600;
  if (
    pregnancyStatus === 'pregnant' ||
    pregnancyStatus === 'lactating' ||
    pregnancyStatus === 'both'
  ) {
    requirements.potassium = 2900;
  }
  if (
    healthConditions.includes('high_blood_pressure') ||
    healthConditions.includes('hypertension')
  ) {
    requirements.potassium += 500; // Helps lower BP
  }
  if (['very_active', 'extra_active'].includes(activityLevel)) {
    requirements.potassium += 500; // Lost through sweat
  }
  if (['hot_humid', 'hot_dry'].includes(climate)) {
    requirements.potassium += 300;
  }

  // Sodium (mg)
  requirements.sodium = 1500; // AI (Adequate Intake)
  if (
    healthConditions.includes('high_blood_pressure') ||
    healthConditions.includes('hypertension')
  ) {
    requirements.sodium = 1200; // Reduce for hypertension
  }
  if (['very_active', 'extra_active'].includes(activityLevel)) {
    requirements.sodium += 500; // Athletes need more
  }
  if (['hot_humid', 'hot_dry'].includes(climate)) {
    requirements.sodium += 300;
  }

  // Zinc (mg)
  requirements.zinc = gender === 'male' ? 11 : 8;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.zinc = 11;
  } else if (pregnancyStatus === 'lactating') {
    requirements.zinc = 12;
  }
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'regular') {
    requirements.zinc += 2;
  }
  if (['very_active', 'extra_active'].includes(activityLevel)) {
    requirements.zinc += 2; // Lost through sweat
  }
  // Adjust for diet preference
  if (['vegan', 'vegetarian'].includes(dietPreference)) {
    requirements.zinc *= 1.5; // Lower bioavailability from plant sources
  }

  // Selenium (mcg)
  requirements.selenium = 55;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.selenium = 60;
  } else if (pregnancyStatus === 'lactating') {
    requirements.selenium = 70;
  }
  if (
    healthConditions.includes('thyroid') ||
    healthConditions.includes('thyroid_issues')
  ) {
    requirements.selenium += 15; // Important for thyroid function
  }

  // Copper (mcg)
  requirements.copper = 900;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.copper = 1000;
  } else if (pregnancyStatus === 'lactating') {
    requirements.copper = 1300;
  }

  // Manganese (mg)
  requirements.manganese = gender === 'male' ? 2.3 : 1.8;
  if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'both') {
    requirements.manganese = 2.0;
  } else if (pregnancyStatus === 'lactating') {
    requirements.manganese = 2.6;
  }

  // ========== ADJUSTMENTS FOR PREVIOUS DEFICIENCIES ==========

  previousDeficiencies.forEach((deficiency) => {
    if (deficiency.includes('Iron')) {
      requirements.iron *= 1.5;
    }
    if (deficiency.includes('Vitamin D')) {
      requirements.vitaminD *= 1.5;
    }
    if (deficiency.includes('Vitamin B12')) {
      requirements.vitaminB12 *= 1.5;
    }
    if (deficiency.includes('Calcium')) {
      requirements.calcium *= 1.2;
    }
    if (deficiency.includes('Folate')) {
      requirements.vitaminB9 *= 1.3;
    }
    if (deficiency.includes('Magnesium')) {
      requirements.magnesium *= 1.2;
    }
    if (deficiency.includes('Zinc')) {
      requirements.zinc *= 1.3;
    }
  });

  // ========== DIET PREFERENCE ADJUSTMENTS ==========

  if (dietPreference === 'keto') {
    // Keto diet adjustments
    requirements.magnesium += 50; // Often deficient on keto
    requirements.potassium += 500;
    requirements.sodium += 500; // Need more electrolytes
  } else if (dietPreference === 'paleo') {
    // Usually adequate, minimal adjustment
    requirements.calcium += 50; // No dairy
  } else if (dietPreference === 'mediterranean') {
    // Generally well-balanced, minimal adjustment
    requirements.vitaminD += 5; // May need slight increase
  } else if (dietPreference === 'low_carb') {
    requirements.magnesium += 30;
    requirements.potassium += 300;
  } else if (dietPreference === 'high_protein') {
    requirements.calcium += 100; // Protein increases calcium excretion
    requirements.vitaminB6 += 0.3; // Needed for protein metabolism
  }

  // Round all values to 1 decimal place
  Object.keys(requirements).forEach((key) => {
    requirements[key] = Math.round(requirements[key] * 10) / 10;
  });

  return requirements;
};

/**
 * Calculate macronutrient distribution based on diet preference
 * Note: A minimum of 5% carbs (20-50g) is maintained even for keto diets
 * to ensure adequate fiber, micronutrients, and sustainable adherence.
 */
export const calculateMacrosForDiet = (
  dailyCalorieTarget,
  dietPreference,
  goal
) => {
  let proteinPercent, carbsPercent, fatsPercent;

  switch (dietPreference) {
    case 'keto':
      proteinPercent = 0.25;
      carbsPercent = 0.05;
      fatsPercent = 0.7;
      break;
    case 'low_carb':
      proteinPercent = 0.3;
      carbsPercent = 0.2;
      fatsPercent = 0.5;
      break;
    case 'high_protein':
      proteinPercent = 0.4;
      carbsPercent = 0.35;
      fatsPercent = 0.25;
      break;
    case 'low_fat':
      proteinPercent = 0.25;
      carbsPercent = 0.6;
      fatsPercent = 0.15;
      break;
    case 'mediterranean':
      proteinPercent = 0.2;
      carbsPercent = 0.45;
      fatsPercent = 0.35;
      break;
    case 'paleo':
      proteinPercent = 0.3;
      carbsPercent = 0.4;
      fatsPercent = 0.3;
      break;
    case 'vegan':
    case 'vegetarian':
      proteinPercent = 0.2;
      carbsPercent = 0.55;
      fatsPercent = 0.25;
      break;
    case 'balanced':
    default:
      // Default balanced (30/45/25)
      proteinPercent = 0.3;
      carbsPercent = 0.45;
      fatsPercent = 0.25;
      break;
  }

  // Adjust for goals (but ensure minimum carbs for health)
  if (goal === 'weight_gain') {
    proteinPercent += 0.05; // Increase protein for muscle building
    carbsPercent = Math.max(carbsPercent - 0.05, 0.05); // Minimum 5% carbs
  } else if (goal === 'weight_loss') {
    proteinPercent += 0.05; // Higher protein helps preserve muscle
    carbsPercent = Math.max(carbsPercent - 0.05, 0.05); // Minimum 5% carbs
  }

  // Ensure macros add up to 100% (adjust fats if needed)
  const totalPercent = proteinPercent + carbsPercent + fatsPercent;
  if (totalPercent !== 1.0) {
    fatsPercent = 1.0 - proteinPercent - carbsPercent;
  }

  const macros = {
    protein: Math.round((dailyCalorieTarget * proteinPercent) / 4), // 4 cal per gram
    carbs: Math.round((dailyCalorieTarget * carbsPercent) / 4), // 4 cal per gram (minimum 5% for health)
    fats: Math.round((dailyCalorieTarget * fatsPercent) / 9), // 9 cal per gram
  };

  return macros;
};
