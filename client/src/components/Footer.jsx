import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-[#1a1d2e] text-gray-300 py-12 mt-auto'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-8 mb-8'>
          {/* Company Info */}
          <div className='md:col-span-1'>
            <div className='mb-4'>
              <Logo />
            </div>
            <p className='text-sm text-gray-400 leading-relaxed'>
              Advanced AI-powered nutrition tracking for a healthier you.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className='text-white font-semibold mb-4 text-base'>Product</h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  to='/dashboard'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to='/upgrade'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className='text-gray-400 hover:text-white transition-colors'>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className='text-white font-semibold mb-4 text-base'>Company</h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  to='/'
                  className='text-gray-400 hover:text-white transition-colors'>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to='/privacy-policy'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - All Policy Pages */}
          <div>
            <h3 className='text-white font-semibold mb-4 text-base'>Legal</h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  to='/terms-and-conditions'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to='/cancellation-refund'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Cancellation & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to='/shipping'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className='text-white font-semibold mb-4 text-base'>Connect</h3>
            <div className='flex gap-3'>
              <a
                href='https://twitter.com/trackall_food'
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-[#2a2d3e] rounded-full flex items-center justify-center hover:bg-[#3a3d4e] transition-colors group'
                aria-label='Twitter'>
                <span className='text-gray-400 group-hover:text-white font-semibold'>
                  T
                </span>
              </a>
              <a
                href='https://instagram.com/trackall.food'
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-[#2a2d3e] rounded-full flex items-center justify-center hover:bg-[#3a3d4e] transition-colors group'
                aria-label='Instagram'>
                <span className='text-gray-400 group-hover:text-white font-semibold'>
                  I
                </span>
              </a>
              <a
                href='https://linkedin.com/company/trackall-food'
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-[#2a2d3e] rounded-full flex items-center justify-center hover:bg-[#3a3d4e] transition-colors group'
                aria-label='LinkedIn'>
                <span className='text-gray-400 group-hover:text-white font-semibold'>
                  L
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-sm text-gray-500'>
            © {currentYear} trackall.food. All rights reserved.
          </p>
          <div className='flex flex-wrap justify-center gap-4 md:gap-6 text-sm'>
            <Link
              to='/terms-and-conditions'
              className='text-gray-500 hover:text-white transition-colors'>
              Terms
            </Link>
            <Link
              to='/privacy-policy'
              className='text-gray-500 hover:text-white transition-colors'>
              Privacy
            </Link>
            <Link
              to='/shipping'
              className='text-gray-500 hover:text-white transition-colors'>
              Shipping
            </Link>
            <Link
              to='/cancellation-refund'
              className='text-gray-500 hover:text-white transition-colors'>
              Refunds
            </Link>
            <Link
              to='/contact'
              className='text-gray-500 hover:text-white transition-colors'>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
