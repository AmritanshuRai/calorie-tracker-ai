import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';

const AgePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [age, setAge] = useState(onboardingData.age || '');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const ageNum = parseInt(age);

    if (!age || isNaN(ageNum)) {
      setError('Please enter your age');
      return;
    }

    if (ageNum < 13 || ageNum > 100) {
      setError('Age must be between 13 and 100');
      return;
    }

    updateOnboardingData({ age: ageNum });
    navigate('/onboarding/goal');
  };

  return (
    <PageLayout title='Personal Info' showBack={true}>
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            How old are you?
          </h2>
          <p className='text-gray-600'>
            Age helps us calculate your metabolism rate
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mt-12'>
          <Input
            type='number'
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setError('');
            }}
            placeholder='Enter your age'
            unit='years'
            min='13'
            max='100'
            error={error}
            className='text-center text-2xl'
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='mt-12'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleContinue}>
            Continue →
          </Button>
        </motion.div>

        {/* Progress indicator */}
        <div className='flex justify-center gap-2 mt-12'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= 1 ? 'w-8 bg-green-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default AgePage;
