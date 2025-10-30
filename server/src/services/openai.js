import OpenAI from 'openai';
import prisma from '../lib/prisma.js';
import sharp from 'sharp';
import { Readable } from 'stream';
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

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

// Lazy initialization of Azure Computer Vision client
let azureVisionClient = null;

function getAzureVisionClient() {
  if (
    !azureVisionClient &&
    process.env.AZURE_VISION_KEY &&
    process.env.AZURE_VISION_ENDPOINT
  ) {
    const credentials = new ApiKeyCredentials({
      inHeader: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_VISION_KEY },
    });
    azureVisionClient = new ComputerVisionClient(
      credentials,
      process.env.AZURE_VISION_ENDPOINT
    );
  }
  return azureVisionClient;
}

// Default model to use for food parsing
const DEFAULT_MODEL = 'gpt-5';

// Azure Computer Vision pricing (in USD per 1,000 transactions)
const AZURE_OCR_PRICING = {
  tier1: { limit: 1_000_000, pricePerK: 1.5 }, // 0-1M transactions
  tier2: { limit: Infinity, pricePerK: 0.6 }, // 1M+ transactions
};

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

/**
 * Extract text from image using Azure Computer Vision OCR (Read API)
 */
async function extractTextWithAzureOCR(imageBuffer) {
  const client = getAzureVisionClient();
  if (!client) {
    throw new Error(
      'Azure Computer Vision not configured. Please add AZURE_VISION_KEY and AZURE_VISION_ENDPOINT.'
    );
  }

  console.log('Starting Azure OCR text extraction...');
  const startTime = Date.now();

  try {
    // Ensure valid image (convert anything to PNG)
    const buffer = await sharp(imageBuffer).toFormat('png').toBuffer();

    // Azure OCR expects Readable stream
    const stream = () => Readable.from(buffer);

    // ✅ Use correct method (use latest v3.2 endpoint)
    const readResponse = await client.readInStream(stream, {
      contentType: 'image/png',
    });

    const operationLocation = readResponse.operationLocation;
    if (!operationLocation)
      throw new Error('Missing operationLocation from Azure response.');

    const operationId = operationLocation.split('/').pop();

    // Poll until done
    let result;
    for (let i = 0; i < 10; i++) {
      result = await client.getReadResult(operationId);
      if (result.status === 'succeeded') break;
      if (result.status === 'failed')
        throw new Error('Azure OCR operation failed.');
      await new Promise((r) => setTimeout(r, 300));
    }

    if (result.status !== 'succeeded') {
      throw new Error('Azure OCR operation timed out.');
    }

    const text = result.analyzeResult.readResults
      .map((p) => p.lines.map((l) => l.text).join('\n'))
      .join('\n');

    console.log(`✓ Azure OCR completed in ${Date.now() - startTime}ms`);
    return text.trim();
  } catch (error) {
    console.error('Azure OCR error:', error);
    throw new Error(`Azure OCR failed: ${error.message}`);
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

    // Use the new Responses API with Structured Outputs
    const response = await client.responses.create({
      model,
      instructions: `
You are a professional nutritionist and food scientist with expertise in nutritional analysis.
Your job is to return the *most accurate and complete* nutritional profile using authoritative, region-appropriate data sources.

🌍 Data Source Priority:
1. Use official or government-approved nutrient databases **from the region of the food's origin** whenever identifiable.
   - **India:** NIN, FSSAI, ICMR
   - **United States:** USDA FoodData Central (FDC)
   - **United Kingdom:** McCance & Widdowson's
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
- Always calculate nutrients for the **exact quantity specified** (e.g., "400 g chicken" → return totals for 400 g).
- Never guess randomly; use measured or published averages.
- Use decimals (e.g., 0.02). Use **0** only if truly absent, **null** only if not reported.
- Output must follow the provided JSON schema exactly.
`,
      input: `Analyze this food input and provide complete nutritional information: "${text}"

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
      text: {
        format: {
          type: 'json_schema',
          name: 'nutrition_data',
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
          strict: false,
        },
      },
      reasoning: {
        effort: reasoningEffort, // 'minimal' is optimal for structured data extraction
      },
      max_output_tokens: 2500, // Set reasonable token limit for cost control
    });

    const responseTimeMs = Date.now() - startTime;

    console.log('OpenAI response:', JSON.stringify(response, null, 2));

    // Extract content from the new Responses API structure
    // The SDK provides a convenience property output_text that aggregates text from all output_text items
    let content = response.output_text?.trim();

    // Fallback: manually extract from output array if output_text is not available
    if (!content) {
      const messageItem = response.output?.find(
        (item) => item.type === 'message'
      );
      if (messageItem) {
        const textContent = messageItem.content?.find(
          (c) => c.type === 'output_text'
        );
        content = textContent?.text?.trim();
      }
    }

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('Raw content from OpenAI:', content);

    // Extract token usage from the new response structure
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    const cachedInputTokens =
      response.usage?.input_tokens_details?.cached_tokens || 0;
    const totalTokens = response.usage?.total_tokens || 0;

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

export async function parseFoodFromImage(
  images,
  instructions = '',
  userId = null,
  endpoint = '/api/food/parse-image'
) {
  const client = getOpenAIClient();
  const startTime = Date.now();

  if (!client) {
    console.warn('OpenAI API key not configured, returning basic fallback');

    await logOpenAICall({
      userId,
      model: DEFAULT_MODEL,
      requestType: 'image',
      input: `${images.length} image(s) upload`,
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
      foodName: 'Unknown food item',
      description: 'Image uploaded but could not be analyzed',
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
    // Use GPT-5 for image OCR parsing - it's faster and cheaper for structured data extraction
    const model = 'gpt-5';

    // Step 1: Extract text from all images using Azure Computer Vision OCR
    console.log(
      `Starting Azure OCR extraction for ${images.length} image(s)...`
    );
    const extractedTexts = await Promise.all(
      images.map(async (image, index) => {
        console.log(
          `Extracting text from image ${index + 1}/${images.length}...`
        );
        const text = await extractTextWithAzureOCR(image.buffer);
        return text;
      })
    );

    // Combine all extracted texts
    const combinedText = extractedTexts
      .map((text, index) => `--- Image ${index + 1} ---\n${text}`)
      .join('\n\n');

    if (!combinedText || combinedText.trim().length === 0) {
      throw new Error('No text could be extracted from the images');
    }

    console.log(
      '\n================================================================================'
    );
    console.log('EXTRACTED TEXT FROM IMAGES (Azure OCR):');
    console.log(
      '================================================================================'
    );
    console.log(combinedText);
    console.log(
      '================================================================================\n'
    );

    // Step 2: Clean the extracted text
    const cleanedText = combinedText
      .replace(/\|/g, ' ')
      .replace(/([0-9])\s*kcal/gi, '$1 kcal')
      .replace(/([0-9])\s*g/gi, '$1g')
      .replace(/([0-9])\s*mg/gi, '$1mg')
      .replace(/([0-9])\s*µg/gi, '$1µg')
      .replace(/(\d+)\s*\.\s*(\d+)/g, '$1.$2') // fix broken decimals
      .replace(/([A-Za-z])([0-9])/g, '$1 $2') // ensure space between label and number
      .replace(/\s+/g, ' ')
      .trim();

    console.log('CLEANED TEXT:');
    console.log(
      '================================================================================'
    );
    console.log(cleanedText);
    console.log(
      '================================================================================\n'
    );

    // Step 3: Build the input prompt
    let inputPrompt = `Parse this nutrition information from ${images.length} image(s) and analyze ingredients to estimate missing micronutrients.

TEXT EXTRACTED FROM IMAGES:
${cleanedText}`;

    // Add user instructions if provided
    if (instructions && instructions.trim()) {
      inputPrompt += `\n\nADDITIONAL USER INSTRUCTIONS:
${instructions.trim()}

Please take these instructions into account when calculating nutritional values (e.g., adjust portion sizes, servings, etc.).`;
    }

    inputPrompt += `\n\n1. Extract visible nutrients from the text
2. Identify ingredients (berries, honey, etc.)
3. Consider user instructions if provided (e.g., serving size adjustments)
4. Estimate missing vitamins/minerals based on ingredient composition
5. Return complete nutritional profile in JSON`;

    // Step 3: Send extracted text to OpenAI for parsing
    console.log('Sending extracted text to OpenAI for nutritional analysis...');
    const reasoningEffort = 'minimal'; // No reasoning = faster

    const response = await client.responses.create({
      model,
      instructions: `
You are a professional nutrition scientist. Parse the following nutrition label text and return a structured JSON.

Guidelines:
- Extract all explicitly listed nutrients with exact numeric values.
- For missing vitamins and minerals, infer reasonable estimates from ingredients.
- If user provides additional instructions (e.g., "this is a large serving" or "double portion"), adjust values accordingly.
- Use ingredient-based heuristics:
  - Fruits → vitamin C, potassium
  - Berries → vitamin C, vitamin K, manganese
  - Honey → B2, B3, B5, calcium, iron, potassium
  - Lemon or citrus → vitamin C
  - Nuts → vitamin E, magnesium, zinc, phosphorus
  - Seeds → vitamin E, zinc, selenium
  - Dairy → calcium, vitamin B2, B12
  - Fish → vitamin D, B12, selenium, phosphorus
  - Leafy greens → vitamin K, folate (B9), magnesium
- Use realistic trace ranges (0.01–3 mg or 0.1–30 µg).
- Ensure total macronutrients + water roughly ≈ serving size.
- Return ONLY JSON, with no commentary.

JSON keys:
foodName, description, calories, protein, carbs, fats, sugar, fiber, cholesterol, sodium, 
vitaminA, vitaminB1, vitaminB2, vitaminB3, vitaminB5, vitaminB6, vitaminB9, vitaminB12,
vitaminC, vitaminD, vitaminE, vitaminK,
calcium, iron, magnesium, phosphorus, potassium, zinc, copper, manganese, selenium,
omega3, transFat, water.
`,
      input: inputPrompt,
      text: {
        format: {
          type: 'json_schema',
          name: 'nutrition_data',
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
          strict: false,
        },
      },
      reasoning: {
        effort: reasoningEffort, // 'minimal' = no reasoning, fastest response
      },
      max_output_tokens: 2500, // Increased slightly to allow for ingredient analysis
    });

    const responseTimeMs = Date.now() - startTime;

    console.log('OpenAI image response:', JSON.stringify(response, null, 2));

    // Check if response is incomplete due to token limit
    if (
      response.status === 'incomplete' &&
      response.incomplete_details?.reason === 'max_output_tokens'
    ) {
      throw new Error(
        'Response exceeded token limit. The image may be too complex or contain too much text. Please try with simpler images.'
      );
    }

    // Extract content from the response
    let content = response.output_text?.trim();

    if (!content) {
      const messageItem = response.output?.find(
        (item) => item.type === 'message'
      );
      if (messageItem) {
        const textContent = messageItem.content?.find(
          (c) => c.type === 'output_text'
        );
        content = textContent?.text?.trim();
      }
    }

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('Raw content from OpenAI (image):', content);

    // Extract token usage
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    const cachedInputTokens =
      response.usage?.input_tokens_details?.cached_tokens || 0;
    const totalTokens = response.usage?.total_tokens || 0;

    console.log('Token usage (image):', {
      inputTokens,
      cachedInputTokens,
      outputTokens,
      totalTokens,
    });

    // Log the successful API call
    await logOpenAICall({
      userId,
      model,
      requestType: 'text', // Now using text-based analysis after Azure OCR
      input: `Azure OCR extracted text from ${images.length} image(s) (${
        combinedText.length
      } chars)${instructions ? ` with instructions: "${instructions}"` : ''}`,
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
      description:
        nutritionData.description || `Food from ${images.length} image(s)`,
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
    console.error('OpenAI image parse error:', error);

    // Log the failed API call
    await logOpenAICall({
      userId,
      model: DEFAULT_MODEL,
      requestType: 'image',
      input: `Food image analysis (${images.length} image(s))`,
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
      foodName: 'Unknown food item',
      description: 'Could not analyze image',
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
      error: 'Failed to analyze image with AI, please try again',
    };
  }
}
