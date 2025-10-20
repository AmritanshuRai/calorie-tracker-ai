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
import SignIn from './pages/SignIn';
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
import DietPreferencePage from './pages/onboarding/DietPreferencePage';
import HealthConditionsPage from './pages/onboarding/HealthConditionsPage';
import FinalPlanPage from './pages/onboarding/FinalPlanPage';

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
          <Route
            path='/signin'
            element={
              isAuthenticated ? <Navigate to='/dashboard' /> : <SignIn />
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

          {/* Catch all */}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
