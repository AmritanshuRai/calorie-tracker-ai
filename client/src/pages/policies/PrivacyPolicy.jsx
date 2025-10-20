import { motion } from 'framer-motion';
import PageLayout from '../../components/PageLayout';

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6 text-gray-900'>
          Privacy Policy
        </h1>
        <p className='text-sm text-gray-600 mb-8'>
          Last Updated: October 20, 2025
        </p>

        <div className='space-y-6 text-gray-700'>
          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              1. Introduction
            </h2>
            <p>
              Welcome to TrackAll Food ("we," "our," or "us"). We are committed
              to protecting your personal information and your right to privacy.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our calorie tracking
              application.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              2. Information We Collect
            </h2>
            <h3 className='text-xl font-medium mb-2'>
              2.1 Personal Information
            </h3>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Name and email address</li>
              <li>Age, gender, height, and weight</li>
              <li>Health and fitness goals</li>
              <li>Dietary preferences and restrictions</li>
              <li>Activity level information</li>
              <li>Health conditions (if voluntarily provided)</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>2.2 Usage Data</h3>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Food logs and nutritional intake</li>
              <li>Application usage statistics</li>
              <li>Device information and IP address</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              2.3 Payment Information
            </h3>
            <p>
              Payment processing is handled securely through Razorpay. We do not
              store your credit card or banking information on our servers.
              Please refer to Razorpay's privacy policy for information about
              how they handle your payment data.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              3. How We Use Your Information
            </h2>
            <ul className='list-disc pl-6 space-y-2'>
              <li>To provide and maintain our service</li>
              <li>To personalize your nutrition and fitness recommendations</li>
              <li>To process your transactions and manage subscriptions</li>
              <li>
                To send you updates, newsletters, and promotional materials
                (with your consent)
              </li>
              <li>To improve our application and user experience</li>
              <li>
                To detect, prevent, and address technical issues and fraudulent
                activities
              </li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              4. Information Sharing and Disclosure
            </h2>
            <p className='mb-3'>
              We may share your information in the following circumstances:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                <strong>Service Providers:</strong> With third-party vendors who
                assist us in operating our application (e.g., OpenAI for
                AI-powered nutrition analysis, Razorpay for payment processing)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
              <li>
                <strong>With Your Consent:</strong> When you explicitly agree to
                share information
              </li>
            </ul>
            <p className='mt-3'>
              <strong>
                We do not sell your personal information to third parties.
              </strong>
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. However, no method
              of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              6. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to
              provide our services and comply with legal obligations. You may
              request deletion of your account and associated data at any time
              through your account settings or by contacting us.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              7. Your Rights
            </h2>
            <p className='mb-3'>You have the right to:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              8. Children's Privacy
            </h2>
            <p>
              Our service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you become aware that a child has provided us with personal
              information, please contact us.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              9. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your country of residence. We ensure appropriate
              safeguards are in place to protect your information in accordance
              with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              10. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date. You are advised to
              review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              11. Contact Us
            </h2>
            <p className='mb-3'>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p>
                <strong>Email:</strong> support@trackall.food
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

export default PrivacyPolicy;
