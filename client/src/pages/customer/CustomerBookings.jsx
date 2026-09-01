import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import { bookingApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/client';
import { Loader, ErrorState, EmptyState, StatusBadge } from '../../components/Feedback';
import { format } from 'date-fns';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    bookingApi
      .mine()
      .then(({ data }) => setBookings(data.bookings))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900 mb-6">My bookings</h1>
      {bookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No bookings yet" description="Once you accept a quote, it'll show up here as a booking." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={b._id} to={`/customer/bookings/${b._id}`} className="blueprint-card p-4 flex items-center justify-between gap-4 block">
              <div className="min-w-0">
                <p className="font-medium text-ink-900 truncate">{b.serviceRequest?.title}</p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {b.technician?.name} · {format(new Date(b.createdAt), 'd MMM yyyy')}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
