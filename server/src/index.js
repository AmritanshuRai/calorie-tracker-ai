import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import exerciseRoutes from './routes/exercise.js';
import userRoutes from './routes/user.js';
import openaiLogsRoutes from './routes/openai-logs.js';
import adminRoutes from './routes/admin.js';
import usageRoutes from './routes/usage.js';
import paymentRoutes from './routes/payment.js';
import webhookRoutes from './routes/webhook.js';
import dailyLogRoutes from './routes/daily-log.js';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - Required for Railway/Heroku/etc. (behind reverse proxy)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging

// CORS configuration with multiple allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost',
  'https://calorie-tracker-ai-delta.vercel.app',
  'https://calorie-tracker-ai-production.up.railway.app',
  'https://www.trackall.food',
  'https://trackall.food',
  'https://api.trackall.food',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Webhook routes FIRST (before express.json for raw body)
app.use('/api/webhook', webhookRoutes);

// Then add JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // 2 minutes - cleanup expired sessions
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/user', userRoutes);
app.use('/api/openai-logs', openaiLogsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/daily-log', dailyLogRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`
  );

  // Log Dodo Payments configuration
  console.log('\n=== Dodo Payments Configuration ===');
  console.log(
    'DODO_PAYMENTS_ENVIRONMENT:',
    process.env.DODO_PAYMENTS_ENVIRONMENT || 'NOT SET'
  );
  console.log(
    'DODO_PAYMENTS_API_KEY exists:',
    !!process.env.DODO_PAYMENTS_API_KEY
  );
  console.log(
    'DODO_PAYMENTS_API_KEY length:',
    process.env.DODO_PAYMENTS_API_KEY?.length || 0
  );
  if (process.env.DODO_PAYMENTS_API_KEY) {
    console.log(
      'DODO_PAYMENTS_API_KEY prefix:',
      process.env.DODO_PAYMENTS_API_KEY
    );
  }
  console.log(
    'DODO_PAYMENTS_WEBHOOK_SECRET exists:',
    !!process.env.DODO_PAYMENTS_WEBHOOK_SECRET
  );
  console.log(
    'DODO_PAYMENTS_WEBHOOK_SECRET length:',
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET?.length || 0
  );

  const DODO_API_URL =
    process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode'
      ? 'https://test.dodopayments.com'
      : 'https://live.dodopayments.com';
  console.log('DODO_API_URL:', DODO_API_URL);
  console.log('====================================\n');
});

export default app;
