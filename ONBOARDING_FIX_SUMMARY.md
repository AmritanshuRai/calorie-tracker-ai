# Onboarding Fix Summary

## Issues Found

1. ❌ **Database was empty after completing onboarding** - The `FinalPlanPage` had a TODO comment and wasn't saving data to backend
2. ❌ **No height field** - Height wasn't being collected during onboarding
3. ❌ **No onboarding history** - Each user's onboarding journey wasn't tracked separately

## Changes Made

### 1. Database Schema Updates (`server/prisma/schema.prisma`)

#### Added Height Field to User Model

```prisma
height: Float?  // in cm
```

#### Created New UserOnboarding Table

```prisma
model UserOnboarding {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Onboarding data snapshot
  gender           String?
  age              Int?
  height           Float?
  goal             String?
  currentWeight    Float?
  targetWeight     Float?
  targetDate       DateTime?
  activityLevel    String?
  activityMultiplier Float?

  // Calculated values at the time
  bmr                    Int?
  tdee                   Int?
  dailyCalorieTarget     Int?
  targetWeightChangeRate Float?
  proteinTarget          Int?
  carbsTarget            Int?
  fatsTarget             Int?

  // Metadata
  completedAt DateTime @default(now())
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([completedAt])
}
```

**Purpose**: Tracks each time a user completes onboarding, creating a history of their fitness journeys.

### 2. Frontend Changes

#### Created HeightPage (`client/src/pages/onboarding/HeightPage.jsx`)

- Input for height in centimeters
- Validation: 100-250 cm range
- Conversion display (cm to feet)
- Quick reference buttons for common heights
- Progress indicator (step 3 of 8)

#### Updated Onboarding Flow

**New 8-step flow**:

1. Gender
2. Age
3. Goal
4. **Height** ⭐ (NEW!)
5. Weight
6. Timeline
7. Activity Level
8. Final Plan

#### Fixed FinalPlanPage (`client/src/pages/onboarding/FinalPlanPage.jsx`)

**Before**:

```javascript
const handleFinish = () => {
  // TODO: Save to backend
  navigate('/dashboard');
};
```

**After**:

```javascript
const handleFinish = async () => {
  setLoading(true);
  setError('');

  try {
    const onboardingPayload = {
      gender: onboardingData.gender,
      age: onboardingData.age,
      height: onboardingData.height, // ⭐ NEW
      goal: onboardingData.goal,
      currentWeight: onboardingData.currentWeight,
      targetWeight: onboardingData.targetWeight,
      targetDate: onboardingData.targetDate,
      activityLevel: onboardingData.activityLevel,
      activityMultiplier: onboardingData.activityMultiplier,
      bmr,
      tdee,
      dailyCalorieTarget,
      targetWeightChangeRate,
      proteinTarget: macros.protein,
      carbsTarget: macros.carbs,
      fatsTarget: macros.fats,
    };

    // Save to backend ⭐ FIXED
    const updatedUser = await authService.completeOnboarding(onboardingPayload);

    setUser({
      ...updatedUser,
      profileCompleted: true,
    });

    navigate('/dashboard');
  } catch (err) {
    console.error('Failed to save onboarding data:', err);
    setError('Failed to save your data. Please try again.');
    setLoading(false);
  }
};
```

#### Updated UserStore (`client/src/stores/useUserStore.js`)

**Before** (using estimated height):

```javascript
const height = gender === 'male' ? 175 : 162; // cm (ESTIMATED)
```

**After** (using actual height):

```javascript
const { gender, age, currentWeight, height } = get().onboardingData;
if (!gender || !age || !currentWeight || !height) return 0;
```

#### Updated All Progress Indicators

Changed from 7 steps to 8 steps across all onboarding pages:

- `GenderPage`: 1/8
- `AgePage`: 2/8
- `GoalPage`: 3/8
- `HeightPage`: 3/8 ⭐ (NEW)
- `WeightPage`: 5/8
- `TimelinePage`: 6/8
- `ActivityLevelPage`: 7/8
- `FinalPlanPage`: 8/8 (all complete)

### 3. Backend Changes

#### Updated Auth Routes (`server/src/routes/auth.js`)

**POST /api/auth/onboarding** - Now includes:

1. ✅ Accepts `height` field
2. ✅ Updates user profile with all onboarding data
3. ✅ Sets `profileCompleted = true`
4. ✅ **Creates UserOnboarding history entry** ⭐ (NEW)

```javascript
// Update user profile
const user = await prisma.user.update({
  where: { id: req.user.userId },
  data: {
    profileCompleted: true,
    gender,
    age,
    height, // ⭐ NEW
    // ... all other fields
  },
});

// Create onboarding history entry ⭐ NEW
await prisma.userOnboarding.create({
  data: {
    userId: req.user.userId,
    gender,
    age,
    height, // ⭐ NEW
    // ... all other fields
  },
});
```

**GET /api/auth/profile** - Now returns:

- ✅ `height` field included in response

### 4. Database Migration

**Migration**: `20251017093151_add_height_and_onboarding_history`

Applied changes:

- ✅ Added `height` column to `User` table
- ✅ Created `UserOnboarding` table
- ✅ Added foreign key relation
- ✅ Added indexes for performance

## Testing Instructions

### 1. Start Both Servers

**Terminal 1 - Backend**:

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**:

```bash
cd client
npm run dev
```

**Terminal 3 - Prisma Studio** (to monitor database):

```bash
cd server
npm run prisma:studio
```

Then open: http://localhost:5555

### 2. Complete Onboarding Flow

1. Go to http://localhost:5173
2. Click "Continue with Google"
3. Sign in with your Google account
4. Complete all 8 onboarding steps:
   - Gender: Male/Female
   - Age: Enter your age
   - Goal: Weight Loss/Improved Health/Weight Gain
   - **Height: Enter height (e.g., 170 cm)** ⭐
   - Weight: Current + Target weight
   - Timeline: Target date
   - Activity Level: Select activity
   - Final Plan: Review and click "Start Tracking"

### 3. Verify in Prisma Studio

Open http://localhost:5555 and check:

#### User Table

- ✅ `profileCompleted` should be `true`
- ✅ All fields populated (gender, age, **height**, goal, weights, etc.)
- ✅ Calculated values present (bmr, tdee, dailyCalorieTarget, macros)

#### UserOnboarding Table ⭐ (NEW)

- ✅ One entry created with all onboarding data
- ✅ `completedAt` timestamp
- ✅ Snapshot of all user's onboarding choices

### 4. Test Re-login

1. Logout from the app
2. Sign in again with the same Google account
3. ✅ Should go directly to `/dashboard` (not onboarding)
4. ✅ User data should persist

## Benefits of New Structure

### 1. Onboarding History Tracking

- 📊 Track multiple onboarding journeys per user
- 📈 See how user's goals change over time
- 🔄 Allow users to restart/update their fitness journey
- 📝 Keep historical records of past goals and metrics

### 2. Accurate BMR Calculation

- 🎯 Uses actual height instead of estimated values
- 📐 Mifflin-St Jeor equation requires height for accuracy:
  - **Males**: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
  - **Females**: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161

### 3. Data Persistence

- 💾 All onboarding data now saved to database
- 🔄 Users don't have to re-enter information on login
- 📱 Works across devices

## API Endpoints Updated

### POST /api/auth/onboarding

**Request Body**:

```json
{
  "gender": "male",
  "age": 25,
  "height": 175, // ⭐ NEW
  "goal": "weight_loss",
  "currentWeight": 80,
  "targetWeight": 75,
  "targetDate": "2025-12-31",
  "activityLevel": "moderate",
  "activityMultiplier": 1.55,
  "bmr": 1750,
  "tdee": 2713,
  "dailyCalorieTarget": 2213,
  "targetWeightChangeRate": 0.5,
  "proteinTarget": 166,
  "carbsTarget": 249,
  "fatsTarget": 61
}
```

**Response**:

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "profileCompleted": true,
  "gender": "male",
  "age": 25,
  "height": 175, // ⭐ NEW
  "goal": "weight_loss",
  "currentWeight": 80,
  "targetWeight": 75,
  "dailyCalorieTarget": 2213,
  "proteinTarget": 166,
  "carbsTarget": 249,
  "fatsTarget": 61
}
```

## Files Modified

### Frontend

- ✅ `client/src/pages/onboarding/HeightPage.jsx` (NEW)
- ✅ `client/src/pages/onboarding/FinalPlanPage.jsx` (FIXED)
- ✅ `client/src/pages/onboarding/GenderPage.jsx`
- ✅ `client/src/pages/onboarding/AgePage.jsx`
- ✅ `client/src/pages/onboarding/GoalPage.jsx`
- ✅ `client/src/pages/onboarding/WeightPage.jsx`
- ✅ `client/src/pages/onboarding/TimelinePage.jsx`
- ✅ `client/src/pages/onboarding/ActivityLevelPage.jsx`
- ✅ `client/src/stores/useUserStore.js`
- ✅ `client/src/App.jsx`

### Backend

- ✅ `server/prisma/schema.prisma`
- ✅ `server/src/routes/auth.js`
- ✅ `server/prisma/migrations/20251017093151_add_height_and_onboarding_history/`

## Summary

✅ **Height page added** - 8-step onboarding flow
✅ **Onboarding data saves to database** - No more TODO!
✅ **UserOnboarding history table** - Track multiple journeys
✅ **Accurate BMR calculations** - Uses real height data
✅ **Profile persistence** - No re-onboarding on login
✅ **Error handling** - User-friendly error messages
✅ **Loading states** - "Saving..." feedback

## Next Steps

1. ✅ Test complete onboarding flow with real Google account
2. ✅ Verify data appears in Prisma Studio
3. ✅ Test logout/login persistence
4. 📱 Implement food logging UI
5. 🤖 Add OpenAI API key for food parsing
6. 📊 Build analytics/progress tracking using UserOnboarding history
