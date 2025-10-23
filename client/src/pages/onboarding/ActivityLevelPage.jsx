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

    // Route based on gender
    if (onboardingData.gender === 'female') {
      navigate('/onboarding/pregnancy-status');
    } else {
      navigate('/onboarding/smoking-status');
    }
  };

  return (
    <PageLayout title='Activity Level' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-2 w-full max-w-3xl mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center flex-shrink-0'>
          <h2 className='text-xl lg:text-2xl font-black text-slate-900 mb-1'>
            What's your activity level?
          </h2>
          <p className='text-sm font-medium text-slate-600'>
            This affects your daily calorie needs
          </p>
        </motion.div>

        <div className='space-y-1.5 mt-2 flex-1 overflow-y-auto'>
          {ACTIVITY_LEVELS.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}>
              <button
                onClick={() => handleSelect(level.id)}
                className={`w-full text-left transition-all duration-200 ${
                  selectedActivity === level.id
                    ? 'scale-[1.01]'
                    : 'hover:scale-[1.005]'
                }`}>
                <Card
                  padding='sm'
                  variant='default'
                  className={`transition-all duration-200 ${
                    selectedActivity === level.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                      : 'hover:border-emerald-300 hover:shadow-md'
                  }`}>
                  <div className='flex items-center justify-between gap-3 py-1'>
                    <div className='flex items-center gap-2 flex-1'>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selectedActivity === level.id
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300'
                        }`}>
                        {selectedActivity === level.id && (
                          <svg
                            className='w-2.5 h-2.5 text-white'
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
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-sm font-black text-slate-900 leading-tight'>
                          {level.label}
                        </h3>
                        <p className='text-xs font-medium text-slate-600 leading-tight'>
                          {level.description}
                        </p>
                      </div>
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <span className='text-base font-black text-slate-900 font-mono'>
                        {level.multiplier}x
                      </span>
                    </div>
                  </div>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>

        {/* BMR and TDEE Display */}
        {bmr && tdee && selectedActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='mt-2 flex-shrink-0'>
            <Card padding='sm' variant='gradient'>
              <h3 className='text-xs font-black text-white mb-2'>
                Your Daily Energy
              </h3>
              <div className='space-y-1.5'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs font-bold text-white/80'>
                    BMR (Basal Metabolic Rate)
                  </span>
                  <span className='text-sm font-black text-white'>
                    {bmr.toLocaleString()} kcal
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-xs font-bold text-white/80'>
                    Activity Multiplier
                  </span>
                  <span className='text-sm font-black text-white'>
                    {
                      ACTIVITY_LEVELS.find((l) => l.id === selectedActivity)
                        ?.multiplier
                    }
                    x
                  </span>
                </div>
                <div className='h-px bg-white/30 my-0.5'></div>
                <div className='flex justify-between items-center pt-0.5'>
                  <span className='text-xs font-black text-white'>
                    TDEE (Total Daily Energy)
                  </span>
                  <span className='text-lg font-black text-white'>
                    {tdee.toLocaleString()}
                  </span>
                </div>
                <p className='text-xs font-medium text-white/70 text-center pt-0.5'>
                  kcal/day
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-2 pt-1 flex-shrink-0'>
          <Button
            variant='primary'
            size='md'
            fullWidth
            onClick={handleContinue}
            disabled={!selectedActivity}>
            Continue →
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ActivityLevelPage;
