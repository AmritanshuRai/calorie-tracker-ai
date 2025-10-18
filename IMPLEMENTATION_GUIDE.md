# 🚀 Implementation Guide - Premium UI Redesign

This guide contains all the updated component code for the calorie tracker app redesign. Replace the files with the code provided below.

## ✅ Already Updated

- ✓ `DESIGN_SYSTEM.md` - Design system documentation created
- ✓ `client/src/index.css` - Global styles updated with new color palette
- ✓ `client/src/components/Button.jsx` - Updated with gradients and loading states
- ✓ `client/src/components/Card.jsx` - Updated with variants and hover effects
- ✓ `client/src/components/Input.jsx` - Updated with better focus states

## 📝 Files to Update

### 1. `client/src/components/PageLayout.jsx`

```jsx
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PageLayout = ({ children, title, showBack = false, rightAction }) => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20'>
      {/* Header */}
      <div className='sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200 shadow-sm'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className='flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-lg'>
              <ChevronLeft className='w-5 h-5' />
              <span className='font-medium'>Back</span>
            </button>
          ) : (
            <div />
          )}

          {title && (
            <h1 className='text-lg font-bold text-slate-800'>{title}</h1>
          )}

          {rightAction || <div />}
        </div>
      </div>

      {/* Content */}
      <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8'>{children}</div>
    </div>
  );
};

export default PageLayout;
```

### 2. `client/src/components/CircularProgress.jsx`

```jsx
const CircularProgress = ({
  value,
  max,
  size = 120,
  strokeWidth = 12,
  label,
  unit,
  color = 'emerald',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  const colorGradients = {
    emerald: { start: '#10b981', end: '#059669' },
    blue: { start: '#3b82f6', end: '#2563eb' },
    orange: { start: '#f97316', end: '#ea580c' },
    green: { start: '#22c55e', end: '#16a34a' },
    yellow: { start: '#eab308', end: '#ca8a04' },
    purple: { start: '#a855f7', end: '#9333ea' },
  };

  const selectedGradient = colorGradients[color] || colorGradients.emerald;

  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative' style={{ width: size, height: size }}>
        <svg className='transform -rotate-90' width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke='#e2e8f0'
            strokeWidth={strokeWidth}
            fill='none'
          />
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor={selectedGradient.start} />
              <stop offset='100%' stopColor={selectedGradient.end} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill='none'
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Center text */}
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-2xl font-bold text-slate-800'>
            {Math.round(value)}
          </span>
          {unit && (
            <span className='text-xs text-slate-500 font-medium'>{unit}</span>
          )}
        </div>
      </div>

      {label && (
        <span className='text-sm font-medium text-slate-600'>{label}</span>
      )}
    </div>
  );
};

export default CircularProgress;
```

### 3. `client/src/pages/SignIn.jsx`

```jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Apple, CheckCircle2, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import useUserStore from '../stores/useUserStore';
import { authService } from '../services/authService';

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);

  const handleGoogleResponse = useCallback(
    async (response) => {
      setLoading(true);
      setError(null);

      try {
        const data = await authService.googleSignIn(response.credential);
        setUser(data.user);
        setToken(data.token);

        if (data.user.profileCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding/gender');
        }
      } catch (err) {
        console.error('Sign-in error:', err);
        setError(
          err.response?.data?.error || 'Failed to sign in. Please try again.'
        );
        setLoading(false);
      }
    },
    [navigate, setUser, setToken]
  );

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    script.onerror = () => {
      setError(
        'Failed to load Google Sign-In. Please check your internet connection.'
      );
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleResponse]);

  const handleGoogleSignIn = () => {
    setError(null);
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In not loaded. Please refresh the page.');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 sm:p-6'>
      <div className='max-w-md w-full'>
        {/* Logo/Icon */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl shadow-xl shadow-emerald-500/30 mb-6'>
            <Apple className='w-12 h-12 text-white' />
          </div>
          <h1 className='text-4xl sm:text-5xl font-bold text-slate-900 mb-3'>
            NutriTrack AI
          </h1>
          <p className='text-lg text-slate-600'>
            Your personal AI nutrition companion
          </p>
        </div>

        {/* Sign-in Card */}
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200'>
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
            Continue with Google
          </Button>

          {/* Benefits */}
          <div className='mt-8 space-y-4'>
            {[
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: Sparkles, text: 'AI-powered food tracking' },
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

        {/* Footer */}
        <p className='text-center text-sm text-slate-500 mt-6 px-4'>
          By continuing, you agree to our{' '}
          <button className='text-emerald-600 hover:text-emerald-700 font-medium'>
            Terms
          </button>{' '}
          and{' '}
          <button className='text-emerald-600 hover:text-emerald-700 font-medium'>
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
```

### 4. Onboarding Pages - Example: `client/src/pages/onboarding/GenderPage.jsx`

```jsx
import { useNavigate } from 'react-router-dom';
import { User, UserCircle2 } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import Card from '../../components/Card';
import useUserStore from '../../stores/useUserStore';

const GenderPage = () => {
  const navigate = useNavigate();
  const updateOnboardingData = useUserStore(
    (state) => state.updateOnboardingData
  );

  const handleSelect = (gender) => {
    updateOnboardingData({ gender });
    navigate('/onboarding/age');
  };

  const options = [
    {
      value: 'male',
      label: 'Male',
      icon: User,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      value: 'female',
      label: 'Female',
      icon: UserCircle2,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <PageLayout title='Welcome!' showBack={false}>
      <div className='space-y-8 max-w-2xl mx-auto'>
        <div className='text-center'>
          <h2 className='text-3xl lg:text-4xl font-bold text-slate-900 mb-3'>
            What's your gender?
          </h2>
          <p className='text-lg text-slate-600'>
            This helps us calculate your personalized calorie needs
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12'>
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.value}
                hoverable
                onClick={() => handleSelect(option.value)}
                padding='lg'
                variant='default'
                className='group'>
                <div className='flex flex-col items-center text-center gap-4 py-6'>
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className='w-10 h-10 text-white' />
                  </div>
                  <span className='text-2xl font-bold text-slate-800'>
                    {option.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className='flex justify-center gap-2 mt-12'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === 0
                  ? 'w-8 bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default GenderPage;
```

## 🎨 Pattern for Other Onboarding Pages

Use the same pattern for all onboarding pages:

### AgePage.jsx

- Icon: `Calendar` from lucide-react
- Gradient: `from-orange-500 to-red-500`
- Input for age with unit display

### GoalPage.jsx

- Icons: `TrendingDown`, `Target`, `TrendingUp` from lucide-react
- Options: Weight Loss, Maintain, Muscle Gain
- Colors: red-500, emerald-500, blue-500

### HeightPage.jsx

- Icon: `Ruler` from lucide-react
- Gradient: `from-purple-500 to-pink-500`
- Input with cm/in toggle

### WeightPage.jsx

- Icon: `Scale` from lucide-react
- Gradient: `from-blue-500 to-cyan-500`
- Input with kg/lbs toggle

### TimelinePage.jsx

- Icon: `Calendar` from lucide-react
- Options with different timeline durations
- Multi-card selection

### ActivityLevelPage.jsx

- Icons: `Armchair`, `WalkIcon`, `Dumbbell`, `Flame` from lucide-react
- 4 levels: Sedentary, Light, Moderate, Very Active
- Card grid with icons

### FinalPlanPage.jsx

- Summary page with gradient cards
- Display all calculated macros
- CTA button to dashboard

## 🚀 Quick Start

1. Run `npm install lucide-react` if not already installed (it's already in your package.json)
2. Replace files one by one starting with components
3. Test each component before moving to the next
4. Update onboarding pages using the pattern above

## 📱 Mobile & Desktop Responsive Classes

Use these Tailwind classes for responsive design:

- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `px-4 sm:px-6 lg:px-8`
- `text-base lg:text-lg`
- `p-4 lg:p-6`
- `gap-4 lg:gap-6`

## 🎯 Key Improvements

1. **Modern Color Palette**: Emerald & Teal gradient-based design
2. **Lucide Icons**: Clean, consistent iconography
3. **Glass Morphism**: Subtle backdrop blur effects
4. **Smooth Animations**: Hover states and transitions
5. **Desktop Friendly**: Responsive grid layouts
6. **Better Typography**: Clearer hierarchy
7. **Premium Feel**: Gradients, shadows, and spacing
