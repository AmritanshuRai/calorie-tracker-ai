# 🍎 AI Calorie Tracker - Full Stack PWA

An AI-powered Progressive Web App for tracking calories and nutrition with natural language input, voice recognition, image analysis, and nutrition label scanning.

## 🎉 Phase 1 MVP - COMPLETE! ✨

The frontend is fully implemented with a modern, smooth UI and frictionless onboarding experience.

![Status](https://img.shields.io/badge/Phase%201-Complete-success)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

---

## ✨ What's Built (Phase 1)

### Frontend ✅

- 🎨 **Modern UI** with Tailwind CSS + Framer Motion animations
- 📱 **PWA Support** - Installable, offline-ready
- 🔐 **Google Sign-in** - One-tap authentication (mock, ready for OAuth)
- 📝 **7-Step Onboarding Flow**:
  1. Gender Selection
  2. Age Input
  3. Goal Selection (Weight Loss, Improved Health, Weight Gain)
  4. Current & Target Weight
  5. Timeline with Date Picker
  6. Activity Level with Live BMR/TDEE Calculations
  7. Final Plan with Adjustable Weight Change Rate Slider
- 📊 **Smart Calculations**:
  - BMR using Mifflin-St Jeor equation
  - TDEE based on activity level
  - Personalized calorie targets
  - Automatic macro calculations (30% protein, 45% carbs, 25% fat)
  - Weight change rate validation
- 🏠 **Dashboard**:
  - Full-width swipeable date slider
  - Nutrient overview with circular progress indicators
  - Heart health metrics
  - Controlled consumption tracking
  - Beautiful empty states
  - Bottom navigation (5 tabs)

### Backend 🚧

- Coming in Phase 1.5!

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation & Run

```bash
# Navigate to project
cd calorie-tracker

# Install frontend dependencies
cd client
npm install

# Start development server
npm run dev
```

🎯 **Open** `http://localhost:5173` and experience the smooth onboarding!

---

## 📱 User Experience

### New User Flow

```
Landing Page
    ↓
Google Sign-in (1 tap)
    ↓
7-Step Onboarding (2-3 minutes)
    ↓
Personalized Dashboard
```

### Returning User Flow

```
Landing Page
    ↓
Auto Sign-in
    ↓
Dashboard (skip onboarding)
```

---

## 🧮 Smart Calculations

### BMR (Basal Metabolic Rate)

Uses **Mifflin-St Jeor equation** - the most accurate for modern populations:

**Men:**

```
BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
```

**Women:**

```
BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
```

_Note: Height estimated at 175cm (men) / 162cm (women) for Phase 1_

### TDEE (Total Daily Energy Expenditure)

```
TDEE = BMR × Activity Multiplier
```

**Activity Levels:**
| Level | Multiplier | Description |
|-------|------------|-------------|
| Sedentary | 1.2 | Little or no exercise |
| Lightly Active | 1.375 | Exercise 1-3 days/week |
| Moderately Active | 1.55 | Exercise 3-5 days/week |
| Very Active | 1.725 | Exercise 6-7 days/week |
| Extra Active | 1.9 | Very hard exercise & physical job |

### Daily Calorie Target

```
Weight Loss:      TDEE - (weekly_rate × 7700 ÷ 7)
Weight Gain:      TDEE + (weekly_rate × 7700 ÷ 7)
Improved Health:  TDEE (maintenance)
```

_1 kg of fat ≈ 7700 kcal_

### Macro Distribution

- **Protein**: 30% of daily calories (÷ 4 kcal/g)
- **Carbs**: 45% of daily calories (÷ 4 kcal/g)
- **Fats**: 25% of daily calories (÷ 9 kcal/g)

**Example:**

```
Daily Target: 1,810 kcal

Protein: (1810 × 0.30) ÷ 4 = 136g
Carbs:   (1810 × 0.45) ÷ 4 = 203g
Fats:    (1810 × 0.25) ÷ 9 = 50g
```

---

## 🛠️ Technology Stack

### Frontend

```
Framework & Build
├── React 19 (JavaScript)
├── Vite 7.1
└── PWA: Vite PWA Plugin

UI & Styling
├── Tailwind CSS 4.0
├── Framer Motion (animations)
└── Custom components

State Management
└── Zustand (with persistence)

Routing
└── React Router v6

Forms & Validation
├── React Hook Form
└── Zod

Utilities
├── date-fns (date handling)
└── Axios (API client)
```

### Backend (Planned - Phase 1.5)

```
Runtime & Framework
├── Node.js 20+
├── Express.js
└── JavaScript (ES6+)

Database
├── PostgreSQL
└── Prisma ORM

Authentication
├── Google OAuth 2.0
└── JWT

AI & APIs
├── OpenAI GPT-4 (text parsing)
└── More in Phase 2
```

---

## 📂 Project Structure

```
calorie-tracker/
├── client/                      # React PWA Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── CircularProgress.jsx
│   │   │   └── PageLayout.jsx
│   │   ├── pages/              # Route pages
│   │   │   ├── SignIn.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── onboarding/     # 7 onboarding pages
│   │   ├── stores/             # Zustand state management
│   │   │   └── useUserStore.js
│   │   ├── services/           # API services (ready for backend)
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── foodService.js
│   │   ├── utils/              # Helpers and constants
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx             # Main app with routing
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                      # Express API (Coming soon)
│
├── TECH_STACK.md               # Detailed tech documentation
├── USER_ONBOARDING.md          # Onboarding flow specs
└── README.md                   # This file
```

---

## 🎨 UI/UX Highlights

✨ **Smooth & Premium Feel**

- Framer Motion animations on every interaction
- Responsive gestures and micro-interactions
- Loading states and transitions

📊 **Visual Feedback**

- Progress indicators on each onboarding step
- Live calculation displays
- Validation messages with color-coded severity
- Circular progress for nutrient tracking

📱 **Mobile-First Design**

- Optimized for touch interactions
- Full-width layouts
- Bottom navigation for thumb-friendly access
- Swipeable date slider

🎯 **User-Centric**

- Clear, helpful empty states
- Contextual hints and tooltips
- Educational content (shows BMR, TDEE explanations)
- Flexible controls (adjustable weight change rate)

---

## 🔐 Authentication

Currently using **mock Google Sign-in** for development.

### To Enable Real OAuth:

1. **Get Google Client ID**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **Install OAuth package**

   ```bash
   npm install @react-oauth/google
   ```

3. **Update environment variables**

   ```env
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id
   ```

4. **Update `SignIn.jsx`**
   - Import `GoogleOAuthProvider` and `GoogleLogin`
   - Replace mock implementation with real OAuth flow

---

## 💾 State Management

Using **Zustand** with localStorage persistence:

```javascript
// Persisted data:
- user (profile)
- token (JWT)
- onboardingData (all 7 steps)
- bmr, tdee, dailyCalorieTarget
- targetWeightChangeRate
- macros (protein, carbs, fats)
```

**Benefits:**

- Survives page refreshes
- No Redux boilerplate
- Simple API
- Automatic localStorage sync

---

## 🎯 Roadmap

### ✅ Phase 1 - MVP (Complete!)

- [x] Modern UI with Tailwind + Framer Motion
- [x] 7-step onboarding flow
- [x] Smart BMR/TDEE calculations
- [x] Dashboard with empty states
- [x] PWA setup
- [x] Responsive design

### 🚧 Phase 1.5 - Backend Foundation (Next!)

- [ ] Express server setup
- [ ] PostgreSQL + Prisma
- [ ] Real Google OAuth integration
- [ ] User profile API endpoints
- [ ] JWT authentication
- [ ] OpenAI GPT-4 for text parsing

### 📅 Phase 2 - Enhanced Input Methods

- [ ] Voice input (GPT-4 audio)
- [ ] Food photo upload & analysis (GPT-4 vision)
- [ ] Barcode scanner (FatSecret API)
- [ ] Nutrition label OCR (GPT-4 vision)

### 💰 Phase 3 - Monetization

- [ ] Razorpay payment integration
- [ ] Free vs Premium tiers
- [ ] Usage limits
- [ ] Subscription management

### 📊 Phase 4 - Advanced Features

- [ ] Goal setting & tracking
- [ ] Meal templates
- [ ] Data export (PDF/CSV)
- [ ] Dark mode
- [ ] Push notifications

### ⚡ Phase 5 - Scale & Optimize

- [ ] Multi-language support
- [ ] Redis caching
- [ ] Performance optimization
- [ ] Admin dashboard

---

## 📝 Environment Variables

### Client (`.env`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Server (Coming soon)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/calorie_tracker
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

---

## 💡 Key Features

### ✨ What Makes This Special

1. **Educational Transparency**

   - Shows BMR/TDEE calculations to users
   - Explains activity multipliers
   - Validates weight change rates with feedback

2. **Smart Validation**

   - Warns if weight loss/gain pace is too fast (>1kg/week)
   - Recommends healthy sustainable rates (0.25-0.75 kg/week)
   - Prevents unrealistic goals

3. **Personalization**

   - Adapts to user's goal (loss/gain/maintenance)
   - Calculates precise calorie targets
   - Auto-adjusts macros

4. **Smooth UX**
   - No page reloads
   - Instant feedback
   - Progress saved automatically
   - One-tap actions where possible

---

## 🐛 Known Issues

- ⚠️ ESLint warnings for Framer Motion imports (false positives - motion is used in JSX)
- 🔧 Mock authentication (will be replaced with real OAuth in Phase 1.5)
- 🔌 No backend yet (API calls will fail until server is implemented)

---

## 📖 Documentation

- **[TECH_STACK.md](./TECH_STACK.md)** - Complete technology decisions and architecture
- **[USER_ONBOARDING.md](./USER_ONBOARDING.md)** - Detailed onboarding flow specifications
- **[client/README.md](./client/README.md)** - Frontend-specific documentation

---

## 🤝 Contributing

This is a learning/portfolio project. Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🎓 Learning Resources

Built while learning:

- Modern React patterns (Hooks, Context, Custom Hooks)
- State management with Zustand
- Tailwind CSS best practices
- Framer Motion animations
- PWA development
- Date handling with date-fns
- Form validation patterns

---

## 👨‍💻 Developer

Built with ❤️ as a full-stack learning project

---

**🎉 Phase 1 Complete - Try it now at `http://localhost:5173`**

_Next up: Backend implementation with Express + PostgreSQL + OpenAI GPT-4!_
