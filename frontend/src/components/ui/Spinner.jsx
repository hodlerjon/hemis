import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 24, className = '' }) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <Loader2 size={size} className="animate-spin text-blue-600" />
  </div>
);

export default Spinner;
