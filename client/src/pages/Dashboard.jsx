import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import useUserStore from '../stores/useUserStore';
import CircularProgress from '../components/CircularProgress';
import Card from '../components/Card';
import Button from '../components/Button';
import FoodLogModal from '../components/FoodLogModal';
import { foodService } from '../services/foodService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const dailyCalorieTarget = useUserStore((state) => state.dailyCalorieTarget);
  const macros = useUserStore((state) => state.macros);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('tracker');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodEntries, setFoodEntries] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    water: 0,
    omega3: 0,
  });

  // Fetch food entries when date changes
  useEffect(() => {
    loadFoodEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadFoodEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const entries = await foodService.getFoodLog(dateStr);
      setFoodEntries(entries);

      // Calculate daily totals
      const totals = entries.reduce(
        (acc, entry) => ({
          calories: acc.calories + (entry.calories || 0),
          protein: acc.protein + (entry.protein || 0),
          carbs: acc.carbs + (entry.carbs || 0),
          fats: acc.fats + (entry.fats || 0),
          fiber: acc.fiber + (entry.fiber || 0),
          sugar: acc.sugar + (entry.sugar || 0),
          sodium: acc.sodium + (entry.sodium || 0),
          cholesterol: acc.cholesterol + (entry.cholesterol || 0),
          water: acc.water + (entry.water || 0),
          omega3: acc.omega3 + (entry.omega3 || 0),
        }),
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          cholesterol: 0,
          water: 0,
          omega3: 0,
        }
      );
      setDailyTotals(totals);
    } catch (error) {
      console.error('Failed to load food entries:', error);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleFoodAdded = () => {
    loadFoodEntries();
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    try {
      await foodService.deleteFoodEntry(entryId);
      loadFoodEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snacks: '🍿',
    };
    return icons[mealType] || '🍽️';
  };

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
      current: Math.round(dailyTotals.calories),
      target: dailyCalorieTarget || 2000,
      unit: 'kcal',
      color: 'orange',
    },
    {
      label: 'Protein',
      current: Math.round(dailyTotals.protein),
      target: macros?.protein || 150,
      unit: 'g',
      color: 'blue',
    },
    {
      label: 'Carbs',
      current: Math.round(dailyTotals.carbs),
      target: macros?.carbs || 200,
      unit: 'g',
      color: 'green',
    },
    {
      label: 'Fats',
      current: Math.round(dailyTotals.fats),
      target: macros?.fats || 65,
      unit: 'g',
      color: 'yellow',
    },
  ];

  const heartHealth = [
    {
      label: 'Cholesterol',
      current: Math.round(dailyTotals.cholesterol),
      target: 300,
      unit: 'mg',
      color: 'orange',
    },
    {
      label: 'Omega-3',
      current: Math.round(dailyTotals.omega3 * 1000), // Convert g to mg
      target: 1600,
      unit: 'mg',
      color: 'blue',
    },
    {
      label: 'Fiber',
      current: Math.round(dailyTotals.fiber),
      target: 38,
      unit: 'g',
      color: 'orange',
    },
    {
      label: 'Water',
      current: Math.round(dailyTotals.water),
      target: 3700,
      unit: 'mL',
      color: 'blue',
    },
    {
      label: 'Sodium',
      current: Math.round(dailyTotals.sodium),
      target: 2300,
      unit: 'mg',
      color: 'orange',
    },
  ];

  const controlled = [
    { label: 'Sugar', current: Math.round(dailyTotals.sugar), unit: 'g' },
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

          {isLoadingEntries ? (
            <Card className='text-center py-8'>
              <div className='animate-pulse'>
                <div className='text-4xl mb-2'>⏳</div>
                <p className='text-gray-500'>Loading...</p>
              </div>
            </Card>
          ) : foodEntries.length === 0 ? (
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
                <Button variant='primary' onClick={() => setIsModalOpen(true)}>
                  + Log Food
                </Button>
              </motion.div>
            </Card>
          ) : (
            <>
              <div className='space-y-3 mb-4'>
                {foodEntries.slice(0, 3).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}>
                    <Card className='hover:shadow-md transition-shadow'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='text-xl'>
                              {getMealIcon(entry.mealType)}
                            </span>
                            <span className='text-xs font-medium text-gray-500 uppercase'>
                              {entry.mealType}
                            </span>
                          </div>
                          <h3 className='font-semibold text-gray-800 mb-1'>
                            {entry.foodName}
                          </h3>
                          <div className='flex items-center gap-3 text-sm text-gray-600'>
                            <span>🔥 {Math.round(entry.calories)} kcal</span>
                            <span>•</span>
                            <span>P: {Math.round(entry.protein)}g</span>
                            <span>•</span>
                            <span>C: {Math.round(entry.carbs)}g</span>
                            <span>•</span>
                            <span>F: {Math.round(entry.fats)}g</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className='p-2 hover:bg-red-50 rounded-lg transition-colors'>
                          <svg
                            className='w-5 h-5 text-red-500'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <Button
                variant='primary'
                onClick={() => setIsModalOpen(true)}
                className='w-full'>
                + Log Another Food
              </Button>
            </>
          )}
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

      {/* Food Log Modal */}
      <FoodLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onFoodAdded={handleFoodAdded}
      />

      {/* Bottom Navigation */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe'>
        <div className='max-w-md mx-auto px-6 py-3'>
          <div className='flex items-center justify-around'>
            {[
              {
                id: 'dietitian',
                label: 'Dietitian',
                icon: '👨‍⚕️',
                path: '/dietitian',
              },
              { id: 'diet', label: 'Diet', icon: '🥗', path: '/diet' },
              {
                id: 'tracker',
                label: 'Tracker',
                icon: '📊',
                path: '/dashboard',
              },
              { id: 'logging', label: 'Logging', icon: '✍️', path: '/logging' },
              { id: 'account', label: 'Account', icon: '👤', path: '/account' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.path) navigate(tab.path);
                }}
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
