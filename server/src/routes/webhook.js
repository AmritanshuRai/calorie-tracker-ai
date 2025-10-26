import express from 'express';
import { Webhook } from 'standardwebhooks';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Initialize webhook verifier
const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
const webhook = new Webhook(webhookSecret);

/**
 * Dodo Payments Webhook Handler
 * Receives and processes webhook events from Dodo Payments
 */
router.post(
  '/dodo-payments',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('📨 Received webhook from Dodo Payments');

    try {
      // Extract headers
      const webhookHeaders = {
        'webhook-id': req.headers['webhook-id'] || '',
        'webhook-signature': req.headers['webhook-signature'] || '',
        'webhook-timestamp': req.headers['webhook-timestamp'] || '',
      };

      console.log('Webhook Headers:', webhookHeaders);

      // Get raw body
      const rawBody = req.body.toString('utf8');

      // Verify webhook signature
      let verifiedPayload;
      try {
        verifiedPayload = await webhook.verify(rawBody, webhookHeaders);
        console.log('✅ Webhook signature verified');
      } catch (error) {
        console.error(
          '❌ Webhook signature verification failed:',
          error.message
        );
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }

      const payload = JSON.parse(rawBody);
      const { business_id, type: eventType, timestamp, data } = payload;

      console.log('Event Type:', eventType);
      console.log('Business ID:', business_id);

      // Store webhook event in database for tracking
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          webhookId: webhookHeaders['webhook-id'],
          eventType,
          businessId: business_id,
          payload,
          webhookTimestamp: new Date(timestamp),
        },
      });

      console.log('📝 Webhook event stored:', webhookEvent.id);

      // Process webhook based on event type
      try {
        await processWebhookEvent(eventType, data, webhookEvent.id);

        // Mark as processed
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processed: true,
            processedAt: new Date(),
          },
        });

        console.log('✅ Webhook processed successfully');
      } catch (processingError) {
        console.error('❌ Error processing webhook:', processingError);

        // Store error in webhook event
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processingError: processingError.message,
            retryCount: { increment: 1 },
          },
        });

        // Return 200 to prevent Dodo from retrying (we'll handle retries internally)
        return res.status(200).json({
          received: true,
          error: 'Processing error, will retry',
        });
      }

      // Return 200 to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('❌ Webhook handler error:', error);
      res.status(400).json({ error: 'Webhook handler failed' });
    }
  }
);

/**
 * Process webhook event based on type
 */
async function processWebhookEvent(eventType, data, webhookEventId) {
  console.log(`🔄 Processing event: ${eventType}`);

  switch (eventType) {
    // Payment Events
    case 'payment.succeeded':
      await handlePaymentSucceeded(data);
      break;
    case 'payment.failed':
      await handlePaymentFailed(data);
      break;
    case 'payment.processing':
      await handlePaymentProcessing(data);
      break;
    case 'payment.cancelled':
      await handlePaymentCancelled(data);
      break;

    // Subscription Events
    case 'subscription.active':
      await handleSubscriptionActive(data);
      break;
    case 'subscription.on_hold':
      await handleSubscriptionOnHold(data);
      break;
    case 'subscription.renewed':
      await handleSubscriptionRenewed(data);
      break;
    case 'subscription.plan_changed':
      await handleSubscriptionPlanChanged(data);
      break;
    case 'subscription.cancelled':
      await handleSubscriptionCancelled(data);
      break;
    case 'subscription.failed':
      await handleSubscriptionFailed(data);
      break;
    case 'subscription.expired':
      await handleSubscriptionExpired(data);
      break;

    // Refund Events
    case 'refund.succeeded':
      await handleRefundSucceeded(data);
      break;
    case 'refund.failed':
      await handleRefundFailed(data);
      break;

    default:
      console.log(`⚠️ Unhandled event type: ${eventType}`);
  }
}

// ============================================
// PAYMENT EVENT HANDLERS
// ============================================

async function handlePaymentSucceeded(data) {
  console.log('💰 Payment succeeded:', data.payment_id);

  const {
    payment_id,
    customer,
    total_amount,
    currency,
    status,
    payment_method,
    payment_method_type,
    card_last_four,
    card_network,
    card_type,
    card_issuing_country,
    subscription_id,
    product_cart,
    tax,
    settlement_amount,
    settlement_currency,
    settlement_tax,
    checkout_session_id,
    billing,
    metadata,
  } = data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: customer.email },
  });

  if (!user) {
    throw new Error(`User not found for email: ${customer.email}`);
  }

  // Determine order type and plan
  let orderType = 'one-time';
  let plan = null;

  if (subscription_id) {
    orderType = 'subscription';

    // Fetch the subscription from our database to get the correct plan
    // The subscription.active webhook is processed before payment.succeeded
    const existingSubscription = await prisma.subscription.findUnique({
      where: { dodoSubscriptionId: subscription_id },
    });

    if (existingSubscription) {
      plan = existingSubscription.plan;
    } else {
      // Fallback: if subscription not found yet, default to monthly
      // This shouldn't happen as subscription.active is processed first
      console.warn('⚠️ Subscription not found in DB, defaulting to monthly');
      plan = 'monthly';
    }
  }

  // Create or update payment record
  await prisma.payment.upsert({
    where: { dodoPaymentId: payment_id },
    update: {
      status,
      totalAmount: total_amount,
      taxAmount: tax,
      settlementAmount: settlement_amount,
      settlementCurrency: settlement_currency,
      settlementTax: settlement_tax,
      method: payment_method,
      cardLastFour: card_last_four,
      cardNetwork: card_network,
      cardType: card_type,
      cardIssuingCountry: card_issuing_country,
      billingAddress: billing,
      metadata,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      dodoPaymentId: payment_id,
      dodoCustomerId: customer.customer_id,
      dodoSubscriptionId: subscription_id,
      dodoCheckoutSessionId: checkout_session_id,
      amount: total_amount / 100, // Convert cents to dollars
      currency,
      status,
      method: payment_method,
      orderType,
      plan,
      totalAmount: total_amount,
      taxAmount: tax,
      settlementAmount: settlement_amount,
      settlementCurrency: settlement_currency,
      settlementTax: settlement_tax,
      cardLastFour: card_last_four,
      cardNetwork: card_network,
      cardType: card_type,
      cardIssuingCountry: card_issuing_country,
      productCart: product_cart,
      billingAddress: billing,
      metadata,
    },
  });

  console.log('✅ Payment record updated');

  // If one-time payment, grant access immediately
  if (orderType === 'one-time') {
    await grantOneTimeAccess(user.id, product_cart, metadata);
  }
}

async function handlePaymentFailed(data) {
  console.log('❌ Payment failed:', data.payment_id);

  const { payment_id, customer, status, error_code, error_message } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: customer.email },
  });

  if (!user) {
    console.log('⚠️ User not found for failed payment');
    return;
  }

  // Update payment record
  await prisma.payment.upsert({
    where: { dodoPaymentId: payment_id },
    update: {
      status,
      errorCode: error_code,
      errorMessage: error_message,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      dodoPaymentId: payment_id,
      dodoCustomerId: data.customer.customer_id,
      amount: data.total_amount / 100,
      currency: data.currency,
      status,
      method: data.payment_method,
      orderType: data.subscription_id ? 'subscription' : 'one-time',
      errorCode: error_code,
      errorMessage: error_message,
    },
  });

  console.log('✅ Failed payment recorded');
}

async function handlePaymentProcessing(data) {
  console.log('⏳ Payment processing:', data.payment_id);
  // Update payment status to processing
  await handlePaymentFailed(data); // Reuse same logic
}

async function handlePaymentCancelled(data) {
  console.log('🚫 Payment cancelled:', data.payment_id);
  // Update payment status to cancelled
  await handlePaymentFailed(data); // Reuse same logic
}

// ============================================
// SUBSCRIPTION EVENT HANDLERS
// ============================================

async function handleSubscriptionActive(data) {
  console.log('🎉 Subscription activated:', data.subscription_id);

  const {
    subscription_id,
    customer,
    product_id,
    status,
    recurring_pre_tax_amount,
    currency,
    payment_frequency_count,
    payment_frequency_interval,
    subscription_period_count,
    subscription_period_interval,
    trial_period_days,
    next_billing_date,
    previous_billing_date,
    metadata,
  } = data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: customer.email },
  });

  if (!user) {
    throw new Error(`User not found for email: ${customer.email}`);
  }

  // Determine plan from payment_frequency_interval (more reliable than metadata)
  // Year = annual, Month = monthly
  const plan = payment_frequency_interval === 'Year' ? 'annual' : 'monthly';

  // Calculate subscription period
  const startDate = previous_billing_date
    ? new Date(previous_billing_date)
    : new Date();
  const endDate = new Date(next_billing_date);

  // Create or update subscription
  await prisma.subscription.upsert({
    where: { dodoSubscriptionId: subscription_id },
    update: {
      status,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      nextBillingDate: endDate,
      previousBillingDate: previous_billing_date
        ? new Date(previous_billing_date)
        : null,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      dodoSubscriptionId: subscription_id,
      dodoCustomerId: customer.customer_id,
      dodoProductId: product_id,
      plan,
      status,
      amount: recurring_pre_tax_amount / 100,
      currency,
      startDate,
      endDate,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      nextBillingDate: endDate,
      previousBillingDate: previous_billing_date
        ? new Date(previous_billing_date)
        : null,
      paymentFrequencyCount: payment_frequency_count,
      paymentFrequencyInterval: payment_frequency_interval,
      subscriptionPeriodCount: subscription_period_count,
      subscriptionPeriodInterval: subscription_period_interval,
      trialPeriodDays: trial_period_days,
      metadata,
    },
  });

  // Update user subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
    },
  });

  console.log('✅ Subscription activated for user:', user.email);
}

async function handleSubscriptionOnHold(data) {
  console.log('⏸️ Subscription on hold:', data.subscription_id);

  await updateSubscriptionStatus(
    data.subscription_id,
    data.customer.email,
    'on_hold'
  );
}

async function handleSubscriptionRenewed(data) {
  console.log('🔄 Subscription renewed:', data.subscription_id);

  await handleSubscriptionActive(data); // Reuse activation logic
}

async function handleSubscriptionPlanChanged(data) {
  console.log('🔄 Subscription plan changed:', data.subscription_id);

  await handleSubscriptionActive(data); // Reuse activation logic
}

async function handleSubscriptionCancelled(data) {
  console.log('❌ Subscription cancelled:', data.subscription_id);

  const { subscription_id, customer, cancelled_at } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: customer.email },
  });

  if (!user) {
    console.log('⚠️ User not found for cancelled subscription');
    return;
  }

  // Update subscription
  await prisma.subscription.update({
    where: { dodoSubscriptionId: subscription_id },
    data: {
      status: 'cancelled',
      cancelledAt: cancelled_at ? new Date(cancelled_at) : new Date(),
      updatedAt: new Date(),
    },
  });

  // Update user status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'cancelled',
    },
  });

  console.log('✅ Subscription cancelled');
}

async function handleSubscriptionFailed(data) {
  console.log('❌ Subscription failed:', data.subscription_id);

  await updateSubscriptionStatus(
    data.subscription_id,
    data.customer.email,
    'failed'
  );
}

async function handleSubscriptionExpired(data) {
  console.log('⏰ Subscription expired:', data.subscription_id);

  await updateSubscriptionStatus(
    data.subscription_id,
    data.customer.email,
    'expired'
  );
}

// ============================================
// REFUND EVENT HANDLERS
// ============================================

async function handleRefundSucceeded(data) {
  console.log('💸 Refund succeeded for payment:', data.payment_id);

  // Update payment with refund information
  await prisma.payment.update({
    where: { dodoPaymentId: data.payment_id },
    data: {
      refundedAmount: data.refund_amount / 100,
      refundedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Refund recorded');
}

async function handleRefundFailed(data) {
  console.log('❌ Refund failed for payment:', data.payment_id);
  // Log the failure but don't update payment record
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function updateSubscriptionStatus(subscriptionId, customerEmail, status) {
  const user = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!user) {
    console.log('⚠️ User not found');
    return;
  }

  await prisma.subscription.update({
    where: { dodoSubscriptionId: subscriptionId },
    data: {
      status,
      updatedAt: new Date(),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: status,
    },
  });
}

async function grantOneTimeAccess(userId, productCart, metadata) {
  console.log('🎁 Granting one-time access to user:', userId);

  // Determine access duration from metadata
  const plan = metadata?.plan || '30D';
  const daysAccess = plan === '365D' ? 365 : 30;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAccess);

  // Update user status
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'active',
      subscriptionPlan: plan === '365D' ? 'annual' : 'monthly',
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
    },
  });

  console.log(`✅ Granted ${daysAccess} days access`);
}

export default router;
