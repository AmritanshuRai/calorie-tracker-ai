export default function Card({
  children,
  className = '',
  onClick,
  variant = 'default',
  padding = 'md',
  hoverable = false,
}) {
  const variants = {
    default:
      'bg-white border-2 border-slate-300 shadow-lg hover:shadow-xl hover:border-emerald-400 transition-all duration-300',
    glass:
      'bg-white/95 backdrop-blur-md border-2 border-slate-300/50 shadow-xl',
    premium:
      'bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-300 shadow-xl shadow-purple-500/20',
    gradient:
      'bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-emerald-600 shadow-xl text-white',
    outline:
      'bg-white border-2 border-slate-400 hover:border-emerald-500 hover:shadow-lg shadow-md',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5 lg:p-7',
    lg: 'p-7 lg:p-9',
  };

  const baseStyles = 'rounded-2xl transition-all duration-300';
  const hoverStyles =
    hoverable || onClick
      ? 'cursor-pointer hover:scale-[1.03] hover:-translate-y-2 active:scale-[0.98]'
      : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
}
