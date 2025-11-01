import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Bell,
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
  CheckCircle,
  X,
  Info,
  ArrowRight,
  Clock,
  Scale,
} from 'lucide-react';
import useUserStore from '../stores/useUserStore';
import Card from '../components/Card';
import Button from '../components/Button';
import Calendar from '../components/Calendar';
import FoodLogModal from '../components/FoodLogModal';
import ExerciseLogModal from '../components/ExerciseLogModal';
import DailyLogModal from '../components/DailyLogModal';
import Tooltip from '../components/Tooltip';
import Footer from '../components/Footer';
import { LogoIcon } from '../components/Logo';
import { foodService } from '../services/foodService';
import { exerciseService } from '../services/exerciseService';
import { authService } from '../services/authService';
import { dailyLogService } from '../services/dailyLogService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const subscription = useUserStore((state) => state.subscription);
  const logout = useUserStore((state) => state.logout);
  const setUser = useUserStore((state) => state.setUser);
  const clearOnboardingData = useUserStore(
    (state) => state.clearOnboardingData
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showDailyLogModal, setShowDailyLogModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [foodEntries, setFoodEntries] = useState([]);
  const [exerciseEntries, setExerciseEntries] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [dailyLog, setDailyLog] = useState(null);
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

  // Check for payment success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionId = urlParams.get('subscription_id');
    const status = urlParams.get('status');

    if (subscriptionId && status === 'active') {
      // Show success notification
      setShowSuccessNotification(true);
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
      // Auto-hide notification after 5 seconds
      setTimeout(() => setShowSuccessNotification(false), 5000);
    }
  }, []);

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
    loadExerciseEntries();
    loadDailyLog();
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

  const loadExerciseEntries = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const entries = await exerciseService.getExerciseLog(dateStr);
      setExerciseEntries(entries);
    } catch (error) {
      console.error('Failed to load exercise entries:', error);
    }
  };

  const loadDailyLog = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const log = await dailyLogService.getDailyLog(dateStr);
      setDailyLog(log);
    } catch (error) {
      console.error('Failed to load daily log:', error);
    }
  };

  const handleAddFood = () => {
    loadFoodEntries();
    loadExerciseEntries(); // Refresh both when food is added
    setShowModal(false);
  };

  const handleAddExercise = () => {
    loadFoodEntries(); // Refresh both when exercise is added
    loadExerciseEntries();
    setShowExerciseModal(false);
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

  const handleStartOnboarding = () => {
    clearOnboardingData();
    navigate('/onboarding/gender');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  // Calculate total exercise calories burned
  const totalExerciseCalories = exerciseEntries.reduce(
    (total, entry) => total + (entry.caloriesBurned || 0),
    0
  );

  // Adjusted target includes exercise calories burned (you can eat more when you exercise)
  const adjustedTarget = userTargets.dailyCalorieTarget + totalExerciseCalories;

  const calorieProgress = adjustedTarget
    ? (dailyTotals.calories / adjustedTarget) * 100
    : 0;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30'>
      {/* Header */}
      <header className='sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b-2 border-slate-300 shadow-lg'>
        <div className='max-w-7xl mx-auto px-8 max-lg:px-6 max-sm:px-3'>
          <div className='flex items-center justify-between h-20 max-md:h-18 max-sm:h-16'>
            <div className='flex items-center gap-4 max-lg:gap-3 max-sm:gap-2 min-w-0'>
              <LogoIcon className='w-14 h-14 max-lg:w-12 max-lg:h-12 max-sm:w-11 max-sm:h-11 flex-shrink-0' />
              <div className='min-w-0'>
                <h1 className='text-xl max-lg:text-lg max-sm:text-base font-black text-slate-900 truncate'>
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
                </h1>
                <p className='text-sm max-sm:text-xs text-slate-600 font-medium truncate'>
                  Track your nutrition journey
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 max-sm:gap-2 flex-shrink-0'>
              <button className='p-2.5 max-sm:p-2 hover:bg-emerald-50 rounded-xl transition-all active:scale-95 relative bg-slate-100'>
                <Bell className='w-6 h-6 max-sm:w-5 max-sm:h-5 text-slate-700' />
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
                      className='w-10 h-10 max-sm:w-9 max-sm:h-9 rounded-full border-2 border-emerald-500 object-cover shadow-md'
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 max-sm:w-9 max-sm:h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-base max-sm:text-sm border-2 border-emerald-500 shadow-md ${
                      user?.picture ? 'hidden' : ''
                    }`}>
                    {getUserInitials()}
                  </div>
                  <ChevronDown className='w-4 h-4 text-slate-600 max-sm:hidden' />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className='absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                    <div className='p-4 border-b-2 border-slate-100 bg-gradient-to-br from-emerald-50 to-teal-50'>
                      <div className='flex items-center justify-between gap-2'>
                        <p className='font-bold text-slate-900 truncate'>
                          {user?.name || 'User'}
                        </p>
                        {user?.isPro && (
                          <span className='flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold rounded-full shadow-sm'>
                            <Sparkles className='w-3 h-3' />
                            PRO
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-slate-600 truncate mt-0.5'>
                        {user?.email || ''}
                      </p>
                    </div>

                    <div className='py-2'>
                      {!user?.isPro && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/upgrade');
                          }}
                          className='w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-colors text-left border-b-2 border-slate-100'>
                          <Sparkles className='w-5 h-5 text-emerald-600' />
                          <span className='font-medium text-emerald-600'>
                            Upgrade to Pro
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/insights');
                        }}
                        className='w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors text-left'>
                        <TrendingUp className='w-5 h-5 text-slate-600' />
                        <span className='font-medium text-slate-700'>
                          Insights
                        </span>
                      </button>

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

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className='fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300 px-4'>
          <div className='bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm flex items-center gap-4 max-w-md'>
            <div className='flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 text-white' />
            </div>
            <div className='flex-1'>
              <h3 className='font-bold text-lg mb-1'>Payment Successful!</h3>
              <p className='text-sm text-white/90'>
                Your premium subscription is now active
              </p>
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className='flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors'>
              <X className='w-5 h-5 text-white' />
            </button>
          </div>
        </div>
      )}

      <main className='max-w-7xl mx-auto px-8 max-lg:px-6 max-sm:px-4 py-8 max-lg:py-6 pb-8 max-lg:pb-24'>
        <div className='grid grid-cols-3 max-lg:grid-cols-1 gap-8 max-lg:gap-6'>
          {/* Left Column - Main Content */}
          <div className='col-span-2 max-col-span-1 space-y-6'>
            {/* Date Carousel */}
            <Card padding='lg' variant='default'>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </Card>

            {/* Daily Log - Weight & Water */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-slate-800'>Daily Log</h2>
                <button
                  onClick={() => setShowDailyLogModal(true)}
                  className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all'>
                  <Scale className='w-4 h-4' />
                  <span className='text-sm font-medium'>
                    Log Weight & Water
                  </span>
                </button>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Scale className='w-5 h-5 text-blue-600' />
                    <h3 className='text-sm font-semibold text-blue-900'>
                      Weight
                    </h3>
                  </div>
                  {dailyLog?.weight ? (
                    <>
                      <p className='text-2xl font-bold text-blue-900'>
                        {dailyLog.weight} {dailyLog.weightUnit || 'kg'}
                      </p>
                      <p className='text-xs text-blue-600 mt-1'>Logged today</p>
                    </>
                  ) : (
                    <>
                      <p className='text-2xl font-bold text-blue-900'>--</p>
                      <p className='text-xs text-blue-600 mt-1'>
                        Not logged yet
                      </p>
                    </>
                  )}
                </div>
                <div className='p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Droplet className='w-5 h-5 text-cyan-600' />
                    <h3 className='text-sm font-semibold text-cyan-900'>
                      Water
                    </h3>
                  </div>
                  {dailyLog?.waterIntake ? (
                    <>
                      <p className='text-2xl font-bold text-cyan-900'>
                        {Math.round(dailyLog.waterIntake)}{' '}
                        {dailyLog.waterUnit || 'ml'}
                      </p>
                      <p className='text-xs text-cyan-600 mt-1'>Logged today</p>
                    </>
                  ) : (
                    <>
                      <p className='text-2xl font-bold text-cyan-900'>--</p>
                      <p className='text-xs text-cyan-600 mt-1'>
                        Not logged yet
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Onboarding Reminder - Compact version */}
            {!user?.profileCompleted && (
              <div className='bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <Info className='w-5 h-5 text-amber-600 flex-shrink-0' />
                    <p className='text-sm text-amber-900 font-medium truncate'>
                      Complete your health profile for personalized targets
                    </p>
                  </div>
                  <button
                    onClick={handleStartOnboarding}
                    className='text-sm font-semibold text-amber-700 hover:text-amber-800 whitespace-nowrap flex items-center gap-1 hover:gap-2 transition-all'>
                    Start Now
                    <ArrowRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}

            {/* Upgrade Banner - Only show for free users */}
            {!user?.isPro && (
              <Card padding='none' variant='default'>
                <div className='relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 rounded-2xl'>
                  {/* Decorative elements */}
                  <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32'></div>
                  <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24'></div>

                  <div className='relative z-10 flex flex-row max-md:flex-col items-center max-md:items-start justify-between gap-4'>
                    <div className='flex items-start gap-4'>
                      <div className='flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                        <Sparkles className='w-6 h-6 text-white' />
                      </div>
                      <div>
                        <h3 className='text-lg font-bold text-white mb-1'>
                          Unlock Premium AI Accuracy
                        </h3>
                        <p className='text-sm text-white/90'>
                          Track 30+ nutrients with advanced AI
                        </p>
                        {/* Free logs counter */}
                        {subscription?.freeLogs >= 0 && (
                          <p className='text-xs text-white/80 mt-1.5 font-medium'>
                            {subscription.freeLogs} free{' '}
                            {subscription.freeLogs === 1 ? 'log' : 'logs'}{' '}
                            remaining
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate('/upgrade')}
                      className='bg-white text-emerald-600 hover:bg-white/90 shadow-lg whitespace-nowrap flex-shrink-0'>
                      Upgrade Now
                      <Sparkles className='w-4 h-4 ml-1' />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

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
                      <Card key={entry.id} padding='md' variant='glass'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='flex items-start gap-3 flex-1 min-w-0'>
                            <div
                              className={`p-2 rounded-xl bg-gradient-to-br ${mealColor} flex-shrink-0`}>
                              <MealIcon className='w-5 h-5 text-white' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-1 flex-wrap'>
                                <span className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                                  {entry.mealType}
                                </span>
                                <span className='text-xs text-slate-400'>
                                  {format(new Date(entry.createdAt), 'h:mm a')}
                                </span>
                              </div>
                              <Tooltip content={entry.foodName}>
                                <h3 className='font-semibold text-slate-800 mb-2 break-words line-clamp-2 cursor-pointer active:opacity-70 transition-opacity'>
                                  {entry.foodName}
                                </h3>
                              </Tooltip>

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
                            className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0'>
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Exercise Entries */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-slate-800'>
                  Today's Workouts
                </h2>
                <button
                  onClick={() => setShowExerciseModal(true)}
                  className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all'>
                  <Plus className='w-4 h-4' />
                  <span className='text-sm font-medium'>Log Workout</span>
                </button>
              </div>

              <div className='space-y-3'>
                {exerciseEntries.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center'>
                      <Activity className='w-8 h-8 text-purple-600' />
                    </div>
                    <p className='text-slate-600 font-medium mb-2'>
                      No workouts logged yet
                    </p>
                    <p className='text-sm text-slate-400'>
                      Track your exercise and calories burned
                    </p>
                  </div>
                ) : (
                  exerciseEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      padding='md'
                      variant='outline'
                      className='hover:shadow-md transition-shadow'>
                      <div className='flex items-start gap-3'>
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0`}>
                          <Activity className='w-6 h-6 text-white' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between gap-2'>
                            <div className='flex-1'>
                              <h3 className='font-bold text-slate-800 mb-1'>
                                {entry.exerciseName}
                              </h3>
                              {entry.description && (
                                <p className='text-sm text-slate-600 mb-2'>
                                  {entry.description}
                                </p>
                              )}
                              <div className='flex flex-wrap items-center gap-3 text-xs text-slate-500'>
                                {entry.duration && (
                                  <span className='flex items-center gap-1'>
                                    <Clock className='w-3 h-3' />
                                    {Math.round(entry.duration)} min
                                  </span>
                                )}
                                {entry.exerciseType && (
                                  <span className='px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium'>
                                    {entry.exerciseType}
                                  </span>
                                )}
                                {entry.intensity && (
                                  <span className='px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full font-medium'>
                                    {entry.intensity}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <div className='text-right'>
                                <div className='flex items-center gap-1 text-purple-600 font-bold'>
                                  <Flame className='w-4 h-4' />
                                  <span>
                                    {Math.round(entry.caloriesBurned)}
                                  </span>
                                </div>
                                <p className='text-xs text-slate-500'>burned</p>
                              </div>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      'Are you sure you want to delete this workout?'
                                    )
                                  ) {
                                    try {
                                      await exerciseService.deleteExerciseEntry(
                                        entry.id
                                      );
                                      loadExerciseEntries();
                                      loadFoodEntries(); // Refresh to update net calories
                                    } catch (error) {
                                      console.error(
                                        'Failed to delete workout:',
                                        error
                                      );
                                      alert(
                                        'Failed to delete workout. Please try again.'
                                      );
                                    }
                                  }
                                }}
                                className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0'>
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Stats with Progress */}
            <Card padding='lg' variant='default'>
              <div className='space-y-5'>
                {[
                  {
                    label: 'Calories',
                    value: Math.round(dailyTotals.calories),
                    target: userTargets.dailyCalorieTarget,
                    icon: Flame,
                    color: 'from-orange-500 to-red-500',
                    unit: '',
                  },
                  {
                    label: 'Protein',
                    value: Math.round(dailyTotals.protein),
                    target: userTargets.proteinTarget,
                    icon: Activity,
                    color: 'from-blue-500 to-cyan-500',
                    unit: 'g',
                  },
                  {
                    label: 'Carbs',
                    value: Math.round(dailyTotals.carbs),
                    target: userTargets.carbsTarget,
                    icon: TrendingUp,
                    color: 'from-green-500 to-emerald-500',
                    unit: 'g',
                  },
                  {
                    label: 'Fats',
                    value: Math.round(dailyTotals.fats),
                    target: userTargets.fatsTarget,
                    icon: Droplet,
                    color: 'from-amber-500 to-yellow-500',
                    unit: 'g',
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  const percentage = stat.target
                    ? Math.min(100, (stat.value / stat.target) * 100)
                    : 0;

                  return (
                    <div key={stat.label}>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <Icon className='w-4 h-4 text-slate-600' />
                          <span className='text-sm font-semibold text-slate-700'>
                            {stat.label}
                          </span>
                        </div>
                        <div className='text-right'>
                          <span className='text-lg font-bold text-slate-900'>
                            {stat.value}
                          </span>
                          <span className='text-sm text-slate-500 mx-1'>/</span>
                          <span className='text-sm font-medium text-slate-600'>
                            {stat.target}
                            {stat.unit}
                          </span>
                          <span className='text-xs text-slate-400 ml-2'>
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                      <div className='relative h-3 bg-slate-100 rounded-full overflow-hidden'>
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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

              <div className='space-y-4'>
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
                    <div key={item.label}>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-slate-700'>
                          {item.label}
                        </span>
                        <div className='text-right'>
                          <span className='text-sm font-semibold text-slate-900'>
                            {item.value > 0 ? item.value.toFixed(1) : '0'}
                          </span>
                          <span className='text-xs text-slate-500 mx-1'>/</span>
                          <span className='text-xs font-medium text-slate-600'>
                            {item.target} {item.unit}
                          </span>
                          <span className='text-xs text-slate-400 ml-2'>
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                      <div className='relative h-2 bg-amber-50 rounded-full overflow-hidden border border-amber-100'>
                        <div
                          className='absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500'
                          style={{ width: `${percentage}%` }}
                        />
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

              <div className='space-y-4'>
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
                    <div key={item.label}>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-slate-700'>
                          {item.label}
                        </span>
                        <div className='text-right'>
                          <span className='text-sm font-semibold text-slate-900'>
                            {item.value > 0 ? item.value.toFixed(1) : '0'}
                          </span>
                          <span className='text-xs text-slate-500 mx-1'>/</span>
                          <span className='text-xs font-medium text-slate-600'>
                            {item.target} {item.unit}
                          </span>
                          <span className='text-xs text-slate-400 ml-2'>
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                      <div className='relative h-2 bg-orange-50 rounded-full overflow-hidden border border-orange-100'>
                        <div
                          className='absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500'
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column - Progress Overview */}
          <div className='col-span-1 max-col-span-1 space-y-6'>
            {/* Daily Progress */}
            <Card padding='lg' variant='gradient'>
              <div className='mb-6'>
                <div className='inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4'>
                  <Target className='w-4 h-4 text-white' />
                  <span className='text-xs font-semibold text-white'>
                    Daily Goal
                  </span>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-end justify-between'>
                    <h2 className='text-3xl font-bold text-white'>
                      {Math.round(dailyTotals.calories)}
                    </h2>
                    <span className='text-sm text-white/80 mb-1'>
                      / {Math.round(adjustedTarget)} cal
                    </span>
                  </div>
                  <div className='relative h-3 bg-white/20 rounded-full overflow-hidden'>
                    <div
                      className='absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500'
                      style={{ width: `${Math.min(100, calorieProgress)}%` }}
                    />
                  </div>
                  <p className='text-xs text-white/80'>
                    {Math.round(calorieProgress)}% of adjusted goal
                  </p>
                </div>
              </div>

              <div className='space-y-3 pt-4 border-t border-white/20'>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Consumed</span>
                  <span className='font-bold text-white'>
                    {Math.round(dailyTotals.calories)} cal
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Burned (Exercise)</span>
                  <span className='font-bold text-emerald-300'>
                    +{Math.round(totalExerciseCalories)} cal
                  </span>
                </div>
                <div className='flex justify-between text-sm border-t border-white/10 pt-2'>
                  <span className='text-white/80'>Base Target</span>
                  <span className='font-bold text-white'>
                    {userTargets.dailyCalorieTarget} cal
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Adjusted Target</span>
                  <span className='font-bold text-white'>
                    {Math.round(adjustedTarget)} cal
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Remaining</span>
                  <span className='font-bold text-white'>
                    {Math.max(
                      0,
                      Math.round(adjustedTarget) -
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

      {/* Food Log Modal */}
      <FoodLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedDate={selectedDate}
        onFoodAdded={handleAddFood}
      />

      {/* Exercise Log Modal */}
      <ExerciseLogModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        selectedDate={selectedDate}
        onExerciseAdded={handleAddExercise}
      />

      {/* Daily Log Modal */}
      <DailyLogModal
        isOpen={showDailyLogModal}
        onClose={() => setShowDailyLogModal(false)}
        selectedDate={selectedDate}
        onLogAdded={() => {
          // Refresh data after logging
          loadDailyLog();
          setShowDailyLogModal(false);
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
