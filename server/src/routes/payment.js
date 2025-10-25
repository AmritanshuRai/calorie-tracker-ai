import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

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

    // Prepare billing address if provided
    const billing = billingAddress
      ? {
          city: billingAddress.city || null,
          country: billingAddress.country || 'IN',
          state: billingAddress.state || null,
          street: billingAddress.street || null,
          zipcode: billingAddress.zipcode || null,
        }
      : null;

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
        allow_currency_selection: true,
        allow_discount_code: true,
        allow_phone_number_collection: true,
        allow_tax_id: false,
      },
      metadata: {
        user_id: user.id,
        user_email: user.email,
      },
    };

    // Add billing address if provided
    if (billing) {
      checkoutData.billing_address = billing;
    }

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

export default router;
