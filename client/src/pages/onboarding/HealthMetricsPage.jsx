import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Brain, Droplets } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';

const HealthMetricsPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [sleepHours, setSleepHours] = useState(onboardingData.sleepHours || '');
  const [stressLevel, setStressLevel] = useState(
    onboardingData.stressLevel || null
  );
  const [waterIntake, setWaterIntake] = useState(
    onboardingData.waterIntake || ''
  );
  const [error, setError] = useState('');

  const stressLevelOptions = [
    {
      value: 'low',
      label: 'Low',
      description: 'Life is calm',
      emoji: '😊',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: 'Some stressful days',
      emoji: '😐',
    },
    {
      value: 'high',
      label: 'High',
      description: 'Often stressed',
      emoji: '😰',
    },
    {
      value: 'severe',
      label: 'Very High',
      description: 'Constantly stressed',
      emoji: '😫',
    },
  ];

  const handleContinue = () => {
    const sleepValue = parseFloat(sleepHours);
    const waterValue = parseFloat(waterIntake);

    if (!sleepHours || isNaN(sleepValue) || sleepValue < 3 || sleepValue > 12) {
      setError('Please enter valid sleep hours (3-12 hours)');
      return;
    }

    if (!stressLevel) {
      setError('Please select your stress level');
      return;
    }

    if (
      !waterIntake ||
      isNaN(waterValue) ||
      waterValue < 0.5 ||
      waterValue > 8
    ) {
      setError('Please enter valid water intake (0.5-8 liters)');
      return;
    }

    updateOnboardingData({
      sleepHours: sleepValue,
      stressLevel,
      waterIntake: waterValue,
    });

    navigate('/onboarding/medications');
  };

  return (
    <PageLayout title='Health Metrics' showBack={true}>
      <div className='space-y-8 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl lg:text-4xl font-black text-slate-900 mb-3'>
            Daily health habits
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            Sleep, stress, and hydration affect your nutritional needs
          </p>
        </motion.div>

        {/* Sleep Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Moon className='w-6 h-6 text-indigo-600' />
              <h3 className='text-lg font-black text-slate-900'>
                How many hours do you sleep per night?
              </h3>
            </div>
            <Input
              type='number'
              value={sleepHours}
              onChange={(e) => {
                setSleepHours(e.target.value);
                setError('');
              }}
              placeholder='7.5'
              unit='hours'
              min='3'
              max='12'
              step='0.5'
            />
            {sleepHours &&
              parseFloat(sleepHours) >= 7 &&
              parseFloat(sleepHours) <= 9 && (
                <div className='mt-3 bg-green-50 border border-green-200 rounded-xl p-3'>
                  <p className='text-sm font-bold text-green-800 text-center'>
                    ✓ Optimal sleep duration for adults
                  </p>
                </div>
              )}
          </Card>
        </motion.div>

        {/* Stress Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Brain className='w-6 h-6 text-purple-600' />
              <h3 className='text-lg font-black text-slate-900'>
                How would you rate your stress level?
              </h3>
            </div>
            <div className='space-y-3'>
              {stressLevelOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStressLevel(option.value);
                    setError('');
                  }}
                  className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${
                    stressLevel === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                  }`}>
                  <div className='flex items-center gap-3'>
                    <span className='text-3xl'>{option.emoji}</span>
                    <div className='flex-1'>
                      <div className='text-base'>{option.label}</div>
                      <div className='text-sm font-medium text-slate-600'>
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Water Intake */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Droplets className='w-6 h-6 text-blue-600' />
              <h3 className='text-lg font-black text-slate-900'>
                How much water do you drink daily?
              </h3>
            </div>
            <Input
              type='number'
              value={waterIntake}
              onChange={(e) => {
                setWaterIntake(e.target.value);
                setError('');
              }}
              placeholder='2.5'
              unit='liters'
              min='0.5'
              max='8'
              step='0.1'
            />
            {waterIntake &&
              parseFloat(waterIntake) >= 2 &&
              parseFloat(waterIntake) <= 3.5 && (
                <div className='mt-3 bg-green-50 border border-green-200 rounded-xl p-3'>
                  <p className='text-sm font-bold text-green-800 text-center'>
                    ✓ Good hydration level
                  </p>
                </div>
              )}
          </Card>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-red-50 border-2 border-red-300 rounded-xl p-4'>
            <p className='text-sm font-bold text-red-800 text-center'>
              {error}
            </p>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-12 pt-4'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleContinue}>
            Continue →
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default HealthMetricsPage;
