import { motion } from 'framer-motion';

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
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label}
        </label>
      )}

      <div className='relative'>
        {icon && (
          <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'>
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
            w-full px-4 py-3 rounded-xl border-2 border-gray-200
            focus:border-green-500 focus:outline-none
            transition-colors duration-200
            ${icon ? 'pl-12' : ''}
            ${unit ? 'pr-16' : ''}
            ${error ? 'border-red-500' : ''}
          `}
          {...props}
        />

        {unit && (
          <div className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium'>
            {unit}
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-1 text-sm text-red-500'>
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
