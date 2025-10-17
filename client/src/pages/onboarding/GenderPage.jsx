import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';

const GenderPage = () => {
  const navigate = useNavigate();
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const handleSelect = (gender) => {
    updateOnboardingData({ gender });
    navigate('/onboarding/age');
  };

  const options = [
    { value: 'male', label: 'Male', emoji: '♂️' },
    { value: 'female', label: 'Female', emoji: '♀️' },
  ];

  return (
    <PageLayout title='Welcome!' showBack={false}>
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            What's your gender?
          </h2>
          <p className='text-gray-600'>
            This helps us calculate your personalized calorie needs
          </p>
        </motion.div>

        <div className='space-y-4 mt-12'>
          {options.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}>
              <Card
                hoverable
                onClick={() => handleSelect(option.value)}
                className='cursor-pointer hover:border-green-500 transition-all'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-5xl'>{option.emoji}</span>
                    <span className='text-2xl font-semibold text-gray-800'>
                      {option.label}
                    </span>
                  </div>
                  <svg
                    className='w-6 h-6 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className='flex justify-center gap-2 mt-12'>
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === 0 ? 'w-8 bg-green-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default GenderPage;
