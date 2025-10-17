# 🚀 User Onboarding Journey - AI Calorie Tracker

## 📋 Overview

A simple, 8-step onboarding flow that personalizes the app for each user's goals.

---

## 🎯 Onboarding Goals

1. **Simple & Fast**: 8 screens, one question per screen
2. **Personalized**: Calculate accurate TDEE and calorie targets
3. **Educational**: Show BMR, activity multiplier, and TDEE
4. **Flexible**: Adjustable weight loss/gain rate
5. **One-time Setup**: New users only, returning users go straight to dashboard

---

## 🛤️ Complete Onboarding Flow

### **Flow for New Users:**

Landing Page → Google Sign-in → 7 Setup Pages → Dashboard

### **Flow for Returning Users:**

Landing Page → Google Sign-in → Dashboard (skip setup)

---

## 📱 Screen-by-Screen Breakdown

### **Page 1: Sign Up (Google Only)** 🔐

```
┌─────────────────────────────────────┐
│                                     │
│  🍎 AI Calorie Tracker              │
│                                     │
│  Track your nutrition with AI       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   [G] Continue with Google  │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✓ No credit card required          │
│  ✓ Free to start                    │
│  ✓ Takes less than 2 minutes        │
│                                     │
└─────────────────────────────────────┘
```

**Key Points:**

- **Google Sign-in Only**: Simplest and fastest authentication
- **No Email/Password**: Reduce friction, increase signups
- **Auto-detect**: If user exists, go to dashboard; if new, go to setup

---

### **Page 2: Gender** 🚻

```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  What's your gender?                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      ♂️  Male                │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      ♀️  Female              │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Key Points:**

- **Simple selection**: Two large, tappable buttons
- **No "Other" option**: Keep it simple for BMR calculation
- **Auto-continue**: Tapping a button goes to next page

---

### **Page 3: Age** 🎂

```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  How old are you?                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │         28                  │   │
│  │        years                │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Use number picker or type          │
│                                     │
│  [Continue] →                       │
└─────────────────────────────────────┘
```

**Key Points:**

- **Number input**: Large, easy to tap
- **Age range**: 13-100 years
- **Validation**: Must be a valid number

---

### **Page 4: Main Goal** 🎯

```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  What's your main goal?             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  📉 Weight Loss             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  💪 Improved Health         │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  📈 Weight Gain             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Key Points:**

- **Three options**: Weight Loss, Improved Health, Weight Gain
- **Large buttons**: Easy to tap
- **Auto-continue**: Tapping goes to next page

---

### **Page 5: Target Weight** ⚖️

```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  What's your target weight?         │
│                                     │
│  Current Weight                     │
│  ┌─────────────────────────────┐   │
│  │         75      kg          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Target Weight                      │
│  ┌─────────────────────────────┐   │
│  │         70      kg          │   │
│  └─────────────────────────────┘   │
│                                     │
│  📊 Change needed: -5 kg            │
│                                     │
│  [Continue] →                       │
└─────────────────────────────────────┘
```

**Key Points:**

- **Current weight**: Required field
- **Target weight**: Based on goal (hidden if "Improved Health")
- **Live calculation**: Show difference immediately
- **Unit toggle**: kg/lbs option

---

### **Page 6: Timeline** 📅

```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  When do you want to reach 70kg?    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📅 December 17, 2025       │   │
│  │     Tap to open calendar    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⏱️  Duration: 8 weeks              │
│                                     │
│  💡 Your pace: 0.62 kg/week         │
│     ✅ Healthy & Sustainable        │
│                                     │
│  [Continue] →                       │
└─────────────────────────────────────┘
```

**Key Points:**

- **Calendar picker**: Easy date selection
- **Auto-calculation**: Shows duration and pace
- **Validation**: Warns if pace is too fast (>1kg/week)
- **Hidden for "Improved Health" goal**

---

### **Page 7: Activity Level + Calculations** 💪

```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  What's your activity level?        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○ Sedentary (1.2)           │   │
│  │   Little or no exercise     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ◉ Lightly Active (1.375)    │   │
│  │   Exercise 1-3 days/week    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○ Moderately Active (1.55)  │   │
│  │   Exercise 3-5 days/week    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○ Very Active (1.725)       │   │
│  │   Exercise 6-7 days/week    │   │
│  └─────────────────────────────┘   │
│                                     │
│  📊 Your Calculations:              │
│  BMR: 1,680 kcal                    │
│  Activity Multiplier: 1.375         │
│  TDEE: 2,310 kcal/day               │
│                                     │
│  [Continue] →                       │
└─────────────────────────────────────┘
```

**Key Points:**

- **5 activity levels**: From Sedentary to Very Active
- **Show multipliers**: Educational and transparent
- **Live calculations**: BMR, TDEE update as user selects
- **BMR Formula**: Mifflin-St Jeor equation

---

### **Page 8: Final Plan + Adjustable Slider** 📈

```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  📊 Your Personalized Plan          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ TDEE: 2,310 kcal/day        │   │
│  │ (Maintenance calories)      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Calorie Deficit: -500 kcal  │   │
│  │ Daily Target: 1,810 kcal    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Target Weight Loss Rate:           │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  [──────●────] 0.62 kg/week │   │
│  │  0.25          Recommended  │   │
│  │                        1.0  │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 Drag slider to adjust pace      │
│  ⚠️ >1kg/week not recommended       │
│                                     │
│  Macros (Auto-calculated):          │
│  Protein: 136g • Carbs: 181g        │
│  Fats: 60g                          │
│                                     │
│  [Start Tracking] →                 │
└─────────────────────────────────────┘
```

**Key Features:**

- **Summary**: TDEE, deficit, and target calories
- **Adjustable slider**: 0.25-1.0 kg/week
- **Live updates**: Calories adjust as slider moves
- **Warning**: Red text if >1kg/week
- **Auto macros**: 30% protein, 25% fat, 45% carbs
- **Final CTA**: "Start Tracking" takes to dashboard

---

## 📱 Dashboard (After Onboarding)

### **Dashboard - Empty State** 🏠

```
┌─────────────────────────────────────┐
│  ☀️ Good morning, User!             │
│  [🔔] [Try Free ⭐] [⚙️]            │
├─────────────────────────────────────┤
│  Date Slider (Full Width)           │
│  ┌─────────────────────────────┐   │
│  │ Sun  Mon  Tue  Wed  Thu Fri │   │
│  │  12   13   14   15   16  17 │   │
│  │  ○    ○    ○    ○    ○   ● │   │
│  └─────────────────────────────┘   │
│  ← Swipe to change date →          │
├─────────────────────────────────────┤
│  🍽️ Logged Foods          [→]      │
│  ┌─────────────────────────────┐   │
│  │  [Empty state illustration] │   │
│  │                             │   │
│  │  You haven't logged any     │   │
│  │  foods yet! Start logging   │   │
│  │  by clicking the log button!│   │
│  │                             │   │
│  │  [+ Log Food] →             │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  📊 Nutrient Overview               │
│  ┌─────────────────────────────┐   │
│  │  ⭕ 0/1810 kcal             │   │
│  │     1810kcal left           │   │
│  │                             │   │
│  │  🔵 0/136g  Protein         │   │
│  │     136g left               │   │
│  │                             │   │
│  │  🟡 0/60g   Fat             │   │
│  │     60g left                │   │
│  │                             │   │
│  │  🟢 0/181g  Carbs           │   │
│  │     181g left               │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  ❤️ Heart Health                    │
│  ┌─────────────────────────────┐   │
│  │ 🟠 0/300mg   Cholesterol    │   │
│  │ 🔵 0/1600mg  Omega-3        │   │
│  │ 🟤 0/38g     Fiber          │   │
│  │ 💧 0/3700mL  Water          │   │
│  │ 🧂 0/2300mg  Sodium         │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  🎯 Controlled Consumption          │
│  ┌─────────────────────────────┐   │
│  │ 🍬 0g  Sugar                │   │
│  │ 🧈 0g  Trans Fat            │   │
│  │ ☕ 0mg Caffeine             │   │
│  │ 🍺 0mL Alcohol              │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  💊 Key Vitamins                    │
│  ┌─────────────────────────────┐   │
│  │ 🟡 Vitamin D  🔵 Vitamin B12│   │
│  │ 🟠 Vitamin C  🟢 Vitamin B9 │   │
│  │ All showing 0% progress     │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  ⚡ Vital Minerals                  │
│  ┌─────────────────────────────┐   │
│  │ 🔴 Iron      ⚪ Calcium      │   │
│  │ ⚫ Magnesium 🔵 Zinc         │   │
│  │ All showing 0% progress     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
│                                     │
│  Bottom Navigation:                 │
│  [Dietitian] [Diet] [●Tracker]      │
│  [Logging] [Account]                │
└─────────────────────────────────────┘
```

**Key Elements:**

- **Date slider**: Full-width, swipeable (Sun-Sat)
- **Today selected**: By default
- **Empty state**: Prompts user to log first food
- **All sections**: Show 0% progress
- **Circular progress**: For each nutrient
- **Bottom nav**: 5 tabs, Tracker is active

---

## 🔄 User Flow Logic

### **New User Flow:**

```
1. Open App
2. See Google Sign-in page
3. Sign in with Google
4. Check if user profile exists in DB
5. If NO → Show onboarding (Pages 2-8)
6. If YES → Go directly to Dashboard
```

### **Returning User Flow:**

```
1. Open App
2. Auto-login (JWT token saved)
3. Go directly to Dashboard
4. Skip all onboarding pages
```

---

## 🧮 BMR & TDEE Calculation

### **BMR Formula (Mifflin-St Jeor):**

**For Men:**

```
BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
```

**For Women:**

```
BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
```

**Note:** Since we don't ask for height, use estimated average:

- Men: 175cm
- Women: 162cm

### **TDEE Formula:**

```
TDEE = BMR × Activity Multiplier
```

**Activity Multipliers:**

- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725
- Extra Active: 1.9

### **Calorie Target:**

```
For Weight Loss: TDEE - (deficit based on kg/week goal)
For Weight Gain: TDEE + (surplus based on kg/week goal)
For Improved Health: TDEE (maintenance)
```

**Deficit/Surplus Calculation:**

```
1 kg fat = 7700 kcal
Target kg/week × 7700 ÷ 7 days = daily deficit/surplus
```

**Example:**

- Goal: Lose 0.62 kg/week
- Daily deficit: 0.62 × 7700 ÷ 7 = 682 kcal/day
- TDEE: 2310 kcal
- Target: 2310 - 682 = 1628 kcal/day

---

## 📝 Data Storage

### **User Profile Schema:**

```javascript
{
  id: "google_123456",
  email: "user@example.com",
  name: "John Doe",
  profileCompleted: true,

  // Onboarding data
  gender: "male",
  age: 28,
  goal: "weight_loss", // weight_loss, improved_health, weight_gain
  currentWeight: 75,
  targetWeight: 70,
  targetDate: "2025-12-17",
  activityLevel: "lightly_active",
  activityMultiplier: 1.375,

  // Calculated values
  bmr: 1680,
  tdee: 2310,
  dailyCalorieTarget: 1810,
  targetWeightChangeRate: 0.62, // kg/week

  // Macros (grams)
  proteinTarget: 136,
  carbsTarget: 181,
  fatsTarget: 60,

  createdAt: "2025-10-17T12:47:00Z",
  updatedAt: "2025-10-17T12:47:00Z"
}
```

---

## ✅ Summary

### **8-Step Onboarding:**

1. ✅ Google Sign-in (1 tap)
2. ✅ Gender (1 tap)
3. ✅ Age (type number)
4. ✅ Main Goal (1 tap)
5. ✅ Target Weight (type 2 numbers)
6. ✅ Timeline (pick date)
7. ✅ Activity Level (1 tap, see calculations)
8. ✅ Final Plan (adjust slider, see macros)

### **Total Time:** 2-3 minutes

### **Total Taps:** ~8-10 (minimal friction)

### **Result:** Personalized calorie and macro targets

---

## 🎯 Key Features

✅ **Simple & Clean:**

- One question per screen
- Large, tappable buttons
- Auto-continue where possible
- No skip buttons (must complete)

✅ **Educational:**

- Show BMR calculation live
- Display activity multipliers
- Explain TDEE concept
- Transparent calorie math

✅ **Flexible:**

- Adjustable weight loss/gain rate
- Calendar date picker
- Unit toggles (kg/lbs)
- Live updates as user selects

✅ **Smart Routing:**

- New users → Full onboarding
- Returning users → Dashboard
- Auto-detect via profile check

---

## 🚀 Implementation Checklist

### **Authentication:**

- [ ] Google OAuth integration
- [ ] Check if user profile exists
- [ ] Route to onboarding or dashboard

### **Onboarding Screens (7 pages):**

- [ ] Page 2: Gender selection
- [ ] Page 3: Age input
- [ ] Page 4: Goal selection
- [ ] Page 5: Weight inputs (current + target)
- [ ] Page 6: Date picker (timeline)
- [ ] Page 7: Activity level + live BMR/TDEE display
- [ ] Page 8: Final plan + adjustable slider

### **Calculations:**

- [ ] BMR calculator (Mifflin-St Jeor)
- [ ] TDEE calculator (BMR × multiplier)
- [ ] Calorie target (based on goal + slider)
- [ ] Macro calculator (protein/carbs/fats split)

### **Dashboard:**

- [ ] Full-width date slider
- [ ] Logged Foods section (empty state)
- [ ] Nutrient Overview (4 circular progress)
- [ ] Heart Health (5 metrics)
- [ ] Controlled Consumption (4 items)
- [ ] Key Vitamins (circular progress)
- [ ] Vital Minerals (circular progress)
- [ ] Bottom navigation (5 tabs)

---

**Last Updated:** October 17, 2025
