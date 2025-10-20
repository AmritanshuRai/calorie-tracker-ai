import axios from 'axios';

/**
 * OpenAI Usage API Service
 * Fetches usage and cost data directly from OpenAI's Usage API
 */

const OPENAI_API_BASE_URL = 'https://api.openai.com/v1/organization';

/**
 * Get OpenAI Admin API key from environment
 * Note: The Admin API key must have 'api.usage.read' scope
 * You can create one at: https://platform.openai.com/api-keys
 * Make sure to select "All" or "Usage" permissions when creating the key
 */
function getAdminApiKey() {
  const apiKey = process.env.OPENAI_ADMIN_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_ADMIN_KEY or OPENAI_API_KEY not configured. Please add it to your .env file.'
    );
  }
  return apiKey;
}

/**
 * Check if Admin API key is configured and has proper permissions
 */
export function isAdminApiKeyConfigured() {
  return !!(process.env.OPENAI_ADMIN_KEY || process.env.OPENAI_API_KEY);
}

/**
 * Fetch completions usage from OpenAI
 * @param {Object} options - Query parameters
 * @param {number} options.start_time - Unix timestamp (seconds) for start time
 * @param {number} options.end_time - Unix timestamp (seconds) for end time (optional)
 * @param {string} options.bucket_width - Time bucket width: '1m', '1h', '1d' (default: '1d')
 * @param {number} options.limit - Number of buckets to return
 * @param {string[]} options.group_by - Fields to group by (e.g., ['model', 'project_id'])
 */
export async function fetchCompletionsUsage(options = {}) {
  try {
    const apiKey = getAdminApiKey();
    const params = new URLSearchParams();

    // Required parameter
    if (!options.start_time) {
      throw new Error('start_time is required');
    }
    params.append('start_time', options.start_time);

    // Optional parameters
    if (options.end_time) params.append('end_time', options.end_time);
    if (options.bucket_width)
      params.append('bucket_width', options.bucket_width);
    if (options.limit) params.append('limit', options.limit);
    if (options.group_by && options.group_by.length > 0) {
      options.group_by.forEach((field) => params.append('group_by', field));
    }
    if (options.models && options.models.length > 0) {
      options.models.forEach((model) => params.append('models', model));
    }
    if (options.page) params.append('page', options.page);

    const response = await axios.get(
      `${OPENAI_API_BASE_URL}/usage/completions?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error fetching completions usage:',
      error.response?.data || error.message
    );

    // Check if it's a permission error
    if (
      error.response?.data?.error?.message?.includes('insufficient permissions')
    ) {
      throw new Error(
        'OpenAI Admin API key does not have the required "api.usage.read" permission. ' +
          'Please create a new API key at https://platform.openai.com/api-keys with "Usage" permissions enabled, ' +
          'and add it to your .env file as OPENAI_ADMIN_KEY.'
      );
    }

    throw new Error(
      `Failed to fetch completions usage: ${
        error.response?.data?.error?.message || error.message
      }`
    );
  }
}

/**
 * Fetch costs from OpenAI
 * @param {Object} options - Query parameters
 * @param {number} options.start_time - Unix timestamp (seconds) for start time
 * @param {number} options.end_time - Unix timestamp (seconds) for end time (optional)
 * @param {string} options.bucket_width - Time bucket width: currently only '1d' supported
 * @param {number} options.limit - Number of buckets to return (default: 7, max: 180)
 * @param {string[]} options.group_by - Fields to group by (e.g., ['project_id', 'line_item'])
 */
export async function fetchCosts(options = {}) {
  try {
    const apiKey = getAdminApiKey();
    const params = new URLSearchParams();

    // Required parameter
    if (!options.start_time) {
      throw new Error('start_time is required');
    }
    params.append('start_time', options.start_time);

    // Optional parameters
    if (options.end_time) params.append('end_time', options.end_time);
    if (options.bucket_width)
      params.append('bucket_width', options.bucket_width);
    if (options.limit) params.append('limit', options.limit);
    if (options.group_by && options.group_by.length > 0) {
      options.group_by.forEach((field) => params.append('group_by', field));
    }
    if (options.project_ids && options.project_ids.length > 0) {
      options.project_ids.forEach((id) => params.append('project_ids', id));
    }
    if (options.page) params.append('page', options.page);

    const response = await axios.get(
      `${OPENAI_API_BASE_URL}/costs?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error fetching costs:',
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to fetch costs: ${
        error.response?.data?.error?.message || error.message
      }`
    );
  }
}

/**
 * Fetch embeddings usage from OpenAI
 */
export async function fetchEmbeddingsUsage(options = {}) {
  try {
    const apiKey = getAdminApiKey();
    const params = new URLSearchParams();

    if (!options.start_time) {
      throw new Error('start_time is required');
    }
    params.append('start_time', options.start_time);

    if (options.end_time) params.append('end_time', options.end_time);
    if (options.bucket_width)
      params.append('bucket_width', options.bucket_width);
    if (options.limit) params.append('limit', options.limit);
    if (options.group_by && options.group_by.length > 0) {
      options.group_by.forEach((field) => params.append('group_by', field));
    }
    if (options.page) params.append('page', options.page);

    const response = await axios.get(
      `${OPENAI_API_BASE_URL}/usage/embeddings?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error fetching embeddings usage:',
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to fetch embeddings usage: ${
        error.response?.data?.error?.message || error.message
      }`
    );
  }
}

/**
 * Calculate the number of days between two timestamps
 */
function calculateDaysBetween(startTime, endTime) {
  if (!endTime) {
    endTime = Math.floor(Date.now() / 1000);
  }
  return Math.ceil((endTime - startTime) / (24 * 60 * 60));
}

/**
 * Fetch all pages of completions usage data with pagination
 */
async function fetchAllCompletionsUsage(options) {
  let allData = [];
  let hasMore = true;
  let page = null;

  while (hasMore) {
    const result = await fetchCompletionsUsage({
      ...options,
      page,
    });

    if (result.data) {
      allData = allData.concat(result.data);
    }

    hasMore = result.has_more;
    page = result.next_page;
  }

  return {
    object: 'page',
    data: allData,
    has_more: false,
    next_page: null,
  };
}

/**
 * Fetch all pages of costs data with pagination
 */
async function fetchAllCosts(options) {
  let allData = [];
  let hasMore = true;
  let page = null;

  while (hasMore) {
    const result = await fetchCosts({
      ...options,
      page,
    });

    if (result.data) {
      allData = allData.concat(result.data);
    }

    hasMore = result.has_more;
    page = result.next_page;
  }

  return {
    object: 'page',
    data: allData,
    has_more: false,
    next_page: null,
  };
}

/**
 * Get aggregated usage summary for a date range
 * This combines data from completions and costs endpoints
 * Automatically handles pagination for date ranges > 31 days
 */
export async function getUsageSummary(
  startTime,
  endTime = null,
  groupBy = ['model']
) {
  try {
    // Calculate days in range
    const days = calculateDaysBetween(startTime, endTime);

    // Determine limit based on days
    // Max 31 days per request for daily buckets
    const limit = Math.min(days, 31);

    // Prepare base options
    const baseOptions = {
      start_time: startTime,
      end_time: endTime,
      bucket_width: '1d',
      limit: limit,
      group_by: groupBy,
    };

    // Fetch costs - Note: Costs API only supports 'project_id' and 'line_item' for grouping
    const costsGroupBy = groupBy.filter((field) =>
      ['project_id', 'line_item'].includes(field)
    );
    const finalCostsGroupBy =
      costsGroupBy.length > 0 ? costsGroupBy : ['line_item'];

    const costsOptions = {
      start_time: startTime,
      end_time: endTime,
      bucket_width: '1d',
      limit: Math.min(days, 180), // Costs API allows up to 180 days
      group_by: finalCostsGroupBy,
    };

    // If date range is <= 31 days, fetch directly (no pagination needed)
    let completions, costs;

    if (days <= 31) {
      [completions, costs] = await Promise.all([
        fetchCompletionsUsage(baseOptions),
        fetchCosts(costsOptions),
      ]);
    } else {
      // For longer periods, use pagination
      [completions, costs] = await Promise.all([
        fetchAllCompletionsUsage(baseOptions),
        fetchAllCosts(costsOptions),
      ]);
    }

    // Process and aggregate the data
    const summary = {
      completions,
      costs,
      aggregated: aggregateUsageData(completions, costs),
    };

    return summary;
  } catch (error) {
    console.error('Error getting usage summary:', error.message);
    throw error;
  }
}

/**
 * Helper function to aggregate usage data
 */
function aggregateUsageData(completions, costs) {
  const aggregated = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalInputCachedTokens: 0,
    totalRequests: 0,
    totalCost: 0,
    byModel: {},
    byDate: {},
  };

  // Aggregate completions data
  if (completions?.data) {
    completions.data.forEach((bucket) => {
      const dateKey = new Date(bucket.start_time * 1000)
        .toISOString()
        .split('T')[0];

      if (!aggregated.byDate[dateKey]) {
        aggregated.byDate[dateKey] = {
          inputTokens: 0,
          outputTokens: 0,
          inputCachedTokens: 0,
          requests: 0,
          cost: 0,
        };
      }

      bucket.results.forEach((result) => {
        aggregated.totalInputTokens += result.input_tokens || 0;
        aggregated.totalOutputTokens += result.output_tokens || 0;
        aggregated.totalInputCachedTokens += result.input_cached_tokens || 0;
        aggregated.totalRequests += result.num_model_requests || 0;

        aggregated.byDate[dateKey].inputTokens += result.input_tokens || 0;
        aggregated.byDate[dateKey].outputTokens += result.output_tokens || 0;
        aggregated.byDate[dateKey].inputCachedTokens +=
          result.input_cached_tokens || 0;
        aggregated.byDate[dateKey].requests += result.num_model_requests || 0;

        // Group by model if available
        if (result.model) {
          if (!aggregated.byModel[result.model]) {
            aggregated.byModel[result.model] = {
              inputTokens: 0,
              outputTokens: 0,
              inputCachedTokens: 0,
              requests: 0,
              cost: 0,
            };
          }
          aggregated.byModel[result.model].inputTokens +=
            result.input_tokens || 0;
          aggregated.byModel[result.model].outputTokens +=
            result.output_tokens || 0;
          aggregated.byModel[result.model].inputCachedTokens +=
            result.input_cached_tokens || 0;
          aggregated.byModel[result.model].requests +=
            result.num_model_requests || 0;
        }
      });
    });
  }

  // Aggregate costs data
  if (costs?.data) {
    costs.data.forEach((bucket) => {
      const dateKey = new Date(bucket.start_time * 1000)
        .toISOString()
        .split('T')[0];

      bucket.results.forEach((result) => {
        const cost = result.amount?.value || 0;
        aggregated.totalCost += cost;

        if (aggregated.byDate[dateKey]) {
          aggregated.byDate[dateKey].cost += cost;
        }

        // If grouped by model, add cost to model data
        if (result.model && aggregated.byModel[result.model]) {
          aggregated.byModel[result.model].cost += cost;
        }
      });
    });
  }

  return aggregated;
}

/**
 * Convert date range to Unix timestamps
 */
export function dateRangeToUnixTimestamps(startDate, endDate = null) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const startTime = Math.floor(start.getTime() / 1000);

  if (!endDate) {
    return { startTime, endTime: null };
  }

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const endTime = Math.floor(end.getTime() / 1000);

  return { startTime, endTime };
}
