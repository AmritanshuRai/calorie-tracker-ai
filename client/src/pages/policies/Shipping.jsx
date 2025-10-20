import { motion } from 'framer-motion';
import PageLayout from '../../components/PageLayout';

const Shipping = () => {
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6 text-gray-900'>
          Shipping Policy
        </h1>
        <p className='text-sm text-gray-600 mb-8'>
          Last Updated: October 20, 2025
        </p>

        <div className='space-y-6 text-gray-700'>
          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Digital Service - No Physical Shipping
            </h2>
            <p className='mb-4'>
              TrackAll Food is a <strong>digital software service</strong> that
              provides calorie tracking and nutrition analysis through our web
              and mobile applications. As we offer exclusively digital products
              and services, we do not ship any physical goods.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Instant Access to Services
            </h2>
            <h3 className='text-xl font-medium mb-2'>
              1. Immediate Availability
            </h3>
            <p className='mb-3'>
              Upon successful payment and account creation, you will receive:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                <strong>Instant access</strong> to all premium features
                associated with your subscription
              </li>
              <li>Immediate activation of your account</li>
              <li>No waiting period or delivery time</li>
              <li>Access from any device with internet connectivity</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>2. How to Access</h3>
            <p className='mb-3'>
              After subscribing, you can access our service through:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                <strong>Web Application:</strong> Visit
                https://www.trackall.food and sign in with your credentials
              </li>
              <li>
                <strong>Mobile App:</strong> Download from iOS App Store or
                Google Play Store (if available)
              </li>
              <li>
                <strong>Email Confirmation:</strong> You'll receive a
                confirmation email with login instructions
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Service Delivery
            </h2>
            <h3 className='text-xl font-medium mb-2'>1. Account Activation</h3>
            <p className='mb-3'>Your account is activated automatically:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Within seconds of successful payment processing</li>
              <li>Email notification sent to your registered email address</li>
              <li>Login credentials are provided during registration</li>
              <li>No manual intervention required</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              2. Subscription Confirmation
            </h3>
            <p className='mb-3'>
              After purchasing a subscription, you will receive:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Email confirmation of your purchase</li>
              <li>Receipt for your transaction</li>
              <li>Details of your subscription plan</li>
              <li>Billing cycle information</li>
              <li>Access instructions</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Technical Requirements
            </h2>
            <p className='mb-3'>To access our digital service, you need:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                <strong>Internet Connection:</strong> Stable internet access for
                optimal performance
              </li>
              <li>
                <strong>Compatible Device:</strong> Smartphone, tablet, or
                computer
              </li>
              <li>
                <strong>Supported Browser:</strong> Chrome, Firefox, Safari, or
                Edge (latest versions)
              </li>
              <li>
                <strong>Valid Email Address:</strong> For account creation and
                communication
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Access Issues
            </h2>
            <h3 className='text-xl font-medium mb-2'>
              1. Unable to Access After Payment
            </h3>
            <p className='mb-3'>
              If you've completed payment but cannot access your account:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                Check your email (including spam folder) for activation
                instructions
              </li>
              <li>Verify that payment was successfully processed</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try logging in from a different browser or device</li>
              <li>Contact our support team at support@trackall.food</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              2. Payment Processing Delays
            </h3>
            <p className='mb-3'>
              In rare cases, payment processing may be delayed:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                Bank processing times may vary (typically instant to 24 hours)
              </li>
              <li>International payments may take longer to confirm</li>
              <li>If access is not granted within 24 hours, contact support</li>
              <li>
                We will manually activate your account if payment is confirmed
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Multi-Device Access
            </h2>
            <p className='mb-3'>Your subscription includes:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                <strong>Cross-Platform Access:</strong> Use on web, iOS, and
                Android
              </li>
              <li>
                <strong>Multiple Devices:</strong> Access from unlimited devices
              </li>
              <li>
                <strong>Data Synchronization:</strong> Your data syncs across
                all devices
              </li>
              <li>
                <strong>Single Account:</strong> One account per user
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Service Availability
            </h2>
            <h3 className='text-xl font-medium mb-2'>1. Uptime</h3>
            <p>
              We strive to maintain 99.9% service availability. However, the
              service may occasionally be unavailable due to:
            </p>
            <ul className='list-disc pl-6 space-y-2 mt-2'>
              <li>Scheduled maintenance (announced in advance)</li>
              <li>Emergency system updates</li>
              <li>Technical issues beyond our control</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              2. Maintenance Windows
            </h3>
            <p>Scheduled maintenance is typically performed:</p>
            <ul className='list-disc pl-6 space-y-2 mt-2'>
              <li>During low-traffic hours (late night/early morning)</li>
              <li>With advance notice via email</li>
              <li>With minimal service disruption</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Data Delivery and Storage
            </h2>
            <p className='mb-3'>Your personal data and usage information:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Is stored securely on our cloud servers</li>
              <li>Is accessible anytime from your account</li>
              <li>Can be exported upon request</li>
              <li>Is backed up regularly for data protection</li>
              <li>Remains available throughout your subscription period</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Customer Support
            </h2>
            <p className='mb-3'>
              For assistance with accessing or using our digital service:
            </p>
            <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
              <p>
                <strong>Email Support:</strong> support@trackall.food
              </p>
              <p>
                <strong>Response Time:</strong> Within 24-48 hours
              </p>
              <p>
                <strong>Help Center:</strong> Access FAQs and guides within the
                application
              </p>
              <p>
                <strong>Live Chat:</strong> Available for premium subscribers
                (if applicable)
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Future Physical Products
            </h2>
            <p>
              Currently, we do not offer any physical products. If we introduce
              physical merchandise or products in the future (such as branded
              merchandise, guides, or materials), we will update this Shipping
              Policy with relevant delivery information including:
            </p>
            <ul className='list-disc pl-6 space-y-2 mt-2'>
              <li>Shipping methods and carriers</li>
              <li>Delivery timeframes</li>
              <li>Shipping costs and regions</li>
              <li>Tracking information</li>
              <li>Returns and exchanges</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              Contact Information
            </h2>
            <p className='mb-3'>
              For questions about service delivery or access issues:
            </p>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p>
                <strong>Email:</strong> support@trackall.food
              </p>
              <p>
                <strong>Website:</strong> https://www.trackall.food
              </p>
              <p>
                <strong>Response Time:</strong> Within 24-48 hours
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default Shipping;
