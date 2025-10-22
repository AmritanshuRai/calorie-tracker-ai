import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Footer from './Footer';

const PageLayout = ({ children, title, showBack = false, rightAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const isUpgradePage = location.pathname === '/upgrade';
  const isFullWidth = isAdminPage || isUpgradePage;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 flex flex-col'>
      {/* Header */}
      <div className='sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200 shadow-sm'>
        <div
          className={`${
            isFullWidth ? 'w-full' : 'max-w-3xl'
          } mx-auto px-4 sm:px-6 py-4 flex items-center justify-between`}>
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className='flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-lg'>
              <ChevronLeft className='w-5 h-5' />
              <span className='font-medium'>Back</span>
            </button>
          ) : (
            <div />
          )}

          {title && (
            <h1 className='text-lg font-bold text-slate-800'>{title}</h1>
          )}

          {rightAction || <div />}
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 ${
          isFullWidth ? 'w-full' : 'max-w-3xl mx-auto px-4 sm:px-6 py-8'
        }`}>
        {children}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PageLayout;
