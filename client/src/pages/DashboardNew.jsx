import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import useUserStore from '../stores/useUserStore';
import CircularProgress from '../components/CircularProgress';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const dailyCalorieTarget = useUserStore((state) => state.dailyCalorieTarget);
  const macros = useUserStore((state) => state.macros);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDates(dates);
  }, [selectedDate]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const nutrients = {
    calories: { current: 0, target: dailyCalorieTarget || 2000 },
    protein: { current: 0, target: macros?.protein || 150 },
    carbs: { current: 0, target: macros?.carbs || 200 },
    fats: { current: 0, target: macros?.fats || 65 },
  };

  const heartHealth = [
    { name: 'Cholesterol', current: 0, target: 300, unit: 'mg' },
    { name: 'Omega-3', current: 0, target: 1600, unit: 'mg' },
    { name: 'Fiber', current: 0, target: 38, unit: 'g' },
    { name: 'Water', current: 0, target: 3700, unit: 'mL' },
    { name: 'Sodium', current: 0, target: 2300, unit: 'mg' },
  ];

  const controlledConsumption = [
    { name: 'Sugar', current: 0, unit: 'g' },
    { name: 'Trans Fat', current: 0, unit: 'g' },
    { name: 'Caffeine', current: 0, unit: 'mg' },
    { name: 'Alcohol', current: 0, unit: 'mL' },
  ];

  return (
    <div className='min-h-screen bg-neutral-50'>
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
                active: true,
                path: '/dashboard',
              },
              { icon: '✍️', label: 'Logging', active: false, path: '/logging' },
              { icon: '👤', label: 'Account', active: false, path: '/account' },
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
        <div className='mx-auto max-w-7xl'>
          {/* Header */}
          <header className='sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm'>
            <div className='px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900'>
                    {greeting()}, {user?.name?.split(' ')[0] || 'Demo'}!
                  </h1>
                  <p className='text-sm sm:text-base text-neutral-500 mt-1'>
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <button className='p-2 sm:p-3 rounded-xl hover:bg-neutral-100 transition-colors'>
                  <svg
                    className='w-6 h-6 text-neutral-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                    />
                  </svg>
                </button>
              </div>

              {/* Date Slider */}
              <div className='mt-6 overflow-x-auto custom-scrollbar pb-2'>
                <div className='flex gap-2 sm:gap-3 min-w-max'>
                  {weekDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center justify-center min-w-[64px] sm:min-w-[72px] px-4 py-3 rounded-2xl transition-all ${
                        isToday(date) &&
                        format(date, 'yyyy-MM-dd') ===
                          format(selectedDate, 'yyyy-MM-dd')
                          ? 'gradient-primary text-white shadow-lg shadow-green-500/30'
                          : format(date, 'yyyy-MM-dd') ===
                            format(selectedDate, 'yyyy-MM-dd')
                          ? 'bg-green-100 text-green-700'
                          : isToday(date)
                          ? 'bg-green-50 text-green-600 border-2 border-green-200'
                          : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                      }`}>
                      <span className='text-xs font-medium opacity-80 mb-1'>
                        {format(date, 'EEE')}
                      </span>
                      <span className='text-xl sm:text-2xl font-bold'>
                        {format(date, 'd')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10'>
            {/* Logged Foods Section */}
            <section className='mb-8 sm:mb-10 lg:mb-12'>
              <div className='flex items-center justify-between mb-4 sm:mb-6'>
                <h2 className='text-xl sm:text-2xl font-bold text-neutral-900'>
                  🍽️ Logged Foods
                </h2>
                <button className='text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base flex items-center gap-1'>
                  View All
                  <svg
                    className='w-4 h-4'
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
                </button>
              </div>

              <Card className='text-center py-12 sm:py-16'>
                <div className='text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6'>
                  🍎
                </div>
                <p className='text-lg sm:text-xl text-neutral-700 font-medium mb-2'>
                  You haven't logged any foods yet!
                </p>
                <p className='text-sm sm:text-base text-neutral-500 mb-6 sm:mb-8 max-w-md mx-auto'>
                  Start logging by clicking the button below.
                </p>
                <Button className='mx-auto'>
                  <span className='text-lg'>+</span> Log Food
                </Button>
              </Card>
            </section>

            {/* Nutrient Overview Grid */}
            <section className='mb-8 sm:mb-10 lg:mb-12'>
              <h2 className='text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6'>
                📊 Nutrient Overview
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6'>
                {Object.entries(nutrients).map(([name, data]) => (
                  <Card
                    key={name}
                    className='flex flex-col items-center justify-center p-6 sm:p-8 hover:shadow-lg transition-shadow'>
                    <CircularProgress
                      value={data.current}
                      max={data.target}
                      size={140}
                      strokeWidth={12}
                      className='mb-4'
                    />
                    <h3 className='text-lg sm:text-xl font-semibold text-neutral-900 capitalize mb-2'>
                      {name}
                    </h3>
                    <p className='text-sm text-neutral-500'>
                      {data.target} {name === 'calories' ? 'kcal' : 'g'} left
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Heart Health Section */}
            <section className='mb-8 sm:mb-10 lg:mb-12'>
              <h2 className='text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6'>
                ❤️ Heart Health
              </h2>
              <Card className='p-6 sm:p-8'>
                <div className='space-y-4 sm:space-y-6'>
                  {heartHealth.map((item) => (
                    <div key={item.name}>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm sm:text-base font-medium text-neutral-700'>
                          {item.name}
                        </span>
                        <span className='text-sm sm:text-base font-semibold text-neutral-900'>
                          {item.current}/{item.target} {item.unit}
                        </span>
                      </div>
                      <div className='h-2.5 bg-neutral-100 rounded-full overflow-hidden'>
                        <div
                          style={{
                            width: `${(item.current / item.target) * 100}%`,
                          }}
                          className='h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Controlled Consumption Section */}
            <section className='mb-20 sm:mb-24 lg:mb-8'>
              <h2 className='text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6'>
                🎯 Controlled Consumption
              </h2>
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6'>
                {controlledConsumption.map((item) => (
                  <Card
                    key={item.name}
                    className='text-center p-6 sm:p-8 hover:shadow-lg transition-shadow'>
                    <div className='text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-2'>
                      {item.current}
                      {item.unit}
                    </div>
                    <div className='text-sm sm:text-base text-neutral-600 font-medium'>
                      {item.name}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
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
            { icon: '📊', label: 'Tracker', active: true, path: '/dashboard' },
            { icon: '✍️', label: 'Logging', active: false, path: '/logging' },
            { icon: '👤', label: 'Account', active: false, path: '/account' },
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
