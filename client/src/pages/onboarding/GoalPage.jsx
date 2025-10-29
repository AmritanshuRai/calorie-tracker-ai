import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, Heart, TrendingUp, ChevronRight } from 'lucide-react';
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

  const goalIcons = {
    weight_loss: TrendingDown,
    improved_health: Heart,
    weight_gain: TrendingUp,
  };

  return (
    <PageLayout title='Your Goal' showBack={true}>
      <div className='h-full flex flex-col justify-center space-y-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-xl sm:text-2xl font-black text-slate-900 mb-1.5'>
            What's your main goal?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            We'll personalize your calorie target based on this
          </p>
        </motion.div>

        <div className='space-y-3 mt-4'>
          {GOALS.map((goal, index) => {
            const Icon = goalIcons[goal.id];
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}>
                <Card
                  hoverable
                  onClick={() => handleSelect(goal.id)}
                  padding='sm'
                  variant='default'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center'>
                        <Icon className='w-6 h-6 text-slate-700' />
                      </div>
                      <div className='text-left'>
                        <h3 className='text-lg font-black text-slate-900'>
                          {goal.label}
                        </h3>
                        <p className='text-xs font-medium text-slate-600'>
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className='w-5 h-5 text-slate-400' />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default GoalPage;
