import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';

const SkinTonePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [skinTone, setSkinTone] = useState(onboardingData.skinTone || null);
  const [error, setError] = useState('');

  const skinToneOptions = [
    { value: 'very-fair', label: 'Very Fair', color: '#FFE4C4' },
    { value: 'fair', label: 'Fair', color: '#FFDAB9' },
    { value: 'light', label: 'Light', color: '#F5DEB3' },
    { value: 'medium', label: 'Medium', color: '#DEB887' },
    { value: 'olive', label: 'Olive', color: '#D2B48C' },
    { value: 'brown', label: 'Brown', color: '#8B7355' },
    { value: 'dark', label: 'Dark', color: '#5C4033' },
  ];

  const handleContinue = () => {
    if (!skinTone) {
      setError('Please select your skin tone');
      return;
    }

    updateOnboardingData({
      skinTone,
    });

    navigate('/onboarding/sleep-hours');
  };

  return (
    <PageLayout title='Environment' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-rose-100 to-pink-200 rounded-2xl flex items-center justify-center'>
            <Palette className='w-7 h-7 text-rose-600' />
          </div>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-1.5'>
            What's your skin tone?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Skin tone affects vitamin D synthesis efficiency
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {skinToneOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSkinTone(option.value);
                setError('');
              }}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all flex items-center gap-3 ${
                skinTone === option.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
              }`}>
              <div
                className='w-6 h-6 rounded-full border-2 border-slate-300'
                style={{ backgroundColor: option.color }}
              />
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

export default SkinTonePage;
