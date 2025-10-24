import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, X } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import useUserStore from '../../stores/useUserStore';

const COMMON_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'high_blood_pressure', label: 'High Blood Pressure' },
  { id: 'high_cholesterol', label: 'High Cholesterol' },
  { id: 'fatty_liver', label: 'Fatty Liver' },
  { id: 'thyroid', label: 'Thyroid Issues' },
  { id: 'pcos', label: 'PCOS' },
  { id: 'heart_disease', label: 'Heart Disease' },
  { id: 'kidney_disease', label: 'Kidney Disease' },
  { id: 'gout', label: 'Gout' },
  { id: 'ibs', label: 'IBS / Digestive Issues' },
  { id: 'food_allergies', label: 'Food Allergies' },
  { id: 'none', label: 'None' },
];

const HealthConditionsPage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [selectedConditions, setSelectedConditions] = useState(
    onboardingData.healthConditions || []
  );
  const [customCondition, setCustomCondition] = useState('');
  const [customConditions, setCustomConditions] = useState(
    onboardingData.customHealthConditions || []
  );

  const handleToggleCondition = (conditionId) => {
    if (conditionId === 'none') {
      setSelectedConditions(['none']);
      setCustomConditions([]);
    } else {
      setSelectedConditions((prev) => {
        const filtered = prev.filter((id) => id !== 'none');
        if (filtered.includes(conditionId)) {
          return filtered.filter((id) => id !== conditionId);
        }
        return [...filtered, conditionId];
      });
    }
  };

  const handleAddCustomCondition = () => {
    if (customCondition.trim()) {
      setCustomConditions([...customConditions, customCondition.trim()]);
      setCustomCondition('');
      // Remove 'none' if adding a custom condition
      setSelectedConditions((prev) => prev.filter((id) => id !== 'none'));
    }
  };

  const handleRemoveCustomCondition = (index) => {
    setCustomConditions(customConditions.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    updateOnboardingData({
      healthConditions: selectedConditions,
      customHealthConditions: customConditions,
    });
    navigate('/onboarding/final');
  };

  const hasNone = selectedConditions.includes('none');
  const canContinue =
    hasNone || selectedConditions.length > 0 || customConditions.length > 0;

  return (
    <PageLayout title='Health Conditions' showBack={true}>
      <div className='space-y-8 max-w-3xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center'>
            <Heart className='w-10 h-10 text-red-600' />
          </div>
          <h2 className='text-4xl max-lg:text-3xl font-black text-slate-900 mb-3'>
            Any health conditions we should know?
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            This helps us personalize your nutrition plan
          </p>
        </motion.div>

        {/* Common Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mt-12'>
          <h3 className='text-lg font-black text-slate-900 mb-4'>
            Common Conditions
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {COMMON_CONDITIONS.map((condition, index) => (
              <motion.button
                key={condition.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleToggleCondition(condition.id)}
                disabled={hasNone && condition.id !== 'none'}
                className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                  selectedConditions.includes(condition.id)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : hasNone && condition.id !== 'none'
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50'
                }`}>
                {condition.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Custom Conditions */}
        {!hasNone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>
            <Card padding='lg' variant='default'>
              <h3 className='text-lg font-black text-slate-900 mb-4'>
                Other Conditions
              </h3>

              {/* Custom conditions list */}
              {customConditions.length > 0 && (
                <div className='space-y-2 mb-4'>
                  {customConditions.map((condition, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg'>
                      <span className='text-sm font-bold text-emerald-900'>
                        {condition}
                      </span>
                      <button
                        onClick={() => handleRemoveCustomCondition(index)}
                        className='w-6 h-6 flex items-center justify-center rounded-full bg-emerald-200 hover:bg-emerald-300 transition-colors'>
                        <X className='w-4 h-4 text-emerald-900' />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add custom condition */}
              <div className='flex gap-3'>
                <div className='flex-1'>
                  <Input
                    placeholder='e.g., Lactose intolerance'
                    value={customCondition}
                    onChange={(e) => setCustomCondition(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomCondition();
                      }
                    }}
                  />
                </div>
                <Button
                  variant='outline'
                  onClick={handleAddCustomCondition}
                  disabled={!customCondition.trim()}>
                  <Plus className='w-5 h-5' />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Info message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}>
          <Card
            padding='lg'
            variant='default'
            className='bg-blue-50 border-blue-200'>
            <p className='text-sm font-medium text-blue-900 text-center'>
              💡 This information helps us provide safer, personalized
              recommendations
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-12 pt-4'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleContinue}
            disabled={!canContinue}>
            Continue →
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default HealthConditionsPage;
