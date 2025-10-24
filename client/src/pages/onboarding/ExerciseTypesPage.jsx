import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';

const ExerciseTypesPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [exerciseTypes, setExerciseTypes] = useState(
    onboardingData.exerciseTypes || []
  );

  const exerciseOptions = [
    'None',
    'Cardio (running, cycling)',
    'Strength training',
    'Sports',
    'Yoga/Pilates',
    'Swimming',
  ];

  const toggleExerciseType = (type) => {
    if (type === 'None') {
      setExerciseTypes(['None']);
    } else {
      setExerciseTypes((prev) => {
        const filtered = prev.filter((t) => t !== 'None');
        if (filtered.includes(type)) {
          return filtered.filter((t) => t !== type);
        } else {
          return [...filtered, type];
        }
      });
    }
  };

  const handleContinue = () => {
    updateOnboardingData({
      exerciseTypes,
    });

    navigate('/onboarding/exercise-intensity');
  };

  return (
    <PageLayout title='Exercise Details' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center'>
            <Dumbbell className='w-7 h-7 text-green-600' />
          </div>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-1.5'>
            What types of exercise do you do?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Different exercises have different nutritional needs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {exerciseOptions.map((type) => (
            <button
              key={type}
              onClick={() => toggleExerciseType(type)}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                exerciseTypes.includes(type)
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
              }`}>
              {type}
            </button>
          ))}
        </motion.div>

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

export default ExerciseTypesPage;
