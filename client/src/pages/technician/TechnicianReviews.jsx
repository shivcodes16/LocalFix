import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewApi } from '../../api/reviewApi';
import { technicianApi } from '../../api/miscApi';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';
import { Loader, ErrorState, EmptyState } from '../../components/Feedback';
import StarRating from '../../components/StarRating';

const ReplyForm = ({ reviewId, onReplied }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await reviewApi.reply(reviewId, text);
      toast.success('Reply posted.');
      onReplied();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} className="input-field text-sm" placeholder="Write a reply…" />
      <button type="submit" disabled={submitting} className="btn-secondary !py-2 !px-3 text-sm shrink-0">
        {submitting ? '…' : 'Reply'}
      </button>
    </form>
  );
};

const TechnicianReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    reviewApi
      .forTechnician(user._id, { limit: 50 })
      .then(({ data }) => setReviews(data.reviews))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user._id]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900 mb-6">Reviews</h1>
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Reviews from verified jobs will appear here." />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="blueprint-card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-ink-800">{r.customer?.name}</p>
                <StarRating rating={r.rating} showValue={false} size={14} />
              </div>
              {r.comment && <p className="text-sm text-ink-600">{r.comment}</p>}
              {r.technicianReply?.text ? (
                <div className="mt-3 ml-4 pl-3 border-l-2 border-brass-200">
                  <p className="text-xs font-semibold text-ink-500 mb-0.5">Your reply</p>
                  <p className="text-sm text-ink-600">{r.technicianReply.text}</p>
                </div>
              ) : (
                <ReplyForm reviewId={r._id} onReplied={load} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianReviews;
