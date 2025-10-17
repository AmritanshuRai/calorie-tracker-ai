const CircularProgress = ({
  value,
  max,
  size = 120,
  strokeWidth = 12,
  label,
  unit,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative' style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className='transform -rotate-90' width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke='#f5f5f5'
            strokeWidth={strokeWidth}
            fill='none'
          />
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient
              id='progressGradient'
              x1='0%'
              y1='0%'
              x2='100%'
              y2='100%'>
              <stop offset='0%' stopColor='#22c55e' />
              <stop offset='100%' stopColor='#16a34a' />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke='url(#progressGradient)'
            strokeWidth={strokeWidth}
            fill='none'
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Center text */}
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-3xl sm:text-4xl font-bold text-neutral-900'>
            {Math.round(value)}
          </span>
          {unit && (
            <span className='text-xs text-neutral-500 font-medium'>{unit}</span>
          )}
        </div>
      </div>

      {label && (
        <span className='text-sm font-medium text-neutral-600'>{label}</span>
      )}
    </div>
  );
};

export default CircularProgress;
