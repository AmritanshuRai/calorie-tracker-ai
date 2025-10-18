import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';

const HeightPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [height, setHeight] = useState(onboardingData.height || '');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const heightValue = parseFloat(height);

    if (!height || isNaN(heightValue) || heightValue <= 0) {
      setError('Please enter a valid height');
      return;
    }

    if (heightValue < 100 || heightValue > 250) {
      setError('Please enter a height between 100 and 250 cm');
      return;
    }

    updateOnboardingData({ height: heightValue });
    navigate('/onboarding/weight');
  };

  const heightInFeet = height ? (parseFloat(height) / 30.48).toFixed(1) : '0.0';

  return (
    <PageLayout title='Your Height' showBack={true}>
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl font-black text-slate-900 mb-2'>
            What's your height?
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            This helps us calculate your accurate calorie needs
          </p>
        </motion.div>

        <div className='space-y-6 mt-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            <Input
              label='Height'
              type='number'
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                setError('');
              }}
              placeholder='170'
              unit='cm'
              min='100'
              max='250'
              step='0.1'
            />
          </motion.div>

          {height && parseFloat(height) >= 100 && parseFloat(height) <= 250 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-green-50 border border-green-200 rounded-xl p-4'>
              <div className='flex items-center gap-2 text-green-800'>
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                <span className='font-semibold'>
                  That's approximately {heightInFeet} feet
                </span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm'>
              {error}
            </motion.div>
          )}

          {/* Common heights helper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='bg-gray-50 rounded-xl p-4'>
            <p className='text-sm text-gray-600 mb-3 font-medium'>
              Quick reference:
            </p>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <button
                onClick={() => setHeight('150')}
                className='text-left text-gray-700 hover:text-green-600 transition-colors'>
                4'11" ≈ 150 cm
              </button>
              <button
                onClick={() => setHeight('160')}
                className='text-left text-gray-700 hover:text-green-600 transition-colors'>
                5'3" ≈ 160 cm
              </button>
              <button
                onClick={() => setHeight('170')}
                className='text-left text-gray-700 hover:text-green-600 transition-colors'>
                5'7" ≈ 170 cm
              </button>
              <button
                onClick={() => setHeight('180')}
                className='text-left text-gray-700 hover:text-green-600 transition-colors'>
                5'11" ≈ 180 cm
              </button>
              <button
                onClick={() => setHeight('190')}
                className='text-left text-gray-700 hover:text-green-600 transition-colors'>
                6'3" ≈ 190 cm
              </button>
              <button
                onClick={() => setHeight('200')}
                className='text-left text-gray-700 hover:text-green-600 transition-colors'>
                6'7" ≈ 200 cm
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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
                i <= 3 ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default HeightPage;
