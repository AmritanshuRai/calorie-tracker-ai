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
        // Send the credential to your backend
        const data = await authService.googleSignIn(response.credential);

        // Store user and token
        setUser(data.user);
        setToken(data.token);

        // Navigate based on profile completion
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
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google script loaded');
      // Initialize Google Sign-In
      if (window.google) {
        console.log(
          'Initializing Google Sign-In with client ID:',
          import.meta.env.VITE_GOOGLE_CLIENT_ID
        );
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        console.log('Google Sign-In initialized');
      } else {
        console.error('window.google not available');
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
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
    console.log('Sign-in button clicked');
    setError(null);
    if (window.google) {
      console.log('Showing Google One Tap prompt');
      window.google.accounts.id.prompt(); // Show One Tap dialog
    } else {
      console.error('window.google not available');
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
