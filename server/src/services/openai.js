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
    // Use Structured Outputs for reliable JSON
    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content:
            'You are a nutrition expert that analyzes food descriptions and returns accurate nutritional data.',
        },
        {
          role: 'user',
          content: `Analyze this food and provide nutritional information: "${text}"`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'nutrition_data',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              foodName: { type: 'string' },
              description: { type: 'string' },
              calories: { type: 'number' },
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fats: { type: 'number' },
              fiber: { type: ['number', 'null'] },
              sugar: { type: ['number', 'null'] },
              sodium: { type: ['number', 'null'] },
              cholesterol: { type: ['number', 'null'] },
              water: { type: ['number', 'null'] },
              omega3: { type: ['number', 'null'] },
              vitaminA: { type: ['number', 'null'] },
              vitaminC: { type: ['number', 'null'] },
              vitaminD: { type: ['number', 'null'] },
              vitaminE: { type: ['number', 'null'] },
              vitaminK: { type: ['number', 'null'] },
              calcium: { type: ['number', 'null'] },
              iron: { type: ['number', 'null'] },
              magnesium: { type: ['number', 'null'] },
              potassium: { type: ['number', 'null'] },
              zinc: { type: ['number', 'null'] },
            },
            required: [
              'foodName',
              'description',
              'calories',
              'protein',
              'carbs',
              'fats',
              'fiber',
              'sugar',
              'sodium',
              'cholesterol',
              'water',
              'omega3',
              'vitaminA',
              'vitaminC',
              'vitaminD',
              'vitaminE',
              'vitaminK',
              'calcium',
              'iron',
              'magnesium',
              'potassium',
              'zinc',
            ],
            additionalProperties: false,
          },
        },
      },
      // Increase token limit and use minimal reasoning for faster response
      max_completion_tokens: 1500,
      reasoning_effort: 'minimal',
    });

    console.log('OpenAI completion:', JSON.stringify(completion, null, 2));
    
    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('Raw content from OpenAI:', content);

    const nutritionData = JSON.parse(content);

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
