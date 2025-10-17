import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useUserStore from './stores/useUserStore';

// Pages
import SignIn from './pages/SignIn';
import Dashboard from './pages/DashboardNew';

// Onboarding Pages
import GenderPage from './pages/onboarding/GenderPage';
import AgePage from './pages/onboarding/AgePage';
import GoalPage from './pages/onboarding/GoalPage';
import WeightPage from './pages/onboarding/WeightPage';
import TimelinePage from './pages/onboarding/TimelinePage';
import ActivityLevelPage from './pages/onboarding/ActivityLevelPage';
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

          {/* Catch all */}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
