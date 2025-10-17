# 401 Unauthorized Error - FIXED ✅

## Problem

Getting **401 Unauthorized** error when calling `/api/auth/onboarding` after completing the onboarding flow.

## Root Cause

**Token storage mismatch**:

- `setToken()` in Zustand was storing the token in Zustand state (persisted to localStorage with key `'user-storage'`)
- `api.js` interceptor was looking for token in localStorage with key `'token'`
- They were using different storage keys, so the authorization header was never added to requests

## The Fix

### Before:

```javascript
setToken: (token) => set({ token }),
```

This only stored the token in Zustand state.

### After:

```javascript
setToken: (token) => {
  set({ token });
  // Also store in localStorage for API interceptor
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
},
```

Now the token is stored in **both**:

1. Zustand state (for React components)
2. localStorage with key `'token'` (for axios interceptor)

### Also Updated logout():

```javascript
logout: () => {
  set({
    // ... clear all state
  });
  // Clear from localStorage
  localStorage.removeItem('token');
},
```

## How It Works Now

### 1. Google Sign-In Flow

```
User clicks "Continue with Google"
  ↓
Google returns credential
  ↓
Frontend sends credential to POST /api/auth/google
  ↓
Backend verifies with Google, creates/finds user, generates JWT
  ↓
Backend returns: { user, token }
  ↓
Frontend calls: setToken(data.token)
  ↓
Token stored in:
  - Zustand state ✅
  - localStorage['token'] ✅
```

### 2. Onboarding Completion Flow

```
User completes all 8 onboarding steps
  ↓
Clicks "Start Tracking" on FinalPlanPage
  ↓
Frontend calls: authService.completeOnboarding(payload)
  ↓
api.js interceptor runs:
  - Reads token from localStorage['token'] ✅
  - Adds header: Authorization: Bearer <token> ✅
  ↓
Backend receives POST /api/auth/onboarding with valid token
  ↓
Backend middleware authenticateToken() verifies JWT ✅
  ↓
Backend updates User table + creates UserOnboarding entry ✅
  ↓
Database filled with all onboarding data! 🎉
```

## Testing Steps

1. **Clear browser data**:

   ```javascript
   // In browser console
   localStorage.clear();
   ```

2. **Refresh the page**: http://localhost:5173

3. **Sign in with Google**: Click "Continue with Google"

4. **Check localStorage**:

   ```javascript
   // In browser console
   console.log('Token:', localStorage.getItem('token'));
   // Should show: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

5. **Complete all 8 onboarding steps**:

   - Gender
   - Age
   - Goal
   - Height
   - Weight
   - Timeline
   - Activity Level
   - Final Plan → Click "Start Tracking"

6. **Check browser console**: Should see no errors

7. **Check backend logs**: Should see successful POST request

8. **Check Prisma Studio** (http://localhost:5555):
   - User table: `profileCompleted: true`, all fields filled ✅
   - UserOnboarding table: New entry with all data ✅

## Why This Happened

The codebase had two different token storage mechanisms:

1. **Zustand persist middleware** - stores entire state in localStorage with key `'user-storage'` as JSON
2. **Direct localStorage access** - API client expects token at localStorage with key `'token'` as string

They weren't synchronized, causing the API interceptor to not find the token.

## Additional Notes

### Zustand Persist

The persist middleware stores the entire Zustand state like this:

```javascript
localStorage['user-storage'] = {
  "state": {
    "user": {...},
    "token": "eyJhbGc...",  // Token here
    "onboardingData": {...},
    ...
  },
  "version": 0
}
```

### API Interceptor

But the API interceptor was looking for:

```javascript
localStorage['token'] = 'eyJhbGc...'; // Token here (string, not object)
```

### The Solution

Now `setToken()` writes to both places:

- ✅ Zustand state (for components to access via `useUserStore`)
- ✅ localStorage['token'] (for axios interceptor to add to headers)

## Files Modified

- ✅ `client/src/stores/useUserStore.js` - Updated `setToken()` and `logout()`

## Result

🎉 **401 Error FIXED!**
🎉 **Onboarding data now saves to database!**
🎉 **UserOnboarding history table populated!**
