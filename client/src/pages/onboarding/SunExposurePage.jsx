import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';

const SunExposurePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [sunExposure, setSunExposure] = useState(
    onboardingData.sunExposure || null
  );
  const [error, setError] = useState('');

  const sunOptions = [
    { value: 'minimal', label: 'Minimal (mostly indoors)' },
    { value: 'low', label: 'Low (15-30 min/day)' },
    { value: 'moderate', label: 'Moderate (30-60 min/day)' },
    { value: 'high', label: 'High (60+ min/day)' },
  ];

  const handleContinue = () => {
    if (!sunExposure) {
      setError('Please select your sun exposure level');
      return;
    }

    updateOnboardingData({
      sunExposure,
    });

    navigate('/onboarding/climate');
  };

  return (
    <PageLayout title='Environment' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-2xl flex items-center justify-center'>
            <Sun className='w-7 h-7 text-orange-600' />
          </div>
          <h2 className='text-2xl lg:text-3xl font-black text-slate-900 mb-1.5'>
            How much sun exposure do you get?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            This affects your vitamin D synthesis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {sunOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSunExposure(option.value);
                setError('');
              }}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                sunExposure === option.value
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

export default SunExposurePage;
