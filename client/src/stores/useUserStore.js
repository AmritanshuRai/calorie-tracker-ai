import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // User authentication
      user: null,
      token: null,
      isAuthenticated: false,

      // Onboarding data
      onboardingData: {
        gender: null,
        age: null,
        goal: null,
        currentWeight: null,
        targetWeight: null,
        targetDate: null,
        activityLevel: null,
        activityMultiplier: null,
      },

      // Calculated values
      bmr: null,
      tdee: null,
      dailyCalorieTarget: null,
      targetWeightChangeRate: null,
      macros: {
        protein: null,
        carbs: null,
        fats: null,
      },

      // Actions
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          onboardingData: {
            gender: null,
            age: null,
            goal: null,
            currentWeight: null,
            targetWeight: null,
            targetDate: null,
            activityLevel: null,
            activityMultiplier: null,
          },
          bmr: null,
          tdee: null,
          dailyCalorieTarget: null,
          targetWeightChangeRate: null,
          macros: { protein: null, carbs: null, fats: null },
        }),

      updateOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),

      setCalculatedValues: (values) => set(values),

      calculateBMR: () => {
        const { gender, age, currentWeight } = get().onboardingData;
        if (!gender || !age || !currentWeight) return 0;

        // Using Mifflin-St Jeor equation with estimated height
        const height = gender === 'male' ? 175 : 162; // cm

        let bmr;
        if (gender === 'male') {
          bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
        }

        set({ bmr: Math.round(bmr) });
        return Math.round(bmr);
      },

      calculateTDEE: () => {
        const { bmr, onboardingData } = get();
        const { activityMultiplier } = onboardingData;

        if (!bmr || !activityMultiplier) return 0;

        const tdee = bmr * activityMultiplier;
        set({ tdee: Math.round(tdee) });
        return Math.round(tdee);
      },

      calculateDailyTarget: (weeklyRate) => {
        const { tdee, onboardingData } = get();
        const { goal } = onboardingData;

        if (!tdee || !goal) return 0;

        // 1 kg fat = 7700 kcal
        const dailyAdjustment = (weeklyRate * 7700) / 7;

        let target;
        if (goal === 'weight_loss') {
          target = tdee - dailyAdjustment;
        } else if (goal === 'weight_gain') {
          target = tdee + dailyAdjustment;
        } else {
          target = tdee; // improved_health
        }

        const roundedTarget = Math.round(target);
        set({ dailyCalorieTarget: roundedTarget });

        // Calculate macros (30% protein, 25% fat, 45% carbs)
        const macros = {
          protein: Math.round((roundedTarget * 0.3) / 4), // 4 cal per gram
          fats: Math.round((roundedTarget * 0.25) / 9), // 9 cal per gram
          carbs: Math.round((roundedTarget * 0.45) / 4), // 4 cal per gram
        };

        set({ macros });
        return roundedTarget;
      },

      setWeightChangeRate: (rate) => set({ targetWeightChangeRate: rate }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        onboardingData: state.onboardingData,
        bmr: state.bmr,
        tdee: state.tdee,
        dailyCalorieTarget: state.dailyCalorieTarget,
        targetWeightChangeRate: state.targetWeightChangeRate,
        macros: state.macros,
      }),
    }
  )
);

export default useUserStore;
