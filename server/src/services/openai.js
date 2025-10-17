import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openai = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function parseFood(text) {
  const client = getOpenAIClient();

  if (!client) {
    console.warn('OpenAI API key not configured, returning basic fallback');
    return {
      foodName: text.substring(0, 50),
      description: text,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: null,
      sugar: null,
      sodium: null,
      cholesterol: null,
      water: null,
      omega3: null,
      vitaminA: null,
      vitaminC: null,
      vitaminD: null,
      vitaminE: null,
      vitaminK: null,
      calcium: null,
      iron: null,
      magnesium: null,
      potassium: null,
      zinc: null,
      error:
        'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.',
    };
  }

  try {
    const prompt = `You are a nutrition expert. Parse the following food description and return ONLY a valid JSON object (no markdown, no code blocks, no explanations) with these exact fields:

{
  "foodName": "string (brief name)",
  "description": "string (detailed description)",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fats": number (grams),
  "fiber": number (grams, optional),
  "sugar": number (grams, optional),
  "sodium": number (mg, optional),
  "cholesterol": number (mg, optional),
  "water": number (ml, optional),
  "omega3": number (grams, optional),
  "vitaminA": number (mcg, optional),
  "vitaminC": number (mg, optional),
  "vitaminD": number (mcg, optional),
  "vitaminE": number (mg, optional),
  "vitaminK": number (mcg, optional),
  "calcium": number (mg, optional),
  "iron": number (mg, optional),
  "magnesium": number (mg, optional),
  "potassium": number (mg, optional),
  "zinc": number (mg, optional)
}

Food description: "${text}"

Return ONLY the JSON object, no other text.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content:
            'You are a nutrition expert that returns accurate nutritional data in JSON format. Always return valid JSON only, with no markdown formatting or code blocks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = completion.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    let jsonStr = content;
    if (content.startsWith('```')) {
      jsonStr = content
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    }

    const nutritionData = JSON.parse(jsonStr);

    // Ensure required fields have default values
    return {
      foodName: nutritionData.foodName || 'Unknown Food',
      description: nutritionData.description || text,
      calories: nutritionData.calories || 0,
      protein: nutritionData.protein || 0,
      carbs: nutritionData.carbs || 0,
      fats: nutritionData.fats || 0,
      fiber: nutritionData.fiber || null,
      sugar: nutritionData.sugar || null,
      sodium: nutritionData.sodium || null,
      cholesterol: nutritionData.cholesterol || null,
      water: nutritionData.water || null,
      omega3: nutritionData.omega3 || null,
      vitaminA: nutritionData.vitaminA || null,
      vitaminC: nutritionData.vitaminC || null,
      vitaminD: nutritionData.vitaminD || null,
      vitaminE: nutritionData.vitaminE || null,
      vitaminK: nutritionData.vitaminK || null,
      calcium: nutritionData.calcium || null,
      iron: nutritionData.iron || null,
      magnesium: nutritionData.magnesium || null,
      potassium: nutritionData.potassium || null,
      zinc: nutritionData.zinc || null,
    };
  } catch (error) {
    console.error('OpenAI parse error:', error);

    // Return basic fallback data
    return {
      foodName: text.substring(0, 50),
      description: text,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: null,
      sugar: null,
      sodium: null,
      cholesterol: null,
      water: null,
      omega3: null,
      vitaminA: null,
      vitaminC: null,
      vitaminD: null,
      vitaminE: null,
      vitaminK: null,
      calcium: null,
      iron: null,
      magnesium: null,
      potassium: null,
      zinc: null,
      error: 'Failed to parse with AI, please enter manually',
    };
  }
}
