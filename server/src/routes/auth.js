import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri:
    process.env.GOOGLE_REDIRECT_URI ||
    'http://localhost:3001/api/auth/google/callback',
});

// Initiate Google OAuth flow
router.get('/google', (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
  res.redirect(authUrl);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}?error=no_code`);
    }

    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken(code);

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { email },
          data: { googleId, picture },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            googleId,
            email,
            name,
            picture,
            profileCompleted: false,
          },
        });
      }
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        profileCompleted: user.profileCompleted,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token and user data
    const redirectUrl = user.profileCompleted
      ? `${process.env.CLIENT_URL}?token=${jwtToken}&action=signin`
      : `${process.env.CLIENT_URL}?token=${jwtToken}&action=onboarding`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        profileCompleted: true,
        isAdmin: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        freeLogs: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get latest onboarding data if profile is completed
    let latestOnboarding = null;
    if (user.profileCompleted) {
      latestOnboarding = await prisma.userOnboarding.findFirst({
        where: { userId: req.user.userId },
        orderBy: { completedAt: 'desc' },
      });
    }

    // Get active subscription details if user has one
    let subscriptionDetails = null;
    if (
      user.subscriptionStatus === 'active' ||
      user.subscriptionStatus === 'cancelled'
    ) {
      subscriptionDetails = await prisma.subscription.findFirst({
        where: {
          userId: req.user.userId,
          status: { in: ['active', 'cancelled'] },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          plan: true,
          status: true,
          endDate: true,
          nextBillingDate: true,
        },
      });
    }

    // Determine if user has Pro access
    // User has Pro access if:
    // 1. Subscription is active, OR
    // 2. Subscription is cancelled but still within the valid period (before subscriptionEnd)
    const isPro =
      user.subscriptionStatus === 'active' ||
      (user.subscriptionStatus === 'cancelled' &&
        user.subscriptionEnd &&
        new Date(user.subscriptionEnd) > new Date());

    // Combine user and onboarding data
    res.json({
      ...user,
      subscription: subscriptionDetails,
      isPro,
      ...(latestOnboarding && {
        gender: latestOnboarding.gender,
        age: latestOnboarding.age,
        height: latestOnboarding.height,
        goal: latestOnboarding.goal,
        currentWeight: latestOnboarding.currentWeight,
        targetWeight: latestOnboarding.targetWeight,
        targetDate: latestOnboarding.targetDate,
        activityLevel: latestOnboarding.activityLevel,
        activityMultiplier: latestOnboarding.activityMultiplier,
        dietPreference: latestOnboarding.dietPreference,
        healthConditions: latestOnboarding.healthConditions,
        customHealthConditions: latestOnboarding.customHealthConditions,
        // New health profile data
        pregnancyStatus: latestOnboarding.pregnancyStatus,
        trimester: latestOnboarding.trimester,
        menstrualCycle: latestOnboarding.menstrualCycle,
        smokingStatus: latestOnboarding.smokingStatus,
        cigarettesPerDay: latestOnboarding.cigarettesPerDay,
        alcoholFrequency: latestOnboarding.alcoholFrequency,
        drinksPerOccasion: latestOnboarding.drinksPerOccasion,
        caffeineIntake: latestOnboarding.caffeineIntake,
        sunExposure: latestOnboarding.sunExposure,
        climate: latestOnboarding.climate,
        skinTone: latestOnboarding.skinTone,
        sleepHours: latestOnboarding.sleepHours,
        stressLevel: latestOnboarding.stressLevel,
        waterIntake: latestOnboarding.waterIntake,
        medications: latestOnboarding.medications,
        previousDeficiencies: latestOnboarding.previousDeficiencies,
        exerciseTypes: latestOnboarding.exerciseTypes,
        exerciseIntensity: latestOnboarding.exerciseIntensity,
        // Calculated values
        bmr: latestOnboarding.bmr,
        tdee: latestOnboarding.tdee,
        dailyCalorieTarget: latestOnboarding.dailyCalorieTarget,
        targetWeightChangeRate: latestOnboarding.targetWeightChangeRate,
        proteinTarget: latestOnboarding.proteinTarget,
        carbsTarget: latestOnboarding.carbsTarget,
        fatsTarget: latestOnboarding.fatsTarget,
        // Micronutrient targets
        vitaminATarget: latestOnboarding.vitaminATarget,
        vitaminCTarget: latestOnboarding.vitaminCTarget,
        vitaminDTarget: latestOnboarding.vitaminDTarget,
        vitaminETarget: latestOnboarding.vitaminETarget,
        vitaminKTarget: latestOnboarding.vitaminKTarget,
        vitaminB1Target: latestOnboarding.vitaminB1Target,
        vitaminB2Target: latestOnboarding.vitaminB2Target,
        vitaminB3Target: latestOnboarding.vitaminB3Target,
        vitaminB5Target: latestOnboarding.vitaminB5Target,
        vitaminB6Target: latestOnboarding.vitaminB6Target,
        vitaminB9Target: latestOnboarding.vitaminB9Target,
        vitaminB12Target: latestOnboarding.vitaminB12Target,
        calciumTarget: latestOnboarding.calciumTarget,
        ironTarget: latestOnboarding.ironTarget,
        magnesiumTarget: latestOnboarding.magnesiumTarget,
        phosphorusTarget: latestOnboarding.phosphorusTarget,
        potassiumTarget: latestOnboarding.potassiumTarget,
        sodiumTarget: latestOnboarding.sodiumTarget,
        zincTarget: latestOnboarding.zincTarget,
        seleniumTarget: latestOnboarding.seleniumTarget,
        copperTarget: latestOnboarding.copperTarget,
        manganeseTarget: latestOnboarding.manganeseTarget,
      }),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Complete onboarding
router.post('/onboarding', authenticateToken, async (req, res) => {
  try {
    const {
      gender,
      age,
      height,
      goal,
      currentWeight,
      targetWeight,
      targetDate,
      activityLevel,
      activityMultiplier,
      dietPreference,
      healthConditions,
      customHealthConditions,
      // New health profile data
      pregnancyStatus,
      trimester,
      menstrualCycle,
      smokingStatus,
      cigarettesPerDay,
      alcoholFrequency,
      drinksPerOccasion,
      caffeineIntake,
      sunExposure,
      climate,
      skinTone,
      sleepHours,
      stressLevel,
      waterIntake,
      medications,
      previousDeficiencies,
      exerciseTypes,
      exerciseIntensity,
      // Calculated values
      bmr,
      tdee,
      dailyCalorieTarget,
      targetWeightChangeRate,
      proteinTarget,
      carbsTarget,
      fatsTarget,
      // Micronutrient targets
      vitaminATarget,
      vitaminCTarget,
      vitaminDTarget,
      vitaminETarget,
      vitaminKTarget,
      vitaminB1Target,
      vitaminB2Target,
      vitaminB3Target,
      vitaminB5Target,
      vitaminB6Target,
      vitaminB9Target,
      vitaminB12Target,
      calciumTarget,
      ironTarget,
      magnesiumTarget,
      phosphorusTarget,
      potassiumTarget,
      sodiumTarget,
      zincTarget,
      seleniumTarget,
      copperTarget,
      manganeseTarget,
    } = req.body;

    // Update user profile - only set profileCompleted flag
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        profileCompleted: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        profileCompleted: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    // Create onboarding history entry with all data
    const onboarding = await prisma.userOnboarding.create({
      data: {
        userId: req.user.userId,
        gender,
        age,
        height,
        goal,
        currentWeight,
        targetWeight,
        targetDate: targetDate ? new Date(targetDate) : null,
        activityLevel,
        activityMultiplier,
        dietPreference,
        healthConditions: healthConditions || [],
        customHealthConditions: customHealthConditions || [],
        // New health profile data
        pregnancyStatus,
        trimester,
        menstrualCycle,
        smokingStatus,
        cigarettesPerDay,
        alcoholFrequency,
        drinksPerOccasion,
        caffeineIntake,
        sunExposure,
        climate,
        skinTone,
        sleepHours,
        stressLevel,
        waterIntake,
        medications: medications || [],
        previousDeficiencies: previousDeficiencies || [],
        exerciseTypes: exerciseTypes || [],
        exerciseIntensity,
        // Calculated values
        bmr,
        tdee,
        dailyCalorieTarget,
        targetWeightChangeRate,
        proteinTarget,
        carbsTarget,
        fatsTarget,
        // Micronutrient targets
        vitaminATarget,
        vitaminCTarget,
        vitaminDTarget,
        vitaminETarget,
        vitaminKTarget,
        vitaminB1Target,
        vitaminB2Target,
        vitaminB3Target,
        vitaminB5Target,
        vitaminB6Target,
        vitaminB9Target,
        vitaminB12Target,
        calciumTarget,
        ironTarget,
        magnesiumTarget,
        phosphorusTarget,
        potassiumTarget,
        sodiumTarget,
        zincTarget,
        seleniumTarget,
        copperTarget,
        manganeseTarget,
      },
    });

    // Return combined data
    res.json({
      ...user,
      ...onboarding,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.email;
    delete updates.googleId;
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updates,
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
