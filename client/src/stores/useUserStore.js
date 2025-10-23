import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  calculateDailyMicronutrients,
  calculateMacrosForDiet,
} from '../utils/micronutrientCalculator';
import { FREE_LOGS_LIMIT } from '../utils/constants';

const useUserStore = create(
  persist(
    (set, get) => ({
      // User authentication
      user: null,
      token: null,
      isAuthenticated: false,

      // Subscription state
      subscription: {
        status: 'free', // free, active, cancelled, expired
        plan: null, // monthly, annual
        endDate: null,
        freeLogs: FREE_LOGS_LIMIT,
        canLog: true,
      },

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
        // New health profile data
        pregnancyStatus: null,
        trimester: null,
        menstrualCycle: null,
        smokingStatus: null,
        cigarettesPerDay: null,
        alcoholFrequency: null,
        drinksPerOccasion: null,
        caffeineIntake: null,
        sunExposure: null,
        climate: null,
        skinTone: null,
        sleepHours: null,
        stressLevel: null,
        waterIntake: null,
        medications: [],
        previousDeficiencies: [],
        exerciseTypes: [],
        exerciseIntensity: null,
        dietPreference: null,
        healthConditions: [],
        customHealthConditions: [],
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
      micronutrients: {
        vitaminA: null,
        vitaminC: null,
        vitaminD: null,
        vitaminE: null,
        vitaminK: null,
        vitaminB1: null,
        vitaminB2: null,
        vitaminB3: null,
        vitaminB5: null,
        vitaminB6: null,
        vitaminB9: null,
        vitaminB12: null,
        calcium: null,
        iron: null,
        magnesium: null,
        phosphorus: null,
        potassium: null,
        sodium: null,
        zinc: null,
        selenium: null,
        copper: null,
        manganese: null,
      },

      // Actions
      setUser: (user) => {
        // Check if user has Pro access
        const isPro =
          user.subscriptionStatus === 'active' ||
          (user.subscriptionStatus === 'cancelled' &&
            user.subscriptionEnd &&
            new Date(user.subscriptionEnd) > new Date());

        // Extract subscription data from user
        const subscriptionData = {
          status: user.subscriptionStatus || 'free',
          plan: user.subscriptionPlan || null,
          endDate: user.subscriptionEnd || null,
          freeLogs: isPro ? -1 : user.freeLogs ?? FREE_LOGS_LIMIT, // -1 for unlimited (Pro)
          canLog: isPro || (user.freeLogs ?? FREE_LOGS_LIMIT) > 0,
        };

        set({
          user,
          isAuthenticated: true,
          subscription: subscriptionData,
        });
      },
      setToken: (token) => {
        set({ token });
        // Also store in localStorage for API interceptor
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },
      setSubscription: (subscription) => set({ subscription }),
      decrementFreeLogs: () =>
        set((state) => {
          // Only decrement if not unlimited
          if (state.subscription.freeLogs >= 0) {
            const newFreeLogs = Math.max(0, state.subscription.freeLogs - 1);
            return {
              subscription: {
                ...state.subscription,
                freeLogs: newFreeLogs,
                canLog: newFreeLogs > 0,
              },
            };
          }
          return state;
        }),
      updateSubscriptionStatus: (status) =>
        set((state) => ({
          subscription: { ...state.subscription, status },
        })),
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          subscription: {
            status: 'free',
            plan: null,
            endDate: null,
            freeLogs: FREE_LOGS_LIMIT,
            canLog: true,
          },
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
        });
        // Clear from localStorage
        localStorage.removeItem('token');
      },

      updateOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),

      clearOnboardingData: () =>
        set({
          onboardingData: {
            gender: null,
            age: null,
            goal: null,
            currentWeight: null,
            targetWeight: null,
            targetDate: null,
            activityLevel: null,
            activityMultiplier: null,
            pregnancyStatus: null,
            trimester: null,
            menstrualCycle: null,
            smokingStatus: null,
            cigarettesPerDay: null,
            alcoholFrequency: null,
            drinksPerOccasion: null,
            caffeineIntake: null,
            sunExposure: null,
            climate: null,
            skinTone: null,
            sleepHours: null,
            stressLevel: null,
            waterIntake: null,
            medications: [],
            previousDeficiencies: [],
            exerciseTypes: [],
            exerciseIntensity: null,
            dietPreference: null,
            healthConditions: [],
            customHealthConditions: [],
          },
          bmr: null,
          tdee: null,
          dailyCalorieTarget: null,
          targetWeightChangeRate: null,
          macros: {
            protein: null,
            carbs: null,
            fats: null,
          },
          micronutrients: {
            vitaminA: null,
            vitaminC: null,
            vitaminD: null,
            vitaminE: null,
            vitaminK: null,
            vitaminB1: null,
            vitaminB2: null,
            vitaminB3: null,
            vitaminB5: null,
            vitaminB6: null,
            vitaminB9: null,
            vitaminB12: null,
            calcium: null,
            iron: null,
            magnesium: null,
            phosphorus: null,
            potassium: null,
            sodium: null,
            zinc: null,
            selenium: null,
            copper: null,
            manganese: null,
          },
        }),

      setCalculatedValues: (values) => set(values),

      calculateBMR: () => {
        const { gender, age, currentWeight, height } = get().onboardingData;
        if (!gender || !age || !currentWeight || !height) return 0;

        // Using Mifflin-St Jeor equation
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
        const { goal, dietPreference } = onboardingData;

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

        // Calculate macros based on diet preference
        const macros = calculateMacrosForDiet(
          roundedTarget,
          dietPreference || 'balanced',
          goal
        );

        set({ macros });
        return roundedTarget;
      },

      calculateMicronutrients: () => {
        const { onboardingData, dailyCalorieTarget } = get();

        if (!dailyCalorieTarget) return;

        const micronutrients = calculateDailyMicronutrients({
          ...onboardingData,
          dailyCalorieTarget,
        });

        set({ micronutrients });
        return micronutrients;
      },

      setWeightChangeRate: (rate) => set({ targetWeightChangeRate: rate }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        subscription: state.subscription,
        onboardingData: state.onboardingData,
        bmr: state.bmr,
        tdee: state.tdee,
        dailyCalorieTarget: state.dailyCalorieTarget,
        targetWeightChangeRate: state.targetWeightChangeRate,
        macros: state.macros,
        micronutrients: state.micronutrients,
      }),
    }
  )
);

export default useUserStore;
