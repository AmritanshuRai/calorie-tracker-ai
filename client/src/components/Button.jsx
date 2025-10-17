export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}) {
  const baseStyles =
    'font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]';

  const variants = {
    primary:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md disabled:bg-neutral-300 disabled:cursor-not-allowed',
    secondary:
      'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 focus:ring-green-500 disabled:border-neutral-300 disabled:text-neutral-400',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-300',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}>
      {children}
    </button>
  );
}
