import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { parseFood } from '../services/openai.js';

const router = express.Router();

// Parse food text using AI
router.post('/parse', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const nutritionData = await parseFood(text);
    res.json(nutritionData);
  } catch (error) {
    console.error('Parse food error:', error);
    res.status(500).json({ error: 'Failed to parse food' });
  }
});

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

    console.log('=== GET FOOD LOG DEBUG ===');
    console.log('Requested date string:', date);
    console.log('Start of day (UTC):', startOfDay.toISOString());
    console.log('End of day (UTC):', endOfDay.toISOString());
    console.log('UserId:', req.user.userId);

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

    console.log('Entries found:', entries.length);
    entries.forEach((entry, idx) => {
      console.log(`Entry ${idx + 1}:`, {
        foodName: entry.foodName,
        date: entry.date.toISOString(),
        mealType: entry.mealType,
      });
    });
    console.log('=== END DEBUG ===\n');

    res.json(entries);
  } catch (error) {
    console.error('Get food log error:', error);
    res.status(500).json({ error: 'Failed to get food log' });
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

    const entryDate = date ? new Date(date) : new Date();

    console.log('=== ADD FOOD ENTRY DEBUG ===');
    console.log('Date from request body:', date);
    console.log('Parsed date:', entryDate.toISOString());
    console.log('Food name:', foodName);
    console.log('Meal type:', mealType);
    console.log('UserId:', req.user.userId);
    console.log('=== END DEBUG ===\n');

    const entry = await prisma.foodEntry.create({
      data: {
        userId: req.user.userId,
        date: entryDate,
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

    console.log('Created entry with date:', entry.date.toISOString());

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
