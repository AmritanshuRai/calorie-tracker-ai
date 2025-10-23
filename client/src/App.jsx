import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useUserStore from './stores/useUserStore';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Admin from './pages/Admin';
import Upgrade from './pages/Upgrade';

// Onboarding Pages
import GenderPage from './pages/onboarding/GenderPage';
import AgePage from './pages/onboarding/AgePage';
import GoalPage from './pages/onboarding/GoalPage';
import HeightPage from './pages/onboarding/HeightPage';
import WeightPage from './pages/onboarding/WeightPage';
import TimelinePage from './pages/onboarding/TimelinePage';
import ActivityLevelPage from './pages/onboarding/ActivityLevelPage';
import PregnancyStatusPage from './pages/onboarding/PregnancyStatusPage';
import SmokingStatusPage from './pages/onboarding/SmokingStatusPage';
import AlcoholConsumptionPage from './pages/onboarding/AlcoholConsumptionPage';
import CaffeineIntakePage from './pages/onboarding/CaffeineIntakePage';
import SunExposurePage from './pages/onboarding/SunExposurePage';
import ClimatePage from './pages/onboarding/ClimatePage';
import SkinTonePage from './pages/onboarding/SkinTonePage';
import SleepHoursPage from './pages/onboarding/SleepHoursPage';
import StressLevelPage from './pages/onboarding/StressLevelPage';
import WaterIntakePage from './pages/onboarding/WaterIntakePage';
import MedicationsListPage from './pages/onboarding/MedicationsListPage';
import DeficienciesPage from './pages/onboarding/DeficienciesPage';
import ExerciseTypesPage from './pages/onboarding/ExerciseTypesPage';
import ExerciseIntensityPage from './pages/onboarding/ExerciseIntensityPage';
import DietPreferencePage from './pages/onboarding/DietPreferencePage';
import HealthConditionsPage from './pages/onboarding/HealthConditionsPage';
import FinalPlanPage from './pages/onboarding/FinalPlanPage';

// Policy Pages
import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import TermsAndConditions from './pages/policies/TermsAndConditions';
import CancellationRefund from './pages/policies/CancellationRefund';
import Shipping from './pages/policies/Shipping';
import ContactUs from './pages/policies/ContactUs';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to='/' />;
};

function App() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <Router>
      <AnimatePresence mode='wait'>
        <Routes>
          {/* Public Routes */}
          <Route
            path='/'
            element={
              isAuthenticated ? <Navigate to='/dashboard' /> : <LandingPage />
            }
          />

          {/* Onboarding Routes */}
          <Route
            path='/onboarding/gender'
            element={
              <ProtectedRoute>
                <GenderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/age'
            element={
              <ProtectedRoute>
                <AgePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/goal'
            element={
              <ProtectedRoute>
                <GoalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/height'
            element={
              <ProtectedRoute>
                <HeightPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/weight'
            element={
              <ProtectedRoute>
                <WeightPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/timeline'
            element={
              <ProtectedRoute>
                <TimelinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/activity'
            element={
              <ProtectedRoute>
                <ActivityLevelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/pregnancy-status'
            element={
              <ProtectedRoute>
                <PregnancyStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/smoking-status'
            element={
              <ProtectedRoute>
                <SmokingStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/alcohol-consumption'
            element={
              <ProtectedRoute>
                <AlcoholConsumptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/caffeine-intake'
            element={
              <ProtectedRoute>
                <CaffeineIntakePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/sun-exposure'
            element={
              <ProtectedRoute>
                <SunExposurePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/climate'
            element={
              <ProtectedRoute>
                <ClimatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/skin-tone'
            element={
              <ProtectedRoute>
                <SkinTonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/sleep-hours'
            element={
              <ProtectedRoute>
                <SleepHoursPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/stress-level'
            element={
              <ProtectedRoute>
                <StressLevelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/water-intake'
            element={
              <ProtectedRoute>
                <WaterIntakePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/medications-list'
            element={
              <ProtectedRoute>
                <MedicationsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/deficiencies'
            element={
              <ProtectedRoute>
                <DeficienciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/exercise-types'
            element={
              <ProtectedRoute>
                <ExerciseTypesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/exercise-intensity'
            element={
              <ProtectedRoute>
                <ExerciseIntensityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/diet-preference'
            element={
              <ProtectedRoute>
                <DietPreferencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/health-conditions'
            element={
              <ProtectedRoute>
                <HealthConditionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/final'
            element={
              <ProtectedRoute>
                <FinalPlanPage />
              </ProtectedRoute>
            }
          />

          {/* App Routes */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/account'
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path='/upgrade'
            element={
              <ProtectedRoute>
                <Upgrade />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin'
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Policy Routes - Public */}
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route
            path='/terms-and-conditions'
            element={<TermsAndConditions />}
          />
          <Route path='/cancellation-refund' element={<CancellationRefund />} />
          <Route path='/shipping' element={<Shipping />} />
          <Route path='/contact' element={<ContactUs />} />

          {/* Catch all */}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
