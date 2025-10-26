import { useState } from 'react';
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
  CreditCard,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import useUserStore from '../stores/useUserStore';
import Card from '../components/Card';
import Button from '../components/Button';
import Footer from '../components/Footer';
import { authService } from '../services/authService';
import { paymentService } from '../services/paymentService';

export default function Account() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const onboardingData = useUserStore((state) => state.onboardingData);
  const dailyCalorieTarget = useUserStore((state) => state.dailyCalorieTarget);
  const macros = useUserStore((state) => state.macros);
  const bmr = useUserStore((state) => state.bmr);
  const tdee = useUserStore((state) => state.tdee);
  const setUser = useUserStore((state) => state.setUser);
  const clearOnboardingData = useUserStore(
    (state) => state.clearOnboardingData
  );

  // Tab state - default to 'profile'
  const [activeTab, setActiveTab] = useState('profile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    authService.logout();
  };

  const handleStartOnboarding = () => {
    clearOnboardingData();
    navigate('/onboarding/gender');
  };

  const handleCancelSubscription = async () => {
    if (!showCancelConfirm) {
      setShowCancelConfirm(true);
      return;
    }

    try {
      setIsProcessing(true);
      const result = await paymentService.cancelSubscription();

      if (result.success) {
        // Refresh user data from auth service
        const userData = await authService.getCurrentUser();
        if (userData) {
          useUserStore.getState().setUser(userData);
        }

        alert(
          'Subscription cancelled successfully. You will have access until the end of your current billing period.'
        );
        setShowCancelConfirm(false);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to cancel subscription';
      alert(`Failed to cancel subscription: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsProcessing(true);
      const result = await paymentService.reactivateSubscription();

      if (result.success) {
        // Refresh user data from auth service
        const userData = await authService.getCurrentUser();
        if (userData) {
          useUserStore.getState().setUser(userData);
        }

        alert(
          'Subscription reactivated successfully! Your subscription will continue at the next billing date.'
        );
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to reactivate subscription';
      alert(`Failed to reactivate subscription: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 pb-8 max-lg:pb-24'>
      {/* Header */}
      <header className='sticky top-0 z-30 backdrop-blur-xl bg-white/95 border-b-2 border-slate-300 shadow-lg'>
        <div className='max-w-5xl mx-auto px-8 max-lg:px-6 max-sm:px-4'>
          <div className='flex items-center justify-between h-20 max-md:h-18 max-sm:h-16'>
            <button
              onClick={() => navigate('/dashboard')}
              className='flex items-center gap-2 hover:bg-slate-100 rounded-xl p-2 transition-all active:scale-95'>
              <ChevronLeft className='w-6 h-6 max-sm:w-5 max-sm:h-5 text-slate-700' />
              <span className='font-semibold text-slate-700 max-sm:hidden'>
                Back
              </span>
            </button>
            <div className='text-center'>
              <h1 className='text-2xl max-lg:text-xl max-sm:text-lg font-black text-slate-900'>
                Account Settings
              </h1>
              <p className='text-sm max-sm:text-xs text-slate-600 font-medium'>
                Manage your profile
              </p>
            </div>
            <div className='w-20'></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-8 max-lg:px-6 max-sm:px-4 py-8 max-sm:py-6'>
        {/* Profile Card */}
        <Card variant='gradient' padding='lg' className='mb-6'>
          <div className='flex flex-row max-md:flex-col items-center sm:items-start gap-6'>
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user?.name || 'User'}
                referrerPolicy='no-referrer'
                className='w-28 h-28 max-sm:w-24 max-sm:h-24 rounded-full border-4 border-white object-cover shadow-2xl'
              />
            ) : (
              <div className='w-28 h-28 max-sm:w-24 max-sm:h-24 rounded-full bg-white/30 backdrop-blur-sm border-4 border-white flex items-center justify-center text-white font-black text-4xl shadow-2xl'>
                {getUserInitials()}
              </div>
            )}
            <div className='flex-1 text-left max-sm:text-center'>
              <div className='flex items-center justify-start max-sm:justify-center gap-3 mb-2'>
                <h2 className='text-3xl max-sm:text-2xl font-black text-white'>
                  {user?.name || 'User'}
                </h2>
                {user?.isPro && (
                  <span className='flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-bold rounded-full shadow-lg'>
                    <Sparkles className='w-4 h-4' />
                    PRO
                  </span>
                )}
              </div>
              <div className='flex items-center justify-start max-sm:justify-center gap-2 text-white/90 mb-4'>
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

        {/* Sidebar and Content Layout */}
        <div className='flex flex-row max-lg:flex-col gap-6'>
          {/* Sidebar */}
          <aside className='w-64 flex-shrink-0'>
            <Card padding='none' variant='default'>
              <nav className='p-2'>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}>
                  <User className='w-5 h-5' />
                  <span className='font-semibold'>Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-2 ${
                    activeTab === 'subscription'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}>
                  <CreditCard className='w-5 h-5' />
                  <span className='font-semibold'>Subscription</span>
                </button>

                <div className='border-t-2 border-slate-200 mt-4 pt-4'>
                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all'>
                    <LogOut className='w-5 h-5' />
                    <span className='font-semibold'>Sign Out</span>
                  </button>
                </div>
              </nav>
            </Card>
          </aside>

          {/* Content Area */}
          <div className='flex-1 space-y-6'>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Profile Stats */}
                <div>
                  <h3 className='text-xl font-black text-slate-900 mb-4 flex items-center gap-2'>
                    <User className='w-6 h-6 text-slate-700' />
                    Profile Information
                  </h3>
                  <div className='grid grid-cols-2 max-sm:grid-cols-1 gap-4'>
                    {profileStats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <Card
                          key={index}
                          padding='md'
                          variant='default'
                          hoverable>
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

                {/* Update Health Profile */}
                <div>
                  <h3 className='text-xl font-black text-slate-900 mb-4 flex items-center gap-2'>
                    <RefreshCw className='w-6 h-6 text-slate-700' />
                    Update Health Profile
                  </h3>
                  <Card padding='lg' variant='default'>
                    <div className='flex items-start gap-4'>
                      <div className='p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-200'>
                        <RefreshCw className='w-8 h-8 text-emerald-600' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='text-lg font-black text-slate-900 mb-2'>
                          Re-run Onboarding Journey
                        </h4>
                        <p className='text-sm font-medium text-slate-600 mb-4 leading-relaxed'>
                          Update your health profile, goals, dietary
                          preferences, lifestyle habits, and medical
                          information. This will recalculate your personalized
                          nutrition targets and micronutrient requirements.
                        </p>
                        <div className='bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4'>
                          <p className='text-xs font-semibold text-blue-800 flex items-start gap-2'>
                            <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
                            <span>
                              Your current profile data will be replaced with
                              new information. Make sure to complete all steps
                              to get accurate nutrition recommendations.
                            </span>
                          </p>
                        </div>
                        <Button
                          onClick={handleStartOnboarding}
                          variant='primary'
                          className='w-auto max-sm:w-full'>
                          <RefreshCw className='w-5 h-5' />
                          Start Onboarding
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <>
                {(user?.isPro ||
                  user?.subscriptionStatus === 'cancelled' ||
                  user?.subscription?.cancelledAt) &&
                user?.subscription ? (
                  <>
                    {/* Subscription Status */}
                    <Card variant='default' padding='lg'>
                      <div className='flex items-center gap-3 mb-6'>
                        <div className='p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500'>
                          <Sparkles className='w-6 h-6 text-white' />
                        </div>
                        <div>
                          <h3 className='text-xl font-black text-slate-900'>
                            Pro Subscription
                          </h3>
                          <p className='text-sm font-medium text-slate-600'>
                            {user.subscriptionStatus === 'cancelled' ||
                            user.subscription?.cancelledAt
                              ? 'Cancelled - Active until end date'
                              : 'Active subscription'}
                          </p>
                        </div>
                      </div>
                      <div className='space-y-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200'>
                        <div className='flex justify-between items-center pb-3 border-b border-yellow-200'>
                          <span className='text-sm font-semibold text-slate-700'>
                            Plan
                          </span>
                          <span className='text-base font-bold text-slate-900 uppercase'>
                            {user.subscription.plan || 'Pro'}
                          </span>
                        </div>
                        <div className='flex justify-between items-center pb-3 border-b border-yellow-200'>
                          <span className='text-sm font-semibold text-slate-700'>
                            Status
                          </span>
                          {user.subscriptionStatus === 'cancelled' ||
                          user.subscription?.cancelledAt ? (
                            <span className='inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full'>
                              ⚠ Cancelled
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full'>
                              ● Active
                            </span>
                          )}
                        </div>
                        {user.subscription.nextBillingDate && (
                          <div className='flex justify-between items-center'>
                            <span className='text-sm font-semibold text-slate-700'>
                              {user.subscriptionStatus === 'cancelled' ||
                              user.subscription?.cancelledAt
                                ? 'Access Until'
                                : 'Next Billing'}
                            </span>
                            <span className='text-base font-bold text-slate-900'>
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

                      {/* Cancel/Reactivate Section */}
                      <div className='mt-6 pt-6 border-t-2 border-slate-200'>
                        {(user.subscriptionStatus === 'cancelled' ||
                          user.subscription?.cancelledAt) &&
                        user.subscription.nextBillingDate &&
                        new Date(user.subscription.nextBillingDate) >
                          new Date() ? (
                          // Show reactivate option
                          <div className='space-y-4'>
                            <div className='flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200'>
                              <AlertCircle className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                              <div className='flex-1'>
                                <p className='text-sm font-semibold text-blue-900 mb-1'>
                                  Subscription Cancelled
                                </p>
                                <p className='text-xs text-blue-700'>
                                  Your subscription will remain active until{' '}
                                  {new Date(
                                    user.subscription.nextBillingDate
                                  ).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                  . You can reactivate it anytime before then.
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={handleReactivateSubscription}
                              disabled={isProcessing}
                              className='w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'>
                              <RefreshCw
                                className={`w-5 h-5 mr-2 ${
                                  isProcessing ? 'animate-spin' : ''
                                }`}
                              />
                              {isProcessing
                                ? 'Reactivating...'
                                : 'Reactivate Subscription'}
                            </Button>
                          </div>
                        ) : (
                          // Show cancel option
                          <div className='space-y-4'>
                            {!showCancelConfirm ? (
                              <Button
                                onClick={handleCancelSubscription}
                                variant='outline'
                                className='w-full border-red-300 text-red-600 hover:bg-red-50'>
                                <XCircle className='w-5 h-5 mr-2' />
                                Cancel Subscription
                              </Button>
                            ) : (
                              <div className='space-y-3'>
                                <div className='flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200'>
                                  <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                                  <div className='flex-1'>
                                    <p className='text-sm font-semibold text-red-900 mb-1'>
                                      Are you sure?
                                    </p>
                                    <p className='text-xs text-red-700'>
                                      Your subscription will be cancelled, but
                                      you'll retain Pro access until the end of
                                      your current billing period.
                                    </p>
                                  </div>
                                </div>
                                <div className='flex gap-3'>
                                  <Button
                                    onClick={() => setShowCancelConfirm(false)}
                                    variant='outline'
                                    className='flex-1'>
                                    Keep Subscription
                                  </Button>
                                  <Button
                                    onClick={handleCancelSubscription}
                                    disabled={isProcessing}
                                    className='flex-1 bg-red-600 hover:bg-red-700 text-white'>
                                    {isProcessing
                                      ? 'Cancelling...'
                                      : 'Confirm Cancellation'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Subscription Benefits */}
                    <Card variant='default' padding='lg'>
                      <h3 className='text-xl font-black text-slate-900 mb-6 flex items-center gap-2'>
                        <Sparkles className='w-6 h-6 text-yellow-500' />
                        Pro Benefits
                      </h3>
                      <div className='space-y-4'>
                        {[
                          'Unlimited food logging',
                          'Advanced AI-powered nutrition tracking',
                          '30+ nutrients tracked per meal',
                          'Detailed vitamin and mineral analysis',
                          'Priority customer support',
                          'Ad-free experience',
                        ].map((benefit, index) => (
                          <div
                            key={index}
                            className='flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors'>
                            <div className='flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center'>
                              <span className='text-white text-xs font-bold'>
                                ✓
                              </span>
                            </div>
                            <p className='text-slate-700 font-medium'>
                              {benefit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                ) : (
                  <Card variant='default' padding='lg'>
                    <div className='text-center py-12'>
                      <div className='w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center'>
                        <CreditCard className='w-10 h-10 text-slate-400' />
                      </div>
                      <h3 className='text-2xl font-black text-slate-900 mb-3'>
                        No Active Subscription
                      </h3>
                      <p className='text-slate-600 mb-6 max-w-md mx-auto'>
                        Upgrade to Pro to unlock unlimited food logging and
                        advanced nutrition tracking features.
                      </p>
                      <Button
                        onClick={() => navigate('/upgrade')}
                        className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg'>
                        <Sparkles className='w-5 h-5 mr-2' />
                        Upgrade to Pro
                      </Button>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
