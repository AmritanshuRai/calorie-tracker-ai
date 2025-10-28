import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Sparkles,
  BarChart3,
  Calendar,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import useUserStore from '../stores/useUserStore';
import Card from '../components/Card';
import Button from '../components/Button';
import Footer from '../components/Footer';
import { LogoIcon } from '../components/Logo';
import { foodService } from '../services/foodService';
import { authService } from '../services/authService';

const DATE_RANGES = [
  { id: 'last7days', label: 'Last 7 Days', days: 7 },
  { id: 'last30days', label: 'Last 30 Days', days: 30 },
  { id: 'last6months', label: 'Last 6 Months', days: 180 },
  { id: 'last1year', label: 'Last 1 Year', days: 365 },
  { id: 'alltime', label: 'All Time', days: null },
];

const MACRO_COLORS = {
  protein: '#3b82f6', // blue
  carbs: '#10b981', // green
  fats: '#f59e0b', // amber
};

// Default RDA values (used as fallback when user hasn't completed onboarding)
const DEFAULT_NUTRIENT_TARGETS = {
  vitaminA: 900,
  vitaminC: 90,
  vitaminD: 20,
  vitaminE: 15,
  vitaminK: 120,
  vitaminB1: 1.2,
  vitaminB2: 1.3,
  vitaminB3: 16,
  vitaminB5: 5,
  vitaminB6: 1.7,
  vitaminB9: 400,
  vitaminB12: 2.4,
  calcium: 1000,
  iron: 18,
  magnesium: 400,
  phosphorus: 700,
  potassium: 3500,
  sodium: 1500,
  zinc: 11,
  selenium: 55,
  copper: 900,
  manganese: 2.3,
};

export default function Insights() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const micronutrients = useUserStore((state) => state.micronutrients);
  const logout = useUserStore((state) => state.logout);
  const clearOnboardingData = useUserStore(
    (state) => state.clearOnboardingData
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedRange, setSelectedRange] = useState('last7days');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    calorieTrend: [],
    macroDistribution: [],
    macroTrends: [],
    nutrientHeatmap: [],
  });
  const userMenuRef = useRef(null);

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

  // Load data when date range changes
  useEffect(() => {
    loadInsightsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    if (selectedRange === 'custom' && customStartDate && customEndDate) {
      return {
        start: startOfDay(new Date(customStartDate)),
        end: endOfDay(new Date(customEndDate)),
      };
    }

    const range = DATE_RANGES.find((r) => r.id === selectedRange);
    if (!range || !range.days) {
      // All time - get user's creation date or go back 1 year
      return {
        start: subDays(new Date(), 365),
        end: endOfDay(new Date()),
      };
    }

    return {
      start: startOfDay(subDays(new Date(), range.days - 1)),
      end: endOfDay(new Date()),
    };
  };

  const loadInsightsData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();

      // Format dates for API
      const startDateStr = format(start, 'yyyy-MM-dd');
      const endDateStr = format(end, 'yyyy-MM-dd');

      // Fetch all food entries for the date range in ONE API call
      const entriesByDate = await foodService.getFoodLogRange(
        startDateStr,
        endDateStr
      );

      // Generate array of dates in range
      const dates = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Map entries to dates (fill missing dates with empty arrays)
      const allEntries = dates.map((date) => entriesByDate[date] || []);

      // Process data for charts
      processCalorieTrend(dates, allEntries);
      processMacroDistribution(allEntries.flat());
      processMacroTrends(dates, allEntries);
      processNutrientHeatmap(dates, allEntries);
    } catch (error) {
      console.error('Error loading insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get nutrient targets - use personalized if available, otherwise use defaults
  const getNutrientTargets = () => {
    if (user?.profileCompleted && micronutrients) {
      return micronutrients;
    }
    return DEFAULT_NUTRIENT_TARGETS;
  };

  const handleStartOnboarding = () => {
    clearOnboardingData();
    navigate('/onboarding/gender');
  };

  const processCalorieTrend = (dates, allEntries) => {
    const data = dates.map((date, index) => {
      const entries = allEntries[index] || [];
      const totalCalories = entries.reduce(
        (sum, entry) => sum + (entry.calories || 0),
        0
      );
      return {
        date: format(new Date(date), 'MMM dd'),
        fullDate: date,
        calories: Math.round(totalCalories),
        target: user?.dailyCalorieTarget || 2000,
      };
    });

    setChartData((prev) => ({ ...prev, calorieTrend: data }));
  };

  const processMacroDistribution = (entries) => {
    const totals = entries.reduce(
      (acc, entry) => ({
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fats: acc.fats + (entry.fats || 0),
      }),
      { protein: 0, carbs: 0, fats: 0 }
    );

    // Convert to calories (protein: 4cal/g, carbs: 4cal/g, fats: 9cal/g)
    const data = [
      {
        name: 'Protein',
        value: Math.round(totals.protein * 4),
        grams: Math.round(totals.protein),
        color: MACRO_COLORS.protein,
      },
      {
        name: 'Carbs',
        value: Math.round(totals.carbs * 4),
        grams: Math.round(totals.carbs),
        color: MACRO_COLORS.carbs,
      },
      {
        name: 'Fats',
        value: Math.round(totals.fats * 9),
        grams: Math.round(totals.fats),
        color: MACRO_COLORS.fats,
      },
    ];

    setChartData((prev) => ({ ...prev, macroDistribution: data }));
  };

  const processMacroTrends = (dates, allEntries) => {
    const data = dates.map((date, index) => {
      const entries = allEntries[index] || [];
      const totals = entries.reduce(
        (acc, entry) => ({
          protein: acc.protein + (entry.protein || 0),
          carbs: acc.carbs + (entry.carbs || 0),
          fats: acc.fats + (entry.fats || 0),
        }),
        { protein: 0, carbs: 0, fats: 0 }
      );

      return {
        date: format(new Date(date), 'MMM dd'),
        fullDate: date,
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fats: Math.round(totals.fats),
      };
    });

    setChartData((prev) => ({ ...prev, macroTrends: data }));
  };

  const processNutrientHeatmap = (dates, allEntries) => {
    const nutrientTargets = getNutrientTargets();
    const nutrients = Object.keys(nutrientTargets);

    const data = nutrients.map((nutrient) => {
      const dailyValues = dates.map((date, index) => {
        const entries = allEntries[index] || [];
        const total = entries.reduce(
          (sum, entry) => sum + (entry[nutrient] || 0),
          0
        );
        const target = nutrientTargets[nutrient];
        const percentage = target ? (total / target) * 100 : 0;

        return {
          date: format(new Date(date), 'MMM dd'),
          fullDate: date,
          value: total,
          percentage: Math.round(percentage),
        };
      });

      return {
        nutrient: formatNutrientName(nutrient),
        key: nutrient,
        dailyValues,
      };
    });

    setChartData((prev) => ({ ...prev, nutrientHeatmap: data }));
  };

  const formatNutrientName = (key) => {
    const names = {
      vitaminA: 'Vitamin A',
      vitaminC: 'Vitamin C',
      vitaminD: 'Vitamin D',
      vitaminE: 'Vitamin E',
      vitaminK: 'Vitamin K',
      vitaminB1: 'B1',
      vitaminB2: 'B2',
      vitaminB3: 'B3',
      vitaminB6: 'B6',
      vitaminB9: 'B9',
      vitaminB12: 'B12',
      calcium: 'Calcium',
      iron: 'Iron',
      magnesium: 'Magnesium',
      phosphorus: 'Phosphorus',
      potassium: 'Potassium',
      zinc: 'Zinc',
    };
    return names[key] || key;
  };

  const getHeatmapColor = (percentage) => {
    if (percentage >= 100) return '#10b981'; // green-500
    if (percentage >= 80) return '#84cc16'; // lime-500
    if (percentage >= 50) return '#fbbf24'; // amber-400
    if (percentage >= 25) return '#fb923c'; // orange-400
    return '#ef4444'; // red-500
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
                  Nutrition Insights
                </h1>
                <p className='text-sm max-sm:text-xs text-slate-600 font-medium truncate'>
                  Analyze your nutrition trends
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
                          navigate('/dashboard');
                        }}
                        className='w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors text-left'>
                        <BarChart3 className='w-5 h-5 text-slate-600' />
                        <span className='font-medium text-slate-700'>
                          Dashboard
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

      {/* Onboarding Banner - Show if user hasn't completed profile */}
      {!user?.profileCompleted && (
        <div className='max-w-7xl mx-auto px-8 max-lg:px-6 max-sm:px-4 pt-6'>
          <div className='bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg'>
            <div className='flex items-start gap-4 max-md:flex-col'>
              <div className='flex-shrink-0'>
                <div className='w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center'>
                  <Info className='w-6 h-6 text-amber-600' />
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-bold text-amber-900 mb-2'>
                  Using Default Nutrition Targets
                </h3>
                <p className='text-sm text-amber-800 leading-relaxed mb-4'>
                  The insights shown are based on general nutrition
                  recommendations. Complete your health profile to get
                  personalized nutrient targets tailored to your age, gender,
                  activity level, health goals, and lifestyle.
                </p>
                <Button
                  onClick={handleStartOnboarding}
                  variant='primary'
                  className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all'>
                  <Sparkles className='w-4 h-4' />
                  Complete Health Profile
                  <ArrowRight className='w-4 h-4' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className='max-w-7xl mx-auto px-8 max-lg:px-6 max-sm:px-4 py-8 max-lg:py-6 pb-24'>
        {/* Date Range Selector */}
        <Card padding='lg' variant='default' className='mb-8'>
          <div className='flex flex-wrap items-center gap-4 justify-between'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-5 h-5 text-emerald-600' />
              <h2 className='text-lg font-bold text-slate-800'>Date Range</h2>
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              {DATE_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => {
                    setSelectedRange(range.id);
                    setShowCustomDate(false);
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedRange === range.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                  {range.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustomDate(!showCustomDate)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedRange === 'custom'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                Custom
              </button>
            </div>
          </div>

          {/* Custom Date Picker */}
          {showCustomDate && (
            <div className='mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Start:
                </label>
                <input
                  type='date'
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className='px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none'
                />
              </div>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-slate-700'>
                  End:
                </label>
                <input
                  type='date'
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className='px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none'
                />
              </div>
              <button
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setSelectedRange('custom');
                  }
                }}
                disabled={!customStartDate || !customEndDate}
                className='px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                Apply
              </button>
            </div>
          )}
        </Card>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-4 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-slate-600 font-medium'>
                Loading insights data...
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-8'>
            {/* Calorie Trend Chart */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-2 mb-6'>
                <TrendingUp className='w-5 h-5 text-emerald-600' />
                <h3 className='text-xl font-bold text-slate-800'>
                  Calorie Trend
                </h3>
              </div>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={chartData.calorieTrend}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis
                    dataKey='date'
                    stroke='#64748b'
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke='#64748b' style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='calories'
                    stroke='#10b981'
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    name='Calories Consumed'
                  />
                  <Line
                    type='monotone'
                    dataKey='target'
                    stroke='#f59e0b'
                    strokeWidth={2}
                    strokeDasharray='5 5'
                    dot={false}
                    name='Daily Target'
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Macronutrient Distribution & Trends */}
            <div className='grid md:grid-cols-2 gap-8'>
              {/* Pie Chart */}
              <Card padding='lg' variant='default'>
                <div className='flex items-center gap-2 mb-6'>
                  <PieChart className='w-5 h-5 text-emerald-600' />
                  <h3 className='text-xl font-bold text-slate-800'>
                    Macro Distribution
                  </h3>
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.macroDistribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'>
                      {chartData.macroDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                      }}
                      formatter={(value, name, props) => [
                        `${value} cal (${props.payload.grams}g)`,
                        name,
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className='mt-4 space-y-2'>
                  {chartData.macroDistribution.map((macro) => (
                    <div
                      key={macro.name}
                      className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{ backgroundColor: macro.color }}></div>
                        <span className='text-sm font-medium text-slate-700'>
                          {macro.name}
                        </span>
                      </div>
                      <span className='text-sm text-slate-600'>
                        {macro.grams}g ({macro.value} cal)
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Stacked Bar Chart */}
              <Card padding='lg' variant='default'>
                <div className='flex items-center gap-2 mb-6'>
                  <Activity className='w-5 h-5 text-emerald-600' />
                  <h3 className='text-xl font-bold text-slate-800'>
                    Macro Trends
                  </h3>
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={chartData.macroTrends}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                    <XAxis
                      dataKey='date'
                      stroke='#64748b'
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke='#64748b' style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey='protein'
                      stackId='a'
                      fill={MACRO_COLORS.protein}
                      name='Protein (g)'
                    />
                    <Bar
                      dataKey='carbs'
                      stackId='a'
                      fill={MACRO_COLORS.carbs}
                      name='Carbs (g)'
                    />
                    <Bar
                      dataKey='fats'
                      stackId='a'
                      fill={MACRO_COLORS.fats}
                      name='Fats (g)'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Nutrient Deficiency Heatmap */}
            <Card padding='lg' variant='default'>
              <div className='flex items-center gap-2 mb-6'>
                <Target className='w-5 h-5 text-emerald-600' />
                <h3 className='text-xl font-bold text-slate-800'>
                  Nutrient Deficiency Heatmap
                </h3>
                <span className='text-sm text-slate-600 ml-2'>
                  (% of daily target)
                </span>
              </div>

              <div className='overflow-x-auto'>
                <div className='min-w-max'>
                  {/* Legend */}
                  <div className='flex items-center gap-4 mb-4 pb-4 border-b border-slate-200'>
                    <span className='text-sm font-medium text-slate-700'>
                      Legend:
                    </span>
                    {[
                      { label: '100%+', color: '#10b981' },
                      { label: '80-100%', color: '#84cc16' },
                      { label: '50-80%', color: '#fbbf24' },
                      { label: '25-50%', color: '#fb923c' },
                      { label: '<25%', color: '#ef4444' },
                    ].map((item) => (
                      <div key={item.label} className='flex items-center gap-2'>
                        <div
                          className='w-4 h-4 rounded'
                          style={{ backgroundColor: item.color }}></div>
                        <span className='text-xs text-slate-600'>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Grid */}
                  <div className='space-y-2'>
                    {chartData.nutrientHeatmap.map((nutrientData) => (
                      <div
                        key={nutrientData.key}
                        className='flex items-center gap-2'>
                        <div className='w-24 text-sm font-medium text-slate-700 flex-shrink-0'>
                          {nutrientData.nutrient}
                        </div>
                        <div className='flex gap-1 flex-1'>
                          {nutrientData.dailyValues.map((day, index) => (
                            <div
                              key={index}
                              className='flex-1 h-8 rounded flex items-center justify-center group relative cursor-pointer'
                              style={{
                                backgroundColor: getHeatmapColor(
                                  day.percentage
                                ),
                                minWidth: '40px',
                              }}>
                              <span className='text-xs font-medium text-white'>
                                {day.percentage}%
                              </span>
                              {/* Tooltip */}
                              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10'>
                                <div className='bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap'>
                                  <div className='font-medium'>{day.date}</div>
                                  <div>
                                    {day.value.toFixed(1)} /{' '}
                                    {getNutrientTargets()[
                                      nutrientData.key
                                    ]?.toFixed(1) || 'N/A'}
                                  </div>
                                  <div>{day.percentage}% of target</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Date Labels */}
                  <div className='flex items-center gap-2 mt-4 pt-4 border-t border-slate-200'>
                    <div className='w-24 flex-shrink-0'></div>
                    <div className='flex gap-1 flex-1'>
                      {chartData.nutrientHeatmap[0]?.dailyValues.map(
                        (day, index) => (
                          <div
                            key={index}
                            className='flex-1 text-xs text-slate-600 text-center'
                            style={{ minWidth: '40px' }}>
                            {day.date}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
