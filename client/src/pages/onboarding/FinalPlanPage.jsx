import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Target, Check, Flame, Apple } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';
import { authService } from '../../services/authService';

const FinalPlanPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const bmr = useUserStore((state) => state.bmr);
  const tdee = useUserStore((state) => state.tdee);
  const calculateDailyTarget = useUserStore(
    (state) => state.calculateDailyTarget
  );
  const setWeightChangeRate = useUserStore(
    (state) => state.setWeightChangeRate
  );
  const dailyCalorieTarget = useUserStore((state) => state.dailyCalorieTarget);
  const macros = useUserStore((state) => state.macros);
  const micronutrients = useUserStore((state) => state.micronutrients);
  const setUser = useUserStore((state) => state.setUser);
  const targetWeightChangeRate = useUserStore(
    (state) => state.targetWeightChangeRate
  );
  const calculateMicronutrients = useUserStore(
    (state) => state.calculateMicronutrients
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isImprovedHealth = onboardingData.goal === 'improved_health';

  // Use the weeklyRate from onboarding data (set in TimelinePage)
  const weeklyRate = onboardingData.weeklyRate || 0.5;

  // Calculate actual macro percentages based on calories
  const macroPercentages = {
    protein: macros?.protein
      ? Math.round(((macros.protein * 4) / dailyCalorieTarget) * 100)
      : 0,
    carbs: macros?.carbs
      ? Math.round(((macros.carbs * 4) / dailyCalorieTarget) * 100)
      : 0,
    fats: macros?.fats
      ? Math.round(((macros.fats * 9) / dailyCalorieTarget) * 100)
      : 0,
  };

  useEffect(() => {
    const rate = isImprovedHealth ? 0 : weeklyRate;
    calculateDailyTarget(rate);
    setWeightChangeRate(rate);
    // Calculate micronutrients after calorie target is set
    calculateMicronutrients();
  }, [
    weeklyRate,
    calculateDailyTarget,
    setWeightChangeRate,
    isImprovedHealth,
    calculateMicronutrients,
  ]);

  const calorieAdjustment = isImprovedHealth ? 0 : tdee - dailyCalorieTarget;

  const handleFinish = async () => {
    setLoading(true);
    setError('');

    try {
      // Prepare onboarding data to send to backend
      const onboardingPayload = {
        gender: onboardingData.gender,
        age: onboardingData.age,
        height: onboardingData.height,
        goal: onboardingData.goal,
        currentWeight: onboardingData.currentWeight,
        targetWeight: onboardingData.targetWeight,
        targetDate: onboardingData.targetDate,
        activityLevel: onboardingData.activityLevel,
        activityMultiplier: onboardingData.activityMultiplier,
        dietPreference: onboardingData.dietPreference,
        healthConditions: onboardingData.healthConditions || [],
        customHealthConditions: onboardingData.customHealthConditions || [],
        // New health profile data
        pregnancyStatus: onboardingData.pregnancyStatus,
        trimester: onboardingData.trimester,
        menstrualCycle: onboardingData.menstrualCycle,
        smokingStatus: onboardingData.smokingStatus,
        cigarettesPerDay: onboardingData.cigarettesPerDay,
        alcoholFrequency: onboardingData.alcoholFrequency,
        drinksPerOccasion: onboardingData.drinksPerOccasion,
        caffeineIntake: onboardingData.caffeineIntake,
        sunExposure: onboardingData.sunExposure,
        climate: onboardingData.climate,
        skinTone: onboardingData.skinTone,
        sleepHours: onboardingData.sleepHours,
        stressLevel: onboardingData.stressLevel,
        waterIntake: onboardingData.waterIntake,
        medications: onboardingData.medications || [],
        previousDeficiencies: onboardingData.previousDeficiencies || [],
        exerciseTypes: onboardingData.exerciseTypes || [],
        exerciseIntensity: onboardingData.exerciseIntensity,
        // Calculated values
        bmr,
        tdee,
        dailyCalorieTarget,
        targetWeightChangeRate,
        proteinTarget: macros.protein,
        carbsTarget: macros.carbs,
        fatsTarget: macros.fats,
        // Micronutrient targets
        vitaminATarget: micronutrients.vitaminA,
        vitaminCTarget: micronutrients.vitaminC,
        vitaminDTarget: micronutrients.vitaminD,
        vitaminETarget: micronutrients.vitaminE,
        vitaminKTarget: micronutrients.vitaminK,
        vitaminB1Target: micronutrients.vitaminB1,
        vitaminB2Target: micronutrients.vitaminB2,
        vitaminB3Target: micronutrients.vitaminB3,
        vitaminB5Target: micronutrients.vitaminB5,
        vitaminB6Target: micronutrients.vitaminB6,
        vitaminB9Target: micronutrients.vitaminB9,
        vitaminB12Target: micronutrients.vitaminB12,
        calciumTarget: micronutrients.calcium,
        ironTarget: micronutrients.iron,
        magnesiumTarget: micronutrients.magnesium,
        phosphorusTarget: micronutrients.phosphorus,
        potassiumTarget: micronutrients.potassium,
        sodiumTarget: micronutrients.sodium,
        zincTarget: micronutrients.zinc,
        seleniumTarget: micronutrients.selenium,
        copperTarget: micronutrients.copper,
        manganeseTarget: micronutrients.manganese,
      };

      // Save to backend
      const updatedUser = await authService.completeOnboarding(
        onboardingPayload
      );

      // Update user state with profile completed
      setUser({
        ...updatedUser,
        profileCompleted: true,
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      setError('Failed to save your data. Please try again.');
      setLoading(false);
    }
  };

  return (
    <PageLayout title='Your Plan' showBack={true}>
      <div className='space-y-8 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl lg:text-4xl font-black text-slate-900 mb-3'>
            Your Personalized Plan
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            Here's your custom calorie and macro targets
          </p>
        </motion.div>

        {/* TDEE Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Card
            padding='lg'
            variant='outline'
            className='bg-blue-50 border-blue-300'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
                  <Flame className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm font-bold text-blue-700'>
                    TDEE (Maintenance)
                  </p>
                  <p className='text-xs font-medium text-blue-600'>
                    Your daily energy expenditure
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-3xl font-black text-blue-900'>
                  {tdee?.toLocaleString() || 0}
                </p>
                <p className='text-sm font-bold text-blue-700'>kcal/day</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Target Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card padding='lg' variant='gradient'>
            <div className='space-y-4'>
              <div className='flex items-center justify-center gap-3'>
                <Target className='w-6 h-6 text-white' />
                <span className='text-lg font-black text-white'>
                  Daily Target
                </span>
              </div>

              {!isImprovedHealth && (
                <div className='text-center'>
                  <p className='text-sm font-bold text-white/80'>
                    Calorie{' '}
                    {onboardingData.goal === 'weight_gain'
                      ? 'Surplus'
                      : 'Deficit'}
                    : {onboardingData.goal === 'weight_gain' ? '+' : '-'}
                    {Math.abs(calorieAdjustment).toFixed(0)} kcal
                  </p>
                </div>
              )}

              <div className='text-center'>
                <p className='text-6xl font-black text-white mb-2'>
                  {dailyCalorieTarget?.toLocaleString() || 0}
                </p>
                <p className='text-lg font-bold text-white/90'>kcal/day</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Macros Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-6'>
              <BarChart3 className='w-6 h-6 text-emerald-600' />
              <h3 className='text-lg font-black text-slate-900'>
                Macros (Auto-calculated)
              </h3>
            </div>
            <div className='grid grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3'>
                  <Apple className='w-8 h-8 text-blue-600' />
                </div>
                <div className='text-4xl font-black text-blue-600 mb-1'>
                  {macros?.protein || 0}g
                </div>
                <div className='text-sm font-bold text-slate-600'>Protein</div>
                <div className='text-xs font-medium text-slate-500 mt-1'>
                  {macroPercentages.protein}%
                </div>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3'>
                  <Apple className='w-8 h-8 text-emerald-600' />
                </div>
                <div className='text-4xl font-black text-emerald-600 mb-1'>
                  {macros?.carbs || 0}g
                </div>
                <div className='text-sm font-bold text-slate-600'>Carbs</div>
                <div className='text-xs font-medium text-slate-500 mt-1'>
                  {macroPercentages.carbs}%
                </div>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3'>
                  <Apple className='w-8 h-8 text-yellow-600' />
                </div>
                <div className='text-4xl font-black text-yellow-600 mb-1'>
                  {macros?.fats || 0}g
                </div>
                <div className='text-sm font-bold text-slate-600'>Fats</div>
                <div className='text-xs font-medium text-slate-500 mt-1'>
                  {macroPercentages.fats}%
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card
              padding='lg'
              variant='default'
              className='bg-red-50 border-2 border-red-300'>
              <div className='flex items-start gap-3'>
                <div className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5'>
                  <svg fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <p className='text-sm font-bold text-red-800'>{error}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Finish Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-12 pt-4'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleFinish}
            disabled={loading}>
            <span className='flex items-center justify-center gap-2'>
              <Check className='w-6 h-6' />
              {loading ? 'Saving...' : 'Start Tracking →'}
            </span>
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default FinalPlanPage;
