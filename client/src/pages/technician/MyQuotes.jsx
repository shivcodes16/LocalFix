import { useEffect, useState } from 'react';
import { Send, IndianRupee } from 'lucide-react';
import { quoteApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/client';
import { Loader, ErrorState, EmptyState, StatusBadge } from '../../components/Feedback';
import { format } from 'date-fns';

const MyQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    quoteApi
      .mine()
      .then(({ data }) => setQuotes(data.quotes))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900 mb-6">My quotes</h1>
      {quotes.length === 0 ? (
        <EmptyState icon={Send} title="No quotes sent yet" description="Browse open requests to send your first quote." />
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q._id} className="blueprint-card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-ink-900 truncate">{q.serviceRequest?.title}</p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {q.serviceRequest?.category?.name} · {format(new Date(q.createdAt), 'd MMM yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-sm text-ink-700 flex items-center"><IndianRupee size={13} />{q.estimatedPrice}</span>
                <StatusBadge status={q.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQuotes;
