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

// Vision model for food photo analysis
const VISION_MODEL = 'gpt-5-mini';

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
  user = null,
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

    // Handle both userId (old style) and user relation (new style)
    const userData = user || (userId ? { connect: { id: userId } } : undefined);

    await prisma.openAILog.create({
      data: {
        ...(userData && { user: userData }),
        model,
        requestType,
        input,
        rawOutput,
        inputTokens,
        outputTokens,
        totalTokens,
        inputCost,
        outputCost,
        totalCost,
        responseTimeMs,
        status,
        errorMessage,
        endpoint,
        reasoningEffort,
      },
    });

    console.log('✅ OpenAI call logged successfully');
  } catch (error) {
    console.error('❌ Failed to log OpenAI call:', error);
    console.error('Error details:', {
      message: error.message,
      userId,
      user,
      userData,
      model,
      endpoint,
    });
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

/**
 * Detect if extracted text contains nutrition label information
 * Returns true if it looks like a nutrition label, false if it's likely a food photo
 */
function hasNutritionLabelText(text) {
  if (!text || text.trim().length < 20) {
    console.log('🔍 Detection: Very little text found, likely a food photo');
    return false;
  }

  const lowerText = text.toLowerCase();

  // Keywords that strongly indicate a nutrition label
  const nutritionLabelKeywords = [
    'nutrition facts',
    'nutrition information',
    'nutritional information',
    'serving size',
    'servings per container',
    'amount per serving',
    'calories',
    'total fat',
    'saturated fat',
    'trans fat',
    'cholesterol',
    'sodium',
    'total carbohydrate',
    'dietary fiber',
    'total sugars',
    'protein',
    'vitamin',
    'ingredients:',
    'contains:',
    '% daily value',
    'per 100g',
    'per 100ml',
    'energy kj',
    'energy kcal',
  ];

  // Count how many nutrition keywords are present
  let keywordMatches = 0;
  const matchedKeywords = [];

  for (const keyword of nutritionLabelKeywords) {
    if (lowerText.includes(keyword)) {
      keywordMatches++;
      matchedKeywords.push(keyword);
    }
  }

  // If we find 3 or more nutrition label keywords, it's likely a label
  const isLabel = keywordMatches >= 3;

  console.log(`\n${'='.repeat(80)}`);
  console.log('🔍 NUTRITION LABEL DETECTION');
  console.log(`${'='.repeat(80)}`);
  console.log(`Text length: ${text.length} characters`);
  console.log(
    `Keyword matches: ${keywordMatches}/${nutritionLabelKeywords.length}`
  );
  if (matchedKeywords.length > 0) {
    console.log(`Matched keywords: ${matchedKeywords.join(', ')}`);
  }
  console.log(`Decision: ${isLabel ? '📦 NUTRITION LABEL' : '🍽️ FOOD PHOTO'}`);
  console.log(`${'='.repeat(80)}\n`);

  return isLabel;
}

/**
 * Analyze food photo using vision model
 * This is used when the image doesn't contain a nutrition label
 */
async function analyzeFoodPhotoWithVision(
  images,
  instructions,
  userId,
  endpoint
) {
  const client = getOpenAIClient();
  const startTime = Date.now();

  console.log(`\n${'='.repeat(80)}`);
  console.log('🍽️ FOOD PHOTO ANALYSIS MODE (Vision)');
  console.log(`${'='.repeat(80)}`);
  console.log(`Processing ${images.length} image(s) with GPT-5-mini vision`);
  console.log(`Model: ${VISION_MODEL}`);
  console.log(`Detail level: low (cost-effective)`);
  if (instructions) {
    console.log(`User instructions: "${instructions}"`);
  }
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Prepare image inputs for vision model
    const imageInputs = await Promise.all(
      images.map(async (image, index) => {
        console.log(
          `📸 Preparing image ${index + 1}/${
            images.length
          } for vision analysis...`
        );

        // Convert image to base64
        const base64Image = image.buffer.toString('base64');
        const dataUrl = `data:${image.mimeType};base64,${base64Image}`;

        return {
          type: 'input_image',
          image_url: dataUrl,
          detail: 'low', // Use low detail for cost savings
        };
      })
    );

    // Build the input prompt
    const userPrompt = `Analyze the food in ${
      images.length > 1 ? 'these images' : 'this image'
    } and provide a complete nutritional breakdown.

Please:
1. Identify all food items visible in the image(s)
2. Estimate the portion size for each item (in grams or standard serving sizes)
3. Calculate total nutritional values for all items combined
4. Use authoritative nutritional databases (USDA, NIN for Indian foods, etc.)

${instructions ? `\nUser's additional context: ${instructions}\n` : ''}
Return complete nutritional information including macros and micronutrients.`;

    console.log('📤 Sending images to GPT-5-mini vision model...');

    // Build message content array
    const messageContent = [
      { type: 'input_text', text: userPrompt },
      ...imageInputs,
    ];

    const response = await client.responses.create({
      model: VISION_MODEL,
      input: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
      instructions: `
You are a professional nutritionist with expertise in visual food analysis and portion estimation.

Your task:
1. **Identify foods**: Look at the image(s) and identify all visible food items
2. **Estimate portions**: Estimate the weight/portion size of each item based on:
   - Plate/bowl size (standard dinner plate ~26cm)
   - Comparison to common objects
   - Visual volume estimation
   - Standard serving sizes
3. **Calculate nutrition**: Use authoritative databases to calculate complete nutrition:
   - Macros: calories, protein, carbs, fats
   - Fiber, sugar, sodium, cholesterol, water
   - All vitamins (A, C, D, E, K, B1-B12)
   - All minerals (calcium, iron, magnesium, phosphorus, potassium, zinc, etc.)

Guidelines:
- Be specific in descriptions: "grilled chicken breast (~200g)" not just "chicken"
- For Indian foods, use NIN/FSSAI databases
- For US/Western foods, use USDA FoodData Central
- Provide realistic estimates, not guesses
- If multiple items are present, calculate total combined nutrition
- Use null only when nutrient data is truly unavailable
`,
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
        effort: 'minimal',
      },
      max_output_tokens: 2500,
    });

    const responseTimeMs = Date.now() - startTime;

    console.log(`✅ Vision analysis completed in ${responseTimeMs}ms`);

    // Extract content
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
      throw new Error('Empty response from vision model');
    }

    // Extract token usage
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    const cachedInputTokens =
      response.usage?.input_tokens_details?.cached_tokens || 0;
    const totalTokens = response.usage?.total_tokens || 0;

    console.log('\n📊 Vision Analysis Token Usage:');
    console.log(`   Input tokens: ${inputTokens.toLocaleString()}`);
    console.log(`   Cached tokens: ${cachedInputTokens.toLocaleString()}`);
    console.log(`   Output tokens: ${outputTokens.toLocaleString()}`);
    console.log(`   Total tokens: ${totalTokens.toLocaleString()}\n`);

    // Log the API call
    await logOpenAICall({
      userId,
      model: VISION_MODEL,
      requestType: 'vision', // New type for vision-based analysis
      input: `Vision analysis of ${images.length} food image(s)${
        instructions ? ` with instructions: "${instructions}"` : ''
      }`,
      rawOutput: content,
      inputTokens,
      outputTokens,
      cachedInputTokens,
      totalTokens,
      responseTimeMs,
      status: 'success',
      endpoint,
      reasoningEffort: 'minimal',
    });

    const nutritionData = JSON.parse(content);

    console.log(
      `✅ Successfully parsed food from vision: ${nutritionData.foodName}`
    );
    console.log(`   ${nutritionData.description}\n`);

    return nutritionData;
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    console.error('❌ Vision analysis error:', error);

    // Log the failed API call
    await logOpenAICall({
      userId,
      model: VISION_MODEL,
      requestType: 'vision',
      input: `Vision analysis of ${images.length} food image(s)`,
      rawOutput: null,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      responseTimeMs,
      status: 'error',
      errorMessage: error.message || 'Unknown error',
      endpoint,
    });

    throw error;
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
    console.log(`\n${'='.repeat(80)}`);
    console.log('🚀 FOOD IMAGE ANALYSIS STARTED');
    console.log(`${'='.repeat(80)}`);
    console.log(`Images to process: ${images.length}`);
    console.log(`User instructions: ${instructions || 'None'}`);
    console.log(`${'='.repeat(80)}\n`);

    // Step 1: Try OCR first to extract any text from images
    console.log('📝 Step 1: Extracting text with Azure OCR...');
    const extractedTexts = await Promise.all(
      images.map(async (image, index) => {
        console.log(`   Processing image ${index + 1}/${images.length}...`);
        try {
          const text = await extractTextWithAzureOCR(image.buffer);
          console.log(
            `   ✓ Image ${index + 1}: Extracted ${text.length} characters`
          );
          return text;
        } catch (error) {
          console.log(`   ⚠ Image ${index + 1}: OCR failed - ${error.message}`);
          return '';
        }
      })
    );

    // Combine all extracted texts
    const combinedText = extractedTexts
      .filter((text) => text && text.trim())
      .map((text, index) => `--- Image ${index + 1} ---\n${text}`)
      .join('\n\n');

    console.log(
      `\n📄 Combined OCR text: ${combinedText.length} characters total\n`
    );

    // Step 2: Decide which approach to use based on detected text
    const hasLabel = hasNutritionLabelText(combinedText);

    if (hasLabel) {
      // ===== NUTRITION LABEL PATH (OCR-based) =====
      console.log(`\n${'='.repeat(80)}`);
      console.log('📦 USING OCR-BASED PARSING (Nutrition Label Detected)');
      console.log(`${'='.repeat(80)}\n`);

      const model = 'gpt-5';

      // Clean the extracted text
      const cleanedText = combinedText
        .replace(/\|/g, ' ')
        .replace(/([0-9])\s*kcal/gi, '$1 kcal')
        .replace(/([0-9])\s*g/gi, '$1g')
        .replace(/([0-9])\s*mg/gi, '$1mg')
        .replace(/([0-9])\s*µg/gi, '$1µg')
        .replace(/(\d+)\s*\.\s*(\d+)/g, '$1.$2')
        .replace(/([A-Za-z])([0-9])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();

      console.log('🧹 Cleaned text for analysis\n');

      // Build the input prompt
      let inputPrompt = `Parse this nutrition information from ${images.length} image(s) and analyze ingredients to estimate missing micronutrients.

TEXT EXTRACTED FROM IMAGES:
${cleanedText}`;

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

      console.log('📤 Sending to GPT-5 for nutrition label parsing...\n');
      const reasoningEffort = 'minimal';

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
          effort: reasoningEffort,
        },
        max_output_tokens: 2500,
      });

      const responseTimeMs = Date.now() - startTime;

      // Extract content
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

      // Extract token usage
      const inputTokens = response.usage?.input_tokens || 0;
      const outputTokens = response.usage?.output_tokens || 0;
      const cachedInputTokens =
        response.usage?.input_tokens_details?.cached_tokens || 0;
      const totalTokens = response.usage?.total_tokens || 0;

      console.log('📊 OCR Analysis Token Usage:');
      console.log(`   Input tokens: ${inputTokens.toLocaleString()}`);
      console.log(`   Cached tokens: ${cachedInputTokens.toLocaleString()}`);
      console.log(`   Output tokens: ${outputTokens.toLocaleString()}`);
      console.log(`   Total tokens: ${totalTokens.toLocaleString()}\n`);

      // Log the successful API call
      await logOpenAICall({
        userId,
        model,
        requestType: 'text',
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

      console.log(
        `✅ Successfully parsed nutrition label: ${nutritionData.foodName}\n`
      );
      console.log(`${'='.repeat(80)}\n`);

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
    } else {
      // ===== FOOD PHOTO PATH (Vision-based) =====
      const nutritionData = await analyzeFoodPhotoWithVision(
        images,
        instructions,
        userId,
        endpoint
      );

      console.log(`${'='.repeat(80)}\n`);

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
    }
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    console.error('\n❌ FOOD IMAGE ANALYSIS FAILED');
    console.error('Error:', error.message);
    console.log(`${'='.repeat(80)}\n`);

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

/**
 * Parse exercise description and calculate calories burned using AI
 * @param {string} text - Exercise description (e.g., "30 minutes jogging" or "strength training")
 * @param {object} userData - User data from onboarding for accurate calorie calculation
 * @param {string} userId - User ID for logging
 * @param {string} endpoint - API endpoint for logging
 * @param {string} userExerciseType - User-selected exercise type (cardio, strength, etc.)
 * @param {string} userIntensity - User-selected intensity (light, moderate, vigorous, very_vigorous)
 * @returns {Promise<object>} - Exercise data with calories burned
 */
export async function parseExercise(
  text,
  userData = {},
  userId = null,
  endpoint = '/api/exercise/parse',
  userExerciseType = null,
  userIntensity = null
) {
  const startTime = Date.now();

  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI client not configured');
    }

    const model = DEFAULT_MODEL;
    const exerciseReasoningEffort = 'minimal';

    console.log('\n' + '='.repeat(80));
    console.log('📋 EXERCISE PARSING REQUEST');
    console.log('='.repeat(80));
    console.log(`User Input: "${text}"`);
    console.log(`Model: ${model}`);
    console.log(`User-Selected Type: ${userExerciseType || 'not specified'}`);
    console.log(`User-Selected Intensity: ${userIntensity || 'not specified'}`);
    console.log(`User Data:`, {
      gender: userData.gender || 'unknown',
      age: userData.age || 'unknown',
      weight: userData.currentWeight || 'unknown',
      height: userData.height || 'unknown',
      activityLevel: userData.activityLevel || 'unknown',
    });
    console.log('='.repeat(80) + '\n');

    // Build context prompt with user data
    const userContext = `
User Profile for Calorie Calculation:
- Gender: ${userData.gender || 'unknown'}
- Age: ${userData.age || 'unknown'} years
- Weight: ${userData.currentWeight || 'unknown'} kg
- Height: ${userData.height || 'unknown'} cm
- Activity Level: ${userData.activityLevel || 'unknown'}
- Fitness Goal: ${userData.goal || 'unknown'}

User-Selected Exercise Details:
- Type: ${userExerciseType || 'not specified - please infer from description'}
- Intensity: ${userIntensity || 'not specified - please infer from description'}
${
  userExerciseType
    ? '\nIMPORTANT: The user has explicitly selected the exercise type as "' +
      userExerciseType +
      '". Use this in your response.'
    : ''
}
${
  userIntensity
    ? '\nIMPORTANT: The user has explicitly selected the intensity as "' +
      userIntensity +
      '". Use this for more accurate calorie calculations.'
    : ''
}
`;

    const response = await client.responses.create({
      model,
      instructions: `You are an expert fitness and exercise science AI. Analyze exercise descriptions and calculate calories burned accurately based on user profile data.

${userContext}

Your task:
1. Parse the exercise description to extract the exercise name, type, duration, and intensity
2. Calculate estimated calories burned using MET (Metabolic Equivalent of Task) values
3. Consider the user's weight, gender, age, and fitness level for accurate calculations
4. If duration is not specified, assume a reasonable default (e.g., 30 minutes for most exercises)
5. Classify exercise type: cardio, strength, flexibility, sports, or other
6. Classify intensity: light, moderate, vigorous, or very_vigorous

MET values reference:
- Walking (slow): 2-3 METs
- Walking (brisk): 3.5-4 METs
- Jogging: 7 METs
- Running (6 mph): 10 METs
- Cycling (moderate): 6-8 METs
- Swimming: 6-11 METs
- Strength training: 3-6 METs
- HIIT: 8-12 METs
- Yoga: 2-4 METs
- Dancing: 4-7 METs

Formula: Calories burned = (MET × weight in kg × duration in hours)

Be accurate and consider all factors. If the input is vague (e.g., "strength exercise"), make reasonable assumptions based on typical workout patterns.`,
      input: text,
      text: {
        format: {
          type: 'json_schema',
          name: 'exercise_data',
          schema: {
            type: 'object',
            properties: {
              exerciseName: { type: 'string' },
              description: { type: 'string' },
              duration: { type: 'number' }, // in minutes
              exerciseType: {
                type: 'string',
                enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'],
              },
              intensity: {
                type: 'string',
                enum: ['light', 'moderate', 'vigorous', 'very_vigorous'],
              },
              caloriesBurned: { type: 'number' },
              metValue: { type: 'number' }, // MET value used for calculation
            },
            required: [
              'exerciseName',
              'description',
              'duration',
              'exerciseType',
              'intensity',
              'caloriesBurned',
              'metValue',
            ],
            additionalProperties: false,
          },
        },
      },
      reasoning: {
        effort: exerciseReasoningEffort, // 'minimal' is optimal for structured data extraction
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
          : 'none',
    });

    console.log('✅ EXERCISE PARSING COMPLETE');
    console.log(`Response Time: ${responseTimeMs}ms`);
    console.log(
      `Tokens: ${totalTokens} (input: ${inputTokens}, output: ${outputTokens})`
    );
    console.log('='.repeat(80) + '\n');

    // Log the successful API call
    await logOpenAICall({
      userId,
      model,
      requestType: 'text',
      input: `Exercise: ${text} | User: ${userData.gender || 'unknown'}, ${
        userData.currentWeight || 'unknown'
      }kg, ${userData.age || 'unknown'}y`,
      rawOutput: content,
      inputTokens,
      outputTokens,
      cachedInputTokens,
      totalTokens,
      responseTimeMs,
      status: 'success',
      endpoint,
    });

    const exerciseData = JSON.parse(content);

    console.log('Parsed Exercise Data:', exerciseData);
    console.log(`${'='.repeat(80)}\n`);

    // Ensure required fields have default values
    return {
      exerciseName: exerciseData.exerciseName || 'Unknown Exercise',
      description: exerciseData.description || text,
      duration: exerciseData.duration || 30,
      exerciseType: exerciseData.exerciseType || 'other',
      intensity: exerciseData.intensity || 'moderate',
      caloriesBurned: Math.round(exerciseData.caloriesBurned) || 0,
      metValue: exerciseData.metValue || 0,
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    console.error('\n❌ EXERCISE PARSING FAILED');
    console.error('Error:', error.message);
    console.log(`${'='.repeat(80)}\n`);

    // Log the failed API call
    await logOpenAICall({
      userId,
      model: DEFAULT_MODEL,
      requestType: 'text',
      input: `Exercise parsing: ${text}`,
      rawOutput: null,
      inputTokens: null,
      outputTokens: null,
      cachedInputTokens: 0,
      totalTokens: null,
      responseTimeMs,
      status: 'error',
      errorMessage: error.message || 'Unknown error',
      endpoint,
    });

    throw new Error('Failed to parse exercise');
  }
}
