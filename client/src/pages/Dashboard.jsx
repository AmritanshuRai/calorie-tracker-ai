import { motion } from 'framer-motion';
import { useState } from 'react';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import useUserStore from '../stores/useUserStore';
import CircularProgress from '../components/CircularProgress';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const dailyCalorieTarget = useUserStore((state) => state.dailyCalorieTarget);
  const macros = useUserStore((state) => state.macros);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('tracker');

  // Generate week dates (Sunday to Saturday)
  const weekStart = startOfWeek(selectedDate);
  const weekDates = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const isToday = (date) =>
    format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isSelected = (date) =>
    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

  const handlePrevWeek = () => setSelectedDate(subDays(selectedDate, 7));
  const handleNextWeek = () => setSelectedDate(addDays(selectedDate, 7));

  const nutrients = [
    {
      label: 'Calories',
      current: 0,
      target: dailyCalorieTarget || 2000,
      unit: 'kcal',
      color: 'orange',
    },
    {
      label: 'Protein',
      current: 0,
      target: macros?.protein || 150,
      unit: 'g',
      color: 'blue',
    },
    {
      label: 'Carbs',
      current: 0,
      target: macros?.carbs || 200,
      unit: 'g',
      color: 'green',
    },
    {
      label: 'Fats',
      current: 0,
      target: macros?.fats || 65,
      unit: 'g',
      color: 'yellow',
    },
  ];

  const heartHealth = [
    {
      label: 'Cholesterol',
      current: 0,
      target: 300,
      unit: 'mg',
      color: 'orange',
    },
    { label: 'Omega-3', current: 0, target: 1600, unit: 'mg', color: 'blue' },
    { label: 'Fiber', current: 0, target: 38, unit: 'g', color: 'orange' },
    { label: 'Water', current: 0, target: 3700, unit: 'mL', color: 'blue' },
    { label: 'Sodium', current: 0, target: 2300, unit: 'mg', color: 'orange' },
  ];

  const controlled = [
    { label: 'Sugar', current: 0, unit: 'g' },
    { label: 'Trans Fat', current: 0, unit: 'g' },
    { label: 'Caffeine', current: 0, unit: 'mg' },
    { label: 'Alcohol', current: 0, unit: 'mL' },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-b from-green-50 to-white pb-24'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-md mx-auto px-6 py-4'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <h1 className='text-xl font-bold text-gray-800'>
                {new Date().getHours() < 12
                  ? '☀️'
                  : new Date().getHours() < 18
                  ? '🌤️'
                  : '🌙'}{' '}
                Good{' '}
                {new Date().getHours() < 12
                  ? 'morning'
                  : new Date().getHours() < 18
                  ? 'afternoon'
                  : 'evening'}
                , {user?.name?.split(' ')[0] || 'there'}!
              </h1>
            </div>
            <div className='flex items-center gap-2'>
              <button className='p-2 hover:bg-gray-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-gray-600'
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
          </div>
        </div>
      </div>

      <div className='max-w-md mx-auto px-6 py-6 space-y-6'>
        {/* Date Slider */}
        <Card>
          <div className='flex items-center justify-between mb-4'>
            <button
              onClick={handlePrevWeek}
              className='p-1 hover:bg-gray-100 rounded'>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>
            <span className='text-sm font-medium text-gray-700'>
              {format(weekStart, 'MMM yyyy')}
            </span>
            <button
              onClick={handleNextWeek}
              className='p-1 hover:bg-gray-100 rounded'>
              <svg
                className='w-5 h-5'
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

          <div className='grid grid-cols-7 gap-2'>
            {weekDates.map((date) => (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  isSelected(date)
                    ? 'bg-green-500 text-white'
                    : isToday(date)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <span className='text-xs font-medium'>
                  {format(date, 'EEE')}
                </span>
                <span className='text-lg font-bold'>{format(date, 'd')}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Logged Foods - Empty State */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
              🍽️ Logged Foods
            </h2>
            <button className='text-sm text-green-600 font-medium'>
              View All →
            </button>
          </div>

          <Card className='text-center py-12'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}>
              <div className='text-6xl mb-4'>🍎</div>
              <p className='text-gray-600 mb-6'>
                You haven't logged any foods yet!
                <br />
                Start logging by clicking the button below.
              </p>
              <Button variant='primary' onClick={() => {}}>
                + Log Food
              </Button>
            </motion.div>
          </Card>
        </div>

        {/* Nutrient Overview */}
        <div>
          <h2 className='text-lg font-bold text-gray-800 mb-3'>
            📊 Nutrient Overview
          </h2>
          <div className='grid grid-cols-2 gap-4'>
            {nutrients.map((nutrient) => (
              <Card key={nutrient.label} className='flex justify-center'>
                <CircularProgress
                  value={nutrient.current}
                  max={nutrient.target}
                  size={100}
                  color={nutrient.color}
                  label={nutrient.label}
                  unit={nutrient.unit}
                />
                <div className='text-center mt-3'>
                  <p className='text-xs text-gray-600'>
                    {nutrient.target - nutrient.current} {nutrient.unit} left
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Heart Health */}
        <div>
          <h2 className='text-lg font-bold text-gray-800 mb-3'>
            ❤️ Heart Health
          </h2>
          <Card>
            <div className='space-y-3'>
              {heartHealth.map((item) => (
                <div
                  key={item.label}
                  className='flex items-center justify-between'>
                  <span className='text-sm text-gray-700'>{item.label}</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-32 h-2 bg-gray-200 rounded-full overflow-hidden'>
                      <div
                        className={`h-full bg-${item.color}-500`}
                        style={{
                          width: `${(item.current / item.target) * 100}%`,
                        }}
                      />
                    </div>
                    <span className='text-sm font-medium text-gray-800 w-20 text-right'>
                      {item.current}/{item.target} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Controlled Consumption */}
        <div>
          <h2 className='text-lg font-bold text-gray-800 mb-3'>
            🎯 Controlled Consumption
          </h2>
          <Card>
            <div className='grid grid-cols-2 gap-4'>
              {controlled.map((item) => (
                <div key={item.label} className='text-center'>
                  <div className='text-2xl font-bold text-gray-800'>
                    {item.current}
                    {item.unit}
                  </div>
                  <div className='text-sm text-gray-600'>{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe'>
        <div className='max-w-md mx-auto px-6 py-3'>
          <div className='flex items-center justify-around'>
            {[
              { id: 'dietitian', label: 'Dietitian', icon: '👨‍⚕️' },
              { id: 'diet', label: 'Diet', icon: '🥗' },
              { id: 'tracker', label: 'Tracker', icon: '📊' },
              { id: 'logging', label: 'Logging', icon: '✍️' },
              { id: 'account', label: 'Account', icon: '👤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id ? 'text-green-600' : 'text-gray-500'
                }`}>
                <span className='text-2xl'>{tab.icon}</span>
                <span className='text-xs font-medium'>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
