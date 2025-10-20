import { motion } from 'framer-motion';
import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6 text-gray-900'>Contact Us</h1>
        <p className='text-lg text-gray-600 mb-8'>
          We'd love to hear from you! Whether you have questions, feedback, or
          need support, feel free to reach out to us.
        </p>

        <div className='grid md:grid-cols-2 gap-8 mb-12'>
          {/* Contact Information */}
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-semibold mb-4 text-gray-900'>
                Get in Touch
              </h2>
              <div className='space-y-4'>
                <div className='flex items-start space-x-4'>
                  <div className='bg-emerald-100 p-3 rounded-lg'>
                    <svg
                      className='w-6 h-6 text-emerald-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Email</h3>
                    <p className='text-gray-600'>support@trackall.food</p>
                    <p className='text-sm text-gray-500 mt-1'>
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <div className='bg-emerald-100 p-3 rounded-lg'>
                    <svg
                      className='w-6 h-6 text-emerald-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Website</h3>
                    <a
                      href='https://www.trackall.food'
                      className='text-emerald-600 hover:text-emerald-700'>
                      www.trackall.food
                    </a>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <div className='bg-emerald-100 p-3 rounded-lg'>
                    <svg
                      className='w-6 h-6 text-emerald-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      Business Hours
                    </h3>
                    <p className='text-gray-600'>
                      Monday - Friday: 9:00 AM - 6:00 PM IST
                    </p>
                    <p className='text-gray-600'>
                      Saturday - Sunday: 10:00 AM - 4:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-emerald-50 p-6 rounded-lg'>
              <h3 className='font-semibold text-gray-900 mb-3'>
                Frequently Asked Questions
              </h3>
              <p className='text-gray-600 text-sm mb-3'>
                Before reaching out, check our FAQ section for quick answers to
                common questions about:
              </p>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• Account setup and management</li>
                <li>• Subscription and billing</li>
                <li>• Food logging and tracking</li>
                <li>• Premium features</li>
                <li>• Technical troubleshooting</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-2xl font-semibold mb-4 text-gray-900'>
                Send us a Message
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center'>
                  <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <svg
                      className='w-8 h-8 text-emerald-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Message Sent!
                  </h3>
                  <p className='text-gray-600'>
                    Thank you for contacting us. We'll get back to you within
                    24-48 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Name *
                    </label>
                    <Input
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder='Your full name'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Email *
                    </label>
                    <Input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder='your.email@example.com'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Subject *
                    </label>
                    <Input
                      type='text'
                      name='subject'
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder='What is this regarding?'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Message *
                    </label>
                    <textarea
                      name='message'
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none'
                      placeholder='Please provide details about your inquiry...'
                    />
                  </div>

                  <Button type='submit' className='w-full'>
                    Send Message
                  </Button>

                  <p className='text-xs text-gray-500 text-center'>
                    * Required fields. We respect your privacy and will never
                    share your information.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Additional Support Options */}
        <div className='bg-gray-50 rounded-lg p-6'>
          <h2 className='text-2xl font-semibold mb-4 text-gray-900'>
            Other Ways to Get Help
          </h2>
          <div className='grid md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='bg-white p-4 rounded-lg shadow-sm'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <svg
                    className='w-6 h-6 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <h3 className='font-semibold mb-2'>Documentation</h3>
                <p className='text-sm text-gray-600'>
                  Browse our comprehensive guides and tutorials
                </p>
              </div>
            </div>

            <div className='text-center'>
              <div className='bg-white p-4 rounded-lg shadow-sm'>
                <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <svg
                    className='w-6 h-6 text-purple-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z'
                    />
                  </svg>
                </div>
                <h3 className='font-semibold mb-2'>Community Forum</h3>
                <p className='text-sm text-gray-600'>
                  Connect with other users and share experiences
                </p>
              </div>
            </div>

            <div className='text-center'>
              <div className='bg-white p-4 rounded-lg shadow-sm'>
                <div className='w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <svg
                    className='w-6 h-6 text-orange-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='font-semibold mb-2'>Help Center</h3>
                <p className='text-sm text-gray-600'>
                  Access in-app help and troubleshooting guides
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Inquiries */}
        <div className='mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6'>
          <h2 className='text-2xl font-semibold mb-3 text-gray-900'>
            Business Inquiries
          </h2>
          <p className='text-gray-600 mb-4'>
            For partnership opportunities, media inquiries, or corporate
            wellness programs, please email us at:
          </p>
          <a
            href='mailto:business@trackall.food'
            className='text-emerald-600 font-semibold hover:text-emerald-700'>
            business@trackall.food
          </a>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default ContactUs;
