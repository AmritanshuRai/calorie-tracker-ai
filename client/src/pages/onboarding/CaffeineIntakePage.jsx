import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';

const CaffeineIntakePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [caffeineIntake, setCaffeineIntake] = useState(
    onboardingData.caffeineIntake || null
  );
  const [error, setError] = useState('');

  const caffeineOptions = [
    { value: 'none', label: 'None' },
    { value: 'low', label: '1-2 cups coffee/day' },
    { value: 'moderate', label: '3-4 cups coffee/day' },
    { value: 'high', label: '5+ cups coffee/day' },
  ];

  const handleContinue = () => {
    if (!caffeineIntake) {
      setError('Please select your caffeine intake');
      return;
    }

    updateOnboardingData({
      caffeineIntake,
    });

    navigate('/onboarding/sun-exposure');
  };

  return (
    <PageLayout title='Lifestyle Habits' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center'>
            <Coffee className='w-7 h-7 text-amber-600' />
          </div>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-1.5'>
            How much caffeine do you consume?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Caffeine affects calcium and iron absorption
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {caffeineOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setCaffeineIntake(option.value);
                setError('');
              }}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                caffeineIntake === option.value
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

export default CaffeineIntakePage;
