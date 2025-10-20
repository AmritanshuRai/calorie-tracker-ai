import { motion } from 'framer-motion';
import PageLayout from '../../components/PageLayout';

const TermsAndConditions = () => {
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6 text-gray-900'>
          Terms and Conditions
        </h1>
        <p className='text-sm text-gray-600 mb-8'>
          Last Updated: October 20, 2025
        </p>

        <div className='space-y-6 text-gray-700'>
          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using TrackAll Food ("Service," "Application," or
              "Platform"), you accept and agree to be bound by the terms and
              provisions of this agreement. If you do not agree to these Terms
              and Conditions, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              2. Description of Service
            </h2>
            <p>
              TrackAll Food is a calorie tracking and nutrition analysis
              application that helps users monitor their food intake, track
              nutritional values, and achieve their health and fitness goals.
              The Service uses AI technology to provide personalized nutrition
              insights and recommendations.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              3. User Accounts
            </h2>
            <h3 className='text-xl font-medium mb-2'>3.1 Account Creation</h3>
            <p className='mb-3'>
              To use certain features of our Service, you must create an
              account. You agree to:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              3.2 Account Termination
            </h3>
            <p>
              We reserve the right to suspend or terminate your account if you
              violate these Terms and Conditions or engage in fraudulent,
              abusive, or illegal activities.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              4. Subscription and Payment
            </h2>
            <h3 className='text-xl font-medium mb-2'>4.1 Subscription Plans</h3>
            <p>
              TrackAll Food offers both free and premium subscription plans.
              Premium features require payment of applicable fees.
            </p>

            <h3 className='text-xl font-medium mb-2 mt-4'>4.2 Billing</h3>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                Subscription fees are billed in advance on a monthly or annual
                basis
              </li>
              <li>Payment is processed securely through Razorpay</li>
              <li>
                You authorize us to charge your payment method for all
                applicable fees
              </li>
              <li>Prices are subject to change with 30 days' notice</li>
            </ul>

            <h3 className='text-xl font-medium mb-2 mt-4'>4.3 Auto-Renewal</h3>
            <p>
              Subscriptions automatically renew unless cancelled before the
              renewal date. You can cancel auto-renewal at any time through your
              account settings.
            </p>

            <h3 className='text-xl font-medium mb-2 mt-4'>
              4.4 Failed Payments
            </h3>
            <p>
              If payment fails, we may suspend access to premium features until
              payment is successfully processed.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              5. User Conduct
            </h2>
            <p className='mb-3'>You agree not to:</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>
                Use automated systems to access the Service without permission
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              6. Intellectual Property
            </h2>
            <p>
              All content, features, and functionality of the Service, including
              but not limited to text, graphics, logos, icons, images, audio
              clips, and software, are the exclusive property of TrackAll Food
              and are protected by international copyright, trademark, patent,
              trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              7. Medical Disclaimer
            </h2>
            <p className='mb-3'>
              <strong>IMPORTANT:</strong> The information provided by TrackAll
              Food is for informational purposes only and is not intended as a
              substitute for professional medical advice, diagnosis, or
              treatment.
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                Always seek the advice of your physician or qualified health
                provider
              </li>
              <li>
                Never disregard professional medical advice because of
                information from our Service
              </li>
              <li>
                In case of a medical emergency, call your doctor or emergency
                services immediately
              </li>
              <li>We do not provide medical advice, diagnosis, or treatment</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              8. Disclaimer of Warranties
            </h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
              NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              9. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TrackAll Food SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
              INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
              GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              10. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold harmless TrackAll Food and its
              officers, directors, employees, and agents from any claims,
              damages, losses, liabilities, and expenses (including legal fees)
              arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              11. Third-Party Services
            </h2>
            <p>
              Our Service may contain links to third-party websites or services
              (including Razorpay for payments and OpenAI for AI features). We
              are not responsible for the content, privacy policies, or
              practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              12. Modifications to Service
            </h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the
              Service (or any part thereof) at any time with or without notice.
              We shall not be liable to you or any third party for any
              modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              13. Changes to Terms
            </h2>
            <p>
              We may revise these Terms and Conditions at any time. The most
              current version will always be posted on our website. By
              continuing to use the Service after revisions become effective,
              you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              14. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of India, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              15. Dispute Resolution
            </h2>
            <p>
              Any disputes arising from these Terms or the Service shall be
              resolved through binding arbitration in accordance with the
              Arbitration and Conciliation Act, 1996.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
              16. Contact Information
            </h2>
            <p className='mb-3'>
              For questions about these Terms and Conditions, please contact us
              at:
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

export default TermsAndConditions;
