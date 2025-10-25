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
import paymentService from '../services/paymentService';

export default function Upgrade() {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [showOneTimeOptions, setShowOneTimeOptions] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(null);
  const [oneTimeProducts, setOneTimeProducts] = useState(null);
  const [baseProduct, setBaseProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();
  const { user, subscription } = useUserStore();

  // Fetch products from Dodo Payments
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await paymentService.getProducts();

        if (response.success && response.products) {
          // Organize recurring products by plan type
          const monthly = response.products.find(
            (p) => p.metadata?.plan === '30D'
          );
          const annual = response.products.find(
            (p) => p.metadata?.plan === '365D'
          );

          setProducts({ monthly, annual });
          setBaseProduct(response.baseProduct);

          // Organize one-time products by plan type
          if (response.oneTimeProducts) {
            const oneTimeMonthly = response.oneTimeProducts.find(
              (p) => p.metadata?.plan === '30D'
            );
            const oneTimeAnnual = response.oneTimeProducts.find(
              (p) => p.metadata?.plan === '365D'
            );

            setOneTimeProducts({
              monthly: oneTimeMonthly,
              annual: oneTimeAnnual,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load pricing. Please refresh the page.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Get current product based on billing cycle (always recurring for main card)
  const getCurrentProduct = () => {
    if (!products) return null;
    return billingCycle === 'monthly' ? products.monthly : products.annual;
  };

  const currentProduct = getCurrentProduct();

  // Check if user is already subscribed
  useEffect(() => {
    if (subscription?.status === 'active') {
      navigate('/dashboard');
    }
  }, [subscription, navigate]);

  // Handle purchase button click
  const handlePurchase = async (productId = null) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const selectedProductId = productId || currentProduct?.product_id;

    if (!selectedProductId) {
      setError('Please select a plan');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const response = await paymentService.createCheckoutSession(
        selectedProductId
      );

      if (response.success && response.checkoutUrl) {
        // Redirect to Dodo Payments checkout page
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to initiate payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate pricing info
  const getPricingInfo = () => {
    if (!currentProduct) {
      return {
        price: 0,
        period: 'month',
        total: 0,
        savings: null,
        currency: 'USD',
        basePrice: null,
        discountPercentage: null,
      };
    }

    const priceDetail = currentProduct.price_detail;
    const price = currentProduct.price / 100; // Convert cents to dollars
    const currency = currentProduct.currency;
    const interval = paymentService.getBillingInterval(priceDetail);

    let monthlyEquivalent = price;
    let total = price;
    let savings = null;
    let basePrice = null;
    let discountPercentage = null;

    // Calculate base price for display (strikethrough)
    if (baseProduct) {
      const baseMonthlyPrice = baseProduct.price / 100;
      basePrice = baseMonthlyPrice;
    }

    if (interval === 'year') {
      monthlyEquivalent = price / 12;
      total = price;

      // Calculate savings and discount compared to monthly plan
      if (products?.monthly) {
        const monthlyPrice = products.monthly.price / 100;
        const annualMonthlyTotal = monthlyPrice * 12;
        savings = annualMonthlyTotal - total;

        // Discount percentage based on monthly equivalent vs actual monthly plan
        discountPercentage = Math.round(
          ((monthlyPrice - monthlyEquivalent) / monthlyPrice) * 100
        );
      }
    }

    return {
      price: interval === 'year' ? monthlyEquivalent : price,
      period: interval === 'year' ? 'month' : interval,
      total,
      savings,
      currency,
      isYearly: interval === 'year',
      basePrice,
      discountPercentage,
    };
  };

  const pricingInfo = getPricingInfo();

  // Get currency symbol from service
  const currencySymbol = paymentService.getCurrencySymbol(pricingInfo.currency);

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
      us: `${currencySymbol}${pricingInfo.price.toFixed(
        2
      )}/month - Best price in market`,
      them: '$10-20/month for similar features',
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
          {loadingProducts ? (
            <Card className='p-6 border-2 border-emerald-500 shadow-xl'>
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='w-8 h-8 animate-spin text-emerald-600' />
              </div>
            </Card>
          ) : (
            <Card className='p-6 space-y-6 border-2 border-emerald-500 shadow-xl'>
              {/* Billing Toggle */}
              <div className='flex items-center justify-center gap-4 flex-wrap'>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  disabled={!products?.monthly}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${
                    !products?.monthly ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  disabled={!products?.annual}
                  className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                    billingCycle === 'annual'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${
                    !products?.annual ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                  Annual
                  {pricingInfo.discountPercentage > 0 &&
                    billingCycle === 'annual' && (
                      <span className='absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full'>
                        Save {pricingInfo.discountPercentage}%
                      </span>
                    )}
                </button>
              </div>

              {/* Price */}
              <div className='text-center space-y-2'>
                <div className='flex flex-col items-center justify-center'>
                  {/* Price row - centered */}
                  <div className='flex items-baseline justify-center gap-2 relative'>
                    {/* Strikethrough base price */}
                    {pricingInfo.basePrice && (
                      <span className='text-lg text-gray-400 line-through absolute left-[-60px] bottom-0'>
                        {currencySymbol}
                        {pricingInfo.basePrice.toFixed(2)}
                      </span>
                    )}

                    {/* Current price */}
                    <div className='flex items-baseline'>
                      <span className='text-2xl text-emerald-600'>
                        {currencySymbol}
                      </span>
                      <div className='flex items-baseline'>
                        <span className='text-6xl font-bold text-emerald-600'>
                          {Math.floor(pricingInfo.price)}
                        </span>
                        {pricingInfo.price % 1 !== 0 && (
                          <span className='text-xl text-emerald-500 font-normal'>
                            .
                            {Math.round((pricingInfo.price % 1) * 100)
                              .toString()
                              .padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className='text-base text-gray-500'>
                    per {pricingInfo.period}
                  </span>
                </div>

                {billingCycle === 'annual' && pricingInfo.isYearly && (
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-600'>
                      {currencySymbol}
                      {pricingInfo.total.toFixed(2)} billed annually
                    </p>
                    {pricingInfo.savings > 0 && (
                      <div className='inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium'>
                        <Sparkles className='w-3 h-3' />
                        Save {currencySymbol}
                        {pricingInfo.savings.toFixed(2)} vs monthly plan
                      </div>
                    )}
                    <p className='text-xs text-gray-500 mt-2'>
                      🔄 Auto-renews every year. Cancel anytime.
                    </p>
                  </div>
                )}

                {billingCycle === 'monthly' && !pricingInfo.isYearly && (
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
                disabled={loading || !currentProduct}
                className='w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed'>
                {loading ? (
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
          )}

          {/* One-Time Payment Toggle */}
          <div className='text-center mt-6'>
            <button
              onClick={() => setShowOneTimeOptions(!showOneTimeOptions)}
              className='text-emerald-600 hover:text-emerald-700 font-medium transition-colors underline decoration-dotted underline-offset-4'>
              {showOneTimeOptions
                ? '← Hide one-time payment options'
                : 'Prefer one-time payment? View options →'}
            </button>
          </div>

          {/* One-Time Payment Cards */}
          {showOneTimeOptions && oneTimeProducts && (
            <div className='mt-8 space-y-4'>
              <div className='text-center'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  One-Time Payment Options
                </h3>
                <p className='text-sm text-gray-600 mt-1'>
                  Pay once, no recurring charges
                </p>
              </div>

              <div className='grid md:grid-cols-2 gap-4'>
                {/* Monthly One-Time */}
                {oneTimeProducts.monthly && (
                  <Card className='p-6 space-y-4 border-2 border-gray-300 hover:border-emerald-500 transition-colors'>
                    <div className='text-center space-y-2'>
                      <h4 className='text-lg font-semibold text-gray-900'>
                        30 Days Access
                      </h4>
                      <div className='flex items-baseline justify-center gap-1 relative'>
                        {/* Strikethrough base price */}
                        {pricingInfo.basePrice && (
                          <span className='text-sm text-gray-400 line-through absolute left-[10px] bottom-0'>
                            {currencySymbol}
                            {pricingInfo.basePrice.toFixed(2)}
                          </span>
                        )}

                        <span className='text-xl text-gray-600'>
                          {currencySymbol}
                        </span>
                        <span className='text-4xl font-bold text-gray-900'>
                          {(oneTimeProducts.monthly.price / 100).toFixed(0)}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600'>One-time payment</p>
                      <p className='text-xs text-gray-500'>
                        30 days of premium features
                      </p>
                      {pricingInfo.basePrice && (
                        <p className='text-xs text-gray-500'>
                          Save {currencySymbol}
                          {(
                            pricingInfo.basePrice -
                            oneTimeProducts.monthly.price / 100
                          ).toFixed(2)}{' '}
                          vs base price
                        </p>
                      )}
                    </div>
                    <div className='flex justify-center'>
                      <Button
                        onClick={() =>
                          handlePurchase(oneTimeProducts.monthly.product_id)
                        }
                        disabled={loading}
                        variant='outline'
                        className='w-full md:w-[14rem] py-3'>
                        {loading ? 'Processing...' : 'Purchase'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Annual One-Time */}
                {oneTimeProducts.annual && (
                  <Card className='p-6 space-y-4 border-2 border-emerald-500 shadow-lg relative'>
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                      <span className='bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium'>
                        Best Value
                      </span>
                    </div>
                    <div className='text-center space-y-2'>
                      <h4 className='text-lg font-semibold text-gray-900'>
                        Annual Access
                      </h4>
                      <div className='flex items-baseline justify-center gap-1 relative'>
                        {/* Strikethrough base price */}
                        {pricingInfo.basePrice && (
                          <span className='text-sm text-gray-400 line-through absolute left-0 bottom-0'>
                            {currencySymbol}
                            {pricingInfo.basePrice.toFixed(2)}
                          </span>
                        )}

                        <span className='text-xl text-emerald-600'>
                          {currencySymbol}
                        </span>
                        <span className='text-4xl font-bold text-emerald-600'>
                          {(oneTimeProducts.annual.price / 100).toFixed(0)}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600'>One-time payment</p>
                      <p className='text-xs text-emerald-700 font-medium'>
                        {currencySymbol}
                        {(oneTimeProducts.annual.price / 100 / 12).toFixed(2)}
                        /month equivalent
                      </p>
                      {oneTimeProducts.monthly && (
                        <p className='text-xs text-gray-500'>
                          Save {currencySymbol}
                          {(
                            (oneTimeProducts.monthly.price / 100) * 12 -
                            oneTimeProducts.annual.price / 100
                          ).toFixed(2)}{' '}
                          vs 12 monthly payments
                        </p>
                      )}
                    </div>
                    <div className='flex justify-center'>
                      <Button
                        onClick={() =>
                          handlePurchase(oneTimeProducts.annual.product_id)
                        }
                        disabled={loading}
                        className='w-full md:w-[14rem] py-3'>
                        {loading ? 'Processing...' : 'Purchase'}
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
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
              disabled={loading || !currentProduct}
              className='px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed'>
              {loading ? (
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
