import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';

const DeficienciesPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [previousDeficiencies, setPreviousDeficiencies] = useState(
    onboardingData.previousDeficiencies || []
  );

  const deficiencyOptions = [
    'None',
    'Iron (Anemia)',
    'Vitamin D',
    'Vitamin B12',
    'Calcium',
    'Magnesium',
    'Folate',
    'Vitamin C',
  ];

  const toggleDeficiency = (def) => {
    if (def === 'None') {
      setPreviousDeficiencies(['None']);
    } else {
      setPreviousDeficiencies((prev) => {
        const filtered = prev.filter((d) => d !== 'None');
        if (filtered.includes(def)) {
          return filtered.filter((d) => d !== def);
        } else {
          return [...filtered, def];
        }
      });
    }
  };

  const handleContinue = () => {
    updateOnboardingData({
      previousDeficiencies,
    });

    navigate('/onboarding/exercise-types');
  };

  return (
    <PageLayout title='Medications & Health' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-orange-100 to-yellow-200 rounded-2xl flex items-center justify-center'>
            <AlertCircle className='w-7 h-7 text-orange-600' />
          </div>
          <h2 className='text-2xl lg:text-3xl font-black text-slate-900 mb-1.5'>
            Any previous nutrient deficiencies?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            History helps us personalize your nutrition plan
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4'>
          {deficiencyOptions.map((def) => (
            <button
              key={def}
              onClick={() => toggleDeficiency(def)}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                previousDeficiencies.includes(def)
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
              }`}>
              {def}
            </button>
          ))}
        </motion.div>

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

export default DeficienciesPage;
