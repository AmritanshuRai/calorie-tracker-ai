import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  test: {
    amount: 100, // ₹1 in paise for testing
    period: 'monthly',
    interval: 1,
    name: 'Test Plan - ₹1',
    description: 'Test subscription for live payment testing (₹1)',
    planId: null,
  },
  monthly: {
    amount: 19700, // Amount in paise (₹197)
    period: 'monthly',
    interval: 1,
    name: 'Monthly Pro Plan',
    description: 'TrackAll.Food Pro - Monthly Subscription',
    // Razorpay plan IDs (will be created if not exists)
    planId: null, // Will be set dynamically
  },
  annual: {
    amount: 149700, // Amount in paise (₹1497)
    period: 'yearly',
    interval: 1,
    name: 'Annual Pro Plan',
    description: 'TrackAll.Food Pro - Annual Subscription (Save 37%)',
    // Razorpay plan IDs (will be created if not exists)
    planId: null, // Will be set dynamically
  },
};

/**
 * Create or get Razorpay subscription plan
 * @param {String} planType - 'monthly' or 'annual'
 * @returns {Promise<Object>} Razorpay plan object
 */
export async function createOrGetPlan(planType) {
  try {
    const planConfig = SUBSCRIPTION_PLANS[planType];

    if (!planConfig) {
      throw new Error('Invalid plan type');
    }

    // Try to create the plan (idempotent - Razorpay will return existing if duplicate)
    const planData = {
      period: planConfig.period,
      interval: planConfig.interval,
      item: {
        name: planConfig.name,
        amount: planConfig.amount,
        currency: 'INR',
        description: planConfig.description,
      },
      notes: {
        planType,
        app: 'trackall.food',
      },
    };

    const plan = await razorpay.plans.create(planData);

    // Cache the plan ID
    SUBSCRIPTION_PLANS[planType].planId = plan.id;

    return plan;
  } catch (error) {
    console.error('Error creating/getting plan:', error.error || error);

    // If plan already exists, try to fetch it
    if (error.error?.description?.includes('already exists')) {
      // List plans and find matching one
      const plans = await razorpay.plans.all();
      const matchingPlan = plans.items.find(
        (p) => p.item.name === SUBSCRIPTION_PLANS[planType].name
      );

      if (matchingPlan) {
        SUBSCRIPTION_PLANS[planType].planId = matchingPlan.id;
        return matchingPlan;
      }
    }

    throw error;
  }
}

/**
 * Create a Razorpay order for one-time payment
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Razorpay order object
 */
export async function createOrder(orderData) {
  try {
    const options = {
      amount: orderData.amount, // amount in paise
      currency: orderData.currency || 'INR',
      receipt: orderData.receipt || `rcpt_${Date.now().toString().slice(-8)}`, // Max 40 chars
      notes: orderData.notes || {},
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error.error || error);
    const errorMsg =
      error.error?.description || error.message || 'Unknown error';
    throw new Error(`Failed to create order: ${errorMsg}`);
  }
}

/**
 * Create a Razorpay subscription
 * @param {Object} subscriptionData - Subscription details
 * @returns {Promise<Object>} Razorpay subscription object
 */
export async function createSubscription(subscriptionData) {
  try {
    const { planId, customerId, totalCount, notes } = subscriptionData;

    const options = {
      plan_id: planId,
      customer_id: customerId,
      total_count: totalCount || 12, // Number of billing cycles
      quantity: 1,
      notes: notes || {},
      // notify parameter removed - not supported by Razorpay API
    };

    const subscription = await razorpay.subscriptions.create(options);
    return subscription;
  } catch (error) {
    console.error(
      'Error creating Razorpay subscription:',
      error.error || error
    );
    const errorMsg =
      error.error?.description || error.message || 'Unknown error';
    throw new Error(`Failed to create subscription: ${errorMsg}`);
  }
}

/**
 * Create a Razorpay customer
 * @param {Object} customerData - Customer details
 * @returns {Promise<Object>} Razorpay customer object
 */
export async function createCustomer(customerData) {
  try {
    const options = {
      name: customerData.name,
      email: customerData.email,
      contact: customerData.contact || '',
      notes: customerData.notes || {},
    };

    const customer = await razorpay.customers.create(options);
    return customer;
  } catch (error) {
    console.error('Error creating Razorpay customer:', error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }
}

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentData - Payment verification data
 * @returns {Boolean} True if signature is valid
 */
export function verifyPaymentSignature(paymentData) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      paymentData;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}

/**
 * Verify Razorpay webhook signature
 * @param {String} webhookBody - Raw webhook body
 * @param {String} webhookSignature - Signature from header
 * @returns {Boolean} True if signature is valid
 */
export function verifyWebhookSignature(webhookBody, webhookSignature) {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Fetch payment details
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export async function fetchPayment(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }
}

/**
 * Fetch subscription details
 * @param {String} subscriptionId - Razorpay subscription ID
 * @returns {Promise<Object>} Subscription details
 */
export async function fetchSubscription(subscriptionId) {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }
}

/**
 * Cancel a subscription
 * @param {String} subscriptionId - Razorpay subscription ID
 * @param {Boolean} cancelAtCycleEnd - Cancel at end of billing cycle
 * @returns {Promise<Object>} Updated subscription
 */
export async function cancelSubscription(
  subscriptionId,
  cancelAtCycleEnd = true
) {
  try {
    const subscription = await razorpay.subscriptions.cancel(
      subscriptionId,
      cancelAtCycleEnd
    );
    return subscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
}

/**
 * Create a refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Object} refundData - Refund details
 * @returns {Promise<Object>} Refund object
 */
export async function createRefund(paymentId, refundData) {
  try {
    const options = {
      amount: refundData.amount, // amount in paise
      notes: refundData.notes || {},
      speed: refundData.speed || 'normal', // normal or optimum
    };

    const refund = await razorpay.payments.refund(paymentId, options);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
}

export default razorpay;
