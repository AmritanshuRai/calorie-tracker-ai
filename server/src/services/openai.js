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
      transFat: null,
      caffeine: null,
      alcohol: null,
      vitaminA: null,
      vitaminC: null,
      vitaminD: null,
      vitaminE: null,
      vitaminK: null,
      vitaminB1: null,
      vitaminB2: null,
      vitaminB3: null,
      vitaminB5: null,
      vitaminB6: null,
      vitaminB9: null,
      vitaminB12: null,
      calcium: null,
      iron: null,
      magnesium: null,
      phosphorus: null,
      potassium: null,
      zinc: null,
      manganese: null,
      copper: null,
      selenium: null,
      error:
        'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.',
    };
  }

  try {
    // Use Structured Outputs for reliable JSON
    const completion = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: `
            You are a professional nutritionist and food scientist with expertise in nutritional analysis. 
            Your job is to return the *most accurate and complete* nutritional profile using official data sources such as USDA FoodData Central (FDC). 
            Rules:
            - Always prefer FDC reference values for 100 g edible portion.
            - If the food is not found in USDA, use values from reliable equivalents.
            - Never estimate or round unless necessary; use decimals (e.g. 0.02 instead of 0).
            - Use 0 only if the nutrient is genuinely absent; use null only if the value is not published anywhere.
            - Do not swap or misalign nutrient meanings (e.g. do not confuse Vitamin B1/B2/B3).
            - Output must strictly follow the JSON schema provided by the user.
            `,
        },
        {
          role: 'user',
          content: `Analyze this food and provide complete nutritional information including all vitamins and minerals: "${text}"\n\nProvide detailed values for:\n- All macronutrients (calories, protein, carbs, fats)\n- Detailed nutrients (fiber, sugar, sodium, cholesterol, water, omega3, transFat, caffeine, alcohol)\n- All B vitamins (B1/Thiamine, B2/Riboflavin, B3/Niacin, B5/Pantothenic acid, B6/Pyridoxine, B9/Folate, B12/Cobalamin)\n- Fat-soluble vitamins (A, C, D, E, K)\n- Essential minerals (calcium, iron, magnesium, phosphorus, potassium, zinc, manganese, copper, selenium)\n\nUse null only when the nutrient data is truly unavailable. Use actual measured values even if small (e.g., 0.02 instead of 0).`,
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
              transFat: { type: ['number', 'null'] },
              caffeine: { type: ['number', 'null'] },
              alcohol: { type: ['number', 'null'] },
              vitaminA: { type: ['number', 'null'] },
              vitaminC: { type: ['number', 'null'] },
              vitaminD: { type: ['number', 'null'] },
              vitaminE: { type: ['number', 'null'] },
              vitaminK: { type: ['number', 'null'] },
              vitaminB1: { type: ['number', 'null'] },
              vitaminB2: { type: ['number', 'null'] },
              vitaminB3: { type: ['number', 'null'] },
              vitaminB5: { type: ['number', 'null'] },
              vitaminB6: { type: ['number', 'null'] },
              vitaminB9: { type: ['number', 'null'] },
              vitaminB12: { type: ['number', 'null'] },
              calcium: { type: ['number', 'null'] },
              iron: { type: ['number', 'null'] },
              magnesium: { type: ['number', 'null'] },
              phosphorus: { type: ['number', 'null'] },
              potassium: { type: ['number', 'null'] },
              zinc: { type: ['number', 'null'] },
              manganese: { type: ['number', 'null'] },
              copper: { type: ['number', 'null'] },
              selenium: { type: ['number', 'null'] },
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
              'transFat',
              'caffeine',
              'alcohol',
              'vitaminA',
              'vitaminC',
              'vitaminD',
              'vitaminE',
              'vitaminK',
              'vitaminB1',
              'vitaminB2',
              'vitaminB3',
              'vitaminB5',
              'vitaminB6',
              'vitaminB9',
              'vitaminB12',
              'calcium',
              'iron',
              'magnesium',
              'phosphorus',
              'potassium',
              'zinc',
              'manganese',
              'copper',
              'selenium',
            ],
            additionalProperties: false,
          },
        },
      },
      // Increase token limit to allow for more careful analysis
      max_completion_tokens: 2500,
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
      transFat: nutritionData.transFat || null,
      caffeine: nutritionData.caffeine || null,
      alcohol: nutritionData.alcohol || null,
      vitaminA: nutritionData.vitaminA || null,
      vitaminC: nutritionData.vitaminC || null,
      vitaminD: nutritionData.vitaminD || null,
      vitaminE: nutritionData.vitaminE || null,
      vitaminK: nutritionData.vitaminK || null,
      vitaminB1: nutritionData.vitaminB1 || null,
      vitaminB2: nutritionData.vitaminB2 || null,
      vitaminB3: nutritionData.vitaminB3 || null,
      vitaminB5: nutritionData.vitaminB5 || null,
      vitaminB6: nutritionData.vitaminB6 || null,
      vitaminB9: nutritionData.vitaminB9 || null,
      vitaminB12: nutritionData.vitaminB12 || null,
      calcium: nutritionData.calcium || null,
      iron: nutritionData.iron || null,
      magnesium: nutritionData.magnesium || null,
      phosphorus: nutritionData.phosphorus || null,
      potassium: nutritionData.potassium || null,
      zinc: nutritionData.zinc || null,
      manganese: nutritionData.manganese || null,
      copper: nutritionData.copper || null,
      selenium: nutritionData.selenium || null,
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
      transFat: null,
      caffeine: null,
      alcohol: null,
      vitaminA: null,
      vitaminC: null,
      vitaminD: null,
      vitaminE: null,
      vitaminK: null,
      vitaminB1: null,
      vitaminB2: null,
      vitaminB3: null,
      vitaminB5: null,
      vitaminB6: null,
      vitaminB9: null,
      vitaminB12: null,
      calcium: null,
      iron: null,
      magnesium: null,
      phosphorus: null,
      potassium: null,
      zinc: null,
      manganese: null,
      copper: null,
      selenium: null,
      error: 'Failed to parse with AI, please enter manually',
    };
  }
}
