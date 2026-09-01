import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IndianRupee, Clock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceRequestApi } from '../../api/serviceRequestApi';
import { quoteApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/client';
import { Loader, ErrorState, EmptyState, StatusBadge } from '../../components/Feedback';
import StarRating from '../../components/StarRating';
import VerifiedStamp from '../../components/VerifiedStamp';

const RequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [reqRes, quotesRes] = await Promise.all([
        serviceRequestApi.getById(id),
        quoteApi.forRequest(id),
      ]);
      setRequest(reqRes.data.request);
      setQuotes(quotesRes.data.quotes);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (quoteId) => {
    setAcceptingId(quoteId);
    try {
      await quoteApi.accept(quoteId);
      toast.success('Quote accepted! A booking has been created.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return <Loader label="Loading request…" />;
  if (error) return <ErrorState message={error} />;
  if (!request) return null;

  const sortedQuotes = [...quotes].sort((a, b) => a.estimatedPrice - b.estimatedPrice);

  return (
    <div>
      <div className="blueprint-card p-6 mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-xl font-semibold text-ink-900">{request.title}</h1>
            <p className="text-xs text-ink-400 mt-0.5">{request.category?.name}{request.subcategory ? ` · ${request.subcategory}` : ''}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <p className="text-sm text-ink-600">{request.description}</p>
        {request.images?.length > 0 && (
          <div className="flex gap-2 mt-4">
            {request.images.map((src, i) => (
              <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-ink-100" />
            ))}
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold text-ink-900 mb-4">
        {request.status === 'booked' ? 'Booking confirmed' : `Quotes (${sortedQuotes.length})`}
      </h2>

      {request.status === 'booked' ? (
        <div className="blueprint-card p-6 text-center">
          <ShieldCheck size={28} className="text-teal-500 mx-auto mb-2" />
          <p className="text-ink-700 font-medium mb-1">A technician has been booked for this request.</p>
          <Link to="/customer/bookings" className="text-brass-600 text-sm font-medium hover:underline">
            View your bookings →
          </Link>
        </div>
      ) : sortedQuotes.length === 0 ? (
        <EmptyState title="No quotes yet" description="Sit tight — nearby technicians have been notified and quotes typically arrive within a few hours." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {sortedQuotes.map((q) => (
            <div key={q._id} className="blueprint-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink-900">{q.technician?.name}</p>
                {q.technicianStats?.verifiedJobs > 0 && (
                  <VerifiedStamp label={`${q.technicianStats.verifiedJobs} Verified`} size="sm" />
                )}
              </div>
              <StarRating rating={q.technicianStats?.averageRating || 0} count={q.technicianStats?.reviewCount} size={13} />
              {q.technicianHeadline && <p className="text-xs text-ink-400">{q.technicianHeadline}</p>}

              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-ink-50">
                <div>
                  <p className="text-xs text-ink-400">Estimated price</p>
                  <p className="font-mono font-semibold text-ink-800 flex items-center"><IndianRupee size={13} />{q.estimatedPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">Visit charge</p>
                  <p className="font-mono font-semibold text-ink-800 flex items-center"><IndianRupee size={13} />{q.visitCharge}</p>
                </div>
                {q.estimatedArrival && (
                  <div className="col-span-2">
                    <p className="text-xs text-ink-400 flex items-center gap-1"><Clock size={11} /> Arrival</p>
                    <p className="text-sm text-ink-700">{q.estimatedArrival}</p>
                  </div>
                )}
              </div>

              {q.message && <p className="text-sm text-ink-600 italic">"{q.message}"</p>}

              <button
                onClick={() => handleAccept(q._id)}
                disabled={acceptingId === q._id}
                className="btn-brass mt-2"
              >
                {acceptingId === q._id ? 'Accepting…' : 'Accept this quote'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestDetail;
