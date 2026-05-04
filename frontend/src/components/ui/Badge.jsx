const Badge = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}
  >
    {children}
  </span>
);

export default Badge;
