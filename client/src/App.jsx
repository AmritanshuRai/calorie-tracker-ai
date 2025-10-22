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
import LifestyleHabitsPage from './pages/onboarding/LifestyleHabitsPage';
import EnvironmentPage from './pages/onboarding/EnvironmentPage';
import HealthMetricsPage from './pages/onboarding/HealthMetricsPage';
import MedicationsPage from './pages/onboarding/MedicationsPage';
import ExerciseDetailsPage from './pages/onboarding/ExerciseDetailsPage';
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
            path='/onboarding/lifestyle-habits'
            element={
              <ProtectedRoute>
                <LifestyleHabitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/environment'
            element={
              <ProtectedRoute>
                <EnvironmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/health-metrics'
            element={
              <ProtectedRoute>
                <HealthMetricsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/medications'
            element={
              <ProtectedRoute>
                <MedicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/onboarding/exercise-details'
            element={
              <ProtectedRoute>
                <ExerciseDetailsPage />
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
