import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Cloud, Palette } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';

const EnvironmentPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [sunExposure, setSunExposure] = useState(
    onboardingData.sunExposure || null
  );
  const [climate, setClimate] = useState(onboardingData.climate || null);
  const [skinTone, setSkinTone] = useState(onboardingData.skinTone || null);
  const [error, setError] = useState('');

  const sunExposureOptions = [
    {
      value: 'minimal',
      label: 'Minimal',
      description: 'Less than 15 min/day (office job)',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: '15-30 min/day',
    },
    {
      value: 'adequate',
      label: 'Adequate',
      description: '30-60 min/day',
    },
    {
      value: 'high',
      label: 'High',
      description: 'More than 1 hour/day',
    },
  ];

  const climateOptions = [
    { value: 'hot_humid', label: 'Hot & Humid', icon: '🌴' },
    { value: 'hot_dry', label: 'Hot & Dry', icon: '🏜️' },
    { value: 'moderate', label: 'Moderate', icon: '🌤️' },
    { value: 'cold', label: 'Cold', icon: '❄️' },
    { value: 'very_cold', label: 'Very Cold', icon: '🥶' },
  ];

  const skinToneOptions = [
    { value: 'very_fair', label: 'Very Fair', color: '#FFE4C4' },
    { value: 'fair', label: 'Fair', color: '#F4D5B7' },
    { value: 'medium', label: 'Medium', color: '#E8BE9D' },
    { value: 'olive', label: 'Olive', color: '#D1A684' },
    { value: 'brown', label: 'Brown', color: '#A67C5B' },
    { value: 'dark_brown', label: 'Dark Brown', color: '#7B5030' },
    { value: 'very_dark', label: 'Very Dark', color: '#5C4033' },
  ];

  const handleContinue = () => {
    if (!sunExposure) {
      setError('Please select your sun exposure level');
      return;
    }

    if (!climate) {
      setError('Please select your climate');
      return;
    }

    if (!skinTone) {
      setError('Please select your skin tone');
      return;
    }

    updateOnboardingData({
      sunExposure,
      climate,
      skinTone,
    });

    navigate('/onboarding/health-metrics');
  };

  return (
    <PageLayout title='Environment' showBack={true}>
      <div className='space-y-8 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl lg:text-4xl font-black text-slate-900 mb-3'>
            About your environment
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            Sun exposure and climate affect vitamin D and mineral needs
          </p>
        </motion.div>

        {/* Sun Exposure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Sun className='w-6 h-6 text-yellow-600' />
              <h3 className='text-lg font-black text-slate-900'>
                How much time do you spend outdoors in sunlight?
              </h3>
            </div>
            <div className='space-y-3'>
              {sunExposureOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSunExposure(option.value);
                    setError('');
                  }}
                  className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${
                    sunExposure === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                  }`}>
                  <div className='flex flex-col'>
                    <span className='text-base'>{option.label}</span>
                    <span className='text-sm font-medium text-slate-600 mt-1'>
                      {option.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Climate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Cloud className='w-6 h-6 text-slate-600' />
              <h3 className='text-lg font-black text-slate-900'>
                What climate do you live in?
              </h3>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
              {climateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setClimate(option.value);
                    setError('');
                  }}
                  className={`p-4 rounded-xl border-2 font-bold transition-all ${
                    climate === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                  }`}>
                  <div className='flex flex-col items-center gap-2'>
                    <span className='text-3xl'>{option.icon}</span>
                    <span className='text-sm'>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Skin Tone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Palette className='w-6 h-6 text-slate-600' />
              <h3 className='text-lg font-black text-slate-900'>
                What is your skin tone?
              </h3>
              <p className='text-xs font-medium text-slate-500 ml-auto'>
                Affects vitamin D synthesis
              </p>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              {skinToneOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSkinTone(option.value);
                    setError('');
                  }}
                  className={`p-4 rounded-xl border-2 font-bold transition-all ${
                    skinTone === option.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-300 bg-white hover:border-emerald-300'
                  }`}>
                  <div className='flex flex-col items-center gap-2'>
                    <div
                      className='w-12 h-12 rounded-full border-2 border-slate-200'
                      style={{ backgroundColor: option.color }}
                    />
                    <span className='text-xs text-slate-900'>
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}>
          <Card
            padding='lg'
            variant='default'
            className='bg-blue-50 border-blue-200'>
            <p className='text-sm font-medium text-blue-900 text-center'>
              💡 Darker skin tones and less sun exposure increase vitamin D
              requirements
            </p>
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
          transition={{ delay: 0.5 }}
          className='mt-12 pt-4'>
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
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= 8 ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default EnvironmentPage;
