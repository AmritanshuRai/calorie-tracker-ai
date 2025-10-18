import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        error: 'Admin access required. Contact administrator for access.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};
