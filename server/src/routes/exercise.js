import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { parseExercise } from '../services/openai.js';
import { FREE_LOGS_LIMIT } from '../utils/constants.js';

const router = express.Router();

// Parse exercise text using AI
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

    // Get user's onboarding data for accurate calorie calculation
    const latestOnboarding = await prisma.userOnboarding.findFirst({
      where: { userId: req.user.userId },
      orderBy: { completedAt: 'desc' },
      select: {
        gender: true,
        age: true,
        height: true,
        currentWeight: true,
        activityLevel: true,
        goal: true,
        activityMultiplier: true,
      },
    });

    const userData = latestOnboarding || {};

    // Parse exercise using AI
    const exerciseData = await parseExercise(
      text,
      userData,
      req.user.userId,
      '/api/exercise/parse'
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
      ...exerciseData,
      freeLogs: isPro ? -1 : remainingLogs, // -1 indicates unlimited (Pro)
      isPro,
    });
  } catch (error) {
    console.error('Parse exercise error:', error);
    res.status(500).json({ error: 'Failed to parse exercise' });
  }
});

// Get exercise log for a specific date
router.get('/log', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Parse date in UTC to avoid timezone issues
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    const entries = await prisma.exerciseEntry.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(entries);
  } catch (error) {
    console.error('Get exercise log error:', error);
    res.status(500).json({ error: 'Failed to get exercise log' });
  }
});

// Get exercise logs for a date range
router.get('/log/range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Start and end dates are required' });
    }

    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    const entries = await prisma.exerciseEntry.findMany({
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
    console.error('Get exercise log range error:', error);
    res.status(500).json({ error: 'Failed to get exercise log range' });
  }
});

// Add exercise entry
router.post('/entry', authenticateToken, async (req, res) => {
  try {
    const {
      date,
      exerciseName,
      description,
      duration,
      exerciseType,
      intensity,
      caloriesBurned,
      aiParsed = false,
    } = req.body;

    if (
      !exerciseName ||
      duration === undefined ||
      caloriesBurned === undefined
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = await prisma.exerciseEntry.create({
      data: {
        userId: req.user.userId,
        date: date ? new Date(date) : new Date(),
        exerciseName,
        description,
        duration,
        exerciseType,
        intensity,
        caloriesBurned,
        aiParsed,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Add exercise entry error:', error);
    res.status(500).json({ error: 'Failed to add exercise entry' });
  }
});

// Update exercise entry
router.put('/entry/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if entry belongs to user
    const existingEntry = await prisma.exerciseEntry.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Exercise entry not found' });
    }

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    const entry = await prisma.exerciseEntry.update({
      where: { id },
      data: updates,
    });

    res.json(entry);
  } catch (error) {
    console.error('Update exercise entry error:', error);
    res.status(500).json({ error: 'Failed to update exercise entry' });
  }
});

// Delete exercise entry
router.delete('/entry/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entry belongs to user
    const existingEntry = await prisma.exerciseEntry.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Exercise entry not found' });
    }

    await prisma.exerciseEntry.delete({
      where: { id },
    });

    res.json({ message: 'Exercise entry deleted successfully' });
  } catch (error) {
    console.error('Delete exercise entry error:', error);
    res.status(500).json({ error: 'Failed to delete exercise entry' });
  }
});

// Get exercise summary for a date range
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: 'Start and end dates are required' });
    }

    const startDate = new Date(start + 'T00:00:00.000Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    const entries = await prisma.exerciseEntry.findMany({
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
        totalCaloriesBurned:
          acc.totalCaloriesBurned + (entry.caloriesBurned || 0),
        totalDuration: acc.totalDuration + (entry.duration || 0),
        totalWorkouts: acc.totalWorkouts + 1,
      }),
      {
        totalCaloriesBurned: 0,
        totalDuration: 0,
        totalWorkouts: 0,
      }
    );

    res.json({
      summary,
      entries,
    });
  } catch (error) {
    console.error('Get exercise summary error:', error);
    res.status(500).json({ error: 'Failed to get exercise summary' });
  }
});

export default router;
