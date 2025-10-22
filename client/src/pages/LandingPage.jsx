import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Globe,
  Award,
  ChevronRight,
  Check,
  CheckCircle2,
  Heart,
  Target,
  Zap,
  Users,
  Shield,
  ArrowRight,
  Menu,
  X,
  Star,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { FREE_LOGS_LIMIT } from '../utils/constants';
import Logo, { LogoIcon } from '../components/Logo';
import Footer from '../components/Footer';
import useUserStore from '../stores/useUserStore';
import { authService } from '../services/authService';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const action = searchParams.get('action');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(
          errorParam === 'auth_failed'
            ? 'Authentication failed. Please try again.'
            : 'Google Sign-In was cancelled or failed. Please try again.'
        );
        setShowSignInModal(true);
        setLoading(false);
        // Clean up URL
        window.history.replaceState({}, '', '/');
        return;
      }

      if (token) {
        setLoading(true);
        setShowSignInModal(true);
        try {
          // Store token
          setToken(token);

          // Fetch user profile
          const fullProfile = await authService.getProfile();
          setUser(fullProfile);

          // Navigate based on action
          if (action === 'onboarding') {
            navigate('/onboarding/gender');
          } else {
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Sign-in error:', err);
          setError('Failed to sign in. Please try again.');
          setLoading(false);
        } finally {
          // Clean up URL
          window.history.replaceState({}, '', '/');
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setToken]);

  const handleGoogleSignIn = () => {
    setError(null);
    setLoading(true);

    // Redirect to backend OAuth endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const openSignInModal = () => {
    setError(null);
    setShowSignInModal(true);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const features = [
    {
      icon: <Sparkles className='w-6 h-6' />,
      title: 'AI-Powered Accuracy',
      description:
        'Hospital-grade nutrition analysis powered by advanced AI technology for precise tracking.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <TrendingUp className='w-6 h-6' />,
      title: '30+ Nutrients Tracked',
      description:
        'Complete nutritional profile including all vitamins, minerals, and macros for every meal.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Globe className='w-6 h-6' />,
      title: 'Global Food Database',
      description:
        'Access specialized foods from 150+ countries, including authentic Indian cuisine.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Target className='w-6 h-6' />,
      title: 'Personalized Goals',
      description:
        'Custom calorie and macro targets based on your unique profile and fitness goals.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Heart className='w-6 h-6' />,
      title: 'Heart Health Tracking',
      description:
        'Monitor sodium, cholesterol, sugar, and fiber to maintain optimal cardiovascular health.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: <Zap className='w-6 h-6' />,
      title: 'Instant Analysis',
      description:
        'Get immediate nutritional insights with our lightning-fast AI processing.',
      color: 'from-yellow-500 to-amber-500',
    },
  ];

  const nutrients = {
    macros: ['Calories', 'Protein', 'Carbs', 'Fats', 'Fiber', 'Sugar'],
    vitamins: [
      'Vitamin A',
      'Vitamin C',
      'Vitamin D',
      'Vitamin E',
      'Vitamin K',
      'B-Complex (B1-B12)',
    ],
    minerals: ['Calcium', 'Iron', 'Magnesium', 'Potassium', 'Zinc', 'Selenium'],
  };

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Fitness Enthusiast',
      image: '👩‍💼',
      content:
        'The AI accuracy is incredible! Finally, an app that understands Indian foods perfectly.',
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'Software Engineer',
      image: '👨‍💻',
      content:
        'Tracking 30+ nutrients has transformed my health. Worth every rupee!',
      rating: 5,
    },
    {
      name: 'Ananya Patel',
      role: 'Nutritionist',
      image: '👩‍⚕️',
      content:
        'I recommend this to all my clients. The vitamin tracking is unmatched.',
      rating: 5,
    },
  ];

  const comparisonFeatures = [
    { feature: 'AI-Powered Analysis', us: true, them: false },
    { feature: '30+ Nutrients', us: true, them: false },
    { feature: 'Global Food Database', us: true, them: false },
    { feature: 'Indian Food Support', us: true, them: false },
    { feature: 'Vitamin Tracking', us: true, them: 'Limited' },
    { feature: 'Mineral Tracking', us: true, them: 'Limited' },
    { feature: 'Price (per month)', us: '₹125', them: '₹300+' },
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation */}
      <nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 lg:h-20'>
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className='flex items-center hover:opacity-80 transition-opacity'>
              <Logo className='h-10 lg:h-12 w-auto' />
            </button>

            {/* Desktop Navigation */}
            <div className='hidden lg:flex items-center gap-8'>
              <button
                onClick={() => scrollToSection('features')}
                className='text-slate-700 hover:text-emerald-600 font-medium transition-colors'>
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className='text-slate-700 hover:text-emerald-600 font-medium transition-colors'>
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className='text-slate-700 hover:text-emerald-600 font-medium transition-colors'>
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className='text-slate-700 hover:text-emerald-600 font-medium transition-colors'>
                Testimonials
              </button>
            </div>

            {/* CTA Buttons */}
            <div className='hidden lg:flex items-center gap-4'>
              <Button
                variant='outline'
                onClick={openSignInModal}
                className='border-2'>
                Sign In
              </Button>
              <Button
                onClick={openSignInModal}
                className='bg-gradient-to-r from-emerald-500 to-teal-500'>
                Get Started Free
                <ChevronRight className='w-4 h-4 ml-1' />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg'>
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className='lg:hidden border-t border-slate-200 py-4 space-y-2'>
              <button
                onClick={() => scrollToSection('features')}
                className='block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium'>
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className='block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium'>
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className='block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium'>
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className='block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium'>
                Testimonials
              </button>
              <div className='px-4 pt-2 space-y-2'>
                <Button
                  variant='outline'
                  fullWidth
                  onClick={openSignInModal}
                  className='border-2'>
                  Sign In
                </Button>
                <Button
                  fullWidth
                  onClick={openSignInModal}
                  className='bg-gradient-to-r from-emerald-500 to-teal-500'>
                  Get Started Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden'>
        {/* Background decorations */}
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50'></div>
        <div className='absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-20'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-20'></div>

        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            {/* Left Content */}
            <div className='text-center lg:text-left space-y-8'>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-semibold'>
                <Sparkles className='w-4 h-4' />
                #1 AI-Powered Nutrition Tracker
              </div>

              <h1 className='text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 leading-tight'>
                Track Every
                <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'>
                  Nutrient
                </span>{' '}
                That
                <br />
                Matters
              </h1>

              <p className='text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0'>
                Hospital-grade AI analyzes 30+ nutrients from foods across 150+
                countries. Get accurate, comprehensive nutrition tracking for
                free.
              </p>

              <div className='flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4'>
                <Button
                  size='xl'
                  onClick={openSignInModal}
                  className='bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 text-lg px-8 py-4 w-full sm:w-auto'>
                  Start Free Trial
                  <ArrowRight className='w-5 h-5 ml-2' />
                </Button>
              </div>

              {/* Social Proof */}
              <div className='flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4'>
                <div className='flex items-center gap-2'>
                  <div className='flex -space-x-2'>
                    {['👨‍💼', '👩‍💻', '👨‍⚕️', '👩‍🔬'].map((emoji, i) => (
                      <div
                        key={i}
                        className='w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-lg border-2 border-white shadow-md'>
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className='text-left'>
                    <div className='flex gap-1'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className='w-4 h-4 fill-amber-400 text-amber-400'
                        />
                      ))}
                    </div>
                    <p className='text-sm text-slate-600 font-medium'>
                      5,000+ Happy Users
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className='relative'>
              {/* Floating Cards */}
              <div className='relative w-full max-w-lg mx-auto'>
                {/* Main Card */}
                <Card className='p-6 shadow-2xl border-2 border-slate-200 hover-lift'>
                  <div className='flex items-center gap-3 mb-6'>
                    <LogoIcon className='w-12 h-12' />
                    <div>
                      <h3 className='font-bold text-slate-900'>
                        Today's Progress
                      </h3>
                      <p className='text-sm text-slate-500'>
                        Comprehensive tracking
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 mb-6'>
                    {[
                      {
                        label: 'Calories',
                        value: '1,847',
                        target: '2,000',
                        color: 'orange',
                      },
                      {
                        label: 'Protein',
                        value: '68g',
                        target: '75g',
                        color: 'blue',
                      },
                      {
                        label: 'Carbs',
                        value: '142g',
                        target: '200g',
                        color: 'green',
                      },
                      {
                        label: 'Fats',
                        value: '52g',
                        target: '65g',
                        color: 'yellow',
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className='bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200'>
                        <p className='text-xs text-slate-500 mb-1'>
                          {stat.label}
                        </p>
                        <p className='text-2xl font-black text-slate-900'>
                          {stat.value}
                        </p>
                        <p className='text-xs text-slate-400'>
                          of {stat.target}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className='bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-xl text-white'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm opacity-90 mb-1'>
                          92% to Daily Goal
                        </p>
                        <p className='text-lg font-bold'>Keep it up! 🎉</p>
                      </div>
                      <Target className='w-8 h-8 opacity-80' />
                    </div>
                  </div>
                </Card>

                {/* Floating Badge - Top Right */}
                <div className='absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border-2 border-emerald-200 animate-fadeInUp'>
                  <div className='flex items-center gap-2'>
                    <Sparkles className='w-5 h-5 text-emerald-600' />
                    <div>
                      <p className='text-xs text-slate-500'>AI Analysis</p>
                      <p className='text-sm font-bold text-slate-900'>
                        30+ Nutrients
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge - Bottom Left */}
                <div className='absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl border-2 border-blue-200 animate-fadeInUp [animation-delay:200ms]'>
                  <div className='flex items-center gap-2'>
                    <Globe className='w-5 h-5 text-blue-600' />
                    <div>
                      <p className='text-xs text-slate-500'>Global Foods</p>
                      <p className='text-sm font-bold text-slate-900'>
                        150+ Countries
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id='features'
        className='py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-semibold mb-4'>
              <Zap className='w-4 h-4' />
              Powerful Features
            </div>
            <h2 className='text-3xl lg:text-5xl font-black text-slate-900 mb-4'>
              Everything You Need for
              <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'>
                Perfect Nutrition Tracking
              </span>
            </h2>
            <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
              Advanced AI technology meets comprehensive nutrition science for
              unmatched accuracy and insights.
            </p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
            {features.map((feature, index) => (
              <Card
                key={index}
                className='p-6 lg:p-8 hover-lift hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200'>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3'>
                  {feature.title}
                </h3>
                <p className='text-slate-600 leading-relaxed'>
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nutrients Showcase */}
      <section className='py-16 lg:py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-5xl font-black text-slate-900 mb-4'>
              Track{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'>
                30+ Nutrients
              </span>
              <br />
              For Every Meal
            </h2>
            <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
              Complete nutritional breakdown including all essential vitamins,
              minerals, and macronutrients.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {/* Macros */}
            <Card className='p-8 hover-lift border-2 border-slate-200 hover:border-blue-200 transition-colors'>
              <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-6 shadow-lg'>
                <TrendingUp className='w-8 h-8' />
              </div>
              <h3 className='text-2xl font-bold text-slate-900 mb-4'>
                Macronutrients
              </h3>
              <ul className='space-y-3'>
                {nutrients.macros.map((nutrient, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-3 text-slate-700'>
                    <Check className='w-5 h-5 text-blue-600 flex-shrink-0' />
                    <span className='font-medium'>{nutrient}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Vitamins */}
            <Card className='p-8 hover-lift border-2 border-slate-200 hover:border-amber-200 transition-colors'>
              <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white mb-6 shadow-lg'>
                <Sparkles className='w-8 h-8' />
              </div>
              <h3 className='text-2xl font-bold text-slate-900 mb-4'>
                Vitamins
              </h3>
              <ul className='space-y-3'>
                {nutrients.vitamins.map((nutrient, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-3 text-slate-700'>
                    <Check className='w-5 h-5 text-amber-600 flex-shrink-0' />
                    <span className='font-medium'>{nutrient}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Minerals */}
            <Card className='p-8 hover-lift border-2 border-slate-200 hover:border-purple-200 transition-colors'>
              <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-6 shadow-lg'>
                <Award className='w-8 h-8' />
              </div>
              <h3 className='text-2xl font-bold text-slate-900 mb-4'>
                Minerals
              </h3>
              <ul className='space-y-3'>
                {nutrients.minerals.map((nutrient, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-3 text-slate-700'>
                    <Check className='w-5 h-5 text-purple-600 flex-shrink-0' />
                    <span className='font-medium'>{nutrient}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className='py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-5xl font-black text-slate-900 mb-4'>
              Why Choose{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'>
                trackall.food?
              </span>
            </h2>
            <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
              See how we stack up against other nutrition tracking apps in the
              market.
            </p>
          </div>

          <Card className='overflow-hidden border-2 border-slate-200 shadow-2xl max-w-4xl mx-auto'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gradient-to-r from-emerald-500 to-teal-500'>
                    <th className='text-left py-4 px-6 text-white font-bold text-lg'>
                      Feature
                    </th>
                    <th className='text-center py-4 px-6 text-white font-bold text-lg'>
                      trackall.food
                    </th>
                    <th className='text-center py-4 px-6 text-white font-bold text-lg'>
                      Other Apps
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-slate-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}>
                      <td className='py-4 px-6 font-medium text-slate-900'>
                        {item.feature}
                      </td>
                      <td className='py-4 px-6 text-center'>
                        {typeof item.us === 'boolean' ? (
                          item.us ? (
                            <div className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100'>
                              <Check className='w-5 h-5 text-emerald-600' />
                            </div>
                          ) : (
                            <div className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100'>
                              <X className='w-5 h-5 text-red-600' />
                            </div>
                          )
                        ) : (
                          <span className='font-bold text-emerald-600'>
                            {item.us}
                          </span>
                        )}
                      </td>
                      <td className='py-4 px-6 text-center'>
                        {typeof item.them === 'boolean' ? (
                          item.them ? (
                            <div className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100'>
                              <Check className='w-5 h-5 text-emerald-600' />
                            </div>
                          ) : (
                            <div className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100'>
                              <X className='w-5 h-5 text-red-600' />
                            </div>
                          )
                        ) : (
                          <span className='font-semibold text-slate-600'>
                            {item.them}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='py-16 lg:py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-5xl font-black text-slate-900 mb-4'>
              Get Started in{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'>
                3 Simple Steps
              </span>
            </h2>
            <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
              Start tracking your nutrition in under 2 minutes with our
              intuitive interface.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto'>
            {[
              {
                step: '01',
                title: 'Sign Up Free',
                description:
                  'Create your account with Google in seconds. Get 15 free food logs to start your journey.',
                icon: <Users className='w-8 h-8' />,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                step: '02',
                title: 'Log Your Meals',
                description:
                  'Simply describe your food and let our AI analyze 30+ nutrients instantly with hospital-grade accuracy.',
                icon: <Sparkles className='w-8 h-8' />,
                color: 'from-emerald-500 to-teal-500',
              },
              {
                step: '03',
                title: 'Track Progress',
                description:
                  'Monitor your daily goals, vitamin intake, and heart health metrics with beautiful visualizations.',
                icon: <TrendingUp className='w-8 h-8' />,
                color: 'from-purple-500 to-pink-500',
              },
            ].map((step, index) => (
              <div key={index} className='relative'>
                {/* Connector Line - Desktop Only */}
                {index < 2 && (
                  <div className='hidden md:block absolute top-12 left-full w-12 lg:w-24 h-0.5 bg-gradient-to-r from-slate-300 to-transparent'></div>
                )}

                <div className='text-center'>
                  <div
                    className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-2xl hover-scale transition-transform`}>
                    {step.icon}
                  </div>
                  <div className='mb-4'>
                    <span className='text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300'>
                      {step.step}
                    </span>
                  </div>
                  <h3 className='text-2xl font-bold text-slate-900 mb-3'>
                    {step.title}
                  </h3>
                  <p className='text-slate-600 leading-relaxed'>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id='pricing'
        className='py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-semibold mb-4'>
              <Award className='w-4 h-4' />
              Best Value in Market
            </div>
            <h2 className='text-3xl lg:text-5xl font-black text-slate-900 mb-4'>
              Simple,{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'>
                Transparent
              </span>{' '}
              Pricing
            </h2>
            <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
              Get premium features at an unbeatable price. No hidden fees, no
              surprises.
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            {/* Monthly Plan */}
            <Card className='p-8 border-2 border-slate-200 hover:shadow-xl transition-all'>
              <div className='mb-6'>
                <h3 className='text-2xl font-bold text-slate-900 mb-2'>
                  Monthly
                </h3>
                <p className='text-slate-600'>Perfect for getting started</p>
              </div>

              <div className='mb-6'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-5xl font-black text-slate-900'>
                    ₹197
                  </span>
                  <span className='text-xl text-slate-600'>/month</span>
                </div>
                <p className='text-sm text-slate-500 mt-2'>
                  Cancel anytime, no commitments
                </p>
              </div>

              <Button
                fullWidth
                size='lg'
                variant='outline'
                onClick={openSignInModal}
                className='mb-6 border-2'>
                Start Monthly Plan
              </Button>

              <ul className='space-y-3'>
                {[
                  'AI-powered food analysis',
                  '30+ nutrients tracked',
                  'Unlimited food logs',
                  'Global food database',
                  'Progress tracking',
                ].map((feature, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-3 text-slate-700'>
                    <Check className='w-5 h-5 text-emerald-600 flex-shrink-0' />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Annual Plan - Recommended */}
            <Card className='p-8 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 relative hover:shadow-emerald-500/30 transition-all'>
              {/* Popular Badge */}
              <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
                <div className='px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-full shadow-lg'>
                  SAVE 37% • MOST POPULAR
                </div>
              </div>

              <div className='mb-6'>
                <h3 className='text-2xl font-bold text-slate-900 mb-2'>
                  Annual
                </h3>
                <p className='text-slate-600'>
                  Best value for serious trackers
                </p>
              </div>

              <div className='mb-6'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-5xl font-black text-slate-900'>
                    ₹125
                  </span>
                  <span className='text-xl text-slate-600'>/month</span>
                </div>
                <p className='text-sm font-semibold text-emerald-600 mt-2'>
                  ₹1,497 billed annually • Save ₹867
                </p>
              </div>

              <Button
                fullWidth
                size='lg'
                onClick={openSignInModal}
                className='mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg'>
                Start Annual Plan
                <Sparkles className='w-4 h-4 ml-2' />
              </Button>

              <ul className='space-y-3'>
                {[
                  'Everything in Monthly',
                  'Save ₹867 per year',
                  'Priority support',
                  'Early access to new features',
                  'Export your data anytime',
                ].map((feature, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-3 text-slate-700'>
                    <Check className='w-5 h-5 text-emerald-600 flex-shrink-0' />
                    <span className='font-medium'>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className='mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500'>
            <div className='flex items-center gap-2'>
              <Shield className='w-5 h-5' />
              <span className='text-sm font-medium'>Secure Payments</span>
            </div>
            <div className='flex items-center gap-2'>
              <Check className='w-5 h-5' />
              <span className='text-sm font-medium'>
                {FREE_LOGS_LIMIT} Free Logs
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Check className='w-5 h-5' />
              <span className='text-sm font-medium'>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id='testimonials' className='py-16 lg:py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-5xl font-black text-slate-900 mb-4'>
              Loved by{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'>
                Thousands
              </span>{' '}
              of Users
            </h2>
            <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
              Join our community of health-conscious individuals transforming
              their nutrition.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className='p-8 hover-lift border-2 border-slate-200 hover:border-emerald-200 transition-colors'>
                <div className='flex gap-1 mb-4'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-5 h-5 fill-amber-400 text-amber-400'
                    />
                  ))}
                </div>
                <p className='text-slate-700 leading-relaxed mb-6 text-lg'>
                  "{testimonial.content}"
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-2xl'>
                    {testimonial.image}
                  </div>
                  <div>
                    <p className='font-bold text-slate-900'>
                      {testimonial.name}
                    </p>
                    <p className='text-sm text-slate-600'>{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='py-16 lg:py-24 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden'>
        {/* Decorative Elements */}
        <div className='absolute inset-0'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl'></div>
        </div>

        <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl lg:text-5xl font-black text-white mb-6'>
            Ready to Transform Your
            <br />
            Nutrition Journey?
          </h2>
          <p className='text-xl text-white/90 mb-8 max-w-2xl mx-auto'>
            Join 5,000+ users tracking their nutrition with hospital-grade
            accuracy. Start your free trial today!
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-8'>
            <Button
              size='xl'
              onClick={openSignInModal}
              className='bg-white text-emerald-600 hover:bg-slate-50 shadow-2xl text-lg px-8 py-4 w-full sm:w-auto'>
              Get Started Free
              <ArrowRight className='w-5 h-5 ml-2' />
            </Button>
            <Button
              size='xl'
              variant='outline'
              onClick={() => scrollToSection('features')}
              className='border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 w-full sm:w-auto'>
              Learn More
            </Button>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm'>
            <div className='flex items-center gap-2'>
              <Check className='w-5 h-5' />
              <span>{FREE_LOGS_LIMIT} free logs on signup</span>
            </div>
            <div className='flex items-center gap-2'>
              <Check className='w-5 h-5' />
              <span>No credit card required</span>
            </div>
            <div className='flex items-center gap-2'>
              <Check className='w-5 h-5' />
              <span>Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Sign-In Modal */}
      {showSignInModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative'>
            {/* Close Button */}
            <button
              onClick={() => {
                setShowSignInModal(false);
                setError(null);
                setLoading(false);
              }}
              className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors'>
              <X className='w-5 h-5' />
            </button>

            {/* Logo */}
            <div className='text-center mb-6'>
              <LogoIcon className='w-16 h-16 mx-auto mb-3' />
              <h2 className='text-2xl font-bold text-slate-900 mb-2'>
                Welcome Back
              </h2>
              <p className='text-slate-600'>
                Sign in to continue your nutrition journey
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className='mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl'>
                <div className='flex items-start gap-3'>
                  <svg
                    className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <p className='text-sm text-red-800 font-medium'>{error}</p>
                </div>
              </div>
            )}

            {/* Google Sign-In Button */}
            <Button
              variant='primary'
              size='lg'
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
              loading={loading}
              icon={
                !loading && (
                  <svg className='w-6 h-6' viewBox='0 0 24 24' fill='none'>
                    <path
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      fill='#4285F4'
                    />
                    <path
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      fill='#34A853'
                    />
                    <path
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      fill='#FBBC05'
                    />
                    <path
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      fill='#EA4335'
                    />
                  </svg>
                )
              }>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            {/* Benefits */}
            <div className='mt-6 space-y-3'>
              {[
                { icon: CheckCircle2, text: 'No credit card required' },
                { icon: Sparkles, text: `${FREE_LOGS_LIMIT} free AI analyses` },
                { icon: CheckCircle2, text: 'Takes less than 2 minutes' },
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className='flex items-center gap-3 text-sm text-slate-700'>
                    <div className='flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center'>
                      <Icon className='w-3.5 h-3.5 text-emerald-600' />
                    </div>
                    <span className='font-medium'>{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
