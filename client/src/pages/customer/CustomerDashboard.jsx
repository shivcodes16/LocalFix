import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, CalendarCheck, Search, ShieldCheck } from 'lucide-react';
import { serviceRequestApi } from '../../api/serviceRequestApi';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { Loader, StatusBadge } from '../../components/Feedback';
import { format } from 'date-fns';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([serviceRequestApi.mine({ limit: 4 }), bookingApi.mine({ limit: 4 })])
      .then(([reqRes, bookRes]) => {
        setRequests(reqRes.data.requests);
        setBookings(bookRes.data.bookings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeBookingsCount = bookings.filter((b) => !['verified', 'cancelled', 'disputed'].includes(b.status)).length;
  const verifiedCount = bookings.filter((b) => b.status === 'verified').length;

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900 mb-1">Hi {user?.name?.split(' ')[0]},</h1>
      <p className="text-ink-500 mb-8">Here's what's happening with your services.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="blueprint-card p-5">
          <p className="text-xs text-ink-400 mb-1">Open requests</p>
          <p className="text-2xl font-semibold text-ink-900 font-mono">{requests.filter((r) => r.status === 'open' || r.status === 'quoted').length}</p>
        </div>
        <div className="blueprint-card p-5">
          <p className="text-xs text-ink-400 mb-1">Active bookings</p>
          <p className="text-2xl font-semibold text-ink-900 font-mono">{activeBookingsCount}</p>
        </div>
        <div className="blueprint-card p-5">
          <p className="text-xs text-ink-400 mb-1 flex items-center gap-1"><ShieldCheck size={12} /> Verified jobs</p>
          <p className="text-2xl font-semibold text-ink-900 font-mono">{verifiedCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <Link to="/customer/new-request" className="btn-brass !py-2.5 !px-4 text-sm">
          <Plus size={16} /> New service request
        </Link>
        <Link to="/find-technicians" className="btn-secondary !py-2.5 !px-4 text-sm">
          <Search size={16} /> Browse technicians
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink-900">Recent requests</h2>
            <Link to="/customer/requests" className="text-sm text-brass-600 hover:underline">View all</Link>
          </div>
          {requests.length === 0 ? (
            <p className="text-sm text-ink-400">No requests yet.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <Link key={r._id} to={`/customer/requests/${r._id}`} className="blueprint-card p-4 flex items-center justify-between gap-3 block">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{r.title}</p>
                    <p className="text-xs text-ink-400">{format(new Date(r.createdAt), 'd MMM')}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink-900">Recent bookings</h2>
            <Link to="/customer/bookings" className="text-sm text-brass-600 hover:underline">View all</Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-ink-400">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <Link key={b._id} to={`/customer/bookings/${b._id}`} className="blueprint-card p-4 flex items-center justify-between gap-3 block">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{b.serviceRequest?.title}</p>
                    <p className="text-xs text-ink-400">{b.technician?.name}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
