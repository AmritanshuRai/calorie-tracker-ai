import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, AlertCircle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';

const MedicationsPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [medications, setMedications] = useState(
    onboardingData.medications || []
  );
  const [previousDeficiencies, setPreviousDeficiencies] = useState(
    onboardingData.previousDeficiencies || []
  );

  const medicationOptions = [
    'Birth control pills',
    'Antacids',
    'Blood pressure medication',
    'Diabetes medication',
    'Thyroid medication',
    'Antidepressants',
    'Steroids',
    'Proton pump inhibitors (PPIs)',
    'Metformin',
    'Diuretics',
    'None of the above',
  ];

  const deficiencyOptions = [
    'Iron deficiency (Anemia)',
    'Vitamin D deficiency',
    'Vitamin B12 deficiency',
    'Calcium deficiency',
    'Folate deficiency',
    'Magnesium deficiency',
    'Zinc deficiency',
    'None that I know of',
  ];

  const toggleMedication = (medication) => {
    if (medication === 'None of the above') {
      setMedications(['None of the above']);
    } else {
      const filtered = medications.filter((m) => m !== 'None of the above');
      if (filtered.includes(medication)) {
        setMedications(filtered.filter((m) => m !== medication));
      } else {
        setMedications([...filtered, medication]);
      }
    }
  };

  const toggleDeficiency = (deficiency) => {
    if (deficiency === 'None that I know of') {
      setPreviousDeficiencies(['None that I know of']);
    } else {
      const filtered = previousDeficiencies.filter(
        (d) => d !== 'None that I know of'
      );
      if (filtered.includes(deficiency)) {
        setPreviousDeficiencies(filtered.filter((d) => d !== deficiency));
      } else {
        setPreviousDeficiencies([...filtered, deficiency]);
      }
    }
  };

  const handleContinue = () => {
    updateOnboardingData({
      medications:
        medications.length === 0 ? ['None of the above'] : medications,
      previousDeficiencies:
        previousDeficiencies.length === 0
          ? ['None that I know of']
          : previousDeficiencies,
    });

    navigate('/onboarding/exercise-details');
  };

  const hasNoneMedications = medications.includes('None of the above');
  const hasNoneDeficiencies = previousDeficiencies.includes(
    'None that I know of'
  );

  return (
    <PageLayout title='Medications' showBack={true}>
      <div className='space-y-8 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl lg:text-4xl font-black text-slate-900 mb-3'>
            Medications & deficiencies
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            Some medications affect nutrient absorption
          </p>
        </motion.div>

        {/* Medications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <Pill className='w-6 h-6 text-blue-600' />
              <h3 className='text-lg font-black text-slate-900'>
                Are you taking any of these medications regularly?
              </h3>
            </div>
            <div className='space-y-2'>
              {medicationOptions.map((medication) => (
                <button
                  key={medication}
                  onClick={() => toggleMedication(medication)}
                  disabled={
                    hasNoneMedications && medication !== 'None of the above'
                  }
                  className={`w-full p-3 rounded-xl border-2 font-medium text-left transition-all ${
                    medications.includes(medication)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : hasNoneMedications && medication !== 'None of the above'
                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300'
                  }`}>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        medications.includes(medication)
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-400'
                      }`}>
                      {medications.includes(medication) && (
                        <svg
                          className='w-3 h-3 text-white'
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
                    <span className='text-sm'>{medication}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Previous Deficiencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card padding='lg' variant='default'>
            <div className='flex items-center gap-3 mb-4'>
              <AlertCircle className='w-6 h-6 text-orange-600' />
              <h3 className='text-lg font-black text-slate-900'>
                Have you been diagnosed with any deficiencies?
              </h3>
            </div>
            <div className='space-y-2'>
              {deficiencyOptions.map((deficiency) => (
                <button
                  key={deficiency}
                  onClick={() => toggleDeficiency(deficiency)}
                  disabled={
                    hasNoneDeficiencies && deficiency !== 'None that I know of'
                  }
                  className={`w-full p-3 rounded-xl border-2 font-medium text-left transition-all ${
                    previousDeficiencies.includes(deficiency)
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : hasNoneDeficiencies &&
                        deficiency !== 'None that I know of'
                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-orange-300'
                  }`}>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        previousDeficiencies.includes(deficiency)
                          ? 'border-orange-600 bg-orange-600'
                          : 'border-slate-400'
                      }`}>
                      {previousDeficiencies.includes(deficiency) && (
                        <svg
                          className='w-3 h-3 text-white'
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
                    <span className='text-sm'>{deficiency}</span>
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
          transition={{ delay: 0.3 }}>
          <Card
            padding='lg'
            variant='default'
            className='bg-blue-50 border-blue-200'>
            <p className='text-sm font-medium text-blue-900 text-center'>
              💡 Certain medications can interfere with nutrient absorption.
              We'll adjust your targets accordingly
            </p>
          </Card>
        </motion.div>

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

export default MedicationsPage;
