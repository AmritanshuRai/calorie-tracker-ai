# 🚀 Quick Start - Razorpay Integration

## Step 1: Get Razorpay Credentials (5 minutes)

1. Go to https://dashboard.razorpay.com and sign up/login
2. Navigate to **Settings** → **API Keys**
3. Click **Generate Test Keys**
4. Copy the Key ID and Key Secret

## Step 2: Set Up Webhook (3 minutes)

1. Go to **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Enter webhook URL: `http://localhost:3001/api/payment/webhook` (for testing)
4. Generate a webhook secret (any random string)
5. Select events:
   - `payment.captured`
   - `payment.failed`
   - `subscription.charged`
   - `subscription.cancelled`

## Step 3: Configure Environment Variables (2 minutes)

Create/update `server/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
```

## Step 4: Install Dependencies (1 minute)

```bash
# Server (if not already done)
cd server
npm install

# Generate Prisma Client
npx prisma generate
```

## Step 5: Start the Application (1 minute)

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

## Step 6: Test Payment Flow (3 minutes)

1. Open http://localhost:5173/upgrade
2. Select a plan (Monthly or Annual)
3. Click "Get Started Now"
4. **Use Razorpay Test Card:**
   - Card Number: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - Name: Your name
5. Complete payment
6. You should be redirected to dashboard
7. Check your subscription status

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Client starts without errors
- [ ] Can access /upgrade page
- [ ] Razorpay checkout opens on button click
- [ ] Test payment completes successfully
- [ ] Subscription is activated in database
- [ ] User is redirected to dashboard

## 🔍 Quick Debug

### Payment button not working?

- Check browser console for errors
- Verify Razorpay SDK loads (Network tab)
- Ensure you're logged in

### Signature verification fails?

- Double-check `RAZORPAY_KEY_SECRET` in .env
- Restart server after updating .env

### Webhook not working?

- Use ngrok for local testing: `ngrok http 3001`
- Update webhook URL in Razorpay dashboard
- Check webhook secret matches .env

## 📊 Check Database

```bash
cd server
npx prisma studio
```

Browse the:

- `User` table → Check subscriptionStatus
- `Subscription` table → View active subscriptions
- `Payment` table → See payment history

## 🎉 You're All Set!

Your Razorpay integration is working! For detailed documentation, see:

- `RAZORPAY_INTEGRATION_COMPLETE.md` - Full summary
- `RAZORPAY_SETUP.md` - Detailed setup guide
- `RAZORPAY_MCP_GUIDE.md` - MCP tools reference

---

**Total Setup Time: ~15 minutes** ⚡
