# Razorpay MCP Tools - Quick Reference

## Overview

Your workspace now has Razorpay payment integration configured with both:

1. **Backend API** - Server-side payment processing
2. **Razorpay MCP Server** - Direct Razorpay operations via MCP

---

## Available Razorpay MCP Tools

The Razorpay MCP server (`razorpay-remote`) provides direct access to Razorpay's API through GitHub Copilot. You can ask questions like:

### Payment Operations

```
"Create a payment link for ₹299"
"Check payment status for payment_id xyz"
"Get payment details for payment_xxxxx"
"List recent payments"
```

### Customer Management

```
"Create a new customer with email user@example.com"
"Get customer details for customer_id xyz"
"List all customers"
```

### Order Management

```
"Create an order for ₹1497"
"Check order status for order_xxxxx"
"List recent orders"
```

### Subscription Management

```
"Create a subscription plan"
"List all subscription plans"
"Cancel subscription sub_xxxxx"
```

### Settlement & Refunds

```
"Check settlement status"
"Create a refund for payment_xxxxx"
"List recent refunds"
```

---

## Your Implementation

### Database Models

- **User** - Added subscription fields (status, plan, dates)
- **Subscription** - Track active subscriptions
- **Payment** - Payment history and receipts

### API Endpoints

**Payment Flow:**

1. `POST /api/payment/create-order` - Create Razorpay order
2. Client completes payment via Razorpay Checkout
3. `POST /api/payment/verify` - Verify and activate subscription

**Subscription Management:**

- `GET /api/payment/subscription` - Get user's subscription
- `POST /api/payment/cancel` - Cancel subscription
- `GET /api/payment/history` - Payment history

**Webhooks:**

- `POST /api/payment/webhook` - Handle Razorpay events

### Client Integration

**Components Updated:**

- `Upgrade.jsx` - Payment checkout flow
- `useUserStore.js` - Subscription state management
- `paymentService.js` - Payment API calls

---

## Subscription Plans

### Monthly Plan

- **Price:** ₹197/month
- **Period:** 30 days
- **Features:** Unlimited logs, all nutrients

### Annual Plan

- **Price:** ₹1,497/year (₹125/month)
- **Savings:** ₹867 (37% off)
- **Period:** 365 days
- **Features:** Unlimited logs, all nutrients

---

## Using MCP vs Backend API

### Use Razorpay MCP for:

- Quick queries about payments
- Customer lookups
- Testing payment flows
- Settlement checks
- Creating payment links

### Use Backend API for:

- User subscription management
- Payment verification
- Subscription activation
- Database synchronization
- Webhook handling

---

## Example Workflows

### Test a Payment

1. **Via MCP (Testing):**

   ```
   "Create a test payment link for ₹197"
   ```

2. **Via Your App (Production):**
   - User clicks "Get Started" on `/upgrade`
   - Backend creates order
   - Razorpay Checkout opens
   - User completes payment
   - Webhook activates subscription

### Check Subscription Status

1. **Via MCP:**

   ```
   "Get subscription details for sub_xxxxx"
   ```

2. **Via Your App:**
   ```
   GET /api/payment/subscription
   ```

### Handle Cancellation

1. **Via MCP:**

   ```
   "Cancel subscription sub_xxxxx"
   ```

2. **Via Your App:**
   ```
   POST /api/payment/cancel
   { "reason": "User requested" }
   ```

---

## Next Steps

### Setup Tasks

1. ✅ Add Razorpay credentials to `.env`
2. ✅ Run database migrations
3. ✅ Test payment flow with test cards
4. ✅ Configure webhook URL
5. ✅ Add policy pages to Razorpay dashboard

### Production Checklist

- [ ] Complete KYC verification
- [ ] Switch to live API keys
- [ ] Test webhook delivery
- [ ] Update CORS origins
- [ ] Monitor payment logs
- [ ] Set up refund policy

---

## Environment Variables

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

See `RAZORPAY_SETUP.md` for detailed setup instructions.

---

## Resources

- **Razorpay Dashboard:** https://dashboard.razorpay.com
- **API Docs:** https://razorpay.com/docs/api/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **MCP Server:** https://mcp.razorpay.com/
