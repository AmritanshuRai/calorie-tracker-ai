import api from './api';

export const exerciseService = {
  // Parse exercise text using AI
  parseExercise: async (exerciseText, exerciseType, intensity) => {
    const response = await api.post('/exercise/parse', {
      text: exerciseText,
      exerciseType,
      intensity,
    });
    return response.data;
  },

  // Get exercise log for a specific date
  getExerciseLog: async (date) => {
    const response = await api.get(`/exercise/log?date=${date}`);
    return response.data;
  },

  // Get exercise logs for a date range (batch endpoint)
  getExerciseLogRange: async (startDate, endDate) => {
    const response = await api.get(
      `/exercise/log/range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Add exercise entry
  addExerciseEntry: async (exerciseEntry) => {
    const response = await api.post('/exercise/entry', exerciseEntry);
    return response.data;
  },

  // Update exercise entry
  updateExerciseEntry: async (entryId, exerciseEntry) => {
    const response = await api.put(`/exercise/entry/${entryId}`, exerciseEntry);
    return response.data;
  },

  // Delete exercise entry
  deleteExerciseEntry: async (entryId) => {
    const response = await api.delete(`/exercise/entry/${entryId}`);
    return response.data;
  },

  // Get exercise summary for a date range
  getExerciseSummary: async (startDate, endDate) => {
    const response = await api.get(
      `/exercise/summary?start=${startDate}&end=${endDate}`
    );
    return response.data;
  },
};
