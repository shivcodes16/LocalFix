import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Send, ShieldCheck, Star } from 'lucide-react';
import { technicianApi } from '../../api/miscApi';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { Loader, StatusBadge } from '../../components/Feedback';
import StarRating from '../../components/StarRating';
import { format } from 'date-fns';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([technicianApi.getMyProfile(), bookingApi.mine({ limit: 5 })])
      .then(([profRes, bookRes]) => {
        setProfile(profRes.data.profile);
        setBookings(bookRes.data.bookings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const stats = profile?.stats || {};

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900 mb-1">Hi {user?.name?.split(' ')[0]},</h1>
      <p className="text-ink-500 mb-8">Here's how your work is performing.</p>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="blueprint-card p-5">
          <p className="text-xs text-ink-400 mb-1">Completed jobs</p>
          <p className="text-2xl font-semibold text-ink-900 font-mono">{stats.completedJobs || 0}</p>
        </div>
        <div className="blueprint-card p-5">
          <p className="text-xs text-ink-400 mb-1 flex items-center gap-1"><ShieldCheck size={12} /> Verified jobs</p>
          <p className="text-2xl font-semibold text-ink-900 font-mono">{stats.verifiedJobs || 0}</p>
        </div>
        <div className="blueprint-card p-5">
          <p className="text-xs text-ink-400 mb-1 flex items-center gap-1"><Star size={12} /> Rating</p>
          <StarRating rating={stats.averageRating || 0} count={stats.reviewCount} />
        </div>
        <div className="blueprint-card p-5">
          <p className="text-xs text-ink-400 mb-1">Repeat customers</p>
          <p className="text-2xl font-semibold text-ink-900 font-mono">{stats.repeatCustomerCount || 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <Link to="/technician/requests" className="btn-brass !py-2.5 !px-4 text-sm">
          <ClipboardList size={16} /> Browse open requests
        </Link>
        <Link to="/technician/quotes" className="btn-secondary !py-2.5 !px-4 text-sm">
          <Send size={16} /> My quotes
        </Link>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-ink-900">Recent bookings</h2>
        <Link to="/technician/bookings" className="text-sm text-brass-600 hover:underline">View all</Link>
      </div>
      {bookings.length === 0 ? (
        <p className="text-sm text-ink-400">No bookings yet.</p>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <Link key={b._id} to={`/technician/bookings/${b._id}`} className="blueprint-card p-4 flex items-center justify-between gap-3 block">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-800 truncate">{b.serviceRequest?.title}</p>
                <p className="text-xs text-ink-400">{b.customer?.name} · {format(new Date(b.createdAt), 'd MMM')}</p>
              </div>
              <StatusBadge status={b.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
