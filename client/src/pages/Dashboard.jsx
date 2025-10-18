import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  Heart,
  Droplet,
  Activity,
  Target,
  Flame,
  Apple,
  UtensilsCrossed,
  Salad,
  User,
  BarChart3,
  Trash2,
  Sparkles,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import useUserStore from '../stores/useUserStore';
import CircularProgress from '../components/CircularProgress';
import Card from '../components/Card';
import Button from '../components/Button';
import FoodLogModal from '../components/FoodLogModal';
import { foodService } from '../services/foodService';
import { authService } from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const setUser = useUserStore((state) => state.setUser);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [foodEntries, setFoodEntries] = useState([]);
  const userMenuRef = useRef(null);
  const [userTargets, setUserTargets] = useState({
    dailyCalorieTarget: 0,
    proteinTarget: 0,
    carbsTarget: 0,
    fatsTarget: 0,
  });
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
    transFat: 0,
    caffeine: 0,
    alcohol: 0,
    // Vitamins
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminK: 0,
    vitaminB1: 0,
    vitaminB2: 0,
    vitaminB3: 0,
    vitaminB5: 0,
    vitaminB6: 0,
    vitaminB9: 0,
    vitaminB12: 0,
    // Minerals
    calcium: 0,
    iron: 0,
    magnesium: 0,
    phosphorus: 0,
    potassium: 0,
    zinc: 0,
    manganese: 0,
    copper: 0,
    selenium: 0,
  });

  // Load user profile data on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await authService.getProfile();

        // Update user store with the full profile data
        setUser(profile);

        // Set user targets from profile
        if (profile.dailyCalorieTarget) {
          setUserTargets({
            dailyCalorieTarget: profile.dailyCalorieTarget,
            proteinTarget: profile.proteinTarget || 0,
            carbsTarget: profile.carbsTarget || 0,
            fatsTarget: profile.fatsTarget || 0,
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // If profile fetch fails, check if user is still authenticated
        if (error.response?.status === 401) {
          logout();
          navigate('/');
        }
      }
    };

    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch food entries when date changes
  useEffect(() => {
    loadFoodEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debug: Log user data
  useEffect(() => {
    console.log('User data:', user);
    console.log('User picture:', user?.picture);
    console.log('User targets:', userTargets);
  }, [user, userTargets]);

  const loadFoodEntries = async () => {
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
          transFat: acc.transFat + (entry.transFat || 0),
          caffeine: acc.caffeine + (entry.caffeine || 0),
          alcohol: acc.alcohol + (entry.alcohol || 0),
          // Vitamins
          vitaminA: acc.vitaminA + (entry.vitaminA || 0),
          vitaminC: acc.vitaminC + (entry.vitaminC || 0),
          vitaminD: acc.vitaminD + (entry.vitaminD || 0),
          vitaminE: acc.vitaminE + (entry.vitaminE || 0),
          vitaminK: acc.vitaminK + (entry.vitaminK || 0),
          vitaminB1: acc.vitaminB1 + (entry.vitaminB1 || 0),
          vitaminB2: acc.vitaminB2 + (entry.vitaminB2 || 0),
          vitaminB3: acc.vitaminB3 + (entry.vitaminB3 || 0),
          vitaminB5: acc.vitaminB5 + (entry.vitaminB5 || 0),
          vitaminB6: acc.vitaminB6 + (entry.vitaminB6 || 0),
          vitaminB9: acc.vitaminB9 + (entry.vitaminB9 || 0),
          vitaminB12: acc.vitaminB12 + (entry.vitaminB12 || 0),
          // Minerals
          calcium: acc.calcium + (entry.calcium || 0),
          iron: acc.iron + (entry.iron || 0),
          magnesium: acc.magnesium + (entry.magnesium || 0),
          phosphorus: acc.phosphorus + (entry.phosphorus || 0),
          potassium: acc.potassium + (entry.potassium || 0),
          zinc: acc.zinc + (entry.zinc || 0),
          manganese: acc.manganese + (entry.manganese || 0),
          copper: acc.copper + (entry.copper || 0),
          selenium: acc.selenium + (entry.selenium || 0),
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
          transFat: 0,
          caffeine: 0,
          alcohol: 0,
          // Vitamins
          vitaminA: 0,
          vitaminC: 0,
          vitaminD: 0,
          vitaminE: 0,
          vitaminK: 0,
          vitaminB1: 0,
          vitaminB2: 0,
          vitaminB3: 0,
          vitaminB5: 0,
          vitaminB6: 0,
          vitaminB9: 0,
          vitaminB12: 0,
          // Minerals
          calcium: 0,
          iron: 0,
          magnesium: 0,
          phosphorus: 0,
          potassium: 0,
          zinc: 0,
          manganese: 0,
          copper: 0,
          selenium: 0,
        }
      );
      setDailyTotals(totals);
    } catch (error) {
      console.error('Failed to load food entries:', error);
    }
  };

  const handleAddFood = () => {
    loadFoodEntries();
    setShowModal(false);
  };

  const handleDeleteFood = async (entryId) => {
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
      breakfast: Apple,
      lunch: UtensilsCrossed,
      dinner: Salad,
      snacks: Sparkles,
    };
    return icons[mealType] || Apple;
  };

  const getMealColor = (mealType) => {
    const colors = {
      breakfast: 'from-orange-500 to-red-500',
      lunch: 'from-blue-500 to-cyan-500',
      dinner: 'from-purple-500 to-pink-500',
      snacks: 'from-yellow-500 to-orange-500',
    };
    return colors[mealType] || 'from-slate-500 to-slate-600';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = () => {
    logout();
    authService.logout();
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
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

  const calorieProgress = userTargets.dailyCalorieTarget
    ? (dailyTotals.calories / userTargets.dailyCalorieTarget) * 100
    : 0;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30'>
      {/* Header */}
      <header className='sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b-2 border-slate-300 shadow-lg'>
        <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 sm:h-18 lg:h-20'>
            <div className='flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0'>
              <div className='w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0'>
                <Apple className='w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white' />
              </div>
              <div className='min-w-0'>
                <h1 className='text-base sm:text-lg lg:text-xl font-black text-slate-900 truncate'>
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
                </h1>
                <p className='text-xs sm:text-sm text-slate-600 font-medium truncate'>
                  Track your nutrition journey
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
              <button className='p-2 sm:p-2.5 hover:bg-emerald-50 rounded-xl transition-all active:scale-95 relative bg-slate-100'>
                <Bell className='w-5 h-5 sm:w-6 sm:h-6 text-slate-700' />
                <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white'></span>
              </button>

              {/* User Profile Dropdown */}
              <div className='relative' ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center gap-2 hover:bg-slate-100 rounded-xl transition-all active:scale-95 p-1 pr-2'>
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user?.name || 'User'}
                      onError={(e) => {
                        console.error('Image failed to load:', user.picture);
                        e.target.style.display = 'none';
                      }}
                      referrerPolicy='no-referrer'
                      className='w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500 object-cover shadow-md'
                    />
                  ) : null}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm sm:text-base border-2 border-emerald-500 shadow-md ${
                      user?.picture ? 'hidden' : ''
                    }`}>
                    {getUserInitials()}
                  </div>
                  <ChevronDown className='w-4 h-4 text-slate-600 hidden sm:block' />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className='absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                    <div className='p-4 border-b-2 border-slate-100 bg-gradient-to-br from-emerald-50 to-teal-50'>
                      <p className='font-bold text-slate-900 truncate'>
                        {user?.name || 'User'}
                      </p>
                      <p className='text-xs text-slate-600 truncate mt-0.5'>
                        {user?.email || ''}
                      </p>
                    </div>

                    <div className='py-2'>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/account');
                        }}
                        className='w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors text-left'>
                        <Settings className='w-5 h-5 text-slate-600' />
                        <span className='font-medium text-slate-700'>
                          Account Settings
                        </span>
                      </button>

                      {user?.isAdmin && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin');
                          }}
                          className='w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left'>
                          <BarChart3 className='w-5 h-5 text-purple-600' />
                          <span className='font-medium text-purple-600'>
                            Admin Panel
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className='w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left'>
                        <LogOut className='w-5 h-5 text-red-600' />
                        <span className='font-medium text-red-600'>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
          {/* Left Column - Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Date Slider */}
            <Card padding='md' variant='default'>
              <div className='flex items-center justify-between mb-4'>
                <button
                  onClick={handlePrevWeek}
                  className='p-2 hover:bg-slate-100 rounded-lg transition-colors'>
                  <ChevronLeft className='w-5 h-5 text-slate-600' />
                </button>
                <h2 className='text-base font-semibold text-slate-700'>
                  {format(weekStart, 'MMM yyyy')}
                </h2>
                <button
                  onClick={handleNextWeek}
                  className='p-2 hover:bg-slate-100 rounded-lg transition-colors'>
                  <ChevronRight className='w-5 h-5 text-slate-600' />
                </button>
              </div>

              <div className='grid grid-cols-7 gap-2'>
                {weekDates.map((date) => (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center p-2 lg:p-3 rounded-xl transition-all ${
                      isSelected(date)
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : isToday(date)
                        ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}>
                    <span className='text-xs font-medium mb-1'>
                      {format(date, 'EEE')}
                    </span>
                    <span className='text-lg lg:text-xl font-bold'>
                      {format(date, 'd')}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick Stats with Progress */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              {[
                {
                  label: 'Calories',
                  value: Math.round(dailyTotals.calories),
                  target: userTargets.dailyCalorieTarget,
                  icon: Flame,
                  color: 'orange',
                },
                {
                  label: 'Protein',
                  value: Math.round(dailyTotals.protein),
                  target: userTargets.proteinTarget,
                  icon: Activity,
                  color: 'blue',
                },
                {
                  label: 'Carbs',
                  value: Math.round(dailyTotals.carbs),
                  target: userTargets.carbsTarget,
                  icon: TrendingUp,
                  color: 'green',
                },
                {
                  label: 'Fats',
                  value: Math.round(dailyTotals.fats),
                  target: userTargets.fatsTarget,
                  icon: Droplet,
                  color: 'yellow',
                },
              ].map((stat) => {
                const Icon = stat.icon;
                const percentage = stat.target
                  ? Math.min(100, (stat.value / stat.target) * 100)
                  : 0;

                return (
                  <Card
                    key={stat.label}
                    padding='md'
                    variant='default'
                    className='hover-lift'>
                    <div className='flex flex-col items-center text-center'>
                      <p className='text-sm font-semibold text-slate-600 mb-3'>
                        {stat.label}
                      </p>

                      <div className='relative mb-3'>
                        <CircularProgress
                          value={percentage}
                          color={stat.color}
                          size='md'
                          showValue={false}
                        />
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <Icon className='w-8 h-8 text-slate-700' />
                        </div>
                      </div>

                      <p className='text-2xl lg:text-3xl font-black text-slate-900'>
                        {stat.value}
                        <span className='text-base font-medium text-slate-500'>
                          g
                        </span>
                      </p>
                      <p className='text-xs text-slate-400 mt-1'>
                        of {stat.target}
                        {stat.label === 'Calories' ? '' : 'g'}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Food Entries */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-slate-800'>
                  Today's Meals
                </h2>
                <button
                  onClick={() => setShowModal(true)}
                  className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all'>
                  <Plus className='w-4 h-4' />
                  <span className='text-sm font-medium'>Add Food</span>
                </button>
              </div>

              <div className='space-y-3'>
                {foodEntries.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center'>
                      <Apple className='w-8 h-8 text-emerald-600' />
                    </div>
                    <p className='text-slate-600 font-medium mb-2'>
                      No meals logged yet
                    </p>
                    <p className='text-sm text-slate-400'>
                      Start tracking your nutrition journey
                    </p>
                  </div>
                ) : (
                  foodEntries.map((entry) => {
                    const MealIcon = getMealIcon(entry.mealType);
                    const mealColor = getMealColor(entry.mealType);

                    return (
                      <Card
                        key={entry.id}
                        padding='md'
                        variant='glass'
                        className='hover-lift'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-start gap-3 flex-1'>
                            <div
                              className={`p-2 rounded-xl bg-gradient-to-br ${mealColor}`}>
                              <MealIcon className='w-5 h-5 text-white' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                                  {entry.mealType}
                                </span>
                                <span className='text-xs text-slate-400'>
                                  {format(new Date(entry.createdAt), 'h:mm a')}
                                </span>
                              </div>
                              <h3 className='font-semibold text-slate-800 mb-2 truncate'>
                                {entry.foodName}
                              </h3>

                              <div className='grid grid-cols-4 gap-3 text-xs'>
                                <div className='text-center'>
                                  <p className='text-slate-400 mb-1'>Cal</p>
                                  <p className='font-bold text-orange-600'>
                                    {Math.round(entry.calories)}
                                  </p>
                                </div>
                                <div className='text-center'>
                                  <p className='text-slate-400 mb-1'>Pro</p>
                                  <p className='font-bold text-blue-600'>
                                    {Math.round(entry.protein)}g
                                  </p>
                                </div>
                                <div className='text-center'>
                                  <p className='text-slate-400 mb-1'>Carb</p>
                                  <p className='font-bold text-green-600'>
                                    {Math.round(entry.carbs)}g
                                  </p>
                                </div>
                                <div className='text-center'>
                                  <p className='text-slate-400 mb-1'>Fat</p>
                                  <p className='font-bold text-yellow-600'>
                                    {Math.round(entry.fats)}g
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteFood(entry.id)}
                            className='ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Vitamins */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500'>
                  <Sparkles className='w-5 h-5 text-white' />
                </div>
                <h3 className='text-xl font-bold text-slate-800'>Vitamins</h3>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                {[
                  {
                    label: 'Vitamin A',
                    value: dailyTotals.vitaminA,
                    target: 900,
                    unit: 'mcg',
                  },
                  {
                    label: 'Vitamin C',
                    value: dailyTotals.vitaminC,
                    target: 90,
                    unit: 'mg',
                  },
                  {
                    label: 'Vitamin D',
                    value: dailyTotals.vitaminD,
                    target: 20,
                    unit: 'mcg',
                  },
                  {
                    label: 'Vitamin E',
                    value: dailyTotals.vitaminE,
                    target: 15,
                    unit: 'mg',
                  },
                  {
                    label: 'Vitamin K',
                    value: dailyTotals.vitaminK,
                    target: 120,
                    unit: 'mcg',
                  },
                  {
                    label: 'B1 (Thiamine)',
                    value: dailyTotals.vitaminB1,
                    target: 1.2,
                    unit: 'mg',
                  },
                  {
                    label: 'B2 (Riboflavin)',
                    value: dailyTotals.vitaminB2,
                    target: 1.3,
                    unit: 'mg',
                  },
                  {
                    label: 'B3 (Niacin)',
                    value: dailyTotals.vitaminB3,
                    target: 16,
                    unit: 'mg',
                  },
                  {
                    label: 'B5 (Pantothenic)',
                    value: dailyTotals.vitaminB5,
                    target: 5,
                    unit: 'mg',
                  },
                  {
                    label: 'B6 (Pyridoxine)',
                    value: dailyTotals.vitaminB6,
                    target: 1.7,
                    unit: 'mg',
                  },
                  {
                    label: 'B9 (Folate)',
                    value: dailyTotals.vitaminB9,
                    target: 400,
                    unit: 'mcg',
                  },
                  {
                    label: 'B12 (Cobalamin)',
                    value: dailyTotals.vitaminB12,
                    target: 2.4,
                    unit: 'mcg',
                  },
                ].map((item) => {
                  const percentage = Math.min(
                    100,
                    (item.value / item.target) * 100
                  );

                  return (
                    <div
                      key={item.label}
                      className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 hover-lift border border-amber-100'>
                      <div className='flex flex-col items-center text-center gap-2'>
                        <div className='relative w-14 h-14 flex-shrink-0'>
                          <CircularProgress
                            value={percentage}
                            color='amber'
                            size={56}
                            strokeWidth={5}
                            showValue={false}
                          />
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <span className='text-xs font-bold text-amber-700'>
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </div>
                        <div className='w-full'>
                          <p className='text-xs text-slate-600 font-semibold mb-1 truncate'>
                            {item.label}
                          </p>
                          <p className='text-sm font-bold text-slate-800'>
                            {item.value > 0 ? item.value.toFixed(1) : '0'}
                          </p>
                          <p className='text-[10px] text-slate-400 font-medium'>
                            / {item.target} {item.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Minerals */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500'>
                  <Sparkles className='w-5 h-5 text-white' />
                </div>
                <h3 className='text-xl font-bold text-slate-800'>Minerals</h3>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                {[
                  {
                    label: 'Calcium',
                    value: dailyTotals.calcium,
                    target: 1000,
                    unit: 'mg',
                  },
                  {
                    label: 'Iron',
                    value: dailyTotals.iron,
                    target: 18,
                    unit: 'mg',
                  },
                  {
                    label: 'Magnesium',
                    value: dailyTotals.magnesium,
                    target: 400,
                    unit: 'mg',
                  },
                  {
                    label: 'Phosphorus',
                    value: dailyTotals.phosphorus,
                    target: 700,
                    unit: 'mg',
                  },
                  {
                    label: 'Potassium',
                    value: dailyTotals.potassium,
                    target: 3500,
                    unit: 'mg',
                  },
                  {
                    label: 'Zinc',
                    value: dailyTotals.zinc,
                    target: 11,
                    unit: 'mg',
                  },
                  {
                    label: 'Manganese',
                    value: dailyTotals.manganese,
                    target: 2.3,
                    unit: 'mg',
                  },
                  {
                    label: 'Copper',
                    value: dailyTotals.copper,
                    target: 0.9,
                    unit: 'mg',
                  },
                  {
                    label: 'Selenium',
                    value: dailyTotals.selenium,
                    target: 55,
                    unit: 'mcg',
                  },
                ].map((item) => {
                  const percentage = Math.min(
                    100,
                    (item.value / item.target) * 100
                  );

                  return (
                    <div
                      key={item.label}
                      className='bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 hover-lift border border-orange-100'>
                      <div className='flex flex-col items-center text-center gap-2'>
                        <div className='relative w-14 h-14 flex-shrink-0'>
                          <CircularProgress
                            value={percentage}
                            color='orange'
                            size={56}
                            strokeWidth={5}
                            showValue={false}
                          />
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <span className='text-xs font-bold text-orange-700'>
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </div>
                        <div className='w-full'>
                          <p className='text-xs text-slate-600 font-semibold mb-1 truncate'>
                            {item.label}
                          </p>
                          <p className='text-sm font-bold text-slate-800'>
                            {item.value > 0 ? item.value.toFixed(1) : '0'}
                          </p>
                          <p className='text-[10px] text-slate-400 font-medium'>
                            / {item.target} {item.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column - Progress Overview */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Daily Progress */}
            <Card padding='lg' variant='gradient'>
              <div className='text-center mb-6'>
                <div className='inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4'>
                  <Target className='w-4 h-4 text-white' />
                  <span className='text-xs font-semibold text-white'>
                    Daily Goal
                  </span>
                </div>
                <h2 className='text-2xl font-bold text-white mb-1'>
                  {Math.round(calorieProgress)}%
                </h2>
                <p className='text-sm text-white/80'>Progress Today</p>
              </div>

              <div className='flex justify-center mb-6'>
                <CircularProgress
                  value={calorieProgress}
                  color='white'
                  size='lg'
                  showValue={false}
                />
              </div>

              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Consumed</span>
                  <span className='font-bold text-white'>
                    {Math.round(dailyTotals.calories)} cal
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Target</span>
                  <span className='font-bold text-white'>
                    {userTargets.dailyCalorieTarget} cal
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Remaining</span>
                  <span className='font-bold text-white'>
                    {Math.max(
                      0,
                      userTargets.dailyCalorieTarget -
                        Math.round(dailyTotals.calories)
                    )}{' '}
                    cal
                  </span>
                </div>
              </div>
            </Card>

            {/* Heart Health */}
            <Card padding='lg' variant='glass'>
              <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500'>
                  <Heart className='w-5 h-5 text-white' />
                </div>
                <h3 className='text-lg font-bold text-slate-800'>
                  Heart Health
                </h3>
              </div>

              <div className='space-y-4'>
                {[
                  {
                    label: 'Sodium',
                    value: Math.round(dailyTotals.sodium),
                    max: 2300,
                    unit: 'mg',
                    color: 'from-purple-500 to-pink-500',
                  },
                  {
                    label: 'Sugar',
                    value: Math.round(dailyTotals.sugar),
                    max: 50,
                    unit: 'g',
                    color: 'from-pink-500 to-rose-500',
                  },
                  {
                    label: 'Cholesterol',
                    value: Math.round(dailyTotals.cholesterol),
                    max: 300,
                    unit: 'mg',
                    color: 'from-rose-500 to-red-500',
                  },
                  {
                    label: 'Fiber',
                    value: Math.round(dailyTotals.fiber),
                    max: 30,
                    unit: 'g',
                    color: 'from-green-500 to-emerald-500',
                  },
                ].map((item) => {
                  const percentage = Math.min(
                    100,
                    (item.value / item.max) * 100
                  );

                  return (
                    <div key={item.label}>
                      <div className='flex justify-between mb-2'>
                        <span className='text-sm font-medium text-slate-700'>
                          {item.label}
                        </span>
                        <span className='text-sm font-bold text-slate-800'>
                          {item.value}
                          <span className='text-slate-400 font-normal'>
                            /{item.max}
                          </span>
                          {item.unit}
                        </span>
                      </div>
                      <div className='relative h-2 bg-slate-100 rounded-full overflow-hidden'>
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className='lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-t border-slate-200/50 shadow-2xl'>
        <div className='flex items-center justify-around h-20 max-w-md mx-auto px-4'>
          <button className='flex flex-col items-center justify-center gap-1 p-2 text-slate-400 hover:text-emerald-600 transition-colors'>
            <Heart className='w-6 h-6' />
            <span className='text-xs font-medium'>Health</span>
          </button>

          <button className='flex flex-col items-center justify-center gap-1 p-2 text-emerald-600'>
            <div className='p-1 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10'>
              <Apple className='w-6 h-6' />
            </div>
            <span className='text-xs font-semibold'>Home</span>
          </button>

          <button className='flex flex-col items-center justify-center gap-1 p-2 text-slate-400 hover:text-emerald-600 transition-colors'>
            <BarChart3 className='w-6 h-6' />
            <span className='text-xs font-medium'>Stats</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className='relative -top-4 flex flex-col items-center justify-center'>
            <div className='w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40 flex items-center justify-center hover:shadow-xl hover:shadow-emerald-500/50 transition-all'>
              <Plus className='w-7 h-7 text-white' />
            </div>
          </button>

          <button
            onClick={() => navigate('/account')}
            className='flex flex-col items-center justify-center gap-1 p-2 text-slate-400 hover:text-emerald-600 transition-colors'>
            <User className='w-6 h-6' />
            <span className='text-xs font-medium'>Profile</span>
          </button>
        </div>
      </nav>

      {/* Food Log Modal */}
      <FoodLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedDate={selectedDate}
        onFoodAdded={handleAddFood}
      />
    </div>
  );
};

export default Dashboard;
