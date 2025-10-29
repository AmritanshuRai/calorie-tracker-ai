import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, X, AlertTriangle } from 'lucide-react';
import Footer from './Footer';
import Button from './Button';

const PageLayout = ({ children, title, showBack = false, rightAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSkipModal, setShowSkipModal] = useState(false);
  const isAdminPage = location.pathname === '/admin';
  const isUpgradePage = location.pathname === '/upgrade';
  const isOnboardingPage = location.pathname.startsWith('/onboarding');
  const isFullWidth = isAdminPage || isUpgradePage || isOnboardingPage;

  // Calculate onboarding progress
  const onboardingSteps = [
    '/onboarding/gender',
    '/onboarding/age',
    '/onboarding/goal',
    '/onboarding/height',
    '/onboarding/weight',
    '/onboarding/timeline',
    '/onboarding/activity',
    '/onboarding/pregnancy-status',
    '/onboarding/smoking-status',
    '/onboarding/alcohol-consumption',
    '/onboarding/caffeine-intake',
    '/onboarding/sun-exposure',
    '/onboarding/climate',
    '/onboarding/skin-tone',
    '/onboarding/sleep-hours',
    '/onboarding/stress-level',
    '/onboarding/water-intake',
    '/onboarding/medications-list',
    '/onboarding/deficiencies',
    '/onboarding/exercise-types',
    '/onboarding/exercise-intensity',
    '/onboarding/diet-preference',
    '/onboarding/health-conditions',
    '/onboarding/final',
  ];

  const currentStepIndex = onboardingSteps.indexOf(location.pathname);
  const progress =
    currentStepIndex >= 0
      ? ((currentStepIndex + 1) / onboardingSteps.length) * 100
      : 0;

  const handleSkipOnboarding = () => {
    setShowSkipModal(false);
    navigate('/dashboard');
  };

  return (
    <div
      className={`bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 flex flex-col ${
        isOnboardingPage ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}>
      {/* Header */}
      <div
        className={`z-50 backdrop-blur-lg bg-white/80 ${
          isOnboardingPage ? 'flex-shrink-0' : 'sticky top-0 shadow-sm'
        }`}>
        <div
          className={`${
            isFullWidth ? 'w-full' : 'max-w-3xl'
          } mx-auto px-6 max-md:px-4 ${
            isOnboardingPage ? 'py-2' : 'py-4'
          } flex items-center justify-between`}>
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-100 rounded-lg ${
                isOnboardingPage ? 'text-sm' : ''
              }`}>
              <ChevronLeft
                className={isOnboardingPage ? 'w-4 h-4' : 'w-5 h-5'}
              />
              <span className='font-medium'>Back</span>
            </button>
          ) : (
            <div />
          )}

          {title && (
            <h1
              className={`font-bold text-slate-800 ${
                isOnboardingPage ? 'text-base' : 'text-lg'
              }`}>
              {title}
            </h1>
          )}

          {isOnboardingPage ? (
            <button
              onClick={() => setShowSkipModal(true)}
              className='text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 hover:bg-slate-100 rounded-lg'>
              Skip
            </button>
          ) : (
            rightAction || <div />
          )}
        </div>

        {/* Progress Bar - Only for onboarding pages */}
        {isOnboardingPage && (
          <div className='w-full h-1 bg-slate-200/50'>
            <div
              className='h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 transition-all duration-500 ease-out shadow-lg shadow-emerald-500/20'
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`${
          isFullWidth
            ? 'w-full px-8 max-lg:px-6 max-sm:px-4'
            : 'max-w-3xl mx-auto px-6 max-md:px-4'
        } ${isOnboardingPage ? 'flex-1 overflow-y-auto py-4' : 'flex-1 py-8'}`}>
        {children}
      </div>

      {/* Footer - Hidden for onboarding pages */}
      {!isOnboardingPage && <Footer />}

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-6 border-b border-slate-200'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center'>
                  <AlertTriangle className='w-5 h-5 text-amber-600' />
                </div>
                <h3 className='text-lg font-bold text-slate-900'>
                  Skip Health Profile?
                </h3>
              </div>
              <button
                onClick={() => setShowSkipModal(false)}
                className='p-1 hover:bg-slate-100 rounded-lg transition-colors'>
                <X className='w-5 h-5 text-slate-500' />
              </button>
            </div>

            {/* Modal Content */}
            <div className='p-6 space-y-4'>
              <p className='text-slate-700 leading-relaxed'>
                Skipping the health profile means you'll miss out on:
              </p>
              <ul className='space-y-2 text-sm text-slate-600'>
                <li className='flex items-start gap-2'>
                  <span className='text-amber-500 font-bold mt-0.5'>⚠️</span>
                  <span>
                    <strong className='text-slate-700'>
                      Personalized nutrition targets
                    </strong>{' '}
                    tailored to your age, gender, and goals
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-amber-500 font-bold mt-0.5'>⚠️</span>
                  <span>
                    <strong className='text-slate-700'>
                      Accurate calorie recommendations
                    </strong>{' '}
                    based on your activity level
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-amber-500 font-bold mt-0.5'>⚠️</span>
                  <span>
                    <strong className='text-slate-700'>
                      Customized micronutrient tracking
                    </strong>{' '}
                    for your specific health needs
                  </span>
                </li>
              </ul>
              <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4'>
                <p className='text-sm text-amber-900 font-medium'>
                  💡 You can complete your profile later from Account Settings
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className='flex gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl'>
              <Button
                onClick={() => setShowSkipModal(false)}
                variant='secondary'
                className='flex-1'>
                Continue Setup
              </Button>
              <Button
                onClick={handleSkipOnboarding}
                variant='primary'
                className='flex-1 bg-slate-600 hover:bg-slate-700'>
                Skip for Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageLayout;
