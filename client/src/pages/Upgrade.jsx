import { useState, useEffect } from 'react';
import {
  Check,
  Sparkles,
  TrendingUp,
  Globe,
  Award,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import useUserStore from '../stores/useUserStore';
import { FREE_LOGS_LIMIT } from '../utils/constants';
import {
  createOrder,
  verifyPayment,
  initializeRazorpayCheckout,
} from '../services/paymentService';

export default function Upgrade() {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, subscription, setSubscription } = useUserStore();

  const pricing = {
    test: {
      price: 1,
      period: 'month',
      total: 1,
      savings: null,
      adminOnly: true,
    },
    monthly: {
      price: 197,
      period: 'month',
      total: 197,
      savings: null,
    },
    annual: {
      price: 125,
      period: 'month',
      total: 1497,
      savings: 867,
      discount: 37,
    },
  };

  const currentPlan = pricing[billingCycle];

  // Check if user is already subscribed
  useEffect(() => {
    if (subscription?.status === 'active') {
      navigate('/dashboard');
    }
  }, [subscription, navigate]);

  // Handle payment initiation
  const handlePurchase = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create subscription on backend
      const subscriptionData = await createOrder(billingCycle);

      // Initialize Razorpay checkout for subscription
      initializeRazorpayCheckout(
        {
          key: subscriptionData.key,
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          subscriptionId: subscriptionData.subscription.id, // Subscription ID instead of order ID
          description: `TrackAll.Food Pro - ${
            billingCycle === 'monthly' ? 'Monthly' : 'Annual'
          } Subscription (Auto-renewing)`,
          plan: billingCycle,
          userName: user.name || user.email.split('@')[0],
          userEmail: user.email,
        },
        async (response) => {
          // Payment successful - verify on backend
          try {
            const verificationResult = await verifyPayment(response);

            if (verificationResult.success) {
              // Update local subscription state
              setSubscription({
                status: 'active',
                plan: billingCycle,
                endDate: verificationResult.subscription.endDate,
                nextBillingDate:
                  verificationResult.subscription.nextBillingDate,
                recurring: true,
                freeLogs: 0,
                canLog: true,
              });

              // Show success and redirect
              alert(
                `🎉 Subscription activated! Your ${billingCycle} plan will auto-renew.`
              );
              navigate('/dashboard');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        (error) => {
          // Payment failed or cancelled
          console.error('Payment error:', error);
          setError(error.message || 'Payment failed. Please try again.');
          setIsProcessing(false);
        }
      );
    } catch (err) {
      console.error('Subscription creation error:', err);
      setError(
        err.response?.data?.details ||
          'Failed to initialize payment. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  // Nutrients we track
  const nutrients = {
    macros: ['Calories', 'Protein', 'Carbs', 'Fats', 'Fiber', 'Sugar'],
    vitamins: [
      'Vitamin A',
      'Vitamin C',
      'Vitamin D',
      'Vitamin E',
      'Vitamin K',
      'Vitamin B1 (Thiamine)',
      'Vitamin B2 (Riboflavin)',
      'Vitamin B3 (Niacin)',
      'Vitamin B5 (Pantothenic Acid)',
      'Vitamin B6 (Pyridoxine)',
      'Vitamin B9 (Folate)',
      'Vitamin B12 (Cobalamin)',
    ],
    minerals: [
      'Calcium',
      'Iron',
      'Magnesium',
      'Phosphorus',
      'Potassium',
      'Zinc',
      'Manganese',
      'Copper',
      'Selenium',
      'Sodium',
    ],
    other: [
      'Cholesterol',
      'Water',
      'Omega-3',
      'Trans Fat',
      'Caffeine',
      'Alcohol',
    ],
  };

  const comparisonFeatures = [
    {
      icon: <Sparkles className='w-6 h-6 text-emerald-500' />,
      title: 'Hospital-Grade AI Accuracy',
      us: 'Powered by the most advanced AI technology',
      them: 'Basic AI models with lower accuracy',
      highlight: true,
    },
    {
      icon: <TrendingUp className='w-6 h-6 text-blue-500' />,
      title: 'Comprehensive Nutrient Tracking',
      us: '30+ nutrients including all vitamins & minerals',
      them: 'Basic macros only, limited micronutrients',
      highlight: true,
    },
    {
      icon: <Award className='w-6 h-6 text-amber-500' />,
      title: 'Unbeatable Value',
      us: '₹125/month (annual) - Best price in market',
      them: '₹300-500/month for similar features',
      highlight: true,
    },
    {
      icon: <Globe className='w-6 h-6 text-purple-500' />,
      title: 'Global Food Database',
      us: 'Specialized foods from 150+ countries',
      them: 'Limited to popular international dishes',
      highlight: true,
    },
  ];

  const allFeatures = [
    'Advanced AI-powered nutrition analysis',
    'USDA FoodData Central verified',
    '30+ nutrients per food item',
    'All vitamins (A, C, D, E, K, B1-B12)',
    'All essential minerals',
    'Omega-3, Trans Fat, Caffeine tracking',
    'Indian & international foods',
    'Foods from 150+ countries',
    'Unlimited food logs',
    'Daily nutrition insights',
    'Calorie & macro targets',
    'Progress tracking & analytics',
    'Mobile responsive design',
    'Export your data anytime',
  ];

  return (
    <PageLayout title='Upgrade to Pro'>
      <div className='max-w-6xl mx-auto px-4 py-8 space-y-12'>
        {/* Hero Section */}
        <div className='text-center space-y-4'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-sm font-medium'>
            <Sparkles className='w-4 h-4' />
            Most Advanced Nutrition Tracking
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900'>
            Track Every Nutrient.
            <br />
            <span className='text-emerald-600'>No Compromises.</span>
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Hospital-grade accuracy powered by advanced AI. Track 30+ nutrients
            from foods across 150+ countries.
          </p>
        </div>

        {/* Pricing Card */}
        <div className='max-w-md mx-auto'>
          <Card className='p-6 space-y-6 border-2 border-emerald-500 shadow-xl'>
            {/* Billing Toggle */}
            <div className='flex items-center justify-center gap-4 flex-wrap'>
              {user?.isAdmin && (
                <button
                  onClick={() => setBillingCycle('test')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                    billingCycle === 'test'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}>
                  Test (₹1)
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full'>
                    Admin
                  </span>
                </button>
              )}
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                  billingCycle === 'annual'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                Annual
                <span className='absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full'>
                  Save 37%
                </span>
              </button>
            </div>

            {/* Price */}
            <div className='text-center space-y-2'>
              <div className='flex items-baseline justify-center gap-1'>
                <span className='text-2xl text-gray-600'>₹</span>
                <span className='text-6xl font-bold text-gray-900'>
                  {currentPlan.price}
                </span>
                <span className='text-xl text-gray-600'>
                  /{currentPlan.period}
                </span>
              </div>

              {billingCycle === 'test' && (
                <div className='space-y-1'>
                  <p className='text-sm text-purple-600 font-medium'>
                    ₹1 for testing live payments
                  </p>
                  <div className='inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-700 rounded-full text-sm font-medium'>
                    <Award className='w-3 h-3' />
                    Admin Test Plan
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>
                    🧪 For testing payment flow with real ₹1
                  </p>
                </div>
              )}

              {billingCycle === 'annual' && (
                <div className='space-y-1'>
                  <p className='text-sm text-gray-600'>
                    ₹{currentPlan.total} billed annually
                  </p>
                  <div className='inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium'>
                    <Sparkles className='w-3 h-3' />
                    Save ₹{currentPlan.savings} per year
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>
                    🔄 Auto-renews every year. Cancel anytime.
                  </p>
                </div>
              )}

              {billingCycle === 'monthly' && (
                <div className='space-y-1'>
                  <p className='text-sm text-gray-600'>
                    Billed monthly. Cancel anytime.
                  </p>
                  <p className='text-xs text-gray-500'>
                    🔄 Auto-renews monthly. Full flexibility.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            )}

            {/* CTA Button */}
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className='w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed'>
              {isProcessing ? (
                <>
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  Get Started Now
                  <ChevronRight className='w-5 h-5 ml-1' />
                </>
              )}
            </Button>

            {/* Benefits List */}
            <div className='pt-4 border-t border-gray-200 space-y-3'>
              <div className='flex items-center gap-3 text-sm text-gray-700'>
                <Check className='w-5 h-5 text-emerald-600 flex-shrink-0' />
                <span>Advanced AI-powered accuracy</span>
              </div>
              <div className='flex items-center gap-3 text-sm text-gray-700'>
                <Check className='w-5 h-5 text-emerald-600 flex-shrink-0' />
                <span>30+ nutrients tracked</span>
              </div>
              <div className='flex items-center gap-3 text-sm text-gray-700'>
                <Check className='w-5 h-5 text-emerald-600 flex-shrink-0' />
                <span>150+ countries food database</span>
              </div>
              <div className='flex items-center gap-3 text-sm text-gray-700'>
                <Check className='w-5 h-5 text-emerald-600 flex-shrink-0' />
                <span>Unlimited food logs</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Competitor Comparison */}
        <div className='space-y-6'>
          <div className='text-center space-y-2'>
            <h2 className='text-3xl font-bold text-gray-900'>Why Choose Us?</h2>
            <p className='text-gray-600'>
              See how we compare to other nutrition tracking apps
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-6'>
            {comparisonFeatures.map((feature, index) => (
              <Card
                key={index}
                className='p-6 space-y-4 hover:shadow-lg transition-shadow'>
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0 p-3 bg-gray-50 rounded-xl'>
                    {feature.icon}
                  </div>
                  <div className='flex-1 space-y-3'>
                    <h3 className='font-semibold text-lg text-gray-900'>
                      {feature.title}
                    </h3>

                    {/* Us */}
                    <div className='flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200'>
                      <Check className='w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5' />
                      <div>
                        <p className='text-xs font-medium text-emerald-700 uppercase mb-1'>
                          Our App
                        </p>
                        <p className='text-sm text-gray-800 font-medium'>
                          {feature.us}
                        </p>
                      </div>
                    </div>

                    {/* Them */}
                    <div className='flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                      <div className='w-5 h-5 flex-shrink-0 mt-0.5 rounded-full bg-gray-300'></div>
                      <div>
                        <p className='text-xs font-medium text-gray-500 uppercase mb-1'>
                          Other Apps
                        </p>
                        <p className='text-sm text-gray-600'>{feature.them}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Nutrients We Track */}
        <div className='space-y-6'>
          <div className='text-center space-y-2'>
            <h2 className='text-3xl font-bold text-gray-900'>
              Track Every Nutrient That Matters
            </h2>
            <p className='text-gray-600'>
              30+ nutrients analyzed for every food you log
            </p>
          </div>

          <div className='grid md:grid-cols-4 gap-6'>
            {/* Macros */}
            <Card className='p-6 space-y-4'>
              <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                <TrendingUp className='w-6 h-6 text-blue-600' />
              </div>
              <h3 className='font-semibold text-lg'>Macronutrients</h3>
              <ul className='space-y-2'>
                {nutrients.macros.map((nutrient, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-2 text-sm text-gray-700'>
                    <div className='w-1.5 h-1.5 bg-blue-500 rounded-full'></div>
                    {nutrient}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Vitamins */}
            <Card className='p-6 space-y-4'>
              <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center'>
                <Sparkles className='w-6 h-6 text-amber-600' />
              </div>
              <h3 className='font-semibold text-lg'>Vitamins</h3>
              <ul className='space-y-2'>
                {nutrients.vitamins.map((nutrient, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-2 text-sm text-gray-700'>
                    <div className='w-1.5 h-1.5 bg-amber-500 rounded-full'></div>
                    {nutrient}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Minerals */}
            <Card className='p-6 space-y-4'>
              <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                <Award className='w-6 h-6 text-purple-600' />
              </div>
              <h3 className='font-semibold text-lg'>Minerals</h3>
              <ul className='space-y-2'>
                {nutrients.minerals.map((nutrient, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-2 text-sm text-gray-700'>
                    <div className='w-1.5 h-1.5 bg-purple-500 rounded-full'></div>
                    {nutrient}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Other */}
            <Card className='p-6 space-y-4'>
              <div className='w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center'>
                <Check className='w-6 h-6 text-emerald-600' />
              </div>
              <h3 className='font-semibold text-lg'>Additional</h3>
              <ul className='space-y-2'>
                {nutrients.other.map((nutrient, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-2 text-sm text-gray-700'>
                    <div className='w-1.5 h-1.5 bg-emerald-500 rounded-full'></div>
                    {nutrient}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* All Features List */}
        <div className='space-y-6'>
          <div className='text-center space-y-2'>
            <h2 className='text-3xl font-bold text-gray-900'>
              Everything You Need
            </h2>
            <p className='text-gray-600'>All features included in every plan</p>
          </div>

          <Card className='p-8'>
            <div className='grid md:grid-cols-2 gap-4'>
              {allFeatures.map((feature, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <div className='flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center'>
                    <Check className='w-4 h-4 text-white' />
                  </div>
                  <span className='text-gray-700'>{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Final CTA */}
        <div className='text-center space-y-6 py-12'>
          <h2 className='text-3xl font-bold text-gray-900'>
            Ready to Transform Your Nutrition Tracking?
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Join thousands of users who trust us for accurate, comprehensive
            nutrition data.
          </p>
          <div className='flex flex-row max-md:flex-col items-center justify-center gap-4'>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className='px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed'>
              {isProcessing ? (
                <>
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  Get Started Now
                  <ChevronRight className='w-5 h-5 ml-1' />
                </>
              )}
            </Button>
            <button className='text-emerald-600 font-medium hover:underline'>
              View sample nutrition report →
            </button>
          </div>
          <div className='flex items-center justify-center gap-8 text-sm text-gray-500'>
            <div className='flex items-center gap-2'>
              <Check className='w-4 h-4 text-emerald-600' />
              {FREE_LOGS_LIMIT} free logs on signup
            </div>
            <div className='flex items-center gap-2'>
              <Check className='w-4 h-4 text-emerald-600' />
              Instant access
            </div>
            <div className='flex items-center gap-2'>
              <Check className='w-4 h-4 text-emerald-600' />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
