import { useNavigate } from 'react-router-dom';
import { User, UserCircle2 } from 'lucide-react';
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
    {
      value: 'male',
      label: 'Male',
      icon: User,
    },
    {
      value: 'female',
      label: 'Female',
      icon: UserCircle2,
    },
  ];

  return (
    <PageLayout title='Welcome!' showBack={false}>
      <div className='space-y-8 max-w-2xl mx-auto'>
        <div className='text-center'>
          <h2 className='text-3xl lg:text-4xl font-black text-slate-900 mb-3'>
            What's your gender?
          </h2>
          <p className='text-lg font-medium text-slate-600'>
            This helps us calculate your personalized calorie needs
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12'>
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.value}
                hoverable
                onClick={() => handleSelect(option.value)}
                padding='lg'
                variant='default'
                className='group'>
                <div className='flex flex-col items-center text-center gap-4 py-6'>
                  <div className='w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-400 transition-all duration-300'>
                    <Icon className='w-10 h-10 text-slate-700 group-hover:text-emerald-600 transition-colors' />
                  </div>
                  <span className='text-2xl font-black text-slate-900'>
                    {option.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className='flex justify-center gap-2 mt-12'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === 0 ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default GenderPage;
