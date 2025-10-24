import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';

const ExerciseDetailsPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [exerciseTypes, setExerciseTypes] = useState(
    onboardingData.exerciseTypes || []
  );
  const [exerciseIntensity, setExerciseIntensity] = useState(
    onboardingData.exerciseIntensity || null
  );
  const [error, setError] = useState('');

  const exerciseTypeOptions = [
    {
      value: 'cardio',
      label: 'Cardio',
      description: 'Running, cycling, swimming',
      emoji: '🏃',
    },
    {
      value: 'strength',
      label: 'Strength Training',
      description: 'Weightlifting, resistance',
      emoji: '💪',
    },
    {
      value: 'sports',
      label: 'Sports',
      description: 'Team or individual sports',
      emoji: '⚽',
    },
    {
      value: 'yoga',
      label: 'Yoga/Pilates',
      description: 'Flexibility & mindfulness',
      emoji: '🧘',
    },
    {
      value: 'hiit',
      label: 'HIIT',
      description: 'High-intensity intervals',
      emoji: '🔥',
    },
    {
      value: 'none',
      label: 'None',
      description: 'No regular exercise',
      emoji: '🚶',
    },
  ];

  const intensityOptions = [
    {
      value: 'light',
      label: 'Light',
      description: 'Can talk easily during exercise',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: 'Can talk but breathing harder',
    },
    {
      value: 'vigorous',
      label: 'Vigorous',
      description: 'Hard to talk, sweating',
    },
    {
      value: 'very_vigorous',
      label: 'Very Vigorous',
      description: 'Maximum effort, athlete level',
    },
  ];

  const toggleExerciseType = (type) => {
    if (type === 'none') {
      setExerciseTypes(['none']);
      setExerciseIntensity(null);
    } else {
      const filtered = exerciseTypes.filter((t) => t !== 'none');
      if (filtered.includes(type)) {
        setExerciseTypes(filtered.filter((t) => t !== type));
      } else {
        setExerciseTypes([...filtered, type]);
      }
    }
  };

  const handleContinue = () => {
    if (exerciseTypes.length === 0) {
      setError('Please select at least one exercise type');
      return;
    }

    if (!exerciseTypes.includes('none') && !exerciseIntensity) {
      setError('Please select your exercise intensity');
      return;
    }

    updateOnboardingData({
      exerciseTypes: exerciseTypes.length === 0 ? ['none'] : exerciseTypes,
      exerciseIntensity: exerciseTypes.includes('none')
        ? null
        : exerciseIntensity,
    });

    navigate('/onboarding/diet-preference');
  };

  const hasNone = exerciseTypes.includes('none');

  return (
    <PageLayout title='Exercise Details' showBack={true}>
      <div className='space-y-8 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-4xl max-lg:text-3xl font-black text-slate-900 mb-3'>
            What type of exercise do you do?
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            Athletes need higher levels of certain nutrients
          </p>
        </motion.div>

        {/* Exercise Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Dumbbell className='w-6 h-6 text-emerald-600' />
              <h3 className='text-lg font-black text-slate-900'>
                Select all that apply
              </h3>
            </div>
            <div className='grid grid-cols-2 max-md:grid-cols-1 gap-3'>
              {exerciseTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    toggleExerciseType(option.value);
                    setError('');
                  }}
                  disabled={hasNone && option.value !== 'none'}
                  className={`p-4 rounded-xl border-2 font-bold text-left transition-all ${
                    exerciseTypes.includes(option.value)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : hasNone && option.value !== 'none'
                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                  }`}>
                  <div className='flex items-center gap-3'>
                    <span className='text-3xl'>{option.emoji}</span>
                    <div className='flex-1'>
                      <div className='text-base'>{option.label}</div>
                      <div className='text-xs font-medium text-slate-600'>
                        {option.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        exerciseTypes.includes(option.value)
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-400'
                      }`}>
                      {exerciseTypes.includes(option.value) && (
                        <svg
                          className='w-3 h-3 text-white'
                          fill='currentColor'
                          viewBox='0 0 20 20'>
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Exercise Intensity */}
        {!hasNone && exerciseTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}>
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-3 mb-4'>
                <Activity className='w-6 h-6 text-orange-600' />
                <h3 className='text-lg font-black text-slate-900'>
                  How intense are your workouts?
                </h3>
              </div>
              <div className='space-y-3'>
                {intensityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setExerciseIntensity(option.value);
                      setError('');
                    }}
                    className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${
                      exerciseIntensity === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-orange-300'
                    }`}>
                    <div className='flex flex-col'>
                      <span className='text-base'>{option.label}</span>
                      <span className='text-sm font-medium text-slate-600 mt-1'>
                        {option.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-red-50 border-2 border-red-300 rounded-xl p-4'>
            <p className='text-sm font-bold text-red-800 text-center'>
              {error}
            </p>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='mt-12 pt-4'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleContinue}>
            Continue →
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ExerciseDetailsPage;
