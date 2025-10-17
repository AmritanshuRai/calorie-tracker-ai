import { useNavigate } from 'react-router-dom';
import useUserStore from '../stores/useUserStore';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Account() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const onboardingData = useUserStore((state) => state.onboardingData);
  const dailyCalorieTarget = useUserStore((state) => state.dailyCalorieTarget);
  const macros = useUserStore((state) => state.macros);
  const bmr = useUserStore((state) => state.bmr);
  const tdee = useUserStore((state) => state.tdee);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const profileStats = [
    {
      label: 'Gender',
      value: onboardingData.gender === 'male' ? 'Male' : 'Female',
      icon: '👤',
    },
    { label: 'Age', value: `${onboardingData.age} years`, icon: '🎂' },
    {
      label: 'Current Weight',
      value: `${onboardingData.currentWeight} kg`,
      icon: '⚖️',
    },
    {
      label: 'Target Weight',
      value: `${onboardingData.targetWeight} kg`,
      icon: '🎯',
    },
  ];

  const nutritionStats = [
    {
      label: 'BMR',
      value: `${bmr || 0} kcal`,
      icon: '🔥',
      description: 'Basal Metabolic Rate',
    },
    {
      label: 'TDEE',
      value: `${tdee || 0} kcal`,
      icon: '⚡',
      description: 'Total Daily Energy',
    },
    {
      label: 'Daily Target',
      value: `${dailyCalorieTarget || 0} kcal`,
      icon: '🎯',
      description: 'Calorie Goal',
    },
  ];

  const macroStats = [
    {
      label: 'Protein',
      value: `${macros?.protein || 0}g`,
      color: 'text-blue-600',
    },
    {
      label: 'Carbs',
      value: `${macros?.carbs || 0}g`,
      color: 'text-green-600',
    },
    { label: 'Fats', value: `${macros?.fats || 0}g`, color: 'text-orange-600' },
  ];

  const goalLabel = {
    weight_loss: 'Lose Weight',
    weight_gain: 'Gain Weight',
    improved_health: 'Improve Health',
  };

  return (
    <div className='min-h-screen bg-neutral-50 pb-24 lg:pb-8'>
      {/* Desktop Sidebar Navigation */}
      <aside className='hidden lg:block fixed left-0 top-0 h-screen w-20 xl:w-24 bg-white border-r border-neutral-200 shadow-sm z-40'>
        <div className='flex flex-col h-full py-8'>
          <div className='text-3xl xl:text-4xl text-center mb-12'>🥗</div>
          <nav className='flex-1 flex flex-col gap-4 px-3'>
            {[
              {
                icon: '🤵',
                label: 'Dietitian',
                active: false,
                path: '/dietitian',
              },
              { icon: '🥗', label: 'Diet', active: false, path: '/diet' },
              {
                icon: '📊',
                label: 'Tracker',
                active: false,
                path: '/dashboard',
              },
              { icon: '✍️', label: 'Logging', active: false, path: '/logging' },
              { icon: '👤', label: 'Account', active: true, path: '/account' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all ${
                  item.active
                    ? 'bg-green-50 text-green-600 shadow-sm'
                    : 'text-neutral-500 hover:bg-neutral-50'
                }`}
                title={item.label}>
                <span className='text-2xl xl:text-3xl'>{item.icon}</span>
                <span className='text-xs font-medium hidden xl:block'>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Container */}
      <div className='lg:ml-20 xl:ml-24'>
        <div className='mx-auto max-w-4xl'>
          {/* Header */}
          <header className='sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm'>
            <div className='px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900'>
                    Account
                  </h1>
                  <p className='text-sm sm:text-base text-neutral-500 mt-1'>
                    Manage your profile and settings
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className='lg:hidden p-2 sm:p-3 rounded-xl hover:bg-neutral-100 transition-colors'>
                  <svg
                    className='w-6 h-6 text-neutral-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6'>
            {/* Profile Card */}
            <div>
              <Card className='p-6 sm:p-8'>
                <div className='flex items-center gap-4 mb-6'>
                  <div className='w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg'>
                    {user?.name?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-neutral-900'>
                      {user?.name || 'User'}
                    </h2>
                    <p className='text-neutral-500'>
                      {user?.email || 'user@example.com'}
                    </p>
                    <div className='mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'>
                      🎯 {goalLabel[onboardingData.goal] || 'Not set'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Profile Stats */}
            <div>
              <h3 className='text-xl font-bold text-neutral-900 mb-4'>
                Profile Information
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {profileStats.map((stat, index) => (
                  <Card
                    key={index}
                    className='p-6 hover:shadow-md transition-shadow'>
                    <div className='flex items-center gap-3'>
                      <span className='text-3xl'>{stat.icon}</span>
                      <div>
                        <p className='text-sm text-neutral-500'>{stat.label}</p>
                        <p className='text-lg font-semibold text-neutral-900'>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Nutrition Stats */}
            <div>
              <h3 className='text-xl font-bold text-neutral-900 mb-4'>
                Nutrition Targets
              </h3>
              <Card className='p-6 sm:p-8'>
                <div className='space-y-6'>
                  {nutritionStats.map((stat, index) => (
                    <div key={index}>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-3'>
                          <span className='text-2xl'>{stat.icon}</span>
                          <div>
                            <p className='font-semibold text-neutral-900'>
                              {stat.label}
                            </p>
                            <p className='text-xs text-neutral-500'>
                              {stat.description}
                            </p>
                          </div>
                        </div>
                        <span className='text-xl font-bold text-green-600'>
                          {stat.value}
                        </span>
                      </div>
                      {index < nutritionStats.length - 1 && (
                        <div className='h-px bg-neutral-200 mt-6'></div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Macros */}
            <div>
              <h3 className='text-xl font-bold text-neutral-900 mb-4'>
                Daily Macros
              </h3>
              <div className='grid grid-cols-3 gap-4'>
                {macroStats.map((macro, index) => (
                  <Card
                    key={index}
                    className='p-6 text-center hover:shadow-md transition-shadow'>
                    <p className={`text-3xl font-bold ${macro.color} mb-1`}>
                      {macro.value}
                    </p>
                    <p className='text-sm text-neutral-600 font-medium'>
                      {macro.label}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div className='pt-4'>
              <Button
                variant='secondary'
                onClick={handleLogout}
                fullWidth
                className='border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500'>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
                Sign Out
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-xl z-50'>
        <div className='grid grid-cols-5 h-20'>
          {[
            {
              icon: '🤵',
              label: 'Dietitian',
              active: false,
              path: '/dietitian',
            },
            { icon: '🥗', label: 'Diet', active: false, path: '/diet' },
            { icon: '📊', label: 'Tracker', active: false, path: '/dashboard' },
            { icon: '✍️', label: 'Logging', active: false, path: '/logging' },
            { icon: '👤', label: 'Account', active: true, path: '/account' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-colors ${
                item.active ? 'text-green-600' : 'text-neutral-500'
              }`}>
              <span className='text-2xl'>{item.icon}</span>
              <span className='text-xs font-medium'>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
