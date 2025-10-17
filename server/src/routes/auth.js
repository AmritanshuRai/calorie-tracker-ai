import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Sign-in
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
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
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
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
        gender: true,
        age: true,
        goal: true,
        currentWeight: true,
        targetWeight: true,
        targetDate: true,
        activityLevel: true,
        activityMultiplier: true,
        bmr: true,
        tdee: true,
        dailyCalorieTarget: true,
        targetWeightChangeRate: true,
        proteinTarget: true,
        carbsTarget: true,
        fatsTarget: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
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
      goal,
      currentWeight,
      targetWeight,
      targetDate,
      activityLevel,
      activityMultiplier,
      bmr,
      tdee,
      dailyCalorieTarget,
      targetWeightChangeRate,
      proteinTarget,
      carbsTarget,
      fatsTarget,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        profileCompleted: true,
        gender,
        age,
        goal,
        currentWeight,
        targetWeight,
        targetDate: targetDate ? new Date(targetDate) : null,
        activityLevel,
        activityMultiplier,
        bmr,
        tdee,
        dailyCalorieTarget,
        targetWeightChangeRate,
        proteinTarget,
        carbsTarget,
        fatsTarget,
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        profileCompleted: true,
        gender: true,
        age: true,
        goal: true,
        currentWeight: true,
        targetWeight: true,
        dailyCalorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatsTarget: true,
      },
    });

    res.json(user);
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
