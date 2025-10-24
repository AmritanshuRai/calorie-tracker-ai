import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cigarette } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';

const SmokingStatusPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [smokingStatus, setSmokingStatus] = useState(
    onboardingData.smokingStatus || null
  );
  const [cigarettesPerDay, setCigarettesPerDay] = useState(
    onboardingData.cigarettesPerDay || ''
  );
  const [error, setError] = useState('');

  const smokingOptions = [
    { value: 'never', label: 'No, never' },
    { value: 'former', label: 'Former smoker' },
    { value: 'current', label: 'Yes, currently' },
  ];

  const handleContinue = () => {
    if (!smokingStatus) {
      setError('Please select your smoking status');
      return;
    }

    if (smokingStatus === 'current' && !cigarettesPerDay) {
      setError('Please enter cigarettes per day');
      return;
    }

    updateOnboardingData({
      smokingStatus,
      cigarettesPerDay:
        smokingStatus === 'current' ? parseInt(cigarettesPerDay) : null,
    });

    navigate('/onboarding/alcohol-consumption');
  };

  return (
    <PageLayout title='Lifestyle Habits' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center'>
            <Cigarette className='w-7 h-7 text-slate-600' />
          </div>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-1.5'>
            Do you smoke tobacco?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Smoking affects your vitamin C and other nutrient needs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {smokingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSmokingStatus(option.value);
                if (option.value !== 'current') {
                  setCigarettesPerDay('');
                }
                setError('');
              }}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                smokingStatus === option.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
              }`}>
              {option.label}
            </button>
          ))}

          {smokingStatus === 'current' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className='pt-3'>
              <Input
                label='Cigarettes per day'
                type='number'
                value={cigarettesPerDay}
                onChange={(e) => {
                  setCigarettesPerDay(e.target.value);
                  setError('');
                }}
                placeholder='10'
                min='1'
                max='100'
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

export default SmokingStatusPage;
