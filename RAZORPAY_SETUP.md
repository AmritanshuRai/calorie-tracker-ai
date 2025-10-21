# Razorpay Payment Integration - Environment Variables

## Required Environment Variables

Add these environment variables to your server's `.env` file:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## How to Get Razorpay Credentials

### 1. Sign Up / Log In to Razorpay

- Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
- Create an account or log in

### 2. Get API Keys

1. Navigate to **Settings** → **API Keys**
2. Click **Generate Test Keys** (for testing) or **Generate Live Keys** (for production)
3. Copy:
   - **Key ID** → `RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

⚠️ **Important:** Keep your Key Secret secure! Never commit it to version control.

### 3. Set Up Webhook

1. Go to **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Configure:
   - **Webhook URL:** `https://your-api-domain.com/api/payment/webhook`
   - **Secret:** Generate a strong random string
   - **Events to Subscribe:**
     - `payment.captured`
     - `payment.failed`
     - `subscription.charged`
     - `subscription.cancelled`
4. Save and copy the **Webhook Secret** → `RAZORPAY_WEBHOOK_SECRET`

---

## Environment Setup

### Development (.env)

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=your_postgres_connection_string

# Session
SESSION_SECRET=your_session_secret_here

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

### Production (.env.production)

```env
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=your_production_postgres_url

# Session
SESSION_SECRET=your_strong_session_secret_here

# Razorpay (Live Mode)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_here
RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Testing Razorpay Integration

### Test Cards

Use these test card details in Test Mode:

**Successful Payment:**

- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

**Failed Payment:**

- Card Number: `4000 0000 0000 0002`

### Test UPI

- UPI ID: `success@razorpay`

More test credentials: [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

---

## Database Migration

After updating the Prisma schema, run migrations:

```bash
cd server
npx prisma migrate dev --name add_subscription_models
```

This will create the necessary tables:

- `Subscription` - Track user subscriptions
- `Payment` - Store payment history
- Updates to `User` model with subscription fields

---

## Verify Integration

1. **Start the server:**

   ```bash
   cd server
   npm run dev
   ```

2. **Test payment flow:**

   - Navigate to `/upgrade` page
   - Select a plan (Monthly/Annual)
   - Click "Get Started Now"
   - Complete payment with test card
   - Verify subscription is activated

3. **Check webhook delivery:**
   - Go to Razorpay Dashboard → Webhooks
   - View webhook logs to ensure events are being received

---

## Security Best Practices

✅ **DO:**

- Keep Key Secret and Webhook Secret in environment variables
- Use HTTPS for webhook URLs in production
- Verify all payment signatures on the backend
- Store sensitive data encrypted in database
- Use different keys for test and live modes

❌ **DON'T:**

- Commit secrets to version control
- Expose Key Secret to the client
- Skip signature verification
- Use test keys in production

---

## Subscription Plans Configuration

Current plans are configured in `server/src/services/razorpay.js`:

```javascript
export const SUBSCRIPTION_PLANS = {
  monthly: {
    amount: 19700, // ₹197 in paise
    period: 'monthly',
    interval: 1,
    name: 'Monthly Pro Plan',
  },
  annual: {
    amount: 149700, // ₹1497 in paise
    period: 'yearly',
    interval: 1,
    name: 'Annual Pro Plan',
  },
};
```

To modify pricing, update the `amount` field (in paise: 1 rupee = 100 paise).

---

## API Endpoints

### Client Endpoints

- `GET /api/payment/plans` - Get subscription plans
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment and activate subscription
- `GET /api/payment/subscription` - Get user's subscription status
- `GET /api/payment/history` - Get payment history
- `POST /api/payment/cancel` - Cancel subscription

### Webhook Endpoint

- `POST /api/payment/webhook` - Razorpay webhook handler

---

## Troubleshooting

### Payment not completing

- Check browser console for errors
- Verify Razorpay SDK is loaded (check Network tab)
- Ensure RAZORPAY_KEY_ID is correct in server response

### Signature verification fails

- Double-check RAZORPAY_KEY_SECRET matches dashboard
- Ensure proper string concatenation in verification
- Check for trailing spaces in environment variables

### Webhook not receiving events

- Verify webhook URL is publicly accessible (use ngrok for local testing)
- Check webhook secret matches
- Review webhook logs in Razorpay Dashboard

### Database errors

- Run migrations: `npx prisma migrate dev`
- Check DATABASE_URL connection string
- Verify Prisma Client is generated: `npx prisma generate`

---

## Support Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Payment Gateway Integration](https://razorpay.com/docs/payments/)
- [Webhook Events](https://razorpay.com/docs/webhooks/)

---

## Next Steps

1. ✅ Complete KYC verification in Razorpay Dashboard
2. ✅ Add policy pages (Privacy, Terms, Refund, Contact)
3. ✅ Test payment flow thoroughly
4. ✅ Set up webhook monitoring
5. ✅ Switch to Live Mode keys for production
6. ✅ Monitor subscription renewals and cancellations
