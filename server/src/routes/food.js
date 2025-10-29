import express from 'express';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { parseFood, parseFoodFromImage } from '../services/openai.js';
import { FREE_LOGS_LIMIT } from '../utils/constants.js';

const router = express.Router();

// Configure multer for handling image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Parse food text using AI
router.post('/parse', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Check user's subscription status and free logs
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        subscriptionStatus: true,
        subscriptionEnd: true,
        freeLogs: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has Pro access
    const isPro =
      user.subscriptionStatus === 'active' ||
      (user.subscriptionStatus === 'cancelled' &&
        user.subscriptionEnd &&
        new Date(user.subscriptionEnd) > new Date());

    // If not Pro and no free logs remaining, deny access
    if (!isPro && user.freeLogs <= 0) {
      return res.status(403).json({
        error: 'No free logs remaining',
        code: 'FREE_LOGS_EXHAUSTED',
        message: `You have used all ${FREE_LOGS_LIMIT} free logs. Upgrade to Pro for unlimited access.`,
        freeLogs: 0,
      });
    }

    // Pass userId and endpoint for logging
    const nutritionData = await parseFood(
      text,
      req.user.userId,
      '/api/food/parse'
    );

    // If not Pro, decrement free logs after successful parse
    let remainingLogs = user.freeLogs;
    if (!isPro) {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: { freeLogs: { decrement: 1 } },
        select: { freeLogs: true },
      });
      remainingLogs = updatedUser.freeLogs;
    }

    // Include remaining logs in response
    res.json({
      ...nutritionData,
      freeLogs: isPro ? -1 : remainingLogs, // -1 indicates unlimited (Pro)
      isPro,
    });
  } catch (error) {
    console.error('Parse food error:', error);
    res.status(500).json({ error: 'Failed to parse food' });
  }
});

// Parse food image using AI
router.post(
  '/parse-image',
  authenticateToken,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      // Check user's subscription status and free logs
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          subscriptionStatus: true,
          subscriptionEnd: true,
          freeLogs: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user has Pro access
      const isPro =
        user.subscriptionStatus === 'active' ||
        (user.subscriptionStatus === 'cancelled' &&
          user.subscriptionEnd &&
          new Date(user.subscriptionEnd) > new Date());

      // If not Pro and no free logs remaining, deny access
      if (!isPro && user.freeLogs <= 0) {
        return res.status(403).json({
          error: 'No free logs remaining',
          code: 'FREE_LOGS_EXHAUSTED',
          message: `You have used all ${FREE_LOGS_LIMIT} free logs. Upgrade to Pro for unlimited access.`,
          freeLogs: 0,
        });
      }

      // Convert buffer to base64
      const imageBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;

      // Parse food from image (Sharp will compress inside the function)
      const nutritionData = await parseFoodFromImage(
        imageBuffer,
        mimeType,
        req.user.userId,
        '/api/food/parse-image'
      );

      // If not Pro, decrement free logs after successful parse
      let remainingLogs = user.freeLogs;
      if (!isPro) {
        const updatedUser = await prisma.user.update({
          where: { id: req.user.userId },
          data: { freeLogs: { decrement: 1 } },
          select: { freeLogs: true },
        });
        remainingLogs = updatedUser.freeLogs;
      }

      // Include remaining logs in response
      res.json({
        ...nutritionData,
        freeLogs: isPro ? -1 : remainingLogs, // -1 indicates unlimited (Pro)
        isPro,
      });
    } catch (error) {
      console.error('Parse food image error:', error);
      res.status(500).json({
        error: error.message || 'Failed to parse food image',
      });
    }
  }
);

// Get food log for a specific date
router.get('/log', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Parse date in UTC to avoid timezone issues
    // Input format: 'YYYY-MM-DD'
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    const entries = await prisma.foodEntry.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(entries);
  } catch (error) {
    console.error('Get food log error:', error);
    res.status(500).json({ error: 'Failed to get food log' });
  }
});

// Get food logs for a date range (batch endpoint for analytics)
router.get('/log/range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Start and end dates are required' });
    }

    // Parse dates in UTC to avoid timezone issues
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    // Fetch all entries in the date range
    const entries = await prisma.foodEntry.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group entries by date
    const entriesByDate = {};
    entries.forEach((entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      if (!entriesByDate[dateKey]) {
        entriesByDate[dateKey] = [];
      }
      entriesByDate[dateKey].push(entry);
    });

    res.json(entriesByDate);
  } catch (error) {
    console.error('Get food log range error:', error);
    res.status(500).json({ error: 'Failed to get food log range' });
  }
});

// Add food entry
router.post('/entry', authenticateToken, async (req, res) => {
  try {
    const {
      date,
      mealType,
      foodName,
      description,
      calories,
      protein,
      carbs,
      fats,
      source = 'text',
      aiParsed = false,
      ...optionalNutrients
    } = req.body;

    if (
      !foodName ||
      !mealType ||
      calories === undefined ||
      protein === undefined ||
      carbs === undefined ||
      fats === undefined
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = await prisma.foodEntry.create({
      data: {
        userId: req.user.userId,
        date: date ? new Date(date) : new Date(),
        mealType,
        foodName,
        description,
        calories,
        protein,
        carbs,
        fats,
        source,
        aiParsed,
        ...optionalNutrients,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Add food entry error:', error);
    res.status(500).json({ error: 'Failed to add food entry' });
  }
});

// Update food entry
router.put('/entry/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if entry belongs to user
    const existingEntry = await prisma.foodEntry.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Food entry not found' });
    }

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    const entry = await prisma.foodEntry.update({
      where: { id },
      data: updates,
    });

    res.json(entry);
  } catch (error) {
    console.error('Update food entry error:', error);
    res.status(500).json({ error: 'Failed to update food entry' });
  }
});

// Delete food entry
router.delete('/entry/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entry belongs to user
    const existingEntry = await prisma.foodEntry.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Food entry not found' });
    }

    await prisma.foodEntry.delete({
      where: { id },
    });

    res.json({ message: 'Food entry deleted successfully' });
  } catch (error) {
    console.error('Delete food entry error:', error);
    res.status(500).json({ error: 'Failed to delete food entry' });
  }
});

// Get nutrition summary for a date range
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: 'Start and end dates are required' });
    }

    // Parse dates in UTC to avoid timezone issues
    const startDate = new Date(start + 'T00:00:00.000Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    const entries = await prisma.foodEntry.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate totals
    const summary = entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fats: acc.fats + (entry.fats || 0),
        cholesterol: acc.cholesterol + (entry.cholesterol || 0),
        omega3: acc.omega3 + (entry.omega3 || 0),
        fiber: acc.fiber + (entry.fiber || 0),
        water: acc.water + (entry.water || 0),
        sodium: acc.sodium + (entry.sodium || 0),
        sugar: acc.sugar + (entry.sugar || 0),
        count: acc.count + 1,
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        cholesterol: 0,
        omega3: 0,
        fiber: 0,
        water: 0,
        sodium: 0,
        sugar: 0,
        count: 0,
      }
    );

    res.json(summary);
  } catch (error) {
    console.error('Get nutrition summary error:', error);
    res.status(500).json({ error: 'Failed to get nutrition summary' });
  }
});

export default router;
