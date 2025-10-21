import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  createOrder,
  createCustomer,
  createSubscription,
  createOrGetPlan,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPayment,
  fetchSubscription,
  SUBSCRIPTION_PLANS,
} from '../services/razorpay.js';

const router = express.Router();

/**
 * Get subscription plans
 * GET /api/payment/plans
 */
router.get('/plans', (req, res) => {
  try {
    const plans = {
      monthly: {
        id: 'monthly',
        name: SUBSCRIPTION_PLANS.monthly.name,
        amount: SUBSCRIPTION_PLANS.monthly.amount / 100, // Convert paise to rupees
        period: 'month',
        description: SUBSCRIPTION_PLANS.monthly.description,
        savings: null,
      },
      annual: {
        id: 'annual',
        name: SUBSCRIPTION_PLANS.annual.name,
        amount: SUBSCRIPTION_PLANS.annual.amount / 100, // Convert paise to rupees
        period: 'year',
        description: SUBSCRIPTION_PLANS.annual.description,
        savings: 867, // ₹2364 - ₹1497
        discount: 37,
      },
    };

    res.json({ success: true, plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

/**
 * Create a new subscription (recurring payment)
 * POST /api/payment/create-order
 */
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // JWT stores it as userId
    const { plan } = req.body; // 'monthly' or 'annual'

    // Validate plan
    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        razorpayCustomerId: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active') {
      return res.status(400).json({
        error: 'You already have an active subscription',
      });
    }

    // Create or get Razorpay customer
    let customerId = user.razorpayCustomerId;
    if (!customerId) {
      const customer = await createCustomer({
        name: user.name || user.email.split('@')[0],
        email: user.email,
        contact: user.phone || '', // Add phone if available
        notes: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Update user with customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { razorpayCustomerId: customerId },
      });
    }

    // Create or get the Razorpay plan
    const razorpayPlan = await createOrGetPlan(plan);

    // Create subscription in Razorpay
    const subscription = await createSubscription({
      planId: razorpayPlan.id,
      customerId: customerId,
      totalCount: plan === 'monthly' ? 120 : 10, // 120 months or 10 years
      notes: {
        userId,
        plan,
        app: 'trackall.food',
      },
    });

    // Save initial payment record to database
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: SUBSCRIPTION_PLANS[plan].amount / 100, // Store in rupees
        currency: 'INR',
        status: 'created',
        orderType: 'subscription',
        plan,
        description: SUBSCRIPTION_PLANS[plan].description,
        razorpayOrderId: subscription.id, // Using subscription ID as order ID
        receipt: `sub_${
          subscription.short_url?.split('/').pop() || Date.now()
        }`,
        notes: {
          customerId,
          subscriptionId: subscription.id,
        },
      },
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        short_url: subscription.short_url,
      },
      amount: SUBSCRIPTION_PLANS[plan].amount,
      currency: 'INR',
      plan: plan,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      error: 'Failed to create subscription',
      details: error.message,
    });
  }
});

/**
 * Verify payment and activate subscription
 * POST /api/payment/verify
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // For subscriptions, verify using subscription_id + payment_id
    const crypto = await import('crypto');
    const generatedSignature = crypto.default
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }

    // Fetch subscription details from Razorpay
    const razorpaySubscription = await fetchSubscription(
      razorpay_subscription_id
    );

    // Fetch payment details
    const razorpayPayment = await fetchPayment(razorpay_payment_id);

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId: razorpay_subscription_id,
        userId: userId,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment record not found',
      });
    }

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'captured',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        method: razorpayPayment.method,
      },
    });

    // Calculate subscription dates based on Razorpay subscription
    const startDate = new Date(razorpaySubscription.start_at * 1000);
    const currentPeriodEnd = new Date(razorpaySubscription.current_end * 1000);
    const plan = payment.plan;

    let nextBillingDate = new Date(currentPeriodEnd);

    // Create subscription record in database
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'active',
        amount: payment.amount,
        currency: payment.currency,
        razorpaySubscriptionId: razorpay_subscription_id,
        razorpayPlanId: razorpaySubscription.plan_id,
        razorpayCustomerId: razorpaySubscription.customer_id,
        startDate: startDate,
        endDate: nextBillingDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: currentPeriodEnd,
        nextBillingDate: nextBillingDate,
      },
    });

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        subscriptionStart: startDate,
        subscriptionEnd: nextBillingDate,
      },
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        endDate: subscription.endDate,
        nextBillingDate: subscription.nextBillingDate,
        recurring: true,
      },
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify subscription',
      details: error.message,
    });
  }
});

/**
 * Get user's subscription status
 * GET /api/payment/subscription
 */
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // JWT stores it as userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        freeLogs: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get active subscription details
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Count food entries
    const foodEntriesCount = await prisma.foodEntry.count({
      where: { userId },
    });

    res.json({
      success: true,
      subscription: {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        startDate: user.subscriptionStart,
        endDate: user.subscriptionEnd,
        freeLogs: user.freeLogs,
        totalLogs: foodEntriesCount,
        canLog: user.subscriptionStatus === 'active' || user.freeLogs > 0,
        details: subscription,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

/**
 * Get payment history
 * GET /api/payment/history
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // JWT stores it as userId

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        orderType: true,
        plan: true,
        description: true,
        createdAt: true,
        receipt: true,
      },
    });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

/**
 * Cancel subscription
 * POST /api/payment/cancel
 */
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // JWT stores it as userId
    const { reason, immediate } = req.body;

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return res.status(404).json({
        error: 'No active subscription found',
      });
    }

    // Cancel on Razorpay (will cancel at cycle end by default)
    try {
      const { cancelSubscription: cancelRazorpaySubscription } = await import(
        '../services/razorpay.js'
      );
      await cancelRazorpaySubscription(
        subscription.razorpaySubscriptionId,
        !immediate // cancelAtCycleEnd
      );
    } catch (razorpayError) {
      console.error('Razorpay cancellation error:', razorpayError);
      // Continue with local cancellation even if Razorpay fails
    }

    // Update subscription status to cancelled
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason || 'User requested cancellation',
      },
    });

    // Update user status (keep active until end date)
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'cancelled',
      },
    });

    res.json({
      success: true,
      message: immediate
        ? 'Subscription cancelled immediately.'
        : 'Subscription cancelled. You can continue using Pro features until the end of your billing period.',
      endDate: subscription.endDate,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * Reactivate cancelled subscription
 * POST /api/payment/reactivate
 */
router.post('/reactivate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get cancelled subscription that hasn't expired yet
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'cancelled',
        endDate: {
          gte: new Date(), // End date is in the future
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return res.status(404).json({
        error:
          'No cancelled subscription found or subscription has already expired',
      });
    }

    // Reactivate subscription in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        cancelledAt: null,
        cancelReason: null,
      },
    });

    // Update user status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'active',
      },
    });

    res.json({
      success: true,
      message: 'Subscription reactivated successfully!',
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: 'active',
        endDate: subscription.endDate,
        nextBillingDate: subscription.nextBillingDate,
      },
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

/**
 * Razorpay webhook handler
 * POST /api/payment/webhook
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const webhookSignature = req.headers['x-razorpay-signature'];
      const webhookBody = req.body;

      // Verify webhook signature
      const isValid = verifyWebhookSignature(
        JSON.stringify(webhookBody),
        webhookSignature
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const event = webhookBody.event;
      const payload = webhookBody.payload;

      console.log(`Received webhook: ${event}`);

      // Handle different webhook events
      switch (event) {
        case 'payment.captured':
          // Payment was successful
          await handlePaymentCaptured(payload);
          break;

        case 'payment.failed':
          // Payment failed
          await handlePaymentFailed(payload);
          break;

        case 'subscription.charged':
          // Subscription renewal payment successful
          await handleSubscriptionCharged(payload);
          break;

        case 'subscription.cancelled':
          // Subscription was cancelled
          await handleSubscriptionCancelled(payload);
          break;

        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// Webhook event handlers
async function handlePaymentCaptured(payload) {
  const payment = payload.payment.entity;
  console.log('Payment captured:', payment.id);
  // Additional logic if needed
}

async function handlePaymentFailed(payload) {
  const payment = payload.payment.entity;
  console.log('Payment failed:', payment.id);

  // Update payment record
  await prisma.payment.updateMany({
    where: { razorpayPaymentId: payment.id },
    data: {
      status: 'failed',
      errorCode: payment.error_code,
      errorDescription: payment.error_description,
    },
  });
}

async function handleSubscriptionCharged(payload) {
  const payment = payload.payment.entity;
  const subscription = payload.subscription.entity;

  console.log('Subscription charged:', subscription.id, 'Payment:', payment.id);

  try {
    // Find the subscription record
    const dbSubscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: subscription.id },
    });

    if (dbSubscription) {
      // Update subscription period dates
      const currentPeriodEnd = new Date(subscription.current_end * 1000);
      const currentPeriodStart = new Date(subscription.current_start * 1000);

      let nextBillingDate = new Date(currentPeriodEnd);
      if (dbSubscription.plan === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          currentPeriodStart,
          currentPeriodEnd,
          nextBillingDate,
          endDate: nextBillingDate,
        },
      });

      // Update user subscription end date
      await prisma.user.update({
        where: { id: dbSubscription.userId },
        data: {
          subscriptionEnd: nextBillingDate,
        },
      });

      // Create a payment record for the renewal
      await prisma.payment.create({
        data: {
          userId: dbSubscription.userId,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: 'captured',
          method: payment.method,
          orderType: 'subscription',
          plan: dbSubscription.plan,
          description: `Subscription renewal - ${dbSubscription.plan}`,
          razorpayOrderId: subscription.id,
          razorpayPaymentId: payment.id,
          receipt: payment.id,
          notes: {
            type: 'renewal',
            subscriptionId: subscription.id,
          },
        },
      });

      console.log('Subscription renewed successfully');
    }
  } catch (error) {
    console.error('Error handling subscription renewal:', error);
  }
}

async function handleSubscriptionCancelled(payload) {
  const subscription = payload.subscription.entity;
  console.log('Subscription cancelled:', subscription.id);

  try {
    // Update subscription in database
    const updated = await prisma.subscription.updateMany({
      where: { razorpaySubscriptionId: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    if (updated.count > 0) {
      // Find the subscription to get userId
      const dbSubscription = await prisma.subscription.findFirst({
        where: { razorpaySubscriptionId: subscription.id },
      });

      if (dbSubscription) {
        // Update user status
        await prisma.user.update({
          where: { id: dbSubscription.userId },
          data: {
            subscriptionStatus: 'cancelled',
          },
        });
      }
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

export default router;
