import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { IndianRupee, CheckCircle2, AlertCircle, Star, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { bookingApi } from '../../api/bookingApi';
import { reviewApi } from '../../api/reviewApi';
import { getErrorMessage } from '../../api/client';
import { Loader, ErrorState, StatusBadge } from '../../components/Feedback';
import VerifiedStamp from '../../components/VerifiedStamp';

const STEPS = ['pending_start', 'in_progress', 'completed_by_technician', 'verified'];
const STEP_LABELS = {
  pending_start: 'Booked',
  in_progress: 'In progress',
  completed_by_technician: 'Marked complete',
  verified: 'Verified',
};

const BookingTimeline = ({ status }) => {
  const currentIndex = STEPS.indexOf(status);
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i <= currentIndex ? 'bg-teal-500 text-white' : 'bg-ink-100 text-ink-400'
              }`}
            >
              {i + 1}
            </div>
            <span className="text-[0.68rem] text-ink-500 text-center w-16">{STEP_LABELS[step]}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 ${i < currentIndex ? 'bg-teal-500' : 'bg-ink-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const CustomerBookingDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addToPassport, setAddToPassport] = useState(false);
  const [passportDetails, setPassportDetails] = useState({ productName: '', serviceType: '', cost: '' });

  const load = useCallback(async () => {
    try {
      const { data } = await bookingApi.getById(id);
      setBooking(data.booking);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const payload = { addToServicePassport: addToPassport };
      if (addToPassport) {
        payload.productName = passportDetails.productName;
        payload.serviceType = passportDetails.serviceType || 'Service completed';
        payload.cost = passportDetails.cost || undefined;
      }
      await bookingApi.confirm(id, payload);
      toast.success('Job verified! You can now leave a review.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  };

  const handleDispute = async () => {
    try {
      await bookingApi.dispute(id, { reason: disputeReason });
      toast.success('Dispute raised. The technician has been notified.');
      setShowDispute(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewApi.create({ bookingId: id, ...reviewForm });
      toast.success('Thanks for your review!');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;
  if (!booking) return null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{booking.serviceRequest?.title}</h1>
          <p className="text-sm text-ink-400 mt-0.5">with {booking.technician?.name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {!['cancelled', 'disputed'].includes(booking.status) && (
        <div className="blueprint-card p-6 mb-6">
          <BookingTimeline status={booking.status} />
        </div>
      )}

      <div className="blueprint-card p-6 mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-ink-400">Agreed price</p>
          <p className="font-mono font-semibold text-ink-800 flex items-center"><IndianRupee size={14} />{booking.finalPrice ?? booking.agreedPrice}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">Category</p>
          <p className="text-ink-800">{booking.category?.name}</p>
        </div>
      </div>

      {booking.technician?.phone && (
        <div className="blueprint-card p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-400">Your technician</p>
            <p className="font-medium text-ink-800">{booking.technician?.name}</p>
          </div>
          <a href={`tel:${booking.technician.phone}`} className="btn-brass !py-2 !px-3.5 text-sm shrink-0">
            <Phone size={15} /> Call Technician
          </a>
        </div>
      )}

      {booking.serviceNotes?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-ink-900 mb-3">Service notes</h2>
          <div className="space-y-3">
            {booking.serviceNotes.map((note, i) => (
              <div key={i} className="blueprint-card p-4">
                <p className="text-sm text-ink-700">{note.aiSummary || note.text}</p>
                <p className="text-xs text-ink-300 mt-1">{format(new Date(note.addedAt), "d MMM, h:mm a")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {booking.status === 'completed_by_technician' && (
        <div className="blueprint-card p-6 mb-6">
          <h2 className="font-semibold text-ink-900 mb-2 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-teal-500" /> Confirm job completion
          </h2>
          <p className="text-sm text-ink-500 mb-4">
            Your technician marked this job as done. Confirming will mark it as a <strong>verified job</strong> and
            let you leave a review.
          </p>

          <label className="flex items-center gap-2 text-sm text-ink-600 mb-3">
            <input type="checkbox" checked={addToPassport} onChange={(e) => setAddToPassport(e.target.checked)} className="accent-brass-500" />
            Log this in my Service Passport
          </label>

          {addToPassport && (
            <div className="grid sm:grid-cols-3 gap-2 mb-4">
              <input
                placeholder="Product/appliance name"
                value={passportDetails.productName}
                onChange={(e) => setPassportDetails({ ...passportDetails, productName: e.target.value })}
                className="input-field text-sm"
              />
              <input
                placeholder="Service type"
                value={passportDetails.serviceType}
                onChange={(e) => setPassportDetails({ ...passportDetails, serviceType: e.target.value })}
                className="input-field text-sm"
              />
              <input
                placeholder="Cost"
                type="number"
                value={passportDetails.cost}
                onChange={(e) => setPassportDetails({ ...passportDetails, cost: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleConfirm} disabled={confirming} className="btn-primary">
              {confirming ? 'Confirming…' : 'Confirm completion'}
            </button>
            <button onClick={() => setShowDispute((s) => !s)} className="btn-danger">
              <AlertCircle size={15} /> Something's wrong
            </button>
          </div>

          {showDispute && (
            <div className="mt-4 pt-4 border-t border-ink-50">
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="input-field mb-2"
                placeholder="What went wrong?"
                rows={3}
              />
              <button onClick={handleDispute} className="btn-danger !py-2 !px-3.5 text-sm">
                Submit dispute
              </button>
            </div>
          )}
        </div>
      )}

      {booking.status === 'verified' && (
        <div className="blueprint-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <VerifiedStamp label="Verified Job" />
          </div>
          {booking.isReviewed ? (
            <p className="text-sm text-ink-500">You've already reviewed this booking. Thanks for your feedback!</p>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <h2 className="font-semibold text-ink-900 mb-3">Leave a review</h2>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button type="button" key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                    <Star size={24} className={s <= reviewForm.rating ? 'fill-brass-400 text-brass-400' : 'fill-ink-100 text-ink-100'} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="input-field mb-3"
                placeholder="How was the service?"
                rows={3}
              />
              <button type="submit" disabled={submittingReview} className="btn-brass">
                {submittingReview ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerBookingDetail;
