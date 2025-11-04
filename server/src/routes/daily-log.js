import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/imageUpload.js';
import DailyPictureService from '../services/dailyPictureService.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();
const dailyPictureService = new DailyPictureService();

// Rate limiters
const uploadPictureRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 uploads per 15 minutes
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const viewPictureRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 views per minute
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

const deletePictureRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 deletes per 15 minutes
  message: 'Too many delete requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

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

// ============================================
// PICTURE ROUTES
// ============================================

// Upload daily picture
router.post(
  '/picture',
  authenticateToken,
  uploadPictureRateLimiter,
  upload.single('image'),
  async (req, res) => {
    try {
      const { date } = req.body;
      const userId = req.user.userId;

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const dailyPicture = await dailyPictureService.uploadDailyPicture(
        userId,
        date,
        req.file
      );

      res.json(dailyPicture);
    } catch (error) {
      console.error('Error uploading picture:', error);
      res
        .status(500)
        .json({ error: error.message || 'Failed to upload picture' });
    }
  }
);

// Get picture for a specific date
router.get(
  '/:date/picture',
  authenticateToken,
  viewPictureRateLimiter,
  async (req, res) => {
    try {
      const { date } = req.params;
      const userId = req.user.userId;

      const picture = await dailyPictureService.getDailyPicture(userId, date);

      if (!picture) {
        return res.status(404).json({ error: 'Picture not found' });
      }

      res.json(picture);
    } catch (error) {
      console.error('Error fetching picture:', error);
      res.status(500).json({ error: 'Failed to fetch picture' });
    }
  }
);

// Delete picture for a specific date
router.delete(
  '/picture/:date',
  authenticateToken,
  deletePictureRateLimiter,
  async (req, res) => {
    try {
      const { date } = req.params;
      const userId = req.user.userId;

      await dailyPictureService.deleteDailyPicture(userId, date);

      res.json({ message: 'Picture deleted successfully' });
    } catch (error) {
      console.error('Error deleting picture:', error);
      res
        .status(500)
        .json({ error: error.message || 'Failed to delete picture' });
    }
  }
);

// Get all pictures for timeline/gallery
router.get(
  '/pictures/history',
  authenticateToken,
  viewPictureRateLimiter,
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { startDate, endDate, limit = 50, offset = 0 } = req.query;

      const pictures = await dailyPictureService.getPictureHistory(userId, {
        startDate,
        endDate,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json(pictures);
    } catch (error) {
      console.error('Error fetching picture history:', error);
      res.status(500).json({ error: 'Failed to fetch picture history' });
    }
  }
);

// Check remaining picture uploads for free users
router.get('/user/picture-quota', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const quota = await dailyPictureService.getPictureQuota(userId);

    res.json(quota);
  } catch (error) {
    console.error('Error fetching picture quota:', error);
    res.status(500).json({ error: 'Failed to fetch picture quota' });
  }
});

export default router;
