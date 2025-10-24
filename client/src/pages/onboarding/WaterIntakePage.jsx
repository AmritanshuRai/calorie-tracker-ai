import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';

const WaterIntakePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [waterIntake, setWaterIntake] = useState(
    onboardingData.waterIntake || ''
  );
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!waterIntake) {
      setError('Please enter your daily water intake');
      return;
    }

    const liters = parseFloat(waterIntake);
    if (liters < 0 || liters > 20) {
      setError('Please enter a valid number between 0 and 20');
      return;
    }

    updateOnboardingData({
      waterIntake: liters,
    });

    navigate('/onboarding/medications-list');
  };

  return (
    <PageLayout title='Health Metrics' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-sky-200 rounded-2xl flex items-center justify-center'>
            <Droplet className='w-7 h-7 text-blue-600' />
          </div>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-1.5'>
            How much water do you drink daily?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Hydration affects nutrient absorption and transport
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mt-4'>
          <Input
            label='Daily water intake (liters)'
            type='number'
            value={waterIntake}
            onChange={(e) => {
              setWaterIntake(e.target.value);
              setError('');
            }}
            placeholder='2.5'
            min='0'
            max='20'
            step='0.1'
          />
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

export default WaterIntakePage;
