import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import useUserStore from '../../stores/useUserStore';

const MedicationsListPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [medications, setMedications] = useState(
    onboardingData.medications || []
  );

  const medicationOptions = [
    'None',
    'Birth control pills',
    'Antibiotics (regular)',
    'Antacids/PPIs',
    'Diabetes medications',
    'Blood pressure medications',
    'Cholesterol medications',
    'Thyroid medications',
    'Corticosteroids',
    'Diuretics',
    'Antidepressants',
  ];

  const toggleMedication = (med) => {
    if (med === 'None') {
      setMedications(['None']);
    } else {
      setMedications((prev) => {
        const filtered = prev.filter((m) => m !== 'None');
        if (filtered.includes(med)) {
          return filtered.filter((m) => m !== med);
        } else {
          return [...filtered, med];
        }
      });
    }
  };

  const handleContinue = () => {
    updateOnboardingData({
      medications,
    });

    navigate('/onboarding/deficiencies');
  };

  return (
    <PageLayout title='Medications & Health' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center'>
            <Pill className='w-7 h-7 text-red-600' />
          </div>
          <h2 className='text-2xl lg:text-3xl font-black text-slate-900 mb-1.5'>
            Are you taking any medications?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Medications can affect nutrient absorption and needs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='space-y-2 mt-4 max-h-[50vh] overflow-y-auto'>
          {medicationOptions.map((med) => (
            <button
              key={med}
              onClick={() => toggleMedication(med)}
              className={`w-full p-3 rounded-xl border-2 font-bold text-left transition-all ${
                medications.includes(med)
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
              }`}>
              {med}
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

export default MedicationsListPage;
