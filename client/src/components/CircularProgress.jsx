const CircularProgress = ({
  value = 0,
  max,
  size = 'md',
  strokeWidth,
  label,
  unit,
  color = 'emerald',
  showValue = true,
}) => {
  // Handle size variants
  const sizeMap = {
    sm: { dimension: 80, stroke: 8 },
    md: { dimension: 120, stroke: 12 },
    lg: { dimension: 160, stroke: 14 },
  };

  const sizeConfig =
    typeof size === 'string'
      ? sizeMap[size] || sizeMap.md
      : { dimension: size, stroke: strokeWidth || 12 };
  const dimension = sizeConfig.dimension;
  const stroke = strokeWidth || sizeConfig.stroke;

  const radius = (dimension - stroke) / 2;
  const circumference = radius * 2 * Math.PI;

  // Calculate percentage - if max is provided, calculate from value/max, otherwise use value as percentage
  const percentage = max
    ? Math.min((value / max) * 100, 100)
    : Math.min(value, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  const colorGradients = {
    emerald: { start: '#059669', end: '#047857', bg: '#e8f5e9' },
    blue: { start: '#2563eb', end: '#1d4ed8', bg: '#e3f2fd' },
    orange: { start: '#ea580c', end: '#c2410c', bg: '#fff3e0' },
    green: { start: '#16a34a', end: '#15803d', bg: '#e8f5e9' },
    yellow: { start: '#ca8a04', end: '#a16207', bg: '#fffde7' },
    purple: { start: '#9333ea', end: '#7e22ce', bg: '#f3e5f5' },
    white: { start: '#ffffff', end: '#f1f5f9', bg: 'rgba(255, 255, 255, 0.1)' },
  };

  const selectedGradient = colorGradients[color] || colorGradients.emerald;

  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative' style={{ width: dimension, height: dimension }}>
        {/* Background circle with solid color for better visibility */}
        <div
          className='absolute inset-0 rounded-full'
          style={{
            background: selectedGradient.bg,
            width: dimension,
            height: dimension,
          }}
        />

        <svg
          className='transform -rotate-90 relative z-10'
          width={dimension}
          height={dimension}>
          {/* Background circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={color === 'white' ? 'rgba(255, 255, 255, 0.3)' : '#94a3b8'}
            strokeWidth={stroke}
            fill='none'
          />
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor={selectedGradient.start} />
              <stop offset='100%' stopColor={selectedGradient.end} />
            </linearGradient>
          </defs>
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            fill='none'
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
            }}
          />
        </svg>

        {/* Center text */}
        {showValue && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-20'>
            <span
              className={`font-black ${
                size === 'sm'
                  ? 'text-xl'
                  : size === 'lg'
                  ? 'text-4xl'
                  : 'text-3xl'
              } ${
                color === 'white'
                  ? 'text-white drop-shadow-md'
                  : 'text-slate-900'
              }`}>
              {Math.round(max ? value : percentage)}
            </span>
            {unit && (
              <span
                className={`text-sm font-bold mt-0.5 ${
                  color === 'white'
                    ? 'text-white/90 drop-shadow'
                    : 'text-slate-700'
                }`}>
                {unit}
              </span>
            )}
          </div>
        )}
      </div>

      {label && (
        <span className='text-sm font-semibold text-slate-700'>{label}</span>
      )}
    </div>
  );
};

export default CircularProgress;
