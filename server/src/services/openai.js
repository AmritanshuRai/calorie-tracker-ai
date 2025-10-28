import OpenAI from 'openai';
import prisma from '../lib/prisma.js';

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

// Default model to use for food parsing
const DEFAULT_MODEL = 'gpt-5';

// Pricing per 1M tokens (in USD) - Updated as of Oct 2024
const PRICING = {
  'gpt-5': {
    input: 1.25, // $1.25 per 1M input tokens
    cachedInput: 0.125, // $0.125 per 1M cached input tokens
    output: 10.0, // $10.00 per 1M output tokens
  },
  'gpt-5-mini': {
    input: 0.25, // $0.250 per 1M input tokens
    output: 2.0, // $2.000 per 1M output tokens
  },
  'gpt-5-nano': {
    input: 0.05, // $0.050 per 1M input tokens
    cachedInput: 0.005, // $0.005 per 1M cached input tokens
    output: 0.4, // $0.400 per 1M output tokens
  },
};

/**
 * Calculate cost based on token usage and model
 */
function calculateCost(
  model,
  inputTokens,
  outputTokens,
  cachedInputTokens = 0
) {
  const pricing = PRICING[model];
  if (!pricing) {
    return {
      inputCost: null,
      outputCost: null,
      cachedInputCost: null,
      totalCost: null,
    };
  }

  const regularInputTokens = inputTokens - cachedInputTokens;
  const inputCost = (regularInputTokens / 1_000_000) * pricing.input;
  const cachedInputCost = pricing.cachedInput
    ? (cachedInputTokens / 1_000_000) * pricing.cachedInput
    : 0;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + cachedInputCost + outputCost;

  return {
    inputCost: parseFloat(inputCost.toFixed(6)),
    cachedInputCost: parseFloat(cachedInputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
    totalCost: parseFloat(totalCost.toFixed(6)),
  };
}

/**
 * Log OpenAI API call to database
 */
async function logOpenAICall({
  userId = null,
  model,
  requestType,
  input,
  rawOutput,
  inputTokens,
  outputTokens,
  cachedInputTokens = 0,
  totalTokens,
  responseTimeMs,
  status = 'success',
  errorMessage = null,
  endpoint = null,
  reasoningEffort = null,
}) {
  try {
    // Calculate costs
    const { inputCost, outputCost, cachedInputCost, totalCost } = calculateCost(
      model,
      inputTokens || 0,
      outputTokens || 0,
      cachedInputTokens || 0
    );

    await prisma.openAILog.create({
      data: {
        userId,
        model,
        requestType,
        input,
        rawOutput,
        inputTokens,
        outputTokens,
        cachedInputTokens,
        totalTokens,
        inputCost,
        outputCost,
        cachedInputCost,
        totalCost,
        responseTimeMs,
        status,
        errorMessage,
        endpoint,
        reasoningEffort,
      },
    });
  } catch (error) {
    console.error('Failed to log OpenAI call:', error);
    // Don't throw - logging should not break the main flow
  }
}

export async function parseFood(
  text,
  userId = null,
  endpoint = '/api/food/parse'
) {
  const client = getOpenAIClient();
  const startTime = Date.now();

  if (!client) {
    console.warn('OpenAI API key not configured, returning basic fallback');

    // Log the failed attempt
    await logOpenAICall({
      userId,
      model: DEFAULT_MODEL,
      requestType: 'text',
      input: text,
      rawOutput: null,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      responseTimeMs: Date.now() - startTime,
      status: 'error',
      errorMessage: 'OpenAI API key not configured',
      endpoint,
    });

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
    const model = DEFAULT_MODEL;
    const reasoningEffort = 'minimal';

    // Use Structured Outputs for reliable JSON
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `
You are a professional nutritionist and food scientist with expertise in nutritional analysis.
Your job is to return the *most accurate and complete* nutritional profile using authoritative, region-appropriate data sources.

🌍 Data Source Priority:
1. Use official or government-approved nutrient databases **from the region of the food’s origin** whenever identifiable.
   - **India:** NIN, FSSAI, ICMR
   - **United States:** USDA FoodData Central (FDC)
   - **United Kingdom:** McCance & Widdowson’s
   - **European Union / France:** CIQUAL (ANSES France)
   - **Japan:** Standard Tables of Food Composition in Japan
   - **Australia/New Zealand:** FSANZ
   - **Canada:** Canadian Nutrient File
2. If regional data is unavailable, use the **closest reliable international equivalent** and clearly mention it in the description.

🧠 Region Inference:
If the origin is unclear, infer it automatically from the food name or context 
(e.g., "sushi" → Japan, "croissant" → France, "tacos" → Mexico, "rohu" → India, "pasta alfredo" → Italy). 
This ensures globally adaptive behavior without needing explicit region input.

⚙️ Rules:
- Parse the user's input to identify BOTH the food item AND the quantity/serving size.
- Always calculate nutrients for the **exact quantity specified** (e.g., “400 g chicken” → return totals for 400 g).
- Never guess randomly; use measured or published averages.
- Use decimals (e.g., 0.02). Use **0** only if truly absent, **null** only if not reported.
- Output must follow the provided JSON schema exactly.
`,
          cache_control: { type: 'ephemeral' },
        },

        {
          role: 'user',
          content: `Analyze this food input and provide complete nutritional information: "${text}"

Note: If the food is of Indian origin (like rohu, katla, hilsa, paneer, dal, etc.), prefer data from NIN, FSSAI, or ICMR sources.
If such data is unavailable, fall back to the closest equivalent (and mention which one). 

All nutrient values must be calculated for the specified total quantity (not per 100g unless specified).

IMPORTANT: 
1. First, identify the food item and the quantity/serving size from the input.
2. Calculate ALL nutritional values for the EXACT quantity specified (not per 100g unless that's what was asked for).
3. If the input is "400g chicken breast", return values for 400g total, not 100g.

Provide detailed values for:
- All macronutrients (calories, protein, carbs, fats)
- Detailed nutrients (fiber, sugar, sodium, cholesterol, water, omega3, transFat, caffeine, alcohol)
- All B vitamins (B1/Thiamine, B2/Riboflavin, B3/Niacin, B5/Pantothenic acid, B6/Pyridoxine, B9/Folate, B12/Cobalamin)
- Fat-soluble vitamins (A, C, D, E, K)
- Essential minerals (calcium, iron, magnesium, phosphorus, potassium, zinc, manganese, copper, selenium)

All values must be calculated for the specified quantity. Use null only when the nutrient data is truly unavailable. Use actual measured values even if small (e.g., 0.02 instead of 0).`,
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
      // Optional: Set reasonable token limit for cost control
      // If omitted, model uses its default maximum
      max_completion_tokens: 2500,
      // 'minimal' reasoning effort is optimal for structured data extraction tasks
      // If omitted, defaults to 'medium' - but 'minimal' is better for this use case
      reasoning_effort: reasoningEffort,
    });

    const responseTimeMs = Date.now() - startTime;

    console.log('OpenAI completion:', JSON.stringify(completion, null, 2));

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('Raw content from OpenAI:', content);

    // Extract token usage including cached tokens
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cachedInputTokens =
      completion.usage?.prompt_tokens_details?.cached_tokens || 0;
    const totalTokens = completion.usage?.total_tokens || 0;

    console.log('Token usage:', {
      inputTokens,
      cachedInputTokens,
      outputTokens,
      totalTokens,
      savingsFromCache:
        cachedInputTokens > 0
          ? `${((cachedInputTokens / inputTokens) * 100).toFixed(1)}%`
          : '0%',
    });

    // Log the successful API call
    await logOpenAICall({
      userId,
      model,
      requestType: 'text',
      input: text,
      rawOutput: content,
      inputTokens,
      outputTokens,
      cachedInputTokens,
      totalTokens,
      responseTimeMs,
      status: 'success',
      endpoint,
      reasoningEffort,
    });

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
    const responseTimeMs = Date.now() - startTime;
    console.error('OpenAI parse error:', error);

    // Log the failed API call
    await logOpenAICall({
      userId,
      model: DEFAULT_MODEL,
      requestType: 'text',
      input: text,
      rawOutput: null,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      responseTimeMs,
      status: 'error',
      errorMessage: error.message || 'Unknown error',
      endpoint,
    });

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
