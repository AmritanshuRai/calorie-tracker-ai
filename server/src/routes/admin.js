import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require both authentication and admin role
// Admin status can only be set manually in the database

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        googleId: true,
        profileCompleted: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user's OpenAI logs
router.get(
  '/users/:userId/logs',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const logs = await prisma.openAILog.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      res.json(logs);
    } catch (error) {
      console.error('Get user logs error:', error);
      res.status(500).json({ error: 'Failed to get user logs' });
    }
  }
);

// Get user's onboarding data
router.get(
  '/users/:userId/onboarding',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const onboarding = await prisma.userOnboarding.findMany({
        where: {
          userId,
        },
        orderBy: {
          completedAt: 'desc',
        },
      });

      res.json(onboarding);
    } catch (error) {
      console.error('Get user onboarding error:', error);
      res.status(500).json({ error: 'Failed to get user onboarding data' });
    }
  }
);

// Get user statistics
router.get(
  '/users/:userId/stats',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              foodEntries: true,
              openaiLogs: true,
              onboardingHistory: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get OpenAI usage statistics
      const openaiStats = await prisma.openAILog.aggregate({
        where: { userId },
        _sum: {
          totalCost: true,
          totalTokens: true,
        },
        _count: {
          id: true,
        },
      });

      // Get latest onboarding
      const latestOnboarding = await prisma.userOnboarding.findFirst({
        where: { userId },
        orderBy: { completedAt: 'desc' },
      });

      res.json({
        user,
        openaiStats,
        latestOnboarding,
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ error: 'Failed to get user statistics' });
    }
  }
);

// Get system statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const completedProfiles = await prisma.user.count({
      where: { profileCompleted: true },
    });

    const totalLogs = await prisma.openAILog.count();
    const totalCost = await prisma.openAILog.aggregate({
      _sum: {
        totalCost: true,
      },
    });

    const totalFoodEntries = await prisma.foodEntry.count();

    // Get users by join date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    res.json({
      totalUsers,
      completedProfiles,
      incompleteProfiles: totalUsers - completedProfiles,
      totalLogs,
      totalCost: totalCost._sum.totalCost || 0,
      totalFoodEntries,
      recentUsers,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get system statistics' });
  }
});

export default router;
