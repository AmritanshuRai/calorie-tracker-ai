import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PageLayout = ({ children, title, showBack = false, rightAction }) => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-b from-green-50 to-white'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200'>
        <div className='max-w-md mx-auto px-6 py-4 flex items-center justify-between'>
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className='flex items-center gap-2 text-gray-600 hover:text-gray-800'>
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {title && (
            <h1 className='text-lg font-semibold text-gray-800'>{title}</h1>
          )}

          {rightAction || <div />}
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className='max-w-md mx-auto px-6 py-8'>
        {children}
      </motion.div>
    </div>
  );
};

export default PageLayout;
