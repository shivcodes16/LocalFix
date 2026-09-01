import { Loader2, Inbox, AlertTriangle } from 'lucide-react';

export const Loader = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-ink-400 gap-3">
    <Loader2 className="animate-spin" size={28} />
    <p className="text-sm">{label}</p>
  </div>
);

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-ink-200 rounded-card bg-paper-soft">
    <div className="w-12 h-12 rounded-full bg-ink-50 flex items-center justify-center mb-4">
      <Icon size={22} className="text-ink-400" />
    </div>
    <h3 className="text-lg font-semibold text-ink-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-ink-400 max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong.' }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <AlertTriangle size={28} className="text-rust-500 mb-3" />
    <p className="text-sm text-ink-500 max-w-sm">{message}</p>
  </div>
);

const STATUS_STYLES = {
  // service requests
  open: 'bg-brass-50 text-brass-700',
  quoted: 'bg-teal-50 text-teal-700',
  booked: 'bg-ink-100 text-ink-700',
  cancelled: 'bg-rust-50 text-rust-600',
  expired: 'bg-ink-100 text-ink-400',
  // bookings
  pending_start: 'bg-brass-50 text-brass-700',
  in_progress: 'bg-teal-50 text-teal-700',
  completed_by_technician: 'bg-ink-100 text-ink-700',
  verified: 'bg-teal-100 text-teal-700',
  disputed: 'bg-rust-50 text-rust-600',
  // quotes
  pending: 'bg-brass-50 text-brass-700',
  accepted: 'bg-teal-50 text-teal-700',
  rejected: 'bg-ink-100 text-ink-400',
  withdrawn: 'bg-ink-100 text-ink-400',
};

const STATUS_LABELS = {
  open: 'Open',
  quoted: 'Quoted',
  booked: 'Booked',
  cancelled: 'Cancelled',
  expired: 'Expired',
  pending_start: 'Awaiting start',
  in_progress: 'In progress',
  completed_by_technician: 'Marked complete',
  verified: 'Verified',
  disputed: 'Disputed',
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
};

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_STYLES[status] || 'bg-ink-100 text-ink-500'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);
