import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get daily log for a specific date
router.get('/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    // Parse and normalize date to UTC midnight
    const requestedDate = new Date(date);
    const normalizedDate = new Date(
      Date.UTC(
        requestedDate.getFullYear(),
        requestedDate.getMonth(),
        requestedDate.getDate(),
        0,
        0,
        0,
        0
      )
    );

    const dailyLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: normalizedDate,
        },
      },
    });

    res.json(
      dailyLog || { date: normalizedDate, weight: null, waterIntake: null }
    );
  } catch (error) {
    console.error('Error fetching daily log:', error);
    res.status(500).json({ error: 'Failed to fetch daily log' });
  }
});

// Update or create daily log (weight and/or water)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      date,
      weight,
      weightUnit = 'kg',
      waterIntake,
      waterUnit = 'ml',
      notes,
    } = req.body;
    const userId = req.user.userId;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Parse and normalize date to UTC midnight
    const requestedDate = new Date(date);
    const normalizedDate = new Date(
      Date.UTC(
        requestedDate.getFullYear(),
        requestedDate.getMonth(),
        requestedDate.getDate(),
        0,
        0,
        0,
        0
      )
    );

    // Build update data - only include fields that are provided
    const updateData = {};
    if (weight !== undefined && weight !== null) {
      updateData.weight = parseFloat(weight);
      updateData.weightUnit = weightUnit;
    }
    if (waterIntake !== undefined && waterIntake !== null) {
      updateData.waterIntake = parseFloat(waterIntake);
      updateData.waterUnit = waterUnit;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Upsert the daily log
    const dailyLog = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId,
          date: normalizedDate,
        },
      },
      update: updateData,
      create: {
        userId,
        date: normalizedDate,
        ...updateData,
      },
    });

    res.json(dailyLog);
  } catch (error) {
    console.error('Error updating daily log:', error);
    res.status(500).json({ error: 'Failed to update daily log' });
  }
});

// Get weight history (for charts/trends)
router.get('/weight/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 30 } = req.query;

    const where = {
      userId,
      weight: { not: null },
    };

    if (startDate) {
      where.date = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    const weightHistory = await prisma.dailyLog.findMany({
      where,
      select: {
        date: true,
        weight: true,
        weightUnit: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: parseInt(limit),
    });

    res.json(weightHistory);
  } catch (error) {
    console.error('Error fetching weight history:', error);
    res.status(500).json({ error: 'Failed to fetch weight history' });
  }
});

// Get water intake history
router.get('/water/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 30 } = req.query;

    const where = {
      userId,
      waterIntake: { not: null },
    };

    if (startDate) {
      where.date = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    const waterHistory = await prisma.dailyLog.findMany({
      where,
      select: {
        date: true,
        waterIntake: true,
        waterUnit: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: parseInt(limit),
    });

    res.json(waterHistory);
  } catch (error) {
    console.error('Error fetching water history:', error);
    res.status(500).json({ error: 'Failed to fetch water history' });
  }
});

export default router;
