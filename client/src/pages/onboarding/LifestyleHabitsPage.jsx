import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cigarette, Wine, Coffee } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';

const LifestyleHabitsPage = () => {
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
  const [alcoholFrequency, setAlcoholFrequency] = useState(
    onboardingData.alcoholFrequency || null
  );
  const [drinksPerOccasion, setDrinksPerOccasion] = useState(
    onboardingData.drinksPerOccasion || ''
  );
  const [caffeineIntake, setCaffeineIntake] = useState(
    onboardingData.caffeineIntake || null
  );
  const [error, setError] = useState('');

  const smokingOptions = [
    { value: 'never', label: 'No, never' },
    { value: 'former', label: 'Former smoker' },
    { value: 'current', label: 'Yes, currently' },
  ];

  const alcoholOptions = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely (1-2 times/month)' },
    { value: 'moderate', label: 'Moderate (1-2 times/week)' },
    { value: 'regular', label: 'Regular (3+ times/week)' },
    { value: 'daily', label: 'Daily' },
  ];

  const caffeineOptions = [
    { value: 'none', label: 'None' },
    { value: 'low', label: '1-2 cups coffee/day' },
    { value: 'moderate', label: '3-4 cups coffee/day' },
    { value: 'high', label: '5+ cups coffee/day' },
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

    if (!alcoholFrequency) {
      setError('Please select your alcohol consumption frequency');
      return;
    }

    if (
      ['moderate', 'regular', 'daily'].includes(alcoholFrequency) &&
      !drinksPerOccasion
    ) {
      setError('Please enter drinks per occasion');
      return;
    }

    if (!caffeineIntake) {
      setError('Please select your caffeine intake');
      return;
    }

    updateOnboardingData({
      smokingStatus,
      cigarettesPerDay:
        smokingStatus === 'current' ? parseInt(cigarettesPerDay) : null,
      alcoholFrequency,
      drinksPerOccasion: ['moderate', 'regular', 'daily'].includes(
        alcoholFrequency
      )
        ? parseInt(drinksPerOccasion)
        : null,
      caffeineIntake,
    });

    navigate('/onboarding/environment');
  };

  return (
    <PageLayout title='Lifestyle Habits' showBack={true}>
      <div className='space-y-8 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl lg:text-4xl font-black text-slate-900 mb-3'>
            Tell us about your lifestyle
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            These habits affect your vitamin and mineral requirements
          </p>
        </motion.div>

        {/* Smoking Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Cigarette className='w-6 h-6 text-slate-600' />
              <h3 className='text-lg font-black text-slate-900'>
                Do you smoke tobacco?
              </h3>
            </div>
            <div className='space-y-3'>
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
                  className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${
                    smokingStatus === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                  }`}>
                  {option.label}
                </button>
              ))}
            </div>

            {smokingStatus === 'current' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className='mt-4'>
                <Input
                  label='How many cigarettes per day?'
                  type='number'
                  value={cigarettesPerDay}
                  onChange={(e) => {
                    setCigarettesPerDay(e.target.value);
                    setError('');
                  }}
                  placeholder='10'
                  min='1'
                  max='60'
                />
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Alcohol Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Wine className='w-6 h-6 text-slate-600' />
              <h3 className='text-lg font-black text-slate-900'>
                How often do you consume alcohol?
              </h3>
            </div>
            <div className='space-y-3'>
              {alcoholOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setAlcoholFrequency(option.value);
                    if (
                      !['moderate', 'regular', 'daily'].includes(option.value)
                    ) {
                      setDrinksPerOccasion('');
                    }
                    setError('');
                  }}
                  className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${
                    alcoholFrequency === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                  }`}>
                  {option.label}
                </button>
              ))}
            </div>

            {['moderate', 'regular', 'daily'].includes(alcoholFrequency) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className='mt-4'>
                <Input
                  label='How many drinks per occasion?'
                  type='number'
                  value={drinksPerOccasion}
                  onChange={(e) => {
                    setDrinksPerOccasion(e.target.value);
                    setError('');
                  }}
                  placeholder='2'
                  min='1'
                  max='20'
                />
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Caffeine Intake */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Coffee className='w-6 h-6 text-slate-600' />
              <h3 className='text-lg font-black text-slate-900'>
                How much caffeine do you consume daily?
              </h3>
            </div>
            <div className='space-y-3'>
              {caffeineOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setCaffeineIntake(option.value);
                    setError('');
                  }}
                  className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${
                    caffeineIntake === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                  }`}>
                  {option.label}
                </button>
              ))}
            </div>
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

        {/* Progress indicator */}
        <div className='flex justify-center gap-2 mt-12'>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= 7 ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default LifestyleHabitsPage;
