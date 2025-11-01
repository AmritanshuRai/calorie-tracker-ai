import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        goal: true,
        currentWeight: true,
        targetWeight: true,
        height: true,
        age: true,
        gender: true,
        activityLevel: true,
        bmr: true,
        tdee: true,
        dailyCalories: true,
        dailyProtein: true,
        dailyCarbs: true,
        dailyFats: true,
        dailyFiber: true,
        dailyWater: true,
        dailyCholesterol: true,
        dailySodium: true,
        dailySugar: true,
        dailyOmega3: true,
        targetWeightChangePerWeek: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get today's food entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEntries = await prisma.foodEntry.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get today's exercise entries
    const todayExerciseEntries = await prisma.exerciseEntry.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Calculate today's food totals
    const todayTotals = todayEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fats: acc.fats + (entry.fats || 0),
        fiber: acc.fiber + (entry.fiber || 0),
        water: acc.water + (entry.water || 0),
        cholesterol: acc.cholesterol + (entry.cholesterol || 0),
        sodium: acc.sodium + (entry.sodium || 0),
        sugar: acc.sugar + (entry.sugar || 0),
        omega3: acc.omega3 + (entry.omega3 || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        water: 0,
        cholesterol: 0,
        sodium: 0,
        sugar: 0,
        omega3: 0,
      }
    );

    // Calculate today's exercise calories burned
    const todayExerciseCalories = todayExerciseEntries.reduce(
      (total, entry) => total + (entry.caloriesBurned || 0),
      0
    );

    // Calculate net calories (consumed - burned)
    const netCalories = todayTotals.calories - todayExerciseCalories;

    res.json({
      user,
      today: {
        ...todayTotals,
        exerciseCalories: todayExerciseCalories,
        netCalories,
      },
      targets: {
        calories: user.dailyCalories,
        protein: user.dailyProtein,
        carbs: user.dailyCarbs,
        fats: user.dailyFats,
        fiber: user.dailyFiber,
        water: user.dailyWater,
        cholesterol: user.dailyCholesterol,
        sodium: user.dailySodium,
        sugar: user.dailySugar,
        omega3: user.dailyOmega3,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Get weight progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        currentWeight: true,
        targetWeight: true,
        startWeight: true,
        startDate: true,
        targetDate: true,
        goal: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For now, return basic progress info
    // In a real app, you'd track weight entries over time
    const startDate = user.startDate || new Date();
    const targetDate = user.targetDate || new Date();
    const currentDate = new Date();

    const totalDays = Math.ceil(
      (targetDate - startDate) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (currentDate - startDate) / (1000 * 60 * 60 * 24)
    );
    const remainingDays = Math.max(0, totalDays - elapsedDays);

    const totalWeightChange = Math.abs(user.targetWeight - user.startWeight);
    const currentWeightChange = Math.abs(user.currentWeight - user.startWeight);
    const progressPercentage =
      totalWeightChange > 0
        ? Math.min(100, (currentWeightChange / totalWeightChange) * 100)
        : 0;

    res.json({
      currentWeight: user.currentWeight,
      startWeight: user.startWeight,
      targetWeight: user.targetWeight,
      goal: user.goal,
      totalDays,
      elapsedDays,
      remainingDays,
      progressPercentage: Math.round(progressPercentage),
      isOnTrack:
        currentWeightChange >= (totalWeightChange * elapsedDays) / totalDays,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

export default router;
