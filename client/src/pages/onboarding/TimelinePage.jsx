import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addWeeks } from 'date-fns';
import { AlertTriangle, Calendar, TrendingDown } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';

const TimelinePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  // Default: 0.5 kg/week (recommended)
  const [weeklyRate, setWeeklyRate] = useState(0.5);

  const weightDifference = Math.abs(
    onboardingData.targetWeight - onboardingData.currentWeight
  );
  const weeks = Math.ceil(weightDifference / weeklyRate);
  const targetDate = addWeeks(new Date(), weeks);

  // Only update when weeklyRate changes (not on every render)
  useEffect(() => {
    updateOnboardingData({
      weeklyRate: Number(weeklyRate),
      targetDate: format(targetDate, 'yyyy-MM-dd'),
      estimatedWeeks: weeks,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeklyRate]);

  const getValidation = (rate) => {
    if (rate > 1) {
      return {
        severity: 'warning',
        message:
          'This pace is aggressive and may not be sustainable long-term.',
        color: 'yellow',
      };
    } else if (rate >= 0.5 && rate <= 1) {
      return {
        severity: 'success',
        message: 'This is a healthy and sustainable pace for weight change.',
        color: 'emerald',
      };
    } else {
      return {
        severity: 'info',
        message: 'This is a slow and steady pace, great for long-term success.',
        color: 'blue',
      };
    }
  };

  const validation = getValidation(weeklyRate);

  const handleContinue = () => {
    navigate('/onboarding/activity');
  };

  // Handle slider change
  const handleSliderChange = (values) => {
    setWeeklyRate(values[0]);
  };

  return (
    <PageLayout title='Timeline' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-2xl lg:text-3xl font-black text-slate-900 mb-1.5'>
            How fast do you want to reach your goal?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Choose a sustainable pace for{' '}
            {Math.abs(weightDifference).toFixed(1)} kg change
          </p>
        </motion.div>

        {/* Slider Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mt-3'>
          <Card padding='md' variant='default'>
            <div className='space-y-3'>
              <div className='flex items-center justify-center gap-2'>
                <TrendingDown className='w-5 h-5 text-emerald-600' />
                <span className='text-sm font-black text-slate-900'>
                  Weekly Goal
                </span>
              </div>

              <div className='text-center'>
                <div className='text-4xl font-black text-emerald-600 mb-1'>
                  {weeklyRate.toFixed(2)}
                </div>
                <div className='text-base font-bold text-slate-600'>
                  kg per week
                </div>
              </div>

              {/* Radix Slider */}
              <div className='px-4 py-8'>
                <Slider.Root
                  className='relative flex items-center select-none touch-none w-full h-5'
                  value={[weeklyRate]}
                  onValueChange={handleSliderChange}
                  max={3}
                  min={0.25}
                  step={0.05}>
                  <Slider.Track className='bg-slate-200 relative grow rounded-full h-3'>
                    <Slider.Range className='absolute bg-emerald-600 rounded-full h-full' />
                  </Slider.Track>
                  <Slider.Thumb
                    className='block w-7 h-7 bg-emerald-600 rounded-full border-4 border-white shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:shadow-xl focus:scale-105 transition-all duration-200 ease-out cursor-grab active:cursor-grabbing active:scale-100'
                    aria-label='Weekly weight change rate'
                  />
                </Slider.Root>

                {/* Labels - positioned accurately based on slider values */}
                <div className='relative text-xs font-bold text-slate-500 mt-4'>
                  <span
                    className='absolute'
                    style={{ left: '0%', transform: 'translateX(0%)' }}>
                    0.25
                  </span>
                  <span
                    className='absolute'
                    style={{
                      left: `${((1.0 - 0.25) / (3 - 0.25)) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}>
                    1.0
                  </span>
                  <span
                    className='absolute'
                    style={{
                      left: `${((2.0 - 0.25) / (3 - 0.25)) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}>
                    2.0
                  </span>
                  <span
                    className='absolute'
                    style={{ left: '100%', transform: 'translateX(-100%)' }}>
                    3.0
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Estimated Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='space-y-1.5 text-center'>
          <div className='flex items-center justify-center gap-2'>
            <Calendar className='w-3.5 h-3.5 text-slate-500' />
            <span className='text-xs font-medium text-slate-600'>
              Estimated Duration
            </span>
            <span className='text-base font-bold text-slate-900'>
              {weeks} {weeks === 1 ? 'week' : 'weeks'}
            </span>
          </div>

          <div className='flex items-center justify-center gap-2'>
            <Calendar className='w-3.5 h-3.5 text-slate-500' />
            <span className='text-xs font-medium text-slate-600'>
              Target Date
            </span>
            <span className='text-base font-bold text-slate-900'>
              {format(targetDate, 'MMM dd, yyyy')}
            </span>
          </div>
        </motion.div>

        {/* Validation Message */}
        {validation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='text-center'>
            <p
              className={`text-xs font-medium inline-flex items-center gap-1.5 ${
                validation.color === 'yellow'
                  ? 'text-yellow-700'
                  : validation.color === 'emerald'
                  ? 'text-emerald-700'
                  : 'text-blue-700'
              }`}>
              {validation.severity === 'warning' && (
                <AlertTriangle className='w-3.5 h-3.5' />
              )}
              {validation.message}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-3 pt-2'>
          <Button
            variant='primary'
            size='md'
            fullWidth
            onClick={handleContinue}>
            Continue →
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default TimelinePage;
