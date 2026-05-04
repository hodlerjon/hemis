import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, children, required, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
        error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;
