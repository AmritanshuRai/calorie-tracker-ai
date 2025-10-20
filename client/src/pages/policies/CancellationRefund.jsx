import { motion } from 'framer-motion';
import PageLayout from '../../components/PageLayout';

const CancellationRefund = () => {
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6 text-gray-900'>
          Cancellation & Refund Policy
        </h1>
        <p className='text-sm text-gray-600 mb-8'>
          Last Updated: October 20, 2025
        </p>

        <div className='space-y-6 text-gray-700'>
          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              1. Subscription Cancellation
            </h2>
            <h3 className='text-xl font-medium mb-2'>1.1 How to Cancel</h3>
            <p className='mb-3'>
              You may cancel your TrackAll Food premium subscription at any time
              through:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Your account settings page within the application</li>
              <li>Contacting our support team at support@trackall.food</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              1.2 Cancellation Effective Date
            </h3>
            <p>When you cancel your subscription:</p>
            <ul className='list-disc pl-6 space-y-2 mt-2'>
              <li>
                The cancellation will take effect at the end of your current
                billing period
              </li>
              <li>
                You will retain access to premium features until the end of the
                paid period
              </li>
              <li>
                No further charges will be made after the current billing period
                ends
              </li>
              <li>
                You can continue using the free version of the service after
                cancellation
              </li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              1.3 No Cancellation Fees
            </h3>
            <p>
              There are no cancellation fees or penalties for terminating your
              subscription. You may cancel at any time without any additional
              charges.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              2. Refund Policy
            </h2>
            <h3 className='text-xl font-medium mb-2'>
              2.1 7-Day Money-Back Guarantee
            </h3>
            <p className='mb-3'>
              We offer a 7-day money-back guarantee for all new subscriptions:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                If you're not satisfied with the service within 7 days of
                purchase, request a full refund
              </li>
              <li>
                The refund request must be made within 7 days of the initial
                payment
              </li>
              <li>This guarantee applies only to first-time subscribers</li>
              <li>Refunds will be processed within 5-10 business days</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              2.2 Refunds After 7 Days
            </h3>
            <p className='mb-3'>
              After the 7-day period, refunds are generally not provided.
              However, we may consider refund requests on a case-by-case basis
              in the following circumstances:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                Technical issues that prevented you from using the service
              </li>
              <li>Duplicate charges or billing errors</li>
              <li>Unauthorized transactions</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              2.3 Pro-Rated Refunds
            </h3>
            <p>
              We do not offer pro-rated refunds for partial billing periods. If
              you cancel mid-cycle, you will have access to premium features
              until the end of your billing period, but no partial refund will
              be issued.
            </p>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              2.4 Annual Subscriptions
            </h3>
            <p className='mb-3'>For annual subscriptions:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>The 7-day money-back guarantee applies</li>
              <li>
                After 7 days, refunds are not available except in exceptional
                circumstances
              </li>
              <li>
                You may cancel at any time, and the subscription will not renew
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              3. How to Request a Refund
            </h2>
            <p className='mb-3'>To request a refund:</p>
            <ol className='list-decimal pl-6 space-y-2'>
              <li>Contact our support team at support@trackall.food</li>
              <li>Include your account email and transaction ID</li>
              <li>Provide a brief explanation for the refund request</li>
              <li>
                Our team will review your request within 2-3 business days
              </li>
              <li>
                If approved, the refund will be processed to your original
                payment method
              </li>
            </ol>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              4. Refund Processing Time
            </h2>
            <p className='mb-3'>Once a refund is approved:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Refunds are processed within 5-10 business days</li>
              <li>The refund will appear on your original payment method</li>
              <li>
                Depending on your bank or payment provider, it may take an
                additional 3-5 business days to reflect in your account
              </li>
              <li>
                You will receive an email confirmation once the refund is
                processed
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              5. Billing Errors and Disputes
            </h2>
            <h3 className='text-xl font-medium mb-2'>5.1 Duplicate Charges</h3>
            <p>
              If you notice duplicate charges on your account, contact us
              immediately at support@trackall.food. We will investigate and
              process a refund if the charge was made in error.
            </p>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              5.2 Unauthorized Transactions
            </h3>
            <p>
              If you believe there has been an unauthorized charge to your
              account:
            </p>
            <ul className='list-disc pl-6 space-y-2 mt-2'>
              <li>Contact us immediately at support@trackall.food</li>
              <li>We will investigate the transaction</li>
              <li>
                If confirmed as unauthorized, a full refund will be issued
              </li>
              <li>
                We recommend also contacting your bank or payment provider
              </li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              5.3 Payment Disputes
            </h3>
            <p>
              Before filing a chargeback with your bank, please contact us to
              resolve the issue. Chargebacks may result in suspension of your
              account and legal action to recover costs associated with the
              chargeback process.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              6. Auto-Renewal Cancellation
            </h2>
            <p>To avoid being charged for the next billing cycle:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Cancel your subscription before the renewal date</li>
              <li>You can check your renewal date in your account settings</li>
              <li>We send reminder emails 3 days before renewal</li>
              <li>
                If you cancel after renewal, no refund will be issued (except
                within the 7-day window for annual renewals)
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              7. Free Trial Cancellation
            </h2>
            <p className='mb-3'>If we offer a free trial promotion:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>You may cancel at any time during the trial period</li>
              <li>
                If you cancel before the trial ends, you will not be charged
              </li>
              <li>
                If you do not cancel, your subscription will automatically begin
                at the end of the trial
              </li>
              <li>
                The 7-day money-back guarantee applies from the date of first
                payment
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              8. Account Deletion
            </h2>
            <p>If you wish to permanently delete your account:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>First cancel any active subscriptions</li>
              <li>
                Request account deletion through account settings or by
                contacting support
              </li>
              <li>
                Once deleted, all your data will be permanently removed within
                30 days
              </li>
              <li>Account deletion does not automatically trigger a refund</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              9. Service Termination by TrackAll Food
            </h2>
            <p className='mb-3'>
              If we terminate your account due to violation of our Terms of
              Service:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                No refund will be provided for the remaining subscription period
              </li>
              <li>You will lose access to all premium features immediately</li>
              <li>This determination is at our sole discretion</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              10. Changes to This Policy
            </h2>
            <p>
              We reserve the right to modify this Cancellation & Refund Policy
              at any time. Changes will be posted on this page with an updated
              "Last Updated" date. Your continued use of the service after
              changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              11. Contact Us
            </h2>
            <p className='mb-3'>
              For questions about cancellations or refunds, or to request a
              refund, please contact us:
            </p>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p>
                <strong>Email:</strong> support@trackall.food
              </p>
              <p>
                <strong>Response Time:</strong> Within 24-48 hours
              </p>
              <p>
                <strong>Website:</strong> https://www.trackall.food
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default CancellationRefund;
