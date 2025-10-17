import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';
import { GOALS } from '../../utils/constants';

const GoalPage = () => {
  const navigate = useNavigate();
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const handleSelect = (goalId) => {
    updateOnboardingData({ goal: goalId });
    navigate('/onboarding/height');
  };

  return (
    <PageLayout title='Your Goal' showBack={true}>
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            What's your main goal?
          </h2>
          <p className='text-gray-600'>
            We'll personalize your calorie target based on this
          </p>
        </motion.div>

        <div className='space-y-4 mt-12'>
          {GOALS.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}>
              <Card
                hoverable
                onClick={() => handleSelect(goal.id)}
                className='cursor-pointer hover:border-green-500 transition-all'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-5xl'>{goal.emoji}</span>
                    <div className='text-left'>
                      <h3 className='text-xl font-semibold text-gray-800'>
                        {goal.label}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {goal.description}
                      </p>
                    </div>
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
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= 2 ? 'w-8 bg-green-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default GoalPage;
