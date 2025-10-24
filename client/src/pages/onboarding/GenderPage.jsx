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
      <div className='h-full flex flex-col justify-center space-y-4 max-w-3xl mx-auto'>
        <div className='text-center'>
          <h2 className='text-3xl max-lg:text-2xl font-black text-slate-900 mb-2'>
            What's your gender?
          </h2>
          <p className='text-base font-medium text-slate-600'>
            This helps us calculate your personalized calorie needs
          </p>
        </div>

        <div className='grid grid-cols-2 max-sm:grid-cols-1 gap-3 mt-6'>
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.value}
                hoverable
                onClick={() => handleSelect(option.value)}
                padding='md'
                variant='default'
                className='group'>
                <div className='flex flex-col items-center text-center gap-3 py-4'>
                  <div className='w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-400 transition-all duration-300'>
                    <Icon className='w-8 h-8 text-slate-700 group-hover:text-emerald-600 transition-colors' />
                  </div>
                  <span className='text-xl font-black text-slate-900'>
                    {option.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default GenderPage;
