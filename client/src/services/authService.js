import api from './api';

export const authService = {
  // Google Sign-in
  googleSignIn: async (googleToken) => {
    const response = await api.post('/auth/google', { token: googleToken });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile (onboarding data)
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Complete onboarding
  completeOnboarding: async (onboardingData) => {
    const response = await api.post('/auth/onboarding', onboardingData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  },
};
