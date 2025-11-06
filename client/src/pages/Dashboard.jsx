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
  Camera,
  ChevronRight,
  Award,
  Zap,
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
import { pictureService } from '../services/pictureService';

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
  const [dailyPicture, setDailyPicture] = useState(null);
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
    loadDailyPicture();
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

  const loadDailyPicture = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const picture = await pictureService.getPicture(dateStr);
      setDailyPicture(picture);
    } catch {
      // No picture for this date - that's okay
      setDailyPicture(null);
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20'>
      {/* Modern Header */}
      <header className='sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-slate-200/60 shadow-sm'>
        <div className='max-w-[1400px] mx-auto px-6 max-lg:px-5 max-sm:px-4'>
          <div className='flex items-center justify-between h-20 max-md:h-16'>
            <div className='flex items-center gap-4 max-sm:gap-3 min-w-0'>
              <div className='relative'>
                <LogoIcon className='w-12 h-12 max-sm:w-10 max-sm:h-10 flex-shrink-0' />
                <div className='absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse'></div>
              </div>
              <div className='min-w-0'>
                <h1 className='text-2xl max-lg:text-xl max-sm:text-lg font-extrabold bg-gradient-to-r from-slate-900 via-emerald-700 to-teal-600 bg-clip-text text-transparent truncate'>
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
                </h1>
                <div className='text-sm max-sm:text-xs text-slate-500 font-medium flex items-center gap-1.5'>
                  <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full block'></span>
                  <span>{format(selectedDate, 'EEEE, MMM d')}</span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 max-sm:gap-2 flex-shrink-0'>
              <button className='relative p-2.5 max-sm:p-2 hover:bg-emerald-50/80 rounded-2xl transition-all active:scale-95 group'>
                <Bell className='w-5 h-5 max-sm:w-4.5 max-sm:h-4.5 text-slate-600 group-hover:text-emerald-600 transition-colors' />
                <span className='absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full ring-2 ring-white shadow-sm'></span>
              </button>

              {/* User Profile Dropdown */}
              <div className='relative' ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center gap-2.5 hover:bg-slate-50 rounded-2xl transition-all active:scale-95 p-1.5 pr-3 group'>
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user?.name || 'User'}
                      onError={(e) => {
                        console.error('Image failed to load:', user.picture);
                        e.target.style.display = 'none';
                      }}
                      referrerPolicy='no-referrer'
                      className='w-9 h-9 max-sm:w-8 max-sm:h-8 rounded-xl border-2 border-emerald-400/60 object-cover shadow-sm group-hover:border-emerald-500 transition-colors'
                    />
                  ) : null}
                  <div
                    className={`w-9 h-9 max-sm:w-8 max-sm:h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                      user?.picture ? 'hidden' : ''
                    }`}>
                    {getUserInitials()}
                  </div>
                  <ChevronDown className='w-4 h-4 text-slate-500 max-sm:hidden group-hover:text-slate-700 transition-colors' />
                </button>

                {/* Dropdown Menu - unchanged */}
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

      <main className='max-w-[1400px] mx-auto px-6 max-lg:px-5 max-sm:px-4 py-8 max-lg:py-6 pb-8 max-lg:pb-24'>
        {/* Hero Stats Section */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8'>
          {/* Main Calorie Card */}
          <div className='lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 shadow-2xl shadow-emerald-500/20'>
            <div className='absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl'></div>
            <div className='absolute bottom-0 left-0 w-60 h-60 bg-teal-400/10 rounded-full -ml-30 -mb-30 blur-2xl'></div>

            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <Target className='w-5 h-5 text-emerald-100' />
                    <span className='text-sm font-semibold text-emerald-100 uppercase tracking-wide'>
                      Daily Goal
                    </span>
                  </div>
                  <h2 className='text-5xl max-lg:text-4xl font-black text-white mb-2'>
                    {Math.round(dailyTotals.calories)}
                    <span className='text-2xl text-emerald-100 font-semibold ml-2'>
                      / {Math.round(adjustedTarget)}
                    </span>
                  </h2>
                  <p className='text-emerald-100 text-sm font-medium'>
                    {Math.round(calorieProgress)}% of your adjusted calorie goal
                  </p>
                </div>
                <div className='hidden md:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20'>
                  <Flame className='w-12 h-12 text-white' />
                </div>
              </div>

              {/* Progress Bar */}
              <div className='relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm mb-6'>
                <div
                  className='absolute inset-y-0 left-0 bg-gradient-to-r from-white to-emerald-100 rounded-full transition-all duration-700 shadow-lg'
                  style={{ width: `${Math.min(100, calorieProgress)}%` }}
                />
              </div>

              {/* Stats Grid */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Apple className='w-4 h-4 text-emerald-100' />
                    <span className='text-xs font-semibold text-emerald-100 uppercase'>
                      Consumed
                    </span>
                  </div>
                  <p className='text-2xl font-black text-white'>
                    {Math.round(dailyTotals.calories)}
                  </p>
                </div>
                <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Activity className='w-4 h-4 text-emerald-100' />
                    <span className='text-xs font-semibold text-emerald-100 uppercase'>
                      Burned
                    </span>
                  </div>
                  <p className='text-2xl font-black text-white'>
                    +{Math.round(totalExerciseCalories)}
                  </p>
                </div>
                <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Target className='w-4 h-4 text-emerald-100' />
                    <span className='text-xs font-semibold text-emerald-100 uppercase'>
                      Remaining
                    </span>
                  </div>
                  <p className='text-2xl font-black text-white'>
                    {Math.max(
                      0,
                      Math.round(adjustedTarget) -
                        Math.round(dailyTotals.calories)
                    )}
                  </p>
                </div>
                <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Award className='w-4 h-4 text-emerald-100' />
                    <span className='text-xs font-semibold text-emerald-100 uppercase'>
                      Base Goal
                    </span>
                  </div>
                  <p className='text-2xl font-black text-white'>
                    {userTargets.dailyCalorieTarget}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Macros Card */}
          <div className='bg-white rounded-3xl p-6 shadow-xl border border-slate-200'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-bold text-slate-800'>Macros</h3>
              <Zap className='w-5 h-5 text-amber-500' />
            </div>
            <div className='space-y-4'>
              {[
                {
                  label: 'Protein',
                  value: Math.round(dailyTotals.protein),
                  target: userTargets.proteinTarget,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'bg-blue-50',
                  textColor: 'text-blue-600',
                  unit: 'g',
                },
                {
                  label: 'Carbs',
                  value: Math.round(dailyTotals.carbs),
                  target: userTargets.carbsTarget,
                  color: 'from-green-500 to-emerald-500',
                  bgColor: 'bg-green-50',
                  textColor: 'text-green-600',
                  unit: 'g',
                },
                {
                  label: 'Fats',
                  value: Math.round(dailyTotals.fats),
                  target: userTargets.fatsTarget,
                  color: 'from-amber-500 to-yellow-500',
                  bgColor: 'bg-amber-50',
                  textColor: 'text-amber-600',
                  unit: 'g',
                },
              ].map((macro) => {
                const percentage = macro.target
                  ? Math.min(100, (macro.value / macro.target) * 100)
                  : 0;

                return (
                  <div
                    key={macro.label}
                    className={`${macro.bgColor} rounded-2xl p-4`}>
                    <div className='flex items-center justify-between mb-2'>
                      <span className={`text-sm font-bold ${macro.textColor}`}>
                        {macro.label}
                      </span>
                      <span className='text-lg font-black text-slate-900'>
                        {macro.value}
                        <span className='text-xs text-slate-500 font-semibold ml-0.5'>
                          /{macro.target}
                          {macro.unit}
                        </span>
                      </span>
                    </div>
                    <div className='relative h-2 bg-white rounded-full overflow-hidden'>
                      <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${macro.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Date Carousel - More compact */}
            <Card padding='md' variant='default'>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </Card>

            {/* Onboarding Reminder */}
            {!user?.profileCompleted && (
              <div className='relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 shadow-lg'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16'></div>
                <div className='relative z-10 flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <div className='flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                      <Info className='w-5 h-5 text-white' />
                    </div>
                    <div>
                      <p className='text-sm font-bold text-white'>
                        Complete your profile
                      </p>
                      <p className='text-xs text-white/90'>
                        Get personalized nutrition targets
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartOnboarding}
                    className='flex-shrink-0 px-4 py-2 bg-white text-orange-600 hover:bg-white/90 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 shadow-lg'>
                    Start Now
                    <ArrowRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}

            {/* Upgrade Banner */}
            {!user?.isPro && (
              <div className='relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 shadow-2xl shadow-purple-500/20'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl'></div>
                <div className='absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-400/10 rounded-full -ml-24 -mb-24 blur-2xl'></div>

                <div className='relative z-10 flex flex-row max-md:flex-col items-center max-md:items-start justify-between gap-4'>
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Sparkles className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <h3 className='text-xl font-black text-white mb-1'>
                        Unlock Premium Features
                      </h3>
                      <p className='text-sm text-white/90 mb-2'>
                        Track 30+ nutrients with AI-powered insights
                      </p>
                      {subscription?.freeLogs >= 0 && (
                        <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full'>
                          <div className='w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse'></div>
                          <span className='text-xs text-white font-bold'>
                            {subscription.freeLogs} free{' '}
                            {subscription.freeLogs === 1 ? 'log' : 'logs'} left
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/upgrade')}
                    className='flex-shrink-0 px-6 py-3 bg-white text-purple-600 hover:bg-white/90 rounded-xl font-bold shadow-xl whitespace-nowrap transition-all flex items-center gap-2'>
                    Upgrade Now
                    <Sparkles className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}

            {/* Daily Log - Redesigned */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center justify-between mb-5'>
                <div>
                  <h2 className='text-xl font-bold text-slate-800 mb-1'>
                    Daily Metrics
                  </h2>
                  <p className='text-sm text-slate-500'>
                    Track weight, water & progress
                  </p>
                </div>
                <button
                  onClick={() => setShowDailyLogModal(true)}
                  className='flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-semibold text-sm'>
                  <Plus className='w-4 h-4' />
                  Log Entry
                </button>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {/* Weight */}
                <div className='group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-100 hover:border-blue-300 transition-all cursor-default'>
                  <div className='absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform'></div>
                  <div className='relative z-10'>
                    <div className='flex items-center gap-2 mb-3'>
                      <div className='w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center'>
                        <Scale className='w-5 h-5 text-white' />
                      </div>
                      <h3 className='text-sm font-bold text-blue-900'>
                        Weight
                      </h3>
                    </div>
                    {dailyLog?.weight ? (
                      <>
                        <p className='text-3xl font-black text-blue-900 mb-1'>
                          {dailyLog.weight}
                          <span className='text-lg text-blue-600 ml-1'>
                            {dailyLog.weightUnit || 'kg'}
                          </span>
                        </p>
                        <div className='flex items-center gap-1 text-xs text-blue-600 font-medium'>
                          <CheckCircle className='w-3 h-3' />
                          Logged today
                        </div>
                      </>
                    ) : (
                      <>
                        <p className='text-3xl font-black text-blue-300 mb-1'>
                          --
                        </p>
                        <p className='text-xs text-blue-500 font-medium'>
                          Not logged yet
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Water */}
                <div className='group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-5 border-2 border-cyan-100 hover:border-cyan-300 transition-all cursor-default'>
                  <div className='absolute top-0 right-0 w-20 h-20 bg-cyan-200/20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform'></div>
                  <div className='relative z-10'>
                    <div className='flex items-center gap-2 mb-3'>
                      <div className='w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center'>
                        <Droplet className='w-5 h-5 text-white' />
                      </div>
                      <h3 className='text-sm font-bold text-cyan-900'>Water</h3>
                    </div>
                    {dailyLog?.waterIntake ? (
                      <>
                        <p className='text-3xl font-black text-cyan-900 mb-1'>
                          {Math.round(dailyLog.waterIntake)}
                          <span className='text-lg text-cyan-600 ml-1'>
                            {dailyLog.waterUnit || 'ml'}
                          </span>
                        </p>
                        <div className='flex items-center gap-1 text-xs text-cyan-600 font-medium'>
                          <CheckCircle className='w-3 h-3' />
                          Logged today
                        </div>
                      </>
                    ) : (
                      <>
                        <p className='text-3xl font-black text-cyan-300 mb-1'>
                          --
                        </p>
                        <p className='text-xs text-cyan-500 font-medium'>
                          Not logged yet
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Picture */}
                <div
                  className='group relative overflow-hidden bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-5 border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer'
                  onClick={() => setShowDailyLogModal(true)}>
                  <div className='absolute top-0 right-0 w-20 h-20 bg-purple-200/20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform'></div>
                  <div className='relative z-10'>
                    <div className='flex items-center gap-2 mb-3'>
                      <div className='w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center'>
                        <Camera className='w-5 h-5 text-white' />
                      </div>
                      <h3 className='text-sm font-bold text-purple-900'>
                        Picture
                      </h3>
                    </div>
                    {dailyPicture?.thumbnailUrl ? (
                      <>
                        <img
                          src={dailyPicture.thumbnailUrl}
                          alt='Daily progress'
                          className='w-full h-24 object-cover rounded-xl mb-2 shadow-md'
                        />
                        <div className='flex items-center gap-1 text-xs text-purple-600 font-medium'>
                          <CheckCircle className='w-3 h-3' />
                          Click to view
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='w-full h-24 bg-purple-100 rounded-xl flex items-center justify-center mb-2'>
                          <Camera className='w-10 h-10 text-purple-300' />
                        </div>
                        <p className='text-xs text-purple-500 font-medium'>
                          Not logged yet
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Food Entries */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-xl font-bold text-slate-800 mb-1'>
                    Today's Meals
                  </h2>
                  <p className='text-sm text-slate-500'>
                    {foodEntries.length}{' '}
                    {foodEntries.length === 1 ? 'entry' : 'entries'} logged
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold text-sm'>
                  <Plus className='w-4 h-4' />
                  Add Food
                </button>
              </div>

              <div className='space-y-3'>
                {foodEntries.length === 0 ? (
                  <div className='text-center py-16'>
                    <div className='w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center'>
                      <Apple className='w-10 h-10 text-emerald-600' />
                    </div>
                    <p className='text-slate-700 font-bold mb-2 text-lg'>
                      No meals logged yet
                    </p>
                    <p className='text-sm text-slate-400 mb-4'>
                      Start tracking your nutrition journey
                    </p>
                    <button
                      onClick={() => setShowModal(true)}
                      className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors font-semibold text-sm'>
                      <Plus className='w-4 h-4' />
                      Add Your First Meal
                    </button>
                  </div>
                ) : (
                  foodEntries.map((entry) => {
                    const MealIcon = getMealIcon(entry.mealType);
                    const mealColor = getMealColor(entry.mealType);

                    return (
                      <div
                        key={entry.id}
                        className='group bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all hover:shadow-md'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='flex items-start gap-3 flex-1 min-w-0'>
                            <div
                              className={`p-2.5 rounded-xl bg-gradient-to-br ${mealColor} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                              <MealIcon className='w-5 h-5 text-white' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-1.5 flex-wrap'>
                                <span className='text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded-md'>
                                  {entry.mealType}
                                </span>
                                <span className='text-xs text-slate-400 flex items-center gap-1'>
                                  <Clock className='w-3 h-3' />
                                  {format(new Date(entry.createdAt), 'h:mm a')}
                                </span>
                              </div>
                              <Tooltip content={entry.foodName}>
                                <h3 className='font-bold text-slate-800 mb-3 break-words line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors text-base'>
                                  {entry.foodName}
                                </h3>
                              </Tooltip>

                              <div className='grid grid-cols-4 gap-3'>
                                <div className='bg-orange-50 rounded-xl p-2.5 text-center'>
                                  <p className='text-xs text-orange-600 font-semibold mb-1'>
                                    Calories
                                  </p>
                                  <p className='font-black text-orange-700 text-lg'>
                                    {Math.round(entry.calories)}
                                  </p>
                                </div>
                                <div className='bg-blue-50 rounded-xl p-2.5 text-center'>
                                  <p className='text-xs text-blue-600 font-semibold mb-1'>
                                    Protein
                                  </p>
                                  <p className='font-black text-blue-700 text-lg'>
                                    {Math.round(entry.protein)}
                                    <span className='text-xs'>g</span>
                                  </p>
                                </div>
                                <div className='bg-green-50 rounded-xl p-2.5 text-center'>
                                  <p className='text-xs text-green-600 font-semibold mb-1'>
                                    Carbs
                                  </p>
                                  <p className='font-black text-green-700 text-lg'>
                                    {Math.round(entry.carbs)}
                                    <span className='text-xs'>g</span>
                                  </p>
                                </div>
                                <div className='bg-amber-50 rounded-xl p-2.5 text-center'>
                                  <p className='text-xs text-amber-600 font-semibold mb-1'>
                                    Fats
                                  </p>
                                  <p className='font-black text-amber-700 text-lg'>
                                    {Math.round(entry.fats)}
                                    <span className='text-xs'>g</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteFood(entry.id)}
                            className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0'>
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Exercise Entries */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-xl font-bold text-slate-800 mb-1'>
                    Today's Workouts
                  </h2>
                  <p className='text-sm text-slate-500'>
                    {exerciseEntries.length}{' '}
                    {exerciseEntries.length === 1 ? 'workout' : 'workouts'}{' '}
                    logged
                  </p>
                </div>
                <button
                  onClick={() => setShowExerciseModal(true)}
                  className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-semibold text-sm'>
                  <Plus className='w-4 h-4' />
                  Add Workout
                </button>
              </div>

              <div className='space-y-3'>
                {exerciseEntries.length === 0 ? (
                  <div className='text-center py-16'>
                    <div className='w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center'>
                      <Activity className='w-10 h-10 text-purple-600' />
                    </div>
                    <p className='text-slate-700 font-bold mb-2 text-lg'>
                      No workouts logged yet
                    </p>
                    <p className='text-sm text-slate-400 mb-4'>
                      Track your exercise and calories burned
                    </p>
                    <button
                      onClick={() => setShowExerciseModal(true)}
                      className='inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-semibold text-sm'>
                      <Plus className='w-4 h-4' />
                      Add Your First Workout
                    </button>
                  </div>
                ) : (
                  exerciseEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className='group bg-white border-2 border-slate-200 hover:border-purple-300 rounded-2xl p-4 transition-all hover:shadow-md'>
                      <div className='flex items-start gap-3'>
                        <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'>
                          <Activity className='w-6 h-6 text-white' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between gap-2 mb-2'>
                            <div className='flex-1'>
                              <h3 className='font-bold text-slate-800 mb-1 text-base'>
                                {entry.exerciseName}
                              </h3>
                              {entry.description && (
                                <p className='text-sm text-slate-600 mb-2 line-clamp-2'>
                                  {entry.description}
                                </p>
                              )}
                              <div className='flex flex-wrap items-center gap-2 text-xs'>
                                {entry.duration && (
                                  <span className='flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold'>
                                    <Clock className='w-3 h-3' />
                                    {Math.round(entry.duration)} min
                                  </span>
                                )}
                                {entry.exerciseType && (
                                  <span className='px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg font-bold'>
                                    {entry.exerciseType}
                                  </span>
                                )}
                                {entry.intensity && (
                                  <span className='px-2.5 py-1 bg-pink-100 text-pink-700 rounded-lg font-bold'>
                                    {entry.intensity}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <div className='text-right bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 border-2 border-orange-200'>
                                <div className='flex items-center gap-1.5 text-orange-600 font-black text-xl mb-0.5'>
                                  <Flame className='w-5 h-5' />
                                  <span>
                                    {Math.round(entry.caloriesBurned)}
                                  </span>
                                </div>
                                <p className='text-xs text-orange-600 font-semibold'>
                                  burned
                                </p>
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
                                      loadFoodEntries();
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
                                className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0'>
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Heart Health */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center'>
                  <Heart className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-slate-800'>
                    Heart Health
                  </h3>
                  <p className='text-xs text-slate-500'>
                    Daily nutrition limits
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                {[
                  {
                    label: 'Sodium',
                    value: Math.round(dailyTotals.sodium),
                    max: 2300,
                    unit: 'mg',
                    color: 'from-purple-500 to-pink-500',
                    bgColor: 'bg-purple-50',
                  },
                  {
                    label: 'Sugar',
                    value: Math.round(dailyTotals.sugar),
                    max: 50,
                    unit: 'g',
                    color: 'from-pink-500 to-rose-500',
                    bgColor: 'bg-pink-50',
                  },
                  {
                    label: 'Cholesterol',
                    value: Math.round(dailyTotals.cholesterol),
                    max: 300,
                    unit: 'mg',
                    color: 'from-rose-500 to-red-500',
                    bgColor: 'bg-rose-50',
                  },
                  {
                    label: 'Fiber',
                    value: Math.round(dailyTotals.fiber),
                    max: 30,
                    unit: 'g',
                    color: 'from-green-500 to-emerald-500',
                    bgColor: 'bg-green-50',
                  },
                ].map((item) => {
                  const percentage = Math.min(
                    100,
                    (item.value / item.max) * 100
                  );
                  const isHigh = percentage > 80;

                  return (
                    <div
                      key={item.label}
                      className={`${item.bgColor} rounded-2xl p-4`}>
                      <div className='flex justify-between mb-2'>
                        <span className='text-sm font-bold text-slate-700'>
                          {item.label}
                        </span>
                        <span className='text-base font-black text-slate-900'>
                          {item.value}
                          <span className='text-xs text-slate-500 font-semibold'>
                            /{item.max}
                            {item.unit}
                          </span>
                        </span>
                      </div>
                      <div className='relative h-2.5 bg-white rounded-full overflow-hidden border border-white'>
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                            item.color
                          } rounded-full transition-all duration-500 ${
                            isHigh ? 'animate-pulse' : ''
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className='text-xs text-slate-600 font-medium mt-1.5'>
                        {Math.round(percentage)}% of daily limit
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Action Card */}
            <div className='bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white'>
              <div className='flex items-center gap-2 mb-4'>
                <BarChart3 className='w-5 h-5 text-emerald-400' />
                <h3 className='text-lg font-bold'>Quick Actions</h3>
              </div>
              <div className='space-y-2.5'>
                <button
                  onClick={() => navigate('/insights')}
                  className='w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/15 rounded-xl transition-all group'>
                  <div className='flex items-center gap-3'>
                    <TrendingUp className='w-5 h-5 text-emerald-400' />
                    <span className='font-semibold text-sm'>View Insights</span>
                  </div>
                  <ChevronRight className='w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all' />
                </button>
                <button
                  onClick={() => navigate('/account')}
                  className='w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/15 rounded-xl transition-all group'>
                  <div className='flex items-center gap-3'>
                    <Settings className='w-5 h-5 text-blue-400' />
                    <span className='font-semibold text-sm'>Settings</span>
                  </div>
                  <ChevronRight className='w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all' />
                </button>
                {!user?.isPro && (
                  <button
                    onClick={() => navigate('/upgrade')}
                    className='w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 border border-yellow-500/30 rounded-xl transition-all group'>
                    <div className='flex items-center gap-3'>
                      <Sparkles className='w-5 h-5 text-yellow-400' />
                      <span className='font-bold text-sm text-yellow-400'>
                        Upgrade to Pro
                      </span>
                    </div>
                    <ChevronRight className='w-4 h-4 text-yellow-400 group-hover:translate-x-1 transition-all' />
                  </button>
                )}
              </div>
            </div>

            {/* Micronutrients Summary */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center'>
                  <Sparkles className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-slate-800'>
                    Micronutrients
                  </h3>
                  <p className='text-xs text-slate-500'>Vitamins & minerals</p>
                </div>
              </div>

              <div className='space-y-3'>
                {/* Top Vitamins */}
                <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-100'>
                  <h4 className='text-sm font-bold text-amber-900 mb-3 flex items-center gap-2'>
                    <Sparkles className='w-4 h-4' />
                    Top Vitamins Today
                  </h4>
                  <div className='space-y-2'>
                    {[
                      {
                        label: 'Vitamin C',
                        value: dailyTotals.vitaminC,
                        target: 90,
                        unit: 'mg',
                      },
                      {
                        label: 'Vitamin A',
                        value: dailyTotals.vitaminA,
                        target: 900,
                        unit: 'mcg',
                      },
                      {
                        label: 'Vitamin D',
                        value: dailyTotals.vitaminD,
                        target: 20,
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
                          className='flex justify-between items-center text-xs'>
                          <span className='font-semibold text-amber-800'>
                            {item.label}
                          </span>
                          <span className='font-bold text-amber-900'>
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const vitaminsSection =
                        document.querySelector('#vitamins-section');
                      if (vitaminsSection) {
                        vitaminsSection.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }
                    }}
                    className='mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl transition-colors font-semibold text-xs'>
                    View All Vitamins
                    <ChevronRight className='w-3.5 h-3.5' />
                  </button>
                </div>

                {/* Top Minerals */}
                <div className='bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-100'>
                  <h4 className='text-sm font-bold text-orange-900 mb-3 flex items-center gap-2'>
                    <Sparkles className='w-4 h-4' />
                    Top Minerals Today
                  </h4>
                  <div className='space-y-2'>
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
                        label: 'Potassium',
                        value: dailyTotals.potassium,
                        target: 3500,
                        unit: 'mg',
                      },
                    ].map((item) => {
                      const percentage = Math.min(
                        100,
                        (item.value / item.target) * 100
                      );

                      return (
                        <div
                          key={item.label}
                          className='flex justify-between items-center text-xs'>
                          <span className='font-semibold text-orange-800'>
                            {item.label}
                          </span>
                          <span className='font-bold text-orange-900'>
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const mineralsSection =
                        document.querySelector('#minerals-section');
                      if (mineralsSection) {
                        mineralsSection.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }
                    }}
                    className='mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl transition-colors font-semibold text-xs'>
                    View All Minerals
                    <ChevronRight className='w-3.5 h-3.5' />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Vitamins & Minerals Sections - Full Width */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
          {/* Vitamins */}
          <Card padding='lg' variant='default' id='vitamins-section'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center'>
                <Sparkles className='w-6 h-6 text-white' />
              </div>
              <div>
                <h3 className='text-xl font-bold text-slate-800'>Vitamins</h3>
                <p className='text-sm text-slate-500'>
                  Essential daily vitamins
                </p>
              </div>
            </div>

            <div className='space-y-3'>
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
                      <span className='text-sm font-semibold text-slate-700'>
                        {item.label}
                      </span>
                      <div className='text-right'>
                        <span className='text-sm font-bold text-slate-900'>
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
                    <div className='relative h-2 bg-amber-50 rounded-full overflow-hidden'>
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
          <Card padding='lg' variant='default' id='minerals-section'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center'>
                <Sparkles className='w-6 h-6 text-white' />
              </div>
              <div>
                <h3 className='text-xl font-bold text-slate-800'>Minerals</h3>
                <p className='text-sm text-slate-500'>
                  Essential daily minerals
                </p>
              </div>
            </div>

            <div className='space-y-3'>
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
                      <span className='text-sm font-semibold text-slate-700'>
                        {item.label}
                      </span>
                      <div className='text-right'>
                        <span className='text-sm font-bold text-slate-900'>
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
                    <div className='relative h-2 bg-orange-50 rounded-full overflow-hidden'>
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
          loadDailyPicture();
          setShowDailyLogModal(false);
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
