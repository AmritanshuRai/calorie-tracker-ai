import api from './api';

export const pictureService = {
  // Upload picture for a specific date
  uploadPicture: async (date, file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('date', date);

    const response = await api.post('/daily-log/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // Get picture for a specific date
  getPicture: async (date) => {
    const response = await api.get(`/daily-log/${date}/picture`);
    return response.data;
  },

  // Delete picture for a specific date
  deletePicture: async (date) => {
    const response = await api.delete(`/daily-log/picture/${date}`);
    return response.data;
  },

  // Get picture history
  getPictureHistory: async (params = {}) => {
    const response = await api.get('/daily-log/pictures/history', { params });
    return response.data;
  },

  // Get picture quota
  getPictureQuota: async () => {
    const response = await api.get('/daily-log/user/picture-quota');
    return response.data;
  },
};
