# Policy Pages for Razorpay Integration

This document provides information about the policy pages created for Razorpay payment gateway compliance.

## Created Policy Pages

All policy pages are located in `/client/src/pages/policies/` and are accessible via the following routes:

### 1. Privacy Policy

- **Route:** `/privacy-policy`
- **File:** `PrivacyPolicy.jsx`
- **URL:** `https://www.trackall.food/privacy-policy`
- **Content Includes:**
  - Information collection and usage
  - Data security and retention
  - User rights and GDPR compliance
  - Third-party service disclosure (OpenAI, Razorpay)
  - Contact information

### 2. Terms and Conditions

- **Route:** `/terms-and-conditions`
- **File:** `TermsAndConditions.jsx`
- **URL:** `https://www.trackall.food/terms-and-conditions`
- **Content Includes:**
  - Service description
  - User account responsibilities
  - Subscription and payment terms
  - User conduct guidelines
  - Medical disclaimer
  - Limitation of liability
  - Dispute resolution

### 3. Cancellation & Refund Policy

- **Route:** `/cancellation-refund`
- **File:** `CancellationRefund.jsx`
- **URL:** `https://www.trackall.food/cancellation-refund`
- **Content Includes:**
  - Subscription cancellation process
  - 7-day money-back guarantee
  - Refund eligibility criteria
  - Refund processing timeline
  - Billing disputes and chargebacks
  - Auto-renewal cancellation

### 4. Shipping Policy

- **Route:** `/shipping`
- **File:** `Shipping.jsx`
- **URL:** `https://www.trackall.food/shipping`
- **Content Includes:**
  - Digital service delivery (no physical shipping)
  - Instant access information
  - Account activation process
  - Technical requirements
  - Multi-device access
  - Service availability and support

### 5. Contact Us

- **Route:** `/contact`
- **File:** `ContactUs.jsx`
- **URL:** `https://www.trackall.food/contact`
- **Content Includes:**
  - Contact form
  - Email: support@trackall.food
  - Business hours
  - Support options
  - FAQ links

## Razorpay Configuration

When setting up your Razorpay account, you need to provide these policy page URLs:

1. **Privacy Policy:** `https://www.trackall.food/privacy-policy`
2. **Terms & Conditions:** `https://www.trackall.food/terms-and-conditions`
3. **Cancellation & Refunds:** `https://www.trackall.food/cancellation-refund`
4. **Shipping:** `https://www.trackall.food/shipping`
5. **Contact Us:** `https://www.trackall.food/contact`

## How to Add URLs to Razorpay

1. Log in to your Razorpay Dashboard
2. Go to **Settings** → **Business Settings**
3. Navigate to **Website and App** section
4. Add the above URLs in their respective fields
5. Save the changes

## Footer Component

A `Footer` component has been created at `/client/src/components/Footer.jsx` that includes links to all policy pages. You can add this to your layouts:

```jsx
import Footer from './components/Footer';

function YourLayout() {
  return (
    <div className='flex flex-col min-h-screen'>
      {/* Your content */}
      <Footer />
    </div>
  );
}
```

## Customization

### Update Contact Information

All policy pages use the following contact details. Update them as needed:

- **Email:** support@trackall.food
- **Business Email:** business@trackall.food
- **Website:** https://www.trackall.food

Search for these values across all policy files to update them.

### Styling

All pages use:

- Tailwind CSS for styling
- Framer Motion for animations (optional)
- Consistent typography and spacing
- Mobile-responsive design

### Legal Compliance

These policy pages are templates designed for Indian jurisdiction (as required for Razorpay). You should:

1. **Review with a lawyer** to ensure compliance with local laws
2. **Customize** content based on your specific business practices
3. **Update regularly** as your service or policies change
4. **Add "Last Updated" dates** when making changes (already included)

## Important Notes

- All policy routes are **public** (no authentication required)
- Pages are optimized for SEO with proper headings
- Content is comprehensive but should be reviewed by legal counsel
- Update the "Last Updated" date when you make changes to policies

## Testing

Test all policy pages:

```bash
# Navigate to each route
/privacy-policy
/terms-and-conditions
/cancellation-refund
/shipping
/contact
```

Ensure:

- Pages load correctly
- All links work
- Content is readable on mobile devices
- Forms submit properly (Contact Us page)

## Deployment

After deploying your application:

1. Verify all policy pages are accessible at their public URLs
2. Add these URLs to your Razorpay account settings
3. Test the complete payment flow
4. Ensure Razorpay can verify the policy pages

## Maintenance

- Review and update policies at least annually
- Update the "Last Updated" date when making changes
- Notify users of significant policy changes
- Keep archived versions for compliance
