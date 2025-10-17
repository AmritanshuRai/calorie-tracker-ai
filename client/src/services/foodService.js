import api from './api';

export const foodService = {
  // Parse food text using AI
  parseFood: async (foodText) => {
    const response = await api.post('/food/parse', { text: foodText });
    return response.data;
  },

  // Get food log for a specific date
  getFoodLog: async (date) => {
    const response = await api.get(`/food/log?date=${date}`);
    return response.data;
  },

  // Add food entry
  addFoodEntry: async (foodEntry) => {
    const response = await api.post('/food/entry', foodEntry);
    return response.data;
  },

  // Update food entry
  updateFoodEntry: async (entryId, foodEntry) => {
    const response = await api.put(`/food/entry/${entryId}`, foodEntry);
    return response.data;
  },

  // Delete food entry
  deleteFoodEntry: async (entryId) => {
    const response = await api.delete(`/food/entry/${entryId}`);
    return response.data;
  },

  // Get nutrition summary for a date range
  getNutritionSummary: async (startDate, endDate) => {
    const response = await api.get(
      `/food/summary?start=${startDate}&end=${endDate}`
    );
    return response.data;
  },
};
