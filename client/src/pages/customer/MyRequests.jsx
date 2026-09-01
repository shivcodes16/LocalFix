import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { serviceRequestApi } from '../../api/serviceRequestApi';
import { getErrorMessage } from '../../api/client';
import { Loader, ErrorState, EmptyState, StatusBadge } from '../../components/Feedback';
import { format } from 'date-fns';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    serviceRequestApi
      .mine()
      .then(({ data }) => setRequests(data.requests))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">My requests</h1>
        <Link to="/customer/new-request" className="btn-brass !py-2 !px-3.5 text-sm">
          <Plus size={16} /> New request
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No requests yet"
          description="Post your first service request to start getting quotes from local technicians."
          action={
            <Link to="/customer/new-request" className="btn-brass !py-2 !px-3.5 text-sm">
              <Plus size={16} /> New request
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link key={r._id} to={`/customer/requests/${r._id}`} className="blueprint-card p-4 flex items-center justify-between gap-4 block">
              <div className="min-w-0">
                <p className="font-medium text-ink-900 truncate">{r.title}</p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {r.category?.name} · {format(new Date(r.createdAt), 'd MMM yyyy')}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
