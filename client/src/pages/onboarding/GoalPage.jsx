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
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'>
          <h2 className='text-3xl font-black text-slate-900 mb-2'>
            What's your main goal?
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            We'll personalize your calorie target based on this
          </p>
        </motion.div>

        <div className='space-y-4 mt-12'>
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
                  padding='md'
                  variant='default'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='w-14 h-14 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center'>
                        <Icon className='w-7 h-7 text-slate-700' />
                      </div>
                      <div className='text-left'>
                        <h3 className='text-xl font-black text-slate-900'>
                          {goal.label}
                        </h3>
                        <p className='text-sm font-medium text-slate-600'>
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className='w-6 h-6 text-slate-400' />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className='flex justify-center gap-2 mt-12'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= 2 ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default GoalPage;
