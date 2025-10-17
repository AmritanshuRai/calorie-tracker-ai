# 🍎 AI Calorie Tracker - Technology Stack & Roadmap

## 📋 Project Overview

AI-powered PWA calorie tracker with natural language input, voice recognition, image analysis, and nutrition label scanning.

---

## 🛠️ Technology Stack

### **Frontend (Client)**

```
Framework & Build
├── React 18 with JavaScript
├── Vite (build tool)
└── PWA: Vite PWA Plugin (Workbox)

UI & Styling
├── Tailwind CSS
├── shadcn/ui components
├── Recharts (data visualization)
└── Framer Motion (animations)

State Management
└── Zustand

Forms & Validation
├── React Hook Form
└── Zod

Features
├── Camera: react-webcam
├── Barcode Scanner: html5-qrcode
├── Voice Input: Web Speech API (built-in browser)
└── HTTP Client: Axios

Utilities
└── date-fns (date handling)
```

### **Backend (Server)**

```
Runtime & Framework
├── Node.js (v20+)
├── JavaScript (ES6+)
└── Express.js

Database
├── PostgreSQL
└── Prisma ORM

Authentication
├── Google OAuth 2.0 (Phase 1 - sign-in only)
└── JWT (JSON Web Tokens)

AI & APIs
├── OpenAI GPT-5 (all AI features - unified model)
│   ├── Text parsing (Phase 1)
│   ├── Image recognition (Phase 2)
│   ├── Voice transcription (Phase 2)
│   └── Nutrition label OCR (Phase 2)
└── FatSecret API (barcode database - free, Phase 2)

Payment Gateway
└── Razorpay (India)

File Storage
├── AWS S3 or Cloudinary
└── Multer (file upload handling)

Security & Performance
├── express-rate-limit
├── helmet (security headers)
├── cors
└── Redis (optional - caching)
```

### **Development Tools**

```
Code Quality
├── ESLint
└── Prettier

Environment
└── dotenv
```

### **Deployment**

```
Frontend
└── Vercel or Netlify

Backend
└── Railway, Render, or AWS EC2

Database
└── Neon (Serverless PostgreSQL)

File Storage
└── AWS S3 or Cloudinary

CDN
└── Cloudflare
```

---

## 🚀 Development Phases

### **Phase 1: MVP (Week 1-2)** ⭐

**Goal:** Basic working app with core functionality

#### Features:

- ✅ **Google Sign-in ONLY** (no email/password)
- ✅ **Text-based food input ONLY** with GPT-5 parsing
- ✅ Basic nutrition display (calories, protein, carbs, fats)
- ✅ Daily food log (breakfast, lunch, dinner, snacks)
- ✅ Simple dashboard with daily totals
- ✅ PWA setup (installable, offline-ready)
- ✅ Responsive UI (mobile-first)

**Note:** Phase 1 focuses ONLY on text input. Voice, images, and barcode scanning come in Phase 2.

#### Tech Focus:

- React + JavaScript + Vite setup
- Express + Neon (PostgreSQL) + Prisma
- **OpenAI GPT-5 integration (text parsing only)**
- Google OAuth 2.0 + JWT
- Basic PWA manifest & service worker
- Framer Motion for smooth animations

#### Deliverables:

- Working prototype
- **User can track meals via text input ONLY**
- GPT-5 parses food text and returns nutrition data
- Data persists in database
- PWA installable on mobile

#### Cost per User (Phase 1):

- Text only: ~$0.144/user/month (90 entries)
- Very affordable for MVP testing

---

### **Phase 2: Enhanced Input Methods (Week 3-4)** 📸🎤

**Goal:** Add voice and image capabilities

#### Features:

- ✅ Voice input integration (GPT-5 audio capabilities)
- ✅ Food photo upload & analysis (GPT-5 vision)
- ✅ Barcode scanner (FatSecret API)
- ✅ Nutrition label OCR (GPT-5 vision)
- ✅ Image storage (AWS S3/Cloudinary)
- ✅ Improved AI parsing accuracy
- ✅ Multiple food items per entry

#### Tech Focus:

- **OpenAI GPT-5 multimodal capabilities** (vision + audio + text)
- html5-qrcode for barcode scanning
- File upload handling (Multer)
- FatSecret API integration
- Audio recording (MediaRecorder API)

#### Deliverables:

- Users can speak their meals (GPT-5 audio)
- Users can upload food photos (GPT-5 vision)
- Barcode scanning works (FatSecret API)
- OCR nutrition labels (GPT-5 vision)

#### Cost per User (Phase 2):

- With all features: ~$0.62/user/month
- Still profitable at ₹249/month pricing

---

### **Phase 3: Premium Features & Monetization (Week 5-6)** 💰

**Goal:** Payment integration and advanced features

#### Features:

- ✅ Razorpay payment integration
- ✅ Free vs Premium tiers
- ✅ Usage limits (free tier)
- ✅ Subscription management
- ✅ Comprehensive nutrition data (vitamins, minerals)
- ✅ Meal history & search
- ✅ Weekly/monthly analytics
- ✅ Progress charts & graphs

#### Tech Focus:

- Razorpay SDK integration
- Subscription logic in database
- Usage tracking middleware
- Data visualization (Recharts)
- PDF generation for reports

#### Deliverables:

- Working payment system
- Free tier with limits
- Premium unlocks all features
- Analytics dashboard

---

### **Phase 4: Advanced Features (Week 7-8)** 📊

**Goal:** User engagement and retention

#### Features:

- ✅ Goal setting (calorie/macro targets)
- ✅ Water intake tracker
- ✅ Meal templates (save frequent meals)
- ✅ Custom food database
- ✅ Export data (PDF/CSV)
- ✅ Dark mode
- ✅ Notifications (daily reminders)
- ✅ Weekly summaries

#### Tech Focus:

- Push notifications (PWA)
- PDF generation (jsPDF)
- CSV export
- Theme switching
- Background sync

#### Deliverables:

- Personalized goals
- Saved meal templates
- Data export functionality
- Dark mode support

---

### **Phase 5: Scale & Optimize (Week 9-10)** ⚡

**Goal:** Performance, reliability, and growth

#### Features:

- ✅ Multi-language support (Hindi, Tamil, etc.)
- ✅ Smart caching strategy
- ✅ Offline mode improvements
- ✅ Performance optimization
- ✅ AI suggestions (meal recommendations)
- ✅ Social features (optional: share progress)
- ✅ Admin dashboard

#### Tech Focus:

- Redis caching layer
- Database query optimization
- Image compression/optimization
- Service worker caching strategies
- i18n internationalization
- Analytics (Mixpanel/Amplitude)

#### Deliverables:

- Multi-language app
- Faster response times
- Better offline experience
- Admin panel for monitoring

---

## 💰 Cost Structure (Per User/Month)

| Feature                | Technology     | Cost        |
| ---------------------- | -------------- | ----------- |
| Text parsing (Phase 1) | GPT-5          | $0.144      |
| Voice input (Phase 2)  | GPT-5 (audio)  | $0.080      |
| Food images (Phase 2)  | GPT-5 (vision) | $0.200      |
| Barcode scan (Phase 2) | FatSecret API  | FREE        |
| Label OCR (Phase 2)    | GPT-5 (vision) | $0.200      |
| **Phase 1 Total**      |                | **~$0.144** |
| **All Features Total** |                | **~$0.62**  |

**Pricing Strategy:**

- Free: Unlimited text entries (Phase 1 only) - **88% profit margin**
- Premium: ₹99/month (~$1.20) - Unlimited all features (Phase 2+) - **48% profit margin**
- Premium: ₹249/month (~$3.00) - Unlimited all features (Phase 2+) - **79% profit margin**

**Note:** Using GPT-5 for everything simplifies development but increases costs slightly. Trade-off: simpler codebase vs higher API costs.

---

## 📦 Project Structure

```
calorie-tracker/
├── client/                 # React PWA
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── utils/         # Helper functions
│   │   ├── services/      # API calls
│   │   └── assets/        # Images, icons
│   ├── public/
│   │   ├── manifest.json  # PWA manifest
│   │   └── sw.js          # Service worker
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, validation
│   │   ├── models/        # Prisma client
│   │   └── utils/         # Helpers
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── package.json
│   └── .env
│
├── docs/                   # Documentation
├── TECH_STACK.md          # This file
└── README.md              # Project overview
```

---

## 🎯 Success Metrics

### **Technical KPIs:**

- ⚡ Page load time: < 2 seconds
- 📱 PWA score: > 90
- 🔒 Security score: A+
- 📊 Uptime: > 99.5%

### **Business KPIs:**

- 👥 User retention: > 40% (30-day)
- 💰 Free → Premium conversion: > 5%
- 📈 DAU/MAU ratio: > 30%
- ⭐ App store rating: > 4.5

---

## 🚀 Getting Started

See individual README files in `client/` and `server/` directories for setup instructions.

---

## 📝 Notes

- Start with Phase 1 MVP to validate the idea
- Collect user feedback before Phase 2
- Monitor API costs closely in early stages
- Consider A/B testing pricing in Phase 3
- Build in public for early adoption

---

**Last Updated:** October 17, 2025
