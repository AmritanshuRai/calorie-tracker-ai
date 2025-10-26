# Dodo Payments Integration - Phase 2: Webhooks ✅

## Overview

Implemented comprehensive webhook handling for Dodo Payments to process subscription lifecycle events, payment confirmations, and refunds.

## What Was Implemented

### 1. Database Schema Updates

#### Updated `Subscription` Model

Added Dodo-specific fields:

- `dodoSubscriptionId` - Unique identifier from Dodo
- `dodoCustomerId` - Customer ID in Dodo
- `dodoProductId` - Product ID subscribed to
- `previousBillingDate` - Track last billing
- `paymentFrequency*` - Payment interval details
- `subscriptionPeriod*` - Subscription duration details
- `trialPeriodDays` - Trial period length
- `metadata` - JSON field for additional Dodo data

Updated `status` values: `active`, `cancelled`, `expired`, `paused`, `on_hold`, `pending`, `failed`

#### Updated `Payment` Model

Added Dodo-specific fields:

- `dodoPaymentId` - Unique identifier from Dodo
- `dodoCustomerId` - Customer ID in Dodo
- `dodoSubscriptionId` - Link to subscription
- `dodoCheckoutSessionId` - Checkout session reference
- `cardLastFour`, `cardNetwork`, `cardType`, `cardIssuingCountry` - Card details
- `totalAmount`, `taxAmount` - Amounts in cents
- `settlementAmount`, `settlementCurrency`, `settlementTax` - Merchant settlement
- `productCart` - JSON of one-time products purchased
- `billingAddress` - JSON billing address
- `metadata` - Additional Dodo data

#### New `WebhookEvent` Model

Tracks all webhook events:

- `webhookId` - Unique ID from webhook header
- `eventType` - Event type (e.g., `payment.succeeded`)
- `businessId` - Dodo business ID
- `payload` - Full JSON payload
- `processed` - Processing status
- `processingError` - Error message if failed
- `retryCount` - Number of retry attempts
- `webhookTimestamp` - When webhook was sent
- `receivedAt` - When we received it
- `processedAt` - When we processed it

### 2. Webhook Route (`/api/webhook/dodo-payments`)

Created secure webhook endpoint with:

#### Security

- **Signature Verification**: Using `standardwebhooks` library
- **Raw Body Parsing**: Required for signature verification
- **Idempotency**: Tracks `webhook-id` to prevent duplicate processing
- **Error Handling**: Graceful error handling with retry tracking

#### Supported Events

##### Payment Events

- `payment.succeeded` - Payment completed successfully
- `payment.failed` - Payment attempt failed
- `payment.processing` - Payment being processed
- `payment.cancelled` - Payment cancelled

##### Subscription Events

- `subscription.active` - Subscription activated
- `subscription.on_hold` - Payment failed, subscription on hold
- `subscription.renewed` - Subscription renewed successfully
- `subscription.plan_changed` - Plan upgraded/downgraded
- `subscription.cancelled` - Subscription cancelled
- `subscription.failed` - Subscription creation failed
- `subscription.expired` - Subscription expired

##### Refund Events

- `refund.succeeded` - Refund processed
- `refund.failed` - Refund failed

### 3. Event Handlers

#### Payment Succeeded Handler

```javascript
handlePaymentSucceeded(data);
```

- Creates/updates payment record
- Stores card details, amounts, settlement info
- Grants one-time access if not subscription
- Links payment to user via email

#### Subscription Active Handler

```javascript
handleSubscriptionActive(data);
```

- Creates/updates subscription record
- Calculates subscription period dates
- Updates user subscription status
- Stores payment frequency and period details

#### Subscription Cancelled Handler

```javascript
handleSubscriptionCancelled(data);
```

- Updates subscription status to cancelled
- Records cancellation date
- Updates user subscription status

#### One-Time Access Handler

```javascript
grantOneTimeAccess(userId, productCart, metadata);
```

- Grants 30 days or 365 days access
- Based on product metadata (`plan: '30D'` or `'365D'`)
- Updates user subscription status and dates

### 4. Webhook Event Tracking

All webhooks are logged in `WebhookEvent` table:

- Prevents duplicate processing
- Tracks processing status
- Stores errors for debugging
- Enables manual retry of failed webhooks

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install standardwebhooks
```

### 2. Update Database

```bash
npx prisma db push
npx prisma generate
```

### 3. Configure Environment

Already set in `.env`:

```env
DODO_PAYMENTS_WEBHOOK_SECRET=whsec_Zf+nAO73oiKb4YZRka2cxPU//wucIKO2
```

### 4. Start Server

```bash
npm run webhook
# or
npm run dev
```

### 5. Configure Dodo Dashboard

1. Go to Dodo Payments Dashboard
2. Navigate to `Settings > Webhooks`
3. Click `Add Webhook`
4. Enter URL: `https://your-domain.com/api/webhook/dodo-payments`
5. For local testing, use ngrok or similar:
   ```bash
   ngrok http 3001
   # Then use: https://xxx.ngrok.io/api/webhook/dodo-payments
   ```
6. Subscribe to events:
   - All Payment events
   - All Subscription events
   - All Refund events

## Testing Webhooks

### Local Testing with Dodo Dashboard

1. Start server: `npm run webhook`
2. Use ngrok for public URL:
   ```bash
   ngrok http 3001
   ```
3. Configure webhook in Dodo Dashboard with ngrok URL
4. Use Dodo Dashboard "Testing" tab to send test events
5. Check server logs for processing

### Manual Testing

```bash
# Send test webhook (replace with your data)
curl -X POST http://localhost:3001/api/webhook/dodo-payments \
  -H "Content-Type: application/json" \
  -H "webhook-id: test-id-123" \
  -H "webhook-timestamp: 1698765432" \
  -H "webhook-signature: v1,your-signature-here" \
  -d '{
    "business_id": "bus_xxxxx",
    "type": "payment.succeeded",
    "timestamp": "2024-10-26T12:00:00Z",
    "data": {
      "payment_id": "pay_xxxxx",
      "customer": {
        "email": "test@example.com",
        "customer_id": "cus_xxxxx"
      },
      "total_amount": 499,
      "currency": "USD",
      "status": "succeeded"
    }
  }'
```

## User Flow with Webhooks

### Subscription Purchase Flow

1. **User clicks "Get Started"** on `/upgrade` page
2. **Frontend creates checkout session**
   - Calls `/api/payment/create-checkout-session`
   - Redirects to Dodo's hosted checkout
3. **User completes payment** on Dodo's page
4. **Dodo processes payment**
5. **Dodo sends `payment.succeeded` webhook**
   - Our server receives webhook
   - Creates Payment record
   - Links to user via email
6. **Dodo activates subscription**
7. **Dodo sends `subscription.active` webhook**
   - Our server receives webhook
   - Creates Subscription record
   - Updates User.subscriptionStatus = "active"
   - Grants unlimited access
8. **User redirected to `/dashboard`**
   - Can now log unlimited food entries
   - Subscription active

### One-Time Purchase Flow

1. **User clicks "Purchase"** on one-time plan
2. **Frontend creates checkout session**
3. **User completes payment**
4. **Dodo sends `payment.succeeded` webhook**
   - Creates Payment record
   - Calls `grantOneTimeAccess()`
   - Updates User.subscriptionStatus = "active"
   - Sets subscription end date (30 or 365 days)
5. **User has access for purchased period**

### Subscription Renewal Flow

1. **Dodo automatically charges** on renewal date
2. **If payment succeeds:**
   - `payment.succeeded` webhook → Update Payment
   - `subscription.renewed` webhook → Extend subscription period
3. **If payment fails:**
   - `payment.failed` webhook → Log failure
   - `subscription.on_hold` webhook → Set status to "on_hold"
   - User access limited

### Subscription Cancellation Flow

1. **User cancels** (future implementation)
2. **Dodo sends `subscription.cancelled` webhook**
   - Updates Subscription.status = "cancelled"
   - Sets Subscription.cancelledAt
   - Updates User.subscriptionStatus = "cancelled"
3. **User keeps access** until end of paid period
4. **After period ends:**
   - `subscription.expired` webhook
   - User.subscriptionStatus = "expired"
   - Access revoked

## Database Schema Changes

```prisma
model Subscription {
  dodoSubscriptionId    String?  @unique
  dodoCustomerId        String?
  dodoProductId         String?
  status                String   // active, on_hold, cancelled, etc.
  previousBillingDate   DateTime?
  // ... additional fields
}

model Payment {
  dodoPaymentId       String?  @unique
  dodoCustomerId      String?
  dodoSubscriptionId  String?
  cardLastFour        String?
  totalAmount         Int?
  settlementAmount    Int?
  // ... additional fields
}

model WebhookEvent {
  id              String   @id @default(cuid())
  webhookId       String   @unique
  eventType       String
  payload         Json
  processed       Boolean  @default(false)
  // ... additional fields
}
```

## Monitoring & Debugging

### View Webhook Logs

```bash
# In Prisma Studio
npm run prisma:studio
# Navigate to WebhookEvent table
```

### Check Processing Errors

```sql
-- Find failed webhooks
SELECT * FROM "WebhookEvent"
WHERE processed = false
ORDER BY "receivedAt" DESC;

-- Find processing errors
SELECT "eventType", "processingError", "retryCount"
FROM "WebhookEvent"
WHERE "processingError" IS NOT NULL;
```

### Server Logs

Look for these log messages:

- `📨 Received webhook from Dodo Payments`
- `✅ Webhook signature verified`
- `📝 Webhook event stored`
- `🔄 Processing event: {type}`
- `✅ Webhook processed successfully`
- `❌ Error processing webhook`

## Security Considerations

1. **Signature Verification**: Always verify webhook signatures
2. **HTTPS Only**: Use HTTPS in production
3. **Idempotency**: Track webhook IDs to prevent duplicate processing
4. **Error Handling**: Log errors but return 200 to prevent retries
5. **Rate Limiting**: Consider rate limiting webhook endpoint
6. **IP Whitelisting**: Optional - whitelist Dodo's webhook IPs

## Error Handling

- **Signature Verification Fails**: Return 401
- **Processing Error**: Log error, mark as failed, return 200
- **Duplicate Webhook**: Skip processing, return 200
- **User Not Found**: Log error, mark as failed, return 200

## Next Steps (Phase 3)

### User Features

- [ ] Subscription management page
- [ ] Cancel subscription UI
- [ ] View payment history
- [ ] Download invoices
- [ ] Update billing information

### Admin Features

- [ ] View all subscriptions
- [ ] Manually process failed webhooks
- [ ] Refund management
- [ ] Subscription analytics dashboard

### Technical Improvements

- [ ] Webhook retry mechanism for failed processing
- [ ] Email notifications for payment events
- [ ] Webhook event replay from dashboard
- [ ] Better error logging and monitoring
- [ ] Integration tests for webhooks

## Files Created/Modified

### Created

- ✅ `server/src/routes/webhook.js` - Webhook handler
- ✅ `server/prisma/schema.prisma` - Updated models
- ✅ `DODO_PAYMENTS_PHASE2.md` - This documentation

### Modified

- ✅ `server/src/index.js` - Added webhook route
- ✅ `server/package.json` - Added standardwebhooks dependency

## Testing Checklist

- [x] Install standardwebhooks package
- [x] Update database schema
- [x] Create webhook route
- [x] Implement signature verification
- [x] Handle payment.succeeded
- [x] Handle subscription.active
- [x] Handle subscription.cancelled
- [x] Handle refund.succeeded
- [ ] Test with ngrok and Dodo Dashboard
- [ ] Test subscription renewal flow
- [ ] Test one-time purchase flow
- [ ] Test failed payment handling
- [ ] Monitor production webhooks

## Production Deployment

1. **Update Environment Variables**

   ```env
   DODO_PAYMENTS_WEBHOOK_SECRET=your_production_secret
   ```

2. **Configure Production Webhook URL**

   - In Dodo Dashboard: `https://api.trackall.food/api/webhook/dodo-payments`

3. **Monitor Webhook Events**

   - Set up logging/monitoring
   - Alert on failed webhooks
   - Track processing times

4. **Database Backups**
   - Ensure regular backups
   - Test restore procedures

---

**Status**: ✅ Webhook integration complete and ready for testing
**Next**: Test with real payments and deploy to production
