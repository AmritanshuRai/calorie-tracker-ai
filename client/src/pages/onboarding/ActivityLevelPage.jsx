import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';
import { ACTIVITY_LEVELS } from '../../utils/constants';

const ActivityLevelPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );
  const calculateBMR = useUserStore((state) => state.calculateBMR);
  const calculateTDEE = useUserStore((state) => state.calculateTDEE);
  const bmr = useUserStore((state) => state.bmr);
  const tdee = useUserStore((state) => state.tdee);

  const [selectedActivity, setSelectedActivity] = useState(
    onboardingData.activityLevel || null
  );

  // Calculate BMR on mount
  useEffect(() => {
    if (
      onboardingData.gender &&
      onboardingData.age &&
      onboardingData.currentWeight
    ) {
      calculateBMR();
    }
  }, [onboardingData, calculateBMR]);

  // Calculate TDEE when activity level changes
  useEffect(() => {
    if (selectedActivity && bmr) {
      const level = ACTIVITY_LEVELS.find((l) => l.id === selectedActivity);
      if (level) {
        updateOnboardingData({
          activityLevel: selectedActivity,
          activityMultiplier: level.multiplier,
        });
        calculateTDEE();
      }
    }
  }, [selectedActivity, bmr, calculateTDEE, updateOnboardingData]);

  const handleSelect = (activityId) => {
    setSelectedActivity(activityId);
  };

  const handleContinue = () => {
    if (!selectedActivity) {
      alert('Please select an activity level');
      return;
    }
    navigate('/onboarding/final');
  };

  return (
    <PageLayout title='Activity Level' showBack={true}>
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            What's your activity level?
          </h2>
          <p className='text-gray-600'>This affects your daily calorie needs</p>
        </motion.div>

        <div className='space-y-3 mt-8'>
          {ACTIVITY_LEVELS.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}>
              <Card
                hoverable
                onClick={() => handleSelect(level.id)}
                className={`cursor-pointer transition-all ${
                  selectedActivity === level.id
                    ? 'border-2 border-green-500 bg-green-50'
                    : 'border-2 border-transparent hover:border-green-300'
                }`}
                padding='p-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedActivity === level.id
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                    {selectedActivity === level.id && (
                      <svg
                        className='w-4 h-4 text-white'
                        fill='currentColor'
                        viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-gray-800'>
                        {level.label}
                      </h3>
                      <span className='text-sm text-gray-500 font-mono'>
                        {level.multiplier}x
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>{level.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* BMR and TDEE Display */}
        {bmr && tdee && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='mt-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200'>
            <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-green-600'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                  clipRule='evenodd'
                />
              </svg>
              Your Calculations
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-700'>
                  BMR (Basal Metabolic Rate)
                </span>
                <span className='text-xl font-bold text-gray-900'>
                  {bmr.toLocaleString()} kcal
                </span>
              </div>
              {selectedActivity && (
                <>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-700'>Activity Multiplier</span>
                    <span className='text-xl font-bold text-green-600'>
                      {
                        ACTIVITY_LEVELS.find((l) => l.id === selectedActivity)
                          ?.multiplier
                      }
                      x
                    </span>
                  </div>
                  <div className='h-px bg-gray-300'></div>
                  <div className='flex justify-between items-center pt-2'>
                    <span className='text-gray-800 font-semibold'>
                      TDEE (Total Daily Energy)
                    </span>
                    <span className='text-2xl font-bold text-green-600'>
                      {tdee.toLocaleString()} kcal/day
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-8'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleContinue}
            disabled={!selectedActivity}>
            Continue →
          </Button>
        </motion.div>

        {/* Progress indicator */}
        <div className='flex justify-center gap-2 mt-8'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= 6 ? 'w-8 bg-green-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ActivityLevelPage;
