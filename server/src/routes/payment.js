import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

const DODO_API_URL =
  process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode'
    ? 'https://test.dodopayments.com'
    : 'https://live.dodopayments.com';

// Get products from Dodo Payments
router.get('/products', async (req, res) => {
  try {
    const response = await fetch(`${DODO_API_URL}/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Dodo API error: ${response.status}`);
    }

    const data = await response.json();

    // Find base product (monthly with type: 'base')
    const baseProduct = data.items.find(
      (product) =>
        product.is_recurring &&
        product.metadata?.type === 'base' &&
        product.metadata?.plan === '30D'
    );

    // Filter for recurring products only
    const recurringProducts = data.items.filter(
      (product) =>
        product.is_recurring && product.metadata?.type === 'recurring'
    );

    // Filter for one-time products only
    const oneTimeProducts = data.items.filter(
      (product) =>
        !product.is_recurring && product.metadata?.type === 'one-time'
    );

    // Sort by plan duration (30D first, then 365D)
    const sortedRecurringProducts = recurringProducts.sort((a, b) => {
      const planA = a.metadata?.plan || '';
      const planB = b.metadata?.plan || '';
      return planA.localeCompare(planB);
    });

    const sortedOneTimeProducts = oneTimeProducts.sort((a, b) => {
      const planA = a.metadata?.plan || '';
      const planB = b.metadata?.plan || '';
      return planA.localeCompare(planB);
    });

    res.json({
      success: true,
      products: sortedRecurringProducts,
      oneTimeProducts: sortedOneTimeProducts,
      baseProduct: baseProduct || null,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message,
    });
  }
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { productId, billingAddress, customerInfo } = req.body;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
      });
    }

    // Prepare customer data
    const customer = {
      email: user.email,
      name: user.name || customerInfo?.name,
      phone_number: customerInfo?.phoneNumber || null,
    };

    // Create checkout session
    const checkoutData = {
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: customer,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
      confirm: false, // Let user confirm on Dodo checkout page
      customization: {
        theme: 'system',
        show_order_details: true,
      },
      feature_flags: {
        allow_currency_selection: false, // Force USD only, no currency selection
        allow_discount_code: true,
        allow_phone_number_collection: true,
        allow_tax_id: false,
      },
      metadata: {
        user_id: user.id,
        user_email: user.email,
      },
    };

    const response = await fetch(`${DODO_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Dodo API error: ${response.status}`
      );
    }

    const data = await response.json();

    res.json({
      success: true,
      checkoutUrl: data.checkout_url,
      sessionId: data.session_id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.userId, // JWT token contains userId field
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
      });
    }

    if (!subscription.dodoSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription data',
      });
    }

    // Attempt to set cancel_at_next_billing_date on subscription via Dodo API.
    // Different Dodo API versions expose different endpoints; try PATCH first
    // (more RESTful) and fall back to POST /cancel if PATCH is not supported.
    let apiResponse = null;
    let apiData = null;

    try {
      // PATCH /subscriptions/{id} with cancel_at_period_end (correct field name per docs)
      apiResponse = await fetch(
        `${DODO_API_URL}/subscriptions/${subscription.dodoSubscriptionId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancel_at_period_end: true }),
        }
      );

      if (apiResponse && apiResponse.ok) {
        apiData = await apiResponse.json().catch(() => ({}));
      } else if (apiResponse && apiResponse.status === 404) {
        // Try legacy POST /cancel
        apiResponse = await fetch(
          `${DODO_API_URL}/subscriptions/${subscription.dodoSubscriptionId}/cancel`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cancel_at_period_end: true }),
          }
        );

        if (apiResponse && apiResponse.ok) {
          apiData = await apiResponse.json().catch(() => ({}));
        }
      } else if (apiResponse && !apiResponse.ok) {
        // Try to parse error body for logging
        const errBody = await apiResponse.json().catch(() => ({}));
        console.error('Dodo API error while cancelling:', errBody);
        throw new Error(
          errBody.message || `Dodo API error: ${apiResponse.status}`
        );
      }
    } catch (e) {
      console.error('Dodo API error during cancel attempt:', e.message || e);
      // Do not immediately fail the request for transient API issues; return helpful message
      return res.status(502).json({
        success: false,
        error: 'Failed to request cancellation from payment provider',
        message: e.message || String(e),
      });
    }

    // If apiData is null here, Dodo did not accept any endpoint
    if (!apiData) {
      console.error('Dodo API did not return data for cancellation');
      return res.status(404).json({
        success: false,
        error: 'Subscription cancel endpoint not found on payment provider',
      });
    }

    // Verify that Dodo actually marked the subscription for cancellation
    console.log(
      'Dodo API response for cancellation:',
      JSON.stringify(apiData, null, 2)
    );

    // Check both possible field names since the API might use either
    const isCancelScheduled =
      apiData.cancel_at_next_billing_date === true ||
      apiData.cancel_at_period_end === true;

    if (!isCancelScheduled) {
      console.error('Dodo API did not confirm cancellation scheduling');
      console.error(
        'cancel_at_next_billing_date:',
        apiData.cancel_at_next_billing_date
      );
      console.error('cancel_at_period_end:', apiData.cancel_at_period_end);
      return res.status(500).json({
        success: false,
        error: 'Payment provider did not confirm cancellation',
        message:
          'The subscription was not marked for cancellation by the payment provider',
        debug: {
          cancel_at_next_billing_date: apiData.cancel_at_next_billing_date,
          cancel_at_period_end: apiData.cancel_at_period_end,
        },
      });
    }

    // Update subscription in our database: if provider set cancel_at_next_billing_date
    // mark cancelledAt to the next billing date if present; otherwise set a pending flag.
    const cancelledAt = apiData.next_billing_date
      ? new Date(apiData.next_billing_date)
      : new Date();

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        // Keep status 'active' until provider emits subscription.cancelled webhook.
        cancelledAt,
        updatedAt: new Date(),
      },
    });

    // Update user to indicate cancel requested (keep subscriptionStatus active for now)
    await prisma.user.update({
      where: { id: user.userId }, // JWT token contains userId field
      data: {
        subscriptionStatus: 'active',
      },
    });

    res.json({
      success: true,
      message:
        'Cancellation requested. The subscription will be cancelled at the end of the billing period.',
      subscription: apiData,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
});

// Reactivate subscription
router.post('/reactivate-subscription', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Get user's cancelled subscription (either status=cancelled or has cancelledAt set)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.userId, // JWT token contains userId field
        OR: [{ status: 'cancelled' }, { cancelledAt: { not: null } }],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No cancelled subscription found',
      });
    }

    if (!subscription.dodoSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription data',
      });
    }

    // Check if subscription hasn't expired yet
    if (
      subscription.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Subscription has already expired. Please create a new subscription.',
      });
    }

    // Attempt to reactivate via PATCH (cancel_at_next_billing_date = false) first,
    // then fall back to POST /reactivate if PATCH not supported.
    let apiResponse = null;
    let apiData = null;

    try {
      apiResponse = await fetch(
        `${DODO_API_URL}/subscriptions/${subscription.dodoSubscriptionId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancel_at_next_billing_date: false }),
        }
      );

      if (apiResponse && apiResponse.ok) {
        apiData = await apiResponse.json().catch(() => ({}));
      } else if (apiResponse && apiResponse.status === 404) {
        apiResponse = await fetch(
          `${DODO_API_URL}/subscriptions/${subscription.dodoSubscriptionId}/reactivate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (apiResponse && apiResponse.ok) {
          apiData = await apiResponse.json().catch(() => ({}));
        }
      } else if (apiResponse && !apiResponse.ok) {
        const errBody = await apiResponse.json().catch(() => ({}));
        console.error('Dodo API error while reactivating:', errBody);
        throw new Error(
          errBody.message || `Dodo API error: ${apiResponse.status}`
        );
      }
    } catch (e) {
      console.error(
        'Dodo API error during reactivate attempt:',
        e.message || e
      );
      return res.status(502).json({
        success: false,
        error: 'Failed to request reactivation from payment provider',
        message: e.message || String(e),
      });
    }

    if (!apiData) {
      console.error('Dodo API did not return data for reactivation');
      return res.status(404).json({
        success: false,
        error: 'Subscription reactivate endpoint not found on payment provider',
      });
    }

    // Clear cancelledAt and keep status active.
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelledAt: null,
        updatedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: user.userId }, // JWT token contains userId field
      data: {
        subscriptionStatus: 'active',
      },
    });

    res.json({
      success: true,
      message:
        'Subscription reactivation requested. Subscription will remain active.',
      subscription: apiData,
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate subscription',
      message: error.message,
    });
  }
});

export default router;
