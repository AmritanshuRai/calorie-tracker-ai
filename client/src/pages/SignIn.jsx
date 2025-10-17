import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import useUserStore from '../stores/useUserStore';

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      // TODO: Implement actual Google OAuth
      // For now, simulate sign-in
      setTimeout(() => {
        const mockUser = {
          id: 'user_123',
          email: 'user@example.com',
          name: 'Demo User',
          profileCompleted: false, // Change to true to skip onboarding
        };

        setUser(mockUser);

        // Route based on profile completion
        if (mockUser.profileCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding/gender');
        }
      }, 1000);
    } catch (error) {
      console.error('Sign-in error:', error);
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-6'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='max-w-md w-full'>
        {/* Logo/Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className='text-center mb-8'>
          <div className='inline-block p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl shadow-xl mb-4'>
            <span className='text-6xl'>🍎</span>
          </div>
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>
            AI Calorie Tracker
          </h1>
          <p className='text-gray-600'>
            Track your nutrition with AI-powered insights
          </p>
        </motion.div>

        {/* Sign-in Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='bg-white rounded-3xl shadow-xl p-8 border border-gray-100'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={loading}
            icon={
              <svg className='w-6 h-6' viewBox='0 0 24 24'>
                <path
                  fill='currentColor'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='currentColor'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='currentColor'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='currentColor'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
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
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='text-center text-sm text-gray-500 mt-6'>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignIn;
