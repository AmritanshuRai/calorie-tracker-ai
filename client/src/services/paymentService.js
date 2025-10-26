import api from './api';

export const paymentService = {
  // Fetch products from Dodo Payments
  async getProducts() {
    try {
      const response = await api.get('/payment/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Create checkout session
  async createCheckoutSession(
    productId,
    billingAddress = null,
    customerInfo = null
  ) {
    try {
      const response = await api.post('/payment/create-checkout-session', {
        productId,
        billingAddress,
        customerInfo,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Helper to format price from cents to dollars
  formatPrice(priceInCents, currency = 'USD') {
    const price = priceInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  },

  // Helper to get billing interval text
  getBillingInterval(priceDetail) {
    if (!priceDetail) return 'month';

    if (priceDetail.type === 'recurring_price') {
      const interval = priceDetail.payment_frequency_interval;
      return interval.toLowerCase();
    }

    return 'month';
  },

  // Helper to calculate monthly equivalent for annual plans
  getMonthlyEquivalent(priceInCents, interval) {
    if (interval.toLowerCase() === 'year') {
      return priceInCents / 12;
    }
    return priceInCents;
  },

  // Helper to get currency symbol
  getCurrencySymbol(currencyCode) {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'Fr',
      CNY: '¥',
      KRW: '₩',
      BRL: 'R$',
      MXN: '$',
      SGD: 'S$',
      HKD: 'HK$',
      NZD: 'NZ$',
      SEK: 'kr',
      NOK: 'kr',
      DKK: 'kr',
      PLN: 'zł',
      RUB: '₽',
      ZAR: 'R',
      // Add more as needed
    };
    return symbols[currencyCode] || currencyCode;
  },

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await api.post('/payment/cancel-subscription');
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Reactivate subscription
  async reactivateSubscription() {
    try {
      const response = await api.post('/payment/reactivate-subscription');
      return response.data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  },
};

export default paymentService;
