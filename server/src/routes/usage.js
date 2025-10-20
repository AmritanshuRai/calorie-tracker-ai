import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  fetchCompletionsUsage,
  fetchCosts,
  fetchEmbeddingsUsage,
  getUsageSummary,
  dateRangeToUnixTimestamps,
  isAdminApiKeyConfigured,
} from '../services/openaiUsage.js';

const router = express.Router();

/**
 * Get usage summary with date range filtering
 * Query params:
 * - startDate: ISO date string (required)
 * - endDate: ISO date string (optional, defaults to now)
 * - groupBy: comma-separated list (optional, defaults to 'model')
 */
router.get('/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    if (!startDate) {
      return res.status(400).json({
        error: 'startDate is required (format: YYYY-MM-DD)',
      });
    }

    // Convert dates to Unix timestamps
    const { startTime, endTime } = dateRangeToUnixTimestamps(
      startDate,
      endDate
    );

    // Parse groupBy parameter
    const groupByFields = groupBy
      ? groupBy.split(',').map((f) => f.trim())
      : ['model'];

    const summary = await getUsageSummary(startTime, endTime, groupByFields);
    summary.source = 'openai_api';

    res.json(summary);
  } catch (error) {
    console.error('Get usage summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch usage summary',
      message: error.message,
    });
  }
});

/**
 * Get detailed completions usage
 * Query params:
 * - startDate: ISO date string (required)
 * - endDate: ISO date string (optional)
 * - bucketWidth: '1m', '1h', '1d' (optional, default: '1d')
 * - limit: number (optional)
 * - groupBy: comma-separated list (optional)
 * - models: comma-separated list (optional)
 * - page: pagination cursor (optional)
 */
router.get(
  '/completions',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { startDate, endDate, bucketWidth, limit, groupBy, models, page } =
        req.query;

      if (!startDate) {
        return res.status(400).json({
          error: 'startDate is required (format: YYYY-MM-DD)',
        });
      }

      const { startTime, endTime } = dateRangeToUnixTimestamps(
        startDate,
        endDate
      );

      const options = {
        start_time: startTime,
        end_time: endTime,
        bucket_width: bucketWidth || '1d',
      };

      if (limit) options.limit = parseInt(limit);
      if (groupBy) options.group_by = groupBy.split(',').map((f) => f.trim());
      if (models) options.models = models.split(',').map((m) => m.trim());
      if (page) options.page = page;

      const usage = await fetchCompletionsUsage(options);

      res.json(usage);
    } catch (error) {
      console.error('Get completions usage error:', error);
      res.status(500).json({
        error: 'Failed to fetch completions usage',
        message: error.message,
      });
    }
  }
);

/**
 * Get costs data
 * Query params:
 * - startDate: ISO date string (required)
 * - endDate: ISO date string (optional)
 * - limit: number (optional, default: 7, max: 180)
 * - groupBy: comma-separated list (optional)
 * - page: pagination cursor (optional)
 */
router.get('/costs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, limit, groupBy, page } = req.query;

    if (!startDate) {
      return res.status(400).json({
        error: 'startDate is required (format: YYYY-MM-DD)',
      });
    }

    const { startTime, endTime } = dateRangeToUnixTimestamps(
      startDate,
      endDate
    );

    const options = {
      start_time: startTime,
      end_time: endTime,
      bucket_width: '1d', // Only '1d' is supported by OpenAI
    };

    if (limit) options.limit = Math.min(parseInt(limit), 180);
    if (groupBy) options.group_by = groupBy.split(',').map((f) => f.trim());
    if (page) options.page = page;

    const costs = await fetchCosts(options);

    res.json(costs);
  } catch (error) {
    console.error('Get costs error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs',
      message: error.message,
    });
  }
});

/**
 * Get embeddings usage
 * Query params:
 * - startDate: ISO date string (required)
 * - endDate: ISO date string (optional)
 * - bucketWidth: '1m', '1h', '1d' (optional, default: '1d')
 * - limit: number (optional)
 * - groupBy: comma-separated list (optional)
 * - page: pagination cursor (optional)
 */
router.get('/embeddings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, bucketWidth, limit, groupBy, page } = req.query;

    if (!startDate) {
      return res.status(400).json({
        error: 'startDate is required (format: YYYY-MM-DD)',
      });
    }

    const { startTime, endTime } = dateRangeToUnixTimestamps(
      startDate,
      endDate
    );

    const options = {
      start_time: startTime,
      end_time: endTime,
      bucket_width: bucketWidth || '1d',
    };

    if (limit) options.limit = parseInt(limit);
    if (groupBy) options.group_by = groupBy.split(',').map((f) => f.trim());
    if (page) options.page = page;

    const usage = await fetchEmbeddingsUsage(options);

    res.json(usage);
  } catch (error) {
    console.error('Get embeddings usage error:', error);
    res.status(500).json({
      error: 'Failed to fetch embeddings usage',
      message: error.message,
    });
  }
});

/**
 * Get quick stats for dashboard
 * Returns aggregated data for common time ranges
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();

    // Last 7 days
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    // Last 30 days
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    const [last7DaysData, last30DaysData] = await Promise.all([
      getUsageSummary(
        Math.floor(last7Days.getTime() / 1000),
        Math.floor(now.getTime() / 1000),
        ['model']
      ),
      getUsageSummary(
        Math.floor(last30Days.getTime() / 1000),
        Math.floor(now.getTime() / 1000),
        ['model']
      ),
    ]);

    res.json({
      source: 'openai_api',
      last7Days: last7DaysData.aggregated,
      last30Days: last30DaysData.aggregated,
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch usage stats',
      message: error.message,
    });
  }
});

export default router;
