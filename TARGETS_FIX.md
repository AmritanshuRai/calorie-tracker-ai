# Target Calories and Macros Fix

## Problem

1. **Empty target calories** - The daily calorie target was not being displayed in the Dashboard because user data from the `UserOnboarding` table wasn't being loaded after login.
2. **Hardcoded macro targets** - Protein (150g), Carbs (200g), and Fats (65g) targets were hardcoded in the UI instead of being fetched from the user's personalized onboarding data.

## Root Cause

- The `SignIn` component only stored basic user data (`id`, `email`, `name`, `picture`, `profileCompleted`) from the initial authentication response.
- The Dashboard was not fetching the user's full profile including onboarding data (which contains `dailyCalorieTarget`, `proteinTarget`, `carbsTarget`, `fatsTarget`).
- The user store's `dailyCalorieTarget` was only being set during onboarding calculations, not when loading existing user data.

## Solution

### 1. Dashboard.jsx Changes

- **Added state for user targets**: Created `userTargets` state to store personalized targets from the database.

  ```javascript
  const [userTargets, setUserTargets] = useState({
    dailyCalorieTarget: 0,
    proteinTarget: 0,
    carbsTarget: 0,
    fatsTarget: 0,
  });
  ```

- **Added profile loading on mount**: Added a `useEffect` that fetches the full user profile from the backend on component mount.

  ```javascript
  useEffect(() => {
    const loadUserProfile = async () => {
      const profile = await authService.getProfile();
      setUser(profile);
      setUserTargets({
        dailyCalorieTarget: profile.dailyCalorieTarget,
        proteinTarget: profile.proteinTarget || 0,
        carbsTarget: profile.carbsTarget || 0,
        fatsTarget: profile.fatsTarget || 0,
      });
    };
    loadUserProfile();
  }, []);
  ```

- **Updated all hardcoded values**: Replaced all hardcoded target values with dynamic values from `userTargets`:
  - Calorie progress calculation
  - Quick stats cards (Protein, Carbs, Fats)
  - Daily Goal card display

### 2. SignIn.jsx Changes

- **Enhanced login flow**: After successful authentication, if the user has completed their profile, the app now fetches the full profile data including onboarding information before navigating to the dashboard.
  ```javascript
  if (data.user.profileCompleted) {
    const fullProfile = await authService.getProfile();
    setUser(fullProfile);
    navigate('/dashboard');
  }
  ```

### 3. Backend API (No changes needed)

The backend already supports fetching complete user data:

- `/api/auth/profile` - Returns user data combined with the latest onboarding record, including:
  - `dailyCalorieTarget`
  - `proteinTarget`
  - `carbsTarget`
  - `fatsTarget`
  - All other onboarding data (BMR, TDEE, activity level, etc.)

## Data Flow

### Before Fix

```
Login → Store basic user data → Dashboard → Show hardcoded targets ❌
```

### After Fix

```
Login → Store token → Fetch full profile → Store complete user data →
Dashboard → Load profile on mount → Display personalized targets ✅
```

## Testing Checklist

- [x] User targets are loaded from the database on Dashboard mount
- [x] Calorie target displays correctly in the "Daily Goal" card
- [x] Protein target displays correctly (no longer shows hardcoded 150g)
- [x] Carbs target displays correctly (no longer shows hardcoded 200g)
- [x] Fats target displays correctly (no longer shows hardcoded 65g)
- [x] Progress circles show correct percentages based on personalized targets
- [x] Remaining calories calculation is accurate
- [x] No console errors related to undefined `dailyCalorieTarget`

## Database Schema Reference

The targets are stored in the `UserOnboarding` table:

```prisma
model UserOnboarding {
  dailyCalorieTarget    Int
  proteinTarget         Int
  carbsTarget           Int
  fatsTarget            Int
  // ... other fields
}
```

## Example User Data

Based on your sample data:

```json
{
  "dailyCalorieTarget": 1560,
  "proteinTarget": 117,
  "carbsTarget": 176,
  "fatsTarget": 43
}
```

These values are now properly displayed in the Dashboard instead of the previous hardcoded values.
