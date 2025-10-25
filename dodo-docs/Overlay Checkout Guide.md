# Overlay Checkout Guide

> A modern TypeScript library for embedding Dodo Payments overlay checkout and listening to checkout events in real-time.

## Overview

The Dodo Payments Checkout SDK provides a seamless way to integrate our payment overlay into your web application. Built with TypeScript and modern web standards, it offers a robust solution for handling payments with real-time event handling and customizable themes.

<Frame>
  <img src="https://mintcdn.com/dodopayments/mOQO5ej_lx0yH9p-/images/cover-images/overlay-checkout.png?fit=max&auto=format&n=mOQO5ej_lx0yH9p-&q=85&s=15d90c695e92914a9d54b10509d6fe47" alt="Overlay Checkout Cover Image" data-og-width="3826" width="3826" data-og-height="2160" height="2160" data-path="images/cover-images/overlay-checkout.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/dodopayments/mOQO5ej_lx0yH9p-/images/cover-images/overlay-checkout.png?w=280&fit=max&auto=format&n=mOQO5ej_lx0yH9p-&q=85&s=67930ac9b97b42692611ffaa063b0338 280w, https://mintcdn.com/dodopayments/mOQO5ej_lx0yH9p-/images/cover-images/overlay-checkout.png?w=560&fit=max&auto=format&n=mOQO5ej_lx0yH9p-&q=85&s=5bc275c0c82994faf7507699f3443cda 560w, https://mintcdn.com/dodopayments/mOQO5ej_lx0yH9p-/images/cover-images/overlay-checkout.png?w=840&fit=max&auto=format&n=mOQO5ej_lx0yH9p-&q=85&s=d85ff73e834510f856f521d74e8d9ecd 840w, https://mintcdn.com/dodopayments/mOQO5ej_lx0yH9p-/images/cover-images/overlay-checkout.png?w=1100&fit=max&auto=format&n=mOQO5ej_lx0yH9p-&q=85&s=2fadc48d6b3d40665366b1922e458ca3 1100w, https://mintcdn.com/dodopayments/mOQO5ej_lx0yH9p-/images/cover-images/overlay-checkout.png?w=1650&fit=max&auto=format&n=mOQO5ej_lx0yH9p-&q=85&s=0f552d1695faa8239eec542a0b1eeefe 1650w, https://mintcdn.com/dodopayments/mOQO5ej_lx0yH9p-/images/cover-images/overlay-checkout.png?w=2500&fit=max&auto=format&n=mOQO5ej_lx0yH9p-&q=85&s=3e25457d894290ee38da2f9319edb999 2500w" />
</Frame>

## Resources

- 📚 [Integration Documentation](https://docs.dodopayments.com/api-reference/overlay-checkout)
- 🎮 [Interactive Demo](https://atlas.dodopayments.com#overlay-checkout)
- 💻 [Demo Source Code](https://github.com/dodopayments/dodo-checkout-demo/blob/main/src/components/Home/OverlayCheckout.tsx)

## Installation

```bash theme={null}
# Using npm
npm install dodopayments-checkout

# Using yarn
yarn add dodopayments-checkout

# Using pnpm
pnpm add dodopayments-checkout
```

## Quick Start

```typescript theme={null}
import { DodoPayments } from 'dodopayments-checkout';

// Initialize the SDK
DodoPayments.Initialize({
  mode: 'live', // 'test' or 'live'
  onEvent: (event) => {
    console.log('Checkout event:', event);
  },
});

// Open checkout
DodoPayments.Checkout.open({
  checkoutUrl: 'https://checkout.dodopayments.com/session/cks_123', // Get this url from create checkout session api
});
```

## Configuration

### Initialize Options

```typescript theme={null}
interface InitializeOptions {
  mode: 'test' | 'live';
  onEvent: (event: CheckoutEvent) => void;
}
```

| Option    | Type     | Required | Description                                    |
| --------- | -------- | -------- | ---------------------------------------------- |
| `mode`    | string   | Yes      | Environment mode: 'test' or 'live'             |
| `onEvent` | function | Yes      | Callback function for handling checkout events |

### Checkout Options

```typescript theme={null}
interface CheckoutOptions {
  checkoutUrl: string;
}
```

| Option        | Type   | Required | Description                                           |
| ------------- | ------ | -------- | ----------------------------------------------------- |
| `checkoutUrl` | string | Yes      | Checkout session URL from create checkout session API |

## Event Handling

The SDK provides real-time events that you can listen to:

```typescript theme={null}
DodoPayments.Initialize({
  onEvent: (event: CheckoutEvent) => {
    switch (event.event_type) {
      case 'checkout.opened':
        // Checkout overlay has been opened
        break;
      case 'checkout.payment_page_opened':
        // Payment page has been displayed
        break;
      case 'checkout.customer_details_submitted':
        // Customer and billing details submitted
        break;
      case 'checkout.closed':
        // Checkout has been closed
        break;
      case 'checkout.redirect':
        // Checkout will perform a redirect
        break;
      case 'checkout.error':
        // An error occurred
        break;
    }
  },
});
```

## Methods

### Open Checkout

```typescript theme={null}
DodoPayments.Checkout.open({
  checkoutUrl: 'https://checkout.dodopayments.com/session/cks_123', // Get this url from create checkout session api
});
```

### Close Checkout

```typescript theme={null}
DodoPayments.Checkout.close();
```

### Check Status

```typescript theme={null}
const isOpen = DodoPayments.Checkout.isOpen();
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11+

> **Note**: Apple Pay is not currently supported in the overlay checkout experience. We plan to add support for Apple Pay in a future release.

## CDN Implementation

For quick integration, you can use our CDN:

```html theme={null}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dodo Payments Checkout</title>

    <!-- Load DodoPayments -->
    <script src="https://cdn.jsdelivr.net/npm/dodopayments-checkout@latest/dist/index.js"></script>
    <script>
      // Initialize the SDK
      DodoPaymentsCheckout.DodoPayments.Initialize({
        mode: 'test', // Change to 'live' for production
        onEvent: (event) => {
          console.log('Checkout event:', event);
        },
      });
    </script>
  </head>
  <body>
    <button onclick="openCheckout()">Checkout Now</button>

    <script>
      function openCheckout() {
        DodoPaymentsCheckout.DodoPayments.Checkout.open({
          checkoutUrl: 'https://checkout.dodopayments.com/session/cks_123', // Get this url from create checkout session api
        });
      }
    </script>
  </body>
</html>
```

## TypeScript Support

The SDK is written in TypeScript and includes comprehensive type definitions. All public APIs are fully typed for better developer experience.

## Error Handling

The SDK provides detailed error information through the event system. Always implement proper error handling in your `onEvent` callback:

```typescript theme={null}
DodoPayments.Initialize({
  onEvent: (event: CheckoutEvent) => {
    if (event.event_type === 'checkout.error') {
      console.error('Checkout error:', event.data?.message);
      // Handle error appropriately
    }
  },
});
```

## Best Practices

1. Always initialize the SDK before attempting to open the checkout
2. Implement proper error handling in your event callback
3. Use the test mode during development
4. Handle all relevant events for a complete user experience
5. Use valid checkout URLs from the create checkout session API
6. Use TypeScript for better type safety and developer experience

## Step-by-Step Guide

### 1. Project Setup

First, ensure you have a modern JavaScript/TypeScript project. We recommend using Next.js, React, or Vue.js.

### 2. Install the SDK

Install the Dodo Payments Checkout SDK using your preferred package manager:

```bash theme={null}
# Using npm
npm install dodopayments-checkout

# Using yarn
yarn add dodopayments-checkout

# Using pnpm
pnpm add dodopayments-checkout
```

### 3. Basic Implementation

Create a new component for your checkout button:

```typescript theme={null}
// components/CheckoutButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { DodoPayments } from 'dodopayments-checkout';
import { useEffect, useState } from 'react';

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize the SDK
    DodoPayments.Initialize({
      mode: 'test', // Change to 'live' for production
      onEvent: (event) => {
        console.log('Checkout event:', event);

        // Handle different events
        switch (event.event_type) {
          case 'checkout.opened':
            setIsLoading(false);
            break;
          case 'checkout.error':
            // Handle error
            break;
        }
      },
    });
  }, []);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      await DodoPayments.Checkout.open({
        checkoutUrl: 'https://checkout.dodopayments.com/session/cks_123', // Get this url from create checkout session api
      });
    } catch (error) {
      console.error('Failed to open checkout:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Checkout Now'}
    </Button>
  );
}
```

### 4. Add to Your Page

Use the checkout button in your page:

```typescript theme={null}
// app/page.tsx
import { CheckoutButton } from '@/components/CheckoutButton';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <h1>Welcome to Our Store</h1>
      <CheckoutButton />
    </main>
  );
}
```

### 5. Handle Success and Failure

Create success and failure pages:

```typescript theme={null}
// app/success/page.tsx
export default function SuccessPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase.</p>
    </div>
  );
}

// app/failure/page.tsx
export default function FailurePage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <h1>Payment Failed</h1>
      <p>Please try again or contact support.</p>
    </div>
  );
}
```

### 6. Testing Your Integration

1. Start your development server:

```bash theme={null}
npm run dev
```

2. Test the checkout flow:
   - Click the checkout button
   - Verify the overlay appears
   - Test the payment flow using test credentials
   - Confirm redirects work correctly

### 7. Going Live

When you're ready to go live:

1. Change the mode to 'live':

```typescript theme={null}
DodoPayments.Initialize({
  mode: 'live',
  onEvent: (event) => {
    console.log('Checkout event:', event);
  },
});
```

2. Update your checkout URLs to use live checkout sessions
3. Test the complete flow in production
4. Monitor events and errors

### Common Issues and Solutions

1. **Checkout not opening**

   - Verify SDK initialization
   - Check for console errors
   - Ensure checkout URL is valid and from create checkout session API

2. **Events not firing**

   - Confirm event handler is properly set up
   - Check for JavaScript errors
   - Verify network connectivity

3. **Styling issues**
   - Ensure no CSS conflicts
   - Check theme settings
   - Verify responsive design

For more help, visit our Discord or contact our developer support team.
