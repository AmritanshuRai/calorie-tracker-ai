/**
 * Rate Limiting Middleware for Picture Routes
 *
 * Installation:
 * npm install express-rate-limit
 *
 * Add this to your routes/daily-log.js
 */

import rateLimit from 'express-rate-limit';

// Rate limiter for picture uploads
export const uploadPictureRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 uploads per windowMs
  message: 'Too many uploads from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
});

// Rate limiter for viewing pictures
export const viewPictureRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 views per minute
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for deleting pictures
export const deletePictureRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 deletes per windowMs
  message: 'Too many delete requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * USAGE in routes/daily-log.js:
 *
 * import { uploadPictureRateLimiter, viewPictureRateLimiter, deletePictureRateLimiter } from '../middleware/rateLimiter.js';
 *
 * // Upload picture
 * router.post('/picture', authenticateToken, uploadPictureRateLimiter, upload.single('picture'), async (req, res) => {
 *   // ... existing code
 * });
 *
 * // View picture
 * router.get('/:date/picture', authenticateToken, viewPictureRateLimiter, async (req, res) => {
 *   // ... existing code
 * });
 *
 * // Delete picture
 * router.delete('/picture/:date', authenticateToken, deletePictureRateLimiter, async (req, res) => {
 *   // ... existing code
 * });
 */
