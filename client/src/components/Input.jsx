const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  unit,
  min,
  max,
  step,
  className = '',
  helperText,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className='block text-sm font-semibold text-slate-700 mb-2'>
          {label}
        </label>
      )}

      <div className='relative'>
        {icon && (
          <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400'>
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`
            w-full px-4 py-3.5 rounded-xl border-2 
            bg-white text-slate-700 font-medium
            placeholder:text-slate-400 placeholder:font-normal
            transition-all duration-200
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
            }
            focus:outline-none
            ${icon ? 'pl-12' : ''}
            ${unit ? 'pr-16' : ''}
            hover:border-slate-300
          `}
          {...props}
        />

        {unit && (
          <div className='absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold text-sm'>
            {unit}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className='mt-1.5 text-xs text-slate-500'>{helperText}</p>
      )}

      {error && (
        <p className='mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1'>
          <svg
            className='w-4 h-4'
            fill='currentColor'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
