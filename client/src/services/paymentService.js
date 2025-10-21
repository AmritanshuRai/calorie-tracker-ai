import api from './api';

/**
 * Get available subscription plans
 */
export const getPlans = async () => {
  const response = await api.get('/payment/plans');
  return response.data;
};

/**
 * Create a Razorpay order for payment
 * @param {string} plan - 'monthly' or 'annual'
 */
export const createOrder = async (plan) => {
  const response = await api.post('/payment/create-order', { plan });
  return response.data;
};

/**
 * Verify payment after successful transaction
 * @param {Object} paymentData - Razorpay payment response
 */
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/payment/verify', paymentData);
  return response.data;
};

/**
 * Get user's subscription status and details
 */
export const getSubscription = async () => {
  const response = await api.get('/payment/subscription');
  return response.data;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async () => {
  const response = await api.get('/payment/history');
  return response.data;
};

/**
 * Cancel active subscription
 * @param {string} reason - Cancellation reason
 * @param {boolean} immediate - Cancel immediately or at end of cycle
 */
export const cancelSubscription = async (reason, immediate = false) => {
  const response = await api.post('/payment/cancel', { reason, immediate });
  return response.data;
};

/**
 * Reactivate cancelled subscription
 */
export const reactivateSubscription = async () => {
  const response = await api.post('/payment/reactivate');
  return response.data;
};

/**
 * Initialize Razorpay checkout for subscriptions
 * @param {Object} options - Razorpay checkout options
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const initializeRazorpayCheckout = (options, onSuccess, onError) => {
  // Load Razorpay script dynamically
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;

  script.onload = () => {
    const razorpayOptions = {
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      name: 'TrackAll.Food',
      description: options.description || 'Pro Subscription',
      subscription_id: options.subscriptionId, // For recurring subscriptions
      image: '/logo.png',
      prefill: {
        name: options.userName,
        email: options.userEmail,
      },
      notes: {
        recurring: 'true',
        plan: options.plan || 'monthly',
      },
      theme: {
        color: '#10b981', // Emerald-500
      },
      modal: {
        ondismiss: () => {
          if (onError) {
            onError(new Error('Payment cancelled by user'));
          }
        },
      },
      handler: function (response) {
        // Payment successful - response contains subscription_id and payment_id
        if (onSuccess) {
          onSuccess(response);
        }
      },
      recurring: true, // Enable recurring payment UI
    };

    const razorpay = new window.Razorpay(razorpayOptions);

    razorpay.on('payment.failed', function (response) {
      if (onError) {
        onError(response.error);
      }
    });

    razorpay.open();
  };

  script.onerror = () => {
    if (onError) {
      onError(new Error('Failed to load Razorpay SDK'));
    }
  };

  document.body.appendChild(script);
};
