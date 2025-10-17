import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addWeeks } from 'date-fns';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';
import {
  calculateWeeksBetween,
  calculateWeightChangeRate,
  validateWeightChangeRate,
} from '../../utils/helpers';

const TimelinePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  // Default: 8 weeks from today
  const defaultDate = format(addWeeks(new Date(), 8), 'yyyy-MM-dd');
  const [targetDate, setTargetDate] = useState(
    onboardingData.targetDate || defaultDate
  );

  const weeks = calculateWeeksBetween(new Date(), targetDate);
  const weeklyRate = calculateWeightChangeRate(
    onboardingData.currentWeight,
    onboardingData.targetWeight,
    weeks
  );
  const validation = validateWeightChangeRate(weeklyRate);

  const handleContinue = () => {
    updateOnboardingData({ targetDate });
    navigate('/onboarding/activity');
  };

  return (
    <PageLayout title='Timeline' showBack={true}>
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            When do you want to reach {onboardingData.targetWeight}kg?
          </h2>
          <p className='text-gray-600'>
            Choose a realistic timeline for your goal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mt-12'>
          <div className='bg-white rounded-2xl border-2 border-gray-200 p-6'>
            <div className='flex items-center justify-center gap-3 mb-2'>
              <svg
                className='w-6 h-6 text-green-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              <span className='text-sm font-medium text-gray-600'>
                Select Target Date
              </span>
            </div>
            <input
              type='date'
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={format(addWeeks(new Date(), 1), 'yyyy-MM-dd')}
              max={format(addWeeks(new Date(), 52), 'yyyy-MM-dd')}
              className='w-full text-center text-xl font-semibold text-gray-800 border-none outline-none cursor-pointer'
            />
          </div>
        </motion.div>

        {weeks > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='space-y-4'>
            {/* Duration */}
            <div className='bg-gray-50 rounded-xl p-4'>
              <div className='flex items-center gap-2'>
                <svg
                  className='w-5 h-5 text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span className='text-sm text-gray-600'>Duration:</span>
                <span className='font-bold text-gray-800'>{weeks} weeks</span>
              </div>
            </div>

            {/* Weekly Rate */}
            <div
              className={`rounded-xl p-4 border-2 ${
                validation.severity === 'error'
                  ? 'bg-red-50 border-red-300'
                  : validation.severity === 'warning'
                  ? 'bg-yellow-50 border-yellow-300'
                  : validation.severity === 'success'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-blue-50 border-blue-300'
              }`}>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm font-medium'>
                    Your pace: {weeklyRate.toFixed(2)} kg/week
                  </span>
                </div>
                <p className='text-sm font-medium'>{validation.message}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='mt-12'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleContinue}>
            Continue →
          </Button>
        </motion.div>

        {/* Progress indicator */}
        <div className='flex justify-center gap-2 mt-12'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= 5 ? 'w-8 bg-green-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default TimelinePage;
