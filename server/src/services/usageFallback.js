import prisma from '../lib/prisma.js';

/**
 * Fallback service to get usage data from database logs
 * Used when OpenAI Admin API key is not available or doesn't have proper permissions
 */

/**
 * Get usage summary from database logs
 */
export async function getUsageSummaryFromDB(startDate, endDate = null) {
  try {
    const whereClause = {
      createdAt: {
        gte: new Date(startDate),
        ...(endDate && { lte: new Date(endDate) }),
      },
      status: 'success', // Only count successful requests
    };

    // Get aggregated data
    const aggregated = await prisma.openAILog.aggregate({
      where: whereClause,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        inputCost: true,
        outputCost: true,
        totalCost: true,
      },
      _count: {
        id: true,
      },
    });

    // Get data grouped by date
    const logsByDate = await prisma.openAILog.groupBy({
      by: ['createdAt'],
      where: whereClause,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        inputCost: true,
        outputCost: true,
        totalCost: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get data grouped by model
    const logsByModel = await prisma.openAILog.groupBy({
      by: ['model'],
      where: whereClause,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        inputCost: true,
        outputCost: true,
        totalCost: true,
      },
      _count: {
        id: true,
      },
    });

    // Transform data to match OpenAI API format
    const byDate = {};
    logsByDate.forEach((log) => {
      const dateKey = new Date(log.createdAt).toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = {
          inputTokens: 0,
          outputTokens: 0,
          inputCachedTokens: 0,
          requests: 0,
          cost: 0,
        };
      }
      byDate[dateKey].inputTokens += log._sum.inputTokens || 0;
      byDate[dateKey].outputTokens += log._sum.outputTokens || 0;
      byDate[dateKey].requests += log._count.id || 0;
      byDate[dateKey].cost +=
        (log._sum.inputCost || 0) + (log._sum.outputCost || 0);
    });

    const byModel = {};
    logsByModel.forEach((log) => {
      byModel[log.model] = {
        inputTokens: log._sum.inputTokens || 0,
        outputTokens: log._sum.outputTokens || 0,
        inputCachedTokens: 0,
        requests: log._count.id || 0,
        cost: (log._sum.inputCost || 0) + (log._sum.outputCost || 0),
      };
    });

    return {
      source: 'database',
      completions: {
        object: 'page',
        data: [],
        has_more: false,
        next_page: null,
      },
      costs: {
        object: 'page',
        data: [],
        has_more: false,
        next_page: null,
      },
      aggregated: {
        totalInputTokens: aggregated._sum.inputTokens || 0,
        totalOutputTokens: aggregated._sum.outputTokens || 0,
        totalInputCachedTokens: 0,
        totalRequests: aggregated._count.id || 0,
        totalCost:
          (aggregated._sum.inputCost || 0) + (aggregated._sum.outputCost || 0),
        byModel,
        byDate,
      },
    };
  } catch (error) {
    console.error('Error getting usage from database:', error);
    throw error;
  }
}

/**
 * Get quick stats from database
 */
export async function getStatsFromDB() {
  try {
    const now = new Date();

    // Last 7 days
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    // Last 30 days
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    const [last7DaysData, last30DaysData] = await Promise.all([
      getUsageSummaryFromDB(last7Days.toISOString(), now.toISOString()),
      getUsageSummaryFromDB(last30Days.toISOString(), now.toISOString()),
    ]);

    return {
      last7Days: last7DaysData.aggregated,
      last30Days: last30DaysData.aggregated,
    };
  } catch (error) {
    console.error('Error getting stats from database:', error);
    throw error;
  }
}
