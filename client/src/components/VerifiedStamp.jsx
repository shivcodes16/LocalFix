import { ShieldCheck } from 'lucide-react';

/**
 * The product's signature visual: a rotated, ink-stamp-style badge used
 * consistently wherever trust needs to be asserted — technician cards,
 * booking status timelines, and service passport entries.
 */
const VerifiedStamp = ({ label = 'Verified Job', size = 'md', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'text-[0.62rem] px-2 py-0.5' : 'text-[0.68rem] px-2.5 py-1';
  return (
    <span className={`verified-stamp ${sizeClasses} ${className}`}>
      <ShieldCheck size={size === 'sm' ? 12 : 14} strokeWidth={2.5} />
      {label}
    </span>
  );
};

export default VerifiedStamp;
