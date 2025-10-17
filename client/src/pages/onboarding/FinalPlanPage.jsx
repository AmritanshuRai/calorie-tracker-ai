import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';
import { authService } from '../../services/authService';
import {
  calculateWeeksBetween,
  calculateWeightChangeRate,
  validateWeightChangeRate,
} from '../../utils/helpers';

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
  const setUser = useUserStore((state) => state.setUser);
  const targetWeightChangeRate = useUserStore(
    (state) => state.targetWeightChangeRate
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isImprovedHealth = onboardingData.goal === 'improved_health';

  // Calculate initial weekly rate
  const weeks = isImprovedHealth
    ? 0
    : calculateWeeksBetween(new Date(), onboardingData.targetDate);
  const initialRate = isImprovedHealth
    ? 0
    : calculateWeightChangeRate(
        onboardingData.currentWeight,
        onboardingData.targetWeight,
        weeks
      );

  const [weeklyRate, setWeeklyRateLocal] = useState(Math.min(initialRate, 1));

  useEffect(() => {
    const rate = isImprovedHealth ? 0 : weeklyRate;
    calculateDailyTarget(rate);
    setWeightChangeRate(rate);
  }, [weeklyRate, calculateDailyTarget, setWeightChangeRate, isImprovedHealth]);

  const validation = validateWeightChangeRate(weeklyRate);
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
        bmr,
        tdee,
        dailyCalorieTarget,
        targetWeightChangeRate,
        proteinTarget: macros.protein,
        carbsTarget: macros.carbs,
        fatsTarget: macros.fats,
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
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            📊 Your Personalized Plan
          </h2>
          <p className='text-gray-600'>
            Here's your custom calorie and macro targets
          </p>
        </motion.div>

        {/* TDEE Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200'>
          <div className='text-center'>
            <p className='text-sm text-blue-700 font-medium mb-1'>
              TDEE (Maintenance)
            </p>
            <p className='text-4xl font-bold text-blue-900'>
              {tdee?.toLocaleString() || 0}
            </p>
            <p className='text-sm text-blue-700'>kcal/day</p>
          </div>
        </motion.div>

        {/* Daily Target Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-300'>
          <div className='text-center space-y-2'>
            {!isImprovedHealth && (
              <p className='text-sm text-green-700 font-medium'>
                Calorie{' '}
                {onboardingData.goal === 'weight_gain' ? 'Surplus' : 'Deficit'}:{' '}
                {onboardingData.goal === 'weight_gain' ? '+' : '-'}
                {Math.abs(calorieAdjustment).toFixed(0)} kcal
              </p>
            )}
            <p className='text-sm text-green-700 font-medium'>Daily Target</p>
            <p className='text-5xl font-bold text-green-900'>
              {dailyCalorieTarget?.toLocaleString() || 0}
            </p>
            <p className='text-lg text-green-700 font-medium'>kcal/day</p>
          </div>
        </motion.div>

        {/* Slider for weight change rate */}
        {!isImprovedHealth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='bg-white rounded-2xl p-6 border-2 border-gray-200'>
            <h3 className='font-semibold text-gray-800 mb-4'>
              Target {onboardingData.goal === 'weight_gain' ? 'Gain' : 'Loss'}{' '}
              Rate
            </h3>

            <div className='space-y-4'>
              <div className='relative'>
                <input
                  type='range'
                  min='0.25'
                  max='1'
                  step='0.05'
                  value={weeklyRate}
                  onChange={(e) =>
                    setWeeklyRateLocal(parseFloat(e.target.value))
                  }
                  className='w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${
                      ((weeklyRate - 0.25) / 0.75) * 100
                    }%, #e5e7eb ${
                      ((weeklyRate - 0.25) / 0.75) * 100
                    }%, #e5e7eb 100%)`,
                  }}
                />
                <div className='flex justify-between text-xs text-gray-500 mt-2'>
                  <span>0.25 kg/week</span>
                  <span className='font-bold text-green-600'>
                    {weeklyRate.toFixed(2)} kg/week
                  </span>
                  <span>1.0 kg/week</span>
                </div>
              </div>

              <div
                className={`rounded-xl p-4 ${
                  validation.severity === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : validation.severity === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : validation.severity === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                <p className='text-sm font-medium text-gray-800'>
                  {validation.message}
                </p>
              </div>

              <p className='text-xs text-gray-600 text-center'>
                💡 Drag slider to adjust your pace
              </p>
            </div>
          </motion.div>
        )}

        {/* Macros Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='bg-white rounded-2xl p-6 border-2 border-gray-200'>
          <h3 className='font-semibold text-gray-800 mb-4'>
            Macros (Auto-calculated)
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                {macros?.protein || 0}g
              </div>
              <div className='text-sm text-gray-600 mt-1'>Protein</div>
              <div className='text-xs text-gray-500'>30%</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>
                {macros?.carbs || 0}g
              </div>
              <div className='text-sm text-gray-600 mt-1'>Carbs</div>
              <div className='text-xs text-gray-500'>45%</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-yellow-600'>
                {macros?.fats || 0}g
              </div>
              <div className='text-sm text-gray-600 mt-1'>Fats</div>
              <div className='text-xs text-gray-500'>25%</div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl'>
            <div className='flex items-start gap-3'>
              <svg
                className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
              <p className='text-sm text-red-800'>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Finish Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='mt-8'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleFinish}
            disabled={loading}
            icon={
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            }>
            {loading ? 'Saving...' : 'Start Tracking →'}
          </Button>
        </motion.div>

        {/* Progress indicator - All complete */}
        <div className='flex justify-center gap-2 mt-8'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='h-2 w-8 rounded-full bg-green-500' />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default FinalPlanPage;
