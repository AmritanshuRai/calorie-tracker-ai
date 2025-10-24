import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';
import SmoothSlider from '../../components/SmoothSlider/js';

const WeightPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [currentWeight, setCurrentWeight] = useState(
    onboardingData.currentWeight || '80'
  );
  const [targetWeight, setTargetWeight] = useState(
    onboardingData.targetWeight || '70'
  );
  const [error, setError] = useState('');

  const isImprovedHealth = onboardingData.goal === 'improved_health';

  const handleContinue = () => {
    const current = parseFloat(currentWeight);

    if (!currentWeight || isNaN(current) || current <= 0) {
      setError('Please enter a valid current weight');
      return;
    }

    if (!isImprovedHealth) {
      const target = parseFloat(targetWeight);

      if (!targetWeight || isNaN(target) || target <= 0) {
        setError('Please enter a valid target weight');
        return;
      }

      if (onboardingData.goal === 'weight_loss' && target >= current) {
        setError(
          'Target weight must be less than current weight for weight loss'
        );
        return;
      }

      if (onboardingData.goal === 'weight_gain' && target <= current) {
        setError(
          'Target weight must be more than current weight for weight gain'
        );
        return;
      }

      updateOnboardingData({
        currentWeight: current,
        targetWeight: target,
      });
    } else {
      updateOnboardingData({
        currentWeight: current,
        targetWeight: current,
      });
    }

    // Always go to timeline page next
    navigate('/onboarding/timeline');
  };

  const weightDifference =
    currentWeight && targetWeight
      ? Math.abs(parseFloat(targetWeight) - parseFloat(currentWeight)).toFixed(
          1
        )
      : 0;

  return (
    <PageLayout title='Target Weight' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-2xl font-bold text-gray-800 mb-1.5'>
            {isImprovedHealth
              ? "What's your current weight?"
              : "What's your target weight?"}
          </h2>
          <p className='text-base text-gray-600'>
            {isImprovedHealth
              ? "We'll help you maintain a healthy weight"
              : 'Set a realistic target for your goal'}
          </p>
        </motion.div>

        <div className='space-y-3 mt-4'>
          {/* Desktop: Show input fields */}
          <div className='hidden md:block space-y-3'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}>
              <Input
                label='Current Weight'
                type='number'
                value={currentWeight}
                onChange={(e) => {
                  setCurrentWeight(e.target.value);
                  setError('');
                }}
                placeholder='75'
                unit='kg'
                min='1'
                step='0.1'
              />
            </motion.div>

            {!isImprovedHealth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                <Input
                  label='Target Weight'
                  type='number'
                  value={targetWeight}
                  onChange={(e) => {
                    setTargetWeight(e.target.value);
                    setError('');
                  }}
                  placeholder='70'
                  unit='kg'
                  min='1'
                  step='0.1'
                />
              </motion.div>
            )}
          </div>

          {/* Mobile: Show iOS picker */}
          <div className='md:hidden'>
            {!isImprovedHealth ? (
              <>
                <div className='grid grid-cols-2 gap-6 mb-4'>
                  <p className='text-base font-bold text-gray-800 text-center'>
                    Current Weight
                  </p>
                  <p className='text-base font-bold text-gray-800 text-center'>
                    Target Weight
                  </p>
                </div>
                <SmoothSlider
                  isDualColumn={true}
                  value={currentWeight}
                  onChange={(value) => {
                    setCurrentWeight(value);
                    setError('');
                  }}
                  min={30}
                  max={200}
                  label='kg'
                  value2={targetWeight}
                  onChange2={(value) => {
                    setTargetWeight(value);
                    setError('');
                  }}
                  min2={30}
                  max2={200}
                  label2='kg'
                />
              </>
            ) : (
              <>
                <p className='text-base font-bold text-gray-800 mb-4 text-center'>
                  Current Weight
                </p>
                <SmoothSlider
                  value={currentWeight}
                  onChange={(value) => {
                    setCurrentWeight(value);
                    setError('');
                  }}
                  min={30}
                  max={200}
                  label='kg'
                />
              </>
            )}
          </div>

          {!isImprovedHealth && weightDifference > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-green-50 border border-green-200 rounded-lg p-3 hidden md:block'>
              <div className='flex items-center gap-2 text-green-800'>
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                <span className='text-sm font-semibold'>
                  Change needed:{' '}
                  {onboardingData.goal === 'weight_gain' ? '+' : '-'}
                  {weightDifference} kg
                </span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm hidden md:block'>
              {error}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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

export default WeightPage;
