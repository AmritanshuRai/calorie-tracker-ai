import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';

const ClimatePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [climate, setClimate] = useState(onboardingData.climate || null);
  const [error, setError] = useState('');

  const climateOptions = [
    { value: 'tropical', label: 'Tropical (hot & humid)' },
    { value: 'dry', label: 'Dry/Desert (hot & dry)' },
    { value: 'temperate', label: 'Temperate (moderate)' },
    { value: 'cold', label: 'Cold (cool/cold)' },
    { value: 'polar', label: 'Polar (very cold)' },
  ];

  const handleContinue = () => {
    if (!climate) {
      setError('Please select your climate');
      return;
    }

    updateOnboardingData({
      climate,
    });

    navigate('/onboarding/skin-tone');
  };

  return (
    <PageLayout title='Environment' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl flex items-center justify-center'>
            <Cloud className='w-7 h-7 text-cyan-600' />
          </div>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-1.5'>
            What's your typical climate?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Climate affects hydration and vitamin D needs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {climateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setClimate(option.value);
                setError('');
              }}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                climate === option.value
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

export default ClimatePage;
