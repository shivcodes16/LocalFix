import { useEffect, useState } from 'react';
import { IndianRupee, Clock, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { serviceRequestApi } from '../../api/serviceRequestApi';
import { quoteApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/client';
import { Loader, ErrorState, EmptyState } from '../../components/Feedback';

const QuoteForm = ({ requestId, onSubmitted }) => {
  const [form, setForm] = useState({ estimatedPrice: '', visitCharge: '', estimatedArrival: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.estimatedPrice) {
      toast.error('Please enter an estimated price.');
      return;
    }
    setSubmitting(true);
    try {
      await quoteApi.submit({ serviceRequestId: requestId, ...form });
      toast.success('Quote submitted!');
      onSubmitted();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-ink-50 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          min={0}
          placeholder="Estimated price (₹)"
          value={form.estimatedPrice}
          onChange={(e) => setForm({ ...form, estimatedPrice: e.target.value })}
          className="input-field text-sm"
          required
        />
        <input
          type="number"
          min={0}
          placeholder="Visit charge (₹)"
          value={form.visitCharge}
          onChange={(e) => setForm({ ...form, visitCharge: e.target.value })}
          className="input-field text-sm"
        />
      </div>
      <input
        placeholder="Estimated arrival (e.g. Today, 4-6 PM)"
        value={form.estimatedArrival}
        onChange={(e) => setForm({ ...form, estimatedArrival: e.target.value })}
        className="input-field text-sm"
      />
      <textarea
        placeholder="Message to customer (optional)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="input-field text-sm"
        rows={2}
      />
      <button type="submit" disabled={submitting} className="btn-brass !py-2 !px-3.5 text-sm">
        {submitting ? 'Submitting…' : 'Submit quote'}
      </button>
    </form>
  );
};

const OpenRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFormId, setActiveFormId] = useState(null);
  const [quoted, setQuoted] = useState(new Set());

  const load = () => {
    serviceRequestApi
      .open()
      .then(({ data }) => setRequests(data.requests))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmitted = (id) => {
    setQuoted((s) => new Set(s).add(id));
    setActiveFormId(null);
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900 mb-1">Open requests</h1>
      <p className="text-ink-500 text-sm mb-6">Requests in your service categories that are open for quotes.</p>

      {requests.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No open requests right now" description="New requests matching your categories will show up here." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {requests.map((r) => (
            <div key={r._id} className="blueprint-card p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-ink-900">{r.title}</p>
              </div>
              <p className="text-xs text-ink-400 mb-2">
                {r.category?.name} · {r.customer?.name} · {format(new Date(r.createdAt), 'd MMM')}
              </p>
              <p className="text-sm text-ink-600 line-clamp-3">{r.description}</p>
              {r.location?.city && (
                <p className="text-xs text-ink-400 mt-2 flex items-center gap-1"><Clock size={11} /> {r.location.city}</p>
              )}

              {quoted.has(r._id) ? (
                <p className="text-sm text-teal-600 font-medium mt-4">Quote submitted ✓</p>
              ) : activeFormId === r._id ? (
                <QuoteForm requestId={r._id} onSubmitted={() => handleSubmitted(r._id)} />
              ) : (
                <button onClick={() => setActiveFormId(r._id)} className="btn-secondary !py-2 !px-3.5 text-sm mt-4">
                  <IndianRupee size={14} /> Send a quote
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenRequests;
