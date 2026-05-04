import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  danger:  'bg-red-500 hover:bg-red-600 text-white',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost:   'hover:bg-gray-100 text-gray-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {loading && <Loader2 size={14} className="animate-spin" />}
    {children}
  </button>
);

export default Button;
