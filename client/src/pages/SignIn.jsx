import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-6'>
      <div className='max-w-md w-full'>
        {/* Logo/Icon */}
        <div className='text-center mb-8'>
          <div className='inline-block p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl shadow-xl mb-4'>
            <span className='text-6xl'>🍎</span>
          </div>
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>
            AI Calorie Tracker
          </h1>
          <p className='text-gray-600'>
            Track your nutrition with AI-powered insights
          </p>
        </div>

        {/* Sign-in Card */}
        <div className='bg-white rounded-3xl shadow-xl p-8 border border-gray-100'>
          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl'>
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
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          )}

          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={loading}
            icon={
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
            }>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Benefits */}
          <div className='mt-8 space-y-3'>
            <div className='flex items-center gap-3 text-sm text-gray-600'>
              <svg
                className='w-5 h-5 text-green-500'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className='flex items-center gap-3 text-sm text-gray-600'>
              <svg
                className='w-5 h-5 text-green-500'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Free to start</span>
            </div>
            <div className='flex items-center gap-3 text-sm text-gray-600'>
              <svg
                className='w-5 h-5 text-green-500'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Takes less than 2 minutes</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className='text-center text-sm text-gray-500 mt-6'>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SignIn;
