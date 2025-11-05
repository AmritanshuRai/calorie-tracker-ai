import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Apple, Ban, Drumstick, CakeSlice } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';

const DIET_PREFERENCES = [
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Mix of all food groups for overall health',
    icon: Scale,
    color: 'blue',
  },
  {
    id: 'keto',
    label: 'Keto',
    description: 'Very low carb, high fat for ketosis',
    icon: Apple,
    color: 'green',
  },
  {
    id: 'low_carb',
    label: 'Low Carb',
    description: 'Reduced carbohydrates, higher protein',
    icon: Ban,
    color: 'red',
  },
  {
    id: 'high_protein',
    label: 'High Protein',
    description: 'Increased protein for muscle building',
    icon: Drumstick,
    color: 'amber',
  },
  {
    id: 'low_fat',
    label: 'Low Fat',
    description: 'Reduced fat intake, higher carbs',
    icon: CakeSlice,
    color: 'pink',
  },
];

const DietPreferencePage = () => {
  const navigate = useNavigate();
  const onboardingData = useUserStore((state) => state.onboardingData);
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const [selectedDiet, setSelectedDiet] = useState(
    onboardingData.dietPreference || null
  );

  const handleSelect = (dietId) => {
    setSelectedDiet(dietId);
  };

  const handleContinue = () => {
    if (!selectedDiet) {
      alert('Please select a diet preference');
      return;
    }
    updateOnboardingData({ dietPreference: selectedDiet });
    navigate('/onboarding/health-conditions');
  };

  return (
    <PageLayout title='Diet Preference' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-3 max-w-3xl mx-auto overflow-y-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center flex-shrink-0'>
          <div className='w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center'>
            <Apple className='w-7 h-7 text-emerald-600' />
          </div>
          <h2 className='text-2xl lg:text-3xl font-black text-slate-900 mb-1.5'>
            What kind of diet do you prefer?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            Choose a dietary approach that suits your lifestyle
          </p>
        </motion.div>

        <div className='space-y-2 mt-3 max-w-2xl mx-auto w-full'>
          {DIET_PREFERENCES.map((diet, index) => {
            const Icon = diet.icon;
            return (
              <motion.div
                key={diet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}>
                <button
                  onClick={() => handleSelect(diet.id)}
                  className='w-full text-left'>
                  <Card
                    padding='sm'
                    variant='default'
                    className={`transition-all duration-200 ${
                      selectedDiet === diet.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'hover:border-emerald-300'
                    }`}>
                    <div className='flex items-center gap-3 py-1'>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          selectedDiet === diet.id
                            ? 'bg-emerald-100'
                            : 'bg-slate-100'
                        }`}>
                        <Icon
                          className={`w-5 h-5 ${
                            selectedDiet === diet.id
                              ? 'text-emerald-600'
                              : 'text-slate-600'
                          }`}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base font-black text-slate-900 mb-0.5'>
                          {diet.label}
                        </h3>
                        <p className='text-xs font-medium text-slate-600'>
                          {diet.description}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selectedDiet === diet.id
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300'
                        }`}>
                        {selectedDiet === diet.id && (
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
                    </div>
                  </Card>
                </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-3 pt-2 flex-shrink-0'>
          <Button
            variant='primary'
            size='md'
            fullWidth
            onClick={handleContinue}
            disabled={!selectedDiet}>
            Continue →
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default DietPreferencePage;
