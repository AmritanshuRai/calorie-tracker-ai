import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all OpenAI logs (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const logs = await prisma.openAILog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const totalCount = await prisma.openAILog.count();

    res.json(logs);
  } catch (error) {
    console.error('Get all OpenAI logs error:', error);
    res.status(500).json({ error: 'Failed to get OpenAI logs' });
  }
});

// Get user's OpenAI logs
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, startDate, endDate } = req.query;

    const where = {
      userId: req.user.userId,
    };

    // Add date filters if provided
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.openAILog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      select: {
        id: true,
        model: true,
        requestType: true,
        input: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        inputCost: true,
        outputCost: true,
        totalCost: true,
        responseTimeMs: true,
        status: true,
        errorMessage: true,
        endpoint: true,
        reasoningEffort: true,
        createdAt: true,
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.openAILog.count({ where });

    res.json({
      logs,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get OpenAI logs error:', error);
    res.status(500).json({ error: 'Failed to get OpenAI logs' });
  }
});

// Get user's OpenAI usage statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, period = 'all' } = req.query;

    const where = {
      userId: req.user.userId,
    };

    // Add date filters
    if (startDate || endDate || period !== 'all') {
      where.createdAt = {};

      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      } else if (period !== 'all') {
        // Calculate start date based on period
        const now = new Date();
        switch (period) {
          case 'today':
            where.createdAt.gte = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            where.createdAt.gte = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            where.createdAt.gte = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            where.createdAt.gte = new Date(
              now.setFullYear(now.getFullYear() - 1)
            );
            break;
        }
      }

      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get aggregated statistics
    const stats = await prisma.openAILog.groupBy({
      by: ['model', 'requestType', 'status'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        inputCost: true,
        outputCost: true,
        totalCost: true,
      },
      _avg: {
        responseTimeMs: true,
      },
    });

    // Calculate total statistics
    const totals = await prisma.openAILog.aggregate({
      where,
      _count: {
        id: true,
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        inputCost: true,
        outputCost: true,
        totalCost: true,
      },
      _avg: {
        responseTimeMs: true,
      },
    });

    // Get daily usage for charts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyUsage = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as count,
        SUM(total_tokens)::int as total_tokens,
        SUM(total_cost)::float as total_cost
      FROM "OpenAILog"
      WHERE user_id = ${req.user.userId}
        AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    res.json({
      totals: {
        totalCalls: totals._count.id || 0,
        totalTokens: totals._sum.totalTokens || 0,
        inputTokens: totals._sum.inputTokens || 0,
        outputTokens: totals._sum.outputTokens || 0,
        totalCost: totals._sum.totalCost || 0,
        avgResponseTime: totals._avg.responseTimeMs || 0,
      },
      breakdown: stats,
      dailyUsage,
    });
  } catch (error) {
    console.error('Get OpenAI stats error:', error);
    res.status(500).json({ error: 'Failed to get OpenAI statistics' });
  }
});

// Get specific log details (including raw output)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const log = await prisma.openAILog.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Get OpenAI log error:', error);
    res.status(500).json({ error: 'Failed to get OpenAI log' });
  }
});

// Admin route: Get all logs (add admin authentication middleware later)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin check middleware
    // For now, this is just a placeholder

    const { limit = 100, offset = 0 } = req.query;

    const logs = await prisma.openAILog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const totalCount = await prisma.openAILog.count();

    res.json({
      logs,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all OpenAI logs error:', error);
    res.status(500).json({ error: 'Failed to get OpenAI logs' });
  }
});

// Admin route: Get aggregate statistics
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin check middleware

    const totals = await prisma.openAILog.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        inputCost: true,
        outputCost: true,
        totalCost: true,
      },
      _avg: {
        responseTimeMs: true,
      },
    });

    const byModel = await prisma.openAILog.groupBy({
      by: ['model'],
      _count: {
        id: true,
      },
      _sum: {
        totalCost: true,
        totalTokens: true,
      },
    });

    const byUser = await prisma.openAILog.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      _sum: {
        totalCost: true,
        totalTokens: true,
      },
      orderBy: {
        _sum: {
          totalCost: 'desc',
        },
      },
      take: 10,
    });

    res.json({
      totals: {
        totalCalls: totals._count.id || 0,
        totalTokens: totals._sum.totalTokens || 0,
        totalCost: totals._sum.totalCost || 0,
        avgResponseTime: totals._avg.responseTimeMs || 0,
      },
      byModel,
      topUsers: byUser,
    });
  } catch (error) {
    console.error('Get admin OpenAI stats error:', error);
    res.status(500).json({ error: 'Failed to get OpenAI statistics' });
  }
});

export default router;
