import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';

const ExerciseIntensityPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [exerciseIntensity, setExerciseIntensity] = useState(
    onboardingData.exerciseIntensity || null
  );
  const [error, setError] = useState('');

  const intensityOptions = [
    { value: 'light', label: 'Light - Easy pace, can talk easily' },
    { value: 'moderate', label: 'Moderate - Somewhat hard, can talk' },
    { value: 'vigorous', label: 'Vigorous - Hard, difficult to talk' },
    { value: 'intense', label: 'Intense - Very hard, cannot talk' },
  ];

  const handleContinue = () => {
    if (!exerciseIntensity) {
      setError('Please select your exercise intensity');
      return;
    }

    updateOnboardingData({
      exerciseIntensity,
    });

    navigate('/onboarding/health-conditions');
  };

  return (
    <PageLayout title='Exercise Details' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl flex items-center justify-center'>
            <Flame className='w-7 h-7 text-orange-600' />
          </div>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-1.5'>
            What's your typical exercise intensity?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Intensity affects recovery needs and nutrient requirements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {intensityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setExerciseIntensity(option.value);
                setError('');
              }}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                exerciseIntensity === option.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
              }`}>
              {option.label}
            </button>
          ))}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm'>
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='mt-4'>
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

export default ExerciseIntensityPage;
