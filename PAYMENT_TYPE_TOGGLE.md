# One-Time Payment Options Implementation

## Overview

Added the ability for users to view and purchase one-time payment options alongside the recurring subscription plans on the Upgrade page. The one-time options are displayed in separate cards below the main pricing card when toggled.

## Features Implemented

### 1. State Management

- Added `showOneTimeOptions` state (boolean) to toggle visibility of one-time payment cards
- `oneTimeProducts` state stores one-time payment products organized by plan
- Main pricing card always shows recurring subscription plans

### 2. Backend Updates (server/src/routes/payment.js)

- Enhanced GET `/api/payment/products` endpoint to fetch and filter one-time products
- Returns structured response:
  ```javascript
  {
    success: true,
    products: [recurring products],
    oneTimeProducts: [one-time products],
    baseProduct: {base product}
  }
  ```
- Filters products by `metadata.type`:
  - `'recurring'` - subscription plans (auto-renewal)
  - `'one-time'` - one-time payments (no auto-renewal)
  - `'base'` - base price reference (strikethrough display)

### 3. Frontend Updates (client/src/pages/Upgrade.jsx)

#### Product Organization

- Recurring products organized by plan: `{ monthly, annual }`
- One-time products organized by plan: `{ monthly, annual }`
- Products matched by `metadata.plan`: `'30D'` (monthly) or `'365D'` (annual)

#### UI Layout

**Main Pricing Card** (Always Visible)

- Displays recurring subscription plans only
- Monthly/Annual toggle for recurring subscriptions
- Shows base price strikethrough
- Discount badge on annual plan
- "Get Started Now" CTA button

**Toggle Button**

- Positioned below main pricing card
- Text: "Prefer one-time payment? View options →"
- When expanded: "← Hide one-time payment options"
- Emerald color with dotted underline

**One-Time Payment Cards** (Conditional Display)

- Only shown when `showOneTimeOptions` is true
- Two-column grid layout (responsive)
- Left card: 30 Days Access
- Right card: Annual Access (highlighted as "Best Value")

#### One-Time Payment Cards Details

**30 Days Access Card**

- Price display: Large number format
- Text: "One-time payment"
- Description: "30 days of premium features"
- Gray border with emerald hover effect
- "Get 30 Days Access" button (outline style)

**Annual Access Card** (Featured)

- Emerald border with shadow
- "Best Value" badge at top
- Price display in emerald color
- Shows monthly equivalent: `$X.XX/month equivalent`
- Displays savings compared to buying 12 monthly one-time payments
- "Get Annual Access" button (primary style)

#### Purchase Flow

- `handlePurchase()` function accepts optional `productId` parameter
- Main card button uses `currentProduct.product_id` (recurring)
- One-time cards pass their specific `product_id` directly
- Creates checkout session and redirects to Dodo Payments

## Product Structure

### Recurring Products (Subscriptions)

- **Monthly Plan**: $4.99/month (499¢)
  - Metadata: `{ type: 'recurring', plan: '30D' }`
  - Auto-renews monthly
  - Billed monthly
- **Annual Plan**: $34/year (3400¢) = $2.83/month
  - Metadata: `{ type: 'recurring', plan: '365D' }`
  - Auto-renews yearly
  - Billed annually
  - 43% savings vs monthly

### One-Time Products (No Auto-Renewal)

- **30 Days Access**: $9 one-time (900¢)
  - Metadata: `{ type: 'one-time', plan: '30D' }`
  - 30 days of premium access
  - No recurring charges
  - No auto-renewal
- **Annual Access**: $39 one-time (3900¢) = $3.25/month
  - Metadata: `{ type: 'one-time', plan: '365D' }`
  - Full year access
  - No recurring charges
  - No auto-renewal
  - Save $69 vs 12 monthly one-time payments ($9 × 12 = $108)

### Base Product

- **Base Price**: $19 (1900¢)
  - Metadata: `{ type: 'base' }`
  - Used for strikethrough "original price" display on main card
  - Not purchasable

## User Experience Flow

1. **Page Load**: User sees main pricing card with recurring subscription options
2. **Explore One-Time**: Click "Prefer one-time payment? View options →"
   - One-time payment cards appear below
   - Two cards displayed side-by-side (30 Days and Annual)
   - Annual card highlighted as "Best Value"
3. **Compare Options**: User can compare:
   - Recurring subscriptions (main card) vs One-time payments (below)
   - Monthly vs Annual for both types
4. **Make Purchase**: Click appropriate button
   - Recurring: "Get Started Now" on main card
   - One-time: "Get 30 Days Access" or "Get Annual Access" on respective cards
5. **Hide One-Time**: Click "← Hide one-time payment options" to collapse

## Visual Hierarchy

```
┌─────────────────────────────────────┐
│   Main Pricing Card (Recurring)    │
│   - Monthly/Annual Toggle           │
│   - Large Price Display             │
│   - Savings Badge                   │
│   - "Get Started Now" Button        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  "Prefer one-time payment? ..."    │ ← Toggle Button
└─────────────────────────────────────┘
           ↓ (when expanded)
┌───────────────┬───────────────────┐
│  30 Days      │  Annual Access    │
│  $9 one-time  │  $39 one-time     │
│  (Gray card)  │  (Emerald card)   │ ← Best Value
└───────────────┴───────────────────┘
```

## Technical Details

### handlePurchase Function

```javascript
const handlePurchase = async (productId = null) => {
  const selectedProductId = productId || currentProduct?.product_id;
  // Create checkout session with selected product
};
```

### Pricing Calculations

- **Monthly Equivalent** (Annual): `price / 12`
- **Savings** (Annual One-Time): `(monthly × 12) - annual`
- **Example**: Annual one-time saves $69 ($9 × 12 - $39 = $69)

### Styling Classes

- Main card: `border-2 border-emerald-500 shadow-xl`
- 30 Days card: `border-2 border-gray-300 hover:border-emerald-500`
- Annual card: `border-2 border-emerald-500 shadow-lg relative`
- Toggle button: `text-emerald-600 hover:text-emerald-700 underline decoration-dotted`

## Responsive Design

- Desktop: Two-column grid for one-time cards
- Mobile: Single column stack via `md:grid-cols-2`

## Button Variants

- Main recurring CTA: Primary button (emerald background)
- 30 Days one-time: Outline button (gray with border)
- Annual one-time: Primary button (emerald background)

## Testing Checklist

- [ ] Toggle shows/hides one-time payment cards
- [ ] Main pricing card remains visible when toggled
- [ ] One-time cards display correct prices
- [ ] Monthly equivalent calculation is accurate
- [ ] Savings calculation is correct
- [ ] Purchase buttons work for all three options (recurring, 30 days, annual)
- [ ] Checkout sessions created with correct product IDs
- [ ] Responsive layout works on mobile
- [ ] "Best Value" badge appears on annual one-time card
- [ ] Toggle text updates based on state

## Future Enhancements

- Add comparison table showing all 4 options side-by-side
- Highlight most popular choice
- Add FAQ section about one-time vs recurring
- Track analytics on which payment type users prefer
- Add seasonal promotions/discounts
- Enable A/B testing for default visibility

## Related Files

- `/server/src/routes/payment.js` - Backend payment routes
- `/client/src/pages/Upgrade.jsx` - Main upgrade page
- `/client/src/services/paymentService.js` - Payment service helpers
- `/client/src/components/Button.jsx` - Reusable button component
- `/client/src/components/Card.jsx` - Reusable card component

## Environment Variables

```bash
DODO_PAYMENTS_API_KEY=your_api_key
DODO_PAYMENTS_ENVIRONMENT=test_mode
```

## API Endpoints Used

- `GET /api/payment/products` - Fetch all products (recurring, one-time, base)
- `POST /api/payment/create-checkout-session` - Create checkout for selected product

## Key Differences from Recurring Plans

| Feature         | Recurring Subscription | One-Time Payment       |
| --------------- | ---------------------- | ---------------------- |
| Auto-Renewal    | Yes                    | No                     |
| Monthly Price   | $4.99                  | $9                     |
| Annual Price    | $34 ($2.83/mo)         | $39 ($3.25/mo)         |
| Billing         | Automatic              | One-time charge        |
| Access Duration | Until cancelled        | 30 days or 365 days    |
| Best For        | Regular users          | Trying out the service |

---

**Status**: ✅ Complete
**Last Updated**: October 25, 2025
**Implementation**: One-time payments display below main recurring pricing card
