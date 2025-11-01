import api from './api';

export const dailyLogService = {
  // Get daily log for a specific date
  getDailyLog: async (date) => {
    const response = await api.get(`/daily-log/${date}`);
    return response.data;
  },

  // Update weight for a specific date
  updateWeight: async (date, weight, weightUnit = 'kg') => {
    const response = await api.post('/daily-log', {
      date,
      weight,
      weightUnit,
    });
    return response.data;
  },

  // Update water intake for a specific date
  updateWaterIntake: async (date, waterIntake, waterUnit = 'ml') => {
    const response = await api.post('/daily-log', {
      date,
      waterIntake,
      waterUnit,
    });
    return response.data;
  },

  // Update both weight and water in one call
  updateDailyLog: async (date, data) => {
    const response = await api.post('/daily-log', {
      date,
      ...data,
    });
    return response.data;
  },

  // Get weight history
  getWeightHistory: async (params = {}) => {
    const response = await api.get('/daily-log/weight/history', { params });
    return response.data;
  },

  // Get water intake history
  getWaterHistory: async (params = {}) => {
    const response = await api.get('/daily-log/water/history', { params });
    return response.data;
  },
};
