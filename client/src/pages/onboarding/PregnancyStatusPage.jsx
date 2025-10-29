import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Heart } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';

const PregnancyStatusPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [pregnancyStatus, setPregnancyStatus] = useState(
    onboardingData.pregnancyStatus || null
  );
  const [trimester, setTrimester] = useState(onboardingData.trimester || null);
  const [menstrualCycle, setMenstrualCycle] = useState(
    onboardingData.menstrualCycle || null
  );
  const [error, setError] = useState('');

  const pregnancyOptions = [
    { value: 'none', label: 'Neither', icon: '👤' },
    { value: 'pregnant', label: 'Pregnant', icon: '🤰' },
    { value: 'lactating', label: 'Breastfeeding', icon: '🤱' },
    { value: 'both', label: 'Pregnant & Planning to Breastfeed', icon: '👶' },
  ];

  const trimesterOptions = [
    { value: 'first', label: 'First Trimester (0-12 weeks)' },
    { value: 'second', label: 'Second Trimester (13-26 weeks)' },
    { value: 'third', label: 'Third Trimester (27-40 weeks)' },
  ];

  const menstrualOptions = [
    { value: 'regular', label: 'Regular cycle' },
    { value: 'heavy', label: 'Heavy flow' },
    { value: 'irregular', label: 'Irregular cycle' },
    { value: 'none', label: 'No periods (menopause/other)' },
  ];

  const handleContinue = () => {
    if (!pregnancyStatus) {
      setError('Please select your pregnancy/lactation status');
      return;
    }

    if (['pregnant', 'both'].includes(pregnancyStatus) && !trimester) {
      setError('Please select which trimester you are in');
      return;
    }

    if (pregnancyStatus === 'none' && !menstrualCycle) {
      setError('Please select your menstrual cycle pattern');
      return;
    }

    updateOnboardingData({
      pregnancyStatus,
      trimester: ['pregnant', 'both'].includes(pregnancyStatus)
        ? trimester
        : null,
      menstrualCycle: pregnancyStatus === 'none' ? menstrualCycle : null,
    });

    navigate('/onboarding/smoking-status');
  };

  return (
    <PageLayout title='Pregnancy Status' showBack={true}>
      <div className='space-y-8 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center'>
            <Baby className='w-10 h-10 text-pink-600' />
          </div>
          <h2 className='text-3xl lg:text-4xl font-black text-slate-900 mb-3'>
            Are you currently pregnant or breastfeeding?
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            This significantly affects your nutritional needs
          </p>
        </motion.div>

        {/* Pregnancy Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {pregnancyOptions.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setPregnancyStatus(option.value);
                  if (option.value !== 'none') {
                    setMenstrualCycle(null);
                  }
                  if (!['pregnant', 'both'].includes(option.value)) {
                    setTrimester(null);
                  }
                  setError('');
                }}
                className='group'>
                <Card
                  padding='lg'
                  variant='default'
                  className={`transition-all duration-200 ${
                    pregnancyStatus === option.value
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                      : 'hover:border-emerald-300 hover:shadow-md'
                  }`}>
                  <div className='flex flex-col items-center text-center gap-4 py-4'>
                    <div className='text-5xl'>{option.icon}</div>
                    <h3 className='text-lg font-black text-slate-900'>
                      {option.label}
                    </h3>
                  </div>
                </Card>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Trimester Selection (if pregnant) */}
        {['pregnant', 'both'].includes(pregnancyStatus) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}>
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-3 mb-4'>
                <Heart className='w-6 h-6 text-pink-600' />
                <h3 className='text-lg font-black text-slate-900'>
                  Which trimester are you in?
                </h3>
              </div>
              <div className='space-y-3'>
                {trimesterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTrimester(option.value);
                      setError('');
                    }}
                    className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${
                      trimester === option.value
                        ? 'border-pink-500 bg-pink-50 text-pink-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-pink-300'
                    }`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Menstrual Cycle (if not pregnant/lactating) */}
        {pregnancyStatus === 'none' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}>
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-3 mb-4'>
                <Heart className='w-6 h-6 text-slate-600' />
                <h3 className='text-lg font-black text-slate-900'>
                  How would you describe your menstrual cycle?
                </h3>
              </div>
              <div className='space-y-3'>
                {menstrualOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setMenstrualCycle(option.value);
                      setError('');
                    }}
                    className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${
                      menstrualCycle === option.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                    }`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}>
          <Card
            padding='lg'
            variant='default'
            className='bg-blue-50 border-blue-200'>
            <p className='text-sm font-medium text-blue-900 text-center'>
              💡 Pregnancy and lactation significantly increase your needs for
              iron, folate, calcium, and other nutrients
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

export default PregnancyStatusPage;
