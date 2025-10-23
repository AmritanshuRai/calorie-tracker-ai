import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Footer from './Footer';

const PageLayout = ({ children, title, showBack = false, rightAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const isUpgradePage = location.pathname === '/upgrade';
  const isOnboardingPage = location.pathname.startsWith('/onboarding');
  const isFullWidth = isAdminPage || isUpgradePage;

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
          } mx-auto px-4 sm:px-6 ${
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

          {rightAction || <div />}
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
          isFullWidth ? 'w-full' : 'max-w-3xl mx-auto px-4 sm:px-6'
        } ${isOnboardingPage ? 'flex-1 overflow-y-auto py-4' : 'flex-1 py-8'}`}>
        {children}
      </div>

      {/* Footer - Hidden for onboarding pages */}
      {!isOnboardingPage && <Footer />}
    </div>
  );
};

export default PageLayout;
