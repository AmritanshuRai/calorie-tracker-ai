import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Target,
  Scale,
  Calendar,
  Flame,
  Zap,
  Activity,
  TrendingUp,
  Droplet,
  LogOut,
  ChevronLeft,
  Award,
  Heart,
  Sparkles,
} from 'lucide-react';
import useUserStore from '../stores/useUserStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { authService } from '../services/authService';

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

  const profileStats = [
    {
      label: 'Gender',
      value: onboardingData.gender === 'male' ? 'Male' : 'Female',
      icon: User,
    },
    {
      label: 'Age',
      value: `${onboardingData.age} years`,
      icon: Calendar,
    },
    {
      label: 'Current Weight',
      value: `${onboardingData.currentWeight} kg`,
      icon: Scale,
    },
    {
      label: 'Target Weight',
      value: `${onboardingData.targetWeight} kg`,
      icon: Target,
    },
  ];

  const nutritionStats = [
    {
      label: 'BMR',
      value: `${bmr || 0}`,
      unit: 'kcal',
      icon: Flame,
      description: 'Basal Metabolic Rate',
    },
    {
      label: 'TDEE',
      value: `${tdee || 0}`,
      unit: 'kcal',
      icon: Zap,
      description: 'Total Daily Energy',
    },
    {
      label: 'Daily Target',
      value: `${dailyCalorieTarget || 0}`,
      unit: 'kcal',
      icon: Target,
      description: 'Calorie Goal',
    },
  ];

  const macroStats = [
    {
      label: 'Protein',
      value: `${macros?.protein || 0}g`,
      icon: Activity,
    },
    {
      label: 'Carbs',
      value: `${macros?.carbs || 0}g`,
      icon: TrendingUp,
    },
    {
      label: 'Fats',
      value: `${macros?.fats || 0}g`,
      icon: Droplet,
    },
  ];

  const goalConfig = {
    weight_loss: {
      label: 'Lose Weight',
      icon: TrendingUp,
      gradient: 'from-red-500 to-pink-500',
    },
    weight_gain: {
      label: 'Gain Weight',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
    },
    improved_health: {
      label: 'Improve Health',
      icon: Heart,
      gradient: 'from-emerald-500 to-teal-500',
    },
  };

  const currentGoal =
    goalConfig[onboardingData.goal] || goalConfig.improved_health;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 pb-24 lg:pb-8'>
      {/* Header */}
      <header className='sticky top-0 z-30 backdrop-blur-xl bg-white/95 border-b-2 border-slate-300 shadow-lg'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 sm:h-18 lg:h-20'>
            <button
              onClick={() => navigate('/dashboard')}
              className='flex items-center gap-2 hover:bg-slate-100 rounded-xl p-2 transition-all active:scale-95'>
              <ChevronLeft className='w-5 h-5 sm:w-6 sm:h-6 text-slate-700' />
              <span className='font-semibold text-slate-700 hidden sm:inline'>
                Back
              </span>
            </button>
            <div className='text-center'>
              <h1 className='text-lg sm:text-xl lg:text-2xl font-black text-slate-900'>
                Account Settings
              </h1>
              <p className='text-xs sm:text-sm text-slate-600 font-medium'>
                Manage your profile
              </p>
            </div>
            <div className='w-20'></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6'>
        {/* Profile Card */}
        <Card variant='gradient' padding='lg'>
          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user?.name || 'User'}
                referrerPolicy='no-referrer'
                className='w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white object-cover shadow-2xl'
              />
            ) : (
              <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/30 backdrop-blur-sm border-4 border-white flex items-center justify-center text-white font-black text-4xl shadow-2xl'>
                {getUserInitials()}
              </div>
            )}
            <div className='flex-1 text-center sm:text-left'>
              <div className='flex items-center justify-center sm:justify-start gap-3 mb-2'>
                <h2 className='text-2xl sm:text-3xl font-black text-white'>
                  {user?.name || 'User'}
                </h2>
                {user?.isPro && (
                  <span className='flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-bold rounded-full shadow-lg'>
                    <Sparkles className='w-4 h-4' />
                    PRO
                  </span>
                )}
              </div>
              <div className='flex items-center justify-center sm:justify-start gap-2 text-white/90 mb-4'>
                <Mail className='w-4 h-4' />
                <p className='text-sm font-medium'>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white font-bold shadow-lg'>
                <Award className='w-5 h-5' />
                <span>{currentGoal.label}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Status - Only show for Pro users */}
        {user?.isPro && user?.subscription && (
          <Card variant='default' padding='lg'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500'>
                <Sparkles className='w-6 h-6 text-white' />
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  Pro Subscription
                </h3>
                <p className='text-sm font-medium text-slate-600'>
                  Active subscription
                </p>
              </div>
            </div>
            <div className='space-y-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-semibold text-slate-700'>
                  Plan
                </span>
                <span className='text-sm font-bold text-slate-900 uppercase'>
                  {user.subscription.plan || 'Pro'}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-semibold text-slate-700'>
                  Status
                </span>
                <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full'>
                  ● Active
                </span>
              </div>
              {user.subscription.nextBillingDate && (
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-semibold text-slate-700'>
                    Next Billing
                  </span>
                  <span className='text-sm font-bold text-slate-900'>
                    {new Date(
                      user.subscription.nextBillingDate
                    ).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Profile Stats */}
        <div>
          <h3 className='text-xl font-black text-slate-900 mb-4 flex items-center gap-2'>
            <User className='w-6 h-6 text-slate-700' />
            Profile Information
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {profileStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} padding='md' variant='default' hoverable>
                  <div className='flex items-center gap-4'>
                    <div className='p-3 rounded-xl bg-slate-100 border-2 border-slate-200'>
                      <Icon className='w-6 h-6 text-slate-700' />
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-slate-600'>
                        {stat.label}
                      </p>
                      <p className='text-xl font-black text-slate-900'>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Nutrition Stats */}
        <div>
          <h3 className='text-xl font-black text-slate-900 mb-4 flex items-center gap-2'>
            <Flame className='w-6 h-6 text-slate-700' />
            Nutrition Targets
          </h3>
          <Card padding='lg' variant='default'>
            <div className='space-y-6'>
              {nutritionStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index}>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='p-3 rounded-xl bg-slate-100 border-2 border-slate-200'>
                          <Icon className='w-6 h-6 text-slate-700' />
                        </div>
                        <div>
                          <p className='font-black text-slate-900 text-lg'>
                            {stat.label}
                          </p>
                          <p className='text-xs font-medium text-slate-500'>
                            {stat.description}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-3xl font-black text-slate-900'>
                          {stat.value}
                        </p>
                        <p className='text-sm font-bold text-slate-500'>
                          {stat.unit}
                        </p>
                      </div>
                    </div>
                    {index < nutritionStats.length - 1 && (
                      <div className='h-0.5 bg-slate-200 mt-6'></div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Macros */}
        <div>
          <h3 className='text-xl font-black text-slate-900 mb-4 flex items-center gap-2'>
            <Activity className='w-6 h-6 text-slate-700' />
            Daily Macros
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            {macroStats.map((macro, index) => {
              const Icon = macro.icon;
              return (
                <Card
                  key={index}
                  padding='md'
                  variant='default'
                  className='text-center'>
                  <div className='w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center'>
                    <Icon className='w-6 h-6 text-slate-700' />
                  </div>
                  <p className='text-2xl font-black text-slate-900 mb-1'>
                    {macro.value}
                  </p>
                  <p className='text-xs font-bold text-slate-600 uppercase tracking-wide'>
                    {macro.label}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className='pt-4'>
          <Button
            variant='danger'
            onClick={handleLogout}
            fullWidth
            icon={<LogOut className='w-5 h-5' />}>
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
}
