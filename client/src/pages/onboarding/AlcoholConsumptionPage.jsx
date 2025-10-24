import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';

const AlcoholConsumptionPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [alcoholFrequency, setAlcoholFrequency] = useState(
    onboardingData.alcoholFrequency || null
  );
  const [drinksPerOccasion, setDrinksPerOccasion] = useState(
    onboardingData.drinksPerOccasion || ''
  );
  const [error, setError] = useState('');

  const alcoholOptions = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely (1-2 times/month)' },
    { value: 'moderate', label: 'Moderate (1-2 times/week)' },
    { value: 'regular', label: 'Regular (3+ times/week)' },
    { value: 'daily', label: 'Daily' },
  ];

  const handleContinue = () => {
    if (!alcoholFrequency) {
      setError('Please select your alcohol consumption frequency');
      return;
    }

    if (
      ['moderate', 'regular', 'daily'].includes(alcoholFrequency) &&
      !drinksPerOccasion
    ) {
      setError('Please enter drinks per occasion');
      return;
    }

    updateOnboardingData({
      alcoholFrequency,
      drinksPerOccasion: ['moderate', 'regular', 'daily'].includes(
        alcoholFrequency
      )
        ? parseInt(drinksPerOccasion)
        : null,
    });

    navigate('/onboarding/caffeine-intake');
  };

  return (
    <PageLayout title='Lifestyle Habits' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center'>
            <Wine className='w-7 h-7 text-purple-600' />
          </div>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-1.5'>
            How often do you consume alcohol?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Alcohol affects B-vitamin and mineral absorption
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {alcoholOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setAlcoholFrequency(option.value);
                if (!['moderate', 'regular', 'daily'].includes(option.value)) {
                  setDrinksPerOccasion('');
                }
                setError('');
              }}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                alcoholFrequency === option.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
              }`}>
              {option.label}
            </button>
          ))}

          {['moderate', 'regular', 'daily'].includes(alcoholFrequency) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className='pt-3'>
              <Input
                label='Drinks per occasion'
                type='number'
                value={drinksPerOccasion}
                onChange={(e) => {
                  setDrinksPerOccasion(e.target.value);
                  setError('');
                }}
                placeholder='2'
                min='1'
                max='20'
              />
            </motion.div>
          )}
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

export default AlcoholConsumptionPage;
