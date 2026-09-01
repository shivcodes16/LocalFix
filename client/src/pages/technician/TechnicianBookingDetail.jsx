import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { IndianRupee, PlayCircle, CheckCircle2, ImagePlus, X, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { bookingApi } from '../../api/bookingApi';
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
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${i <= currentIndex ? 'bg-teal-500 text-white' : 'bg-ink-100 text-ink-400'}`}>
              {i + 1}
            </div>
            <span className="text-[0.68rem] text-ink-500 text-center w-16">{STEP_LABELS[step]}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < currentIndex ? 'bg-teal-500' : 'bg-ink-100'}`} />}
        </div>
      ))}
    </div>
  );
};

const TechnicianBookingDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteImages, setNoteImages] = useState([]);
  const [addingNote, setAddingNote] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeForm, setCompleteForm] = useState({ finalPrice: '', warrantyPeriodDays: '' });

  const load = useCallback(async () => {
    try {
      const { data } = await bookingApi.getById(id);
      setBooking(data.booking);
      setCompleteForm((f) => ({ ...f, finalPrice: data.booking.agreedPrice }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await bookingApi.start(id);
      toast.success('Job marked as in progress.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error('Please write a note first.');
      return;
    }
    setAddingNote(true);
    try {
      const formData = new FormData();
      formData.append('text', noteText);
      noteImages.forEach((img) => formData.append('images', img));
      await bookingApi.addNote(id, formData);
      toast.success('Note added.');
      setNoteText('');
      setNoteImages([]);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingNote(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setCompleting(true);
    try {
      await bookingApi.complete(id, completeForm);
      toast.success('Job marked complete. Waiting for customer confirmation.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCompleting(false);
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
          <p className="text-sm text-ink-400 mt-0.5">for {booking.customer?.name}</p>
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
          <p className="font-mono font-semibold text-ink-800 flex items-center"><IndianRupee size={14} />{booking.agreedPrice}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">Category</p>
          <p className="text-ink-800">{booking.category?.name}</p>
        </div>
      </div>

      {(booking.customerContactPhone || booking.customer?.phone) && (
        <div className="blueprint-card p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-400">Customer</p>
            <p className="font-medium text-ink-800">{booking.customer?.name}</p>
          </div>
          <a
            href={`tel:${booking.customerContactPhone || booking.customer.phone}`}
            className="btn-brass !py-2 !px-3.5 text-sm shrink-0"
          >
            <Phone size={15} /> Call Customer
          </a>
        </div>
      )}

      {booking.status === 'pending_start' && (
        <button onClick={handleStart} disabled={starting} className="btn-primary mb-6">
          <PlayCircle size={16} /> {starting ? 'Starting…' : 'Start job'}
        </button>
      )}

      {['pending_start', 'in_progress'].includes(booking.status) && (
        <div className="blueprint-card p-6 mb-6">
          <h2 className="font-semibold text-ink-900 mb-3">Add a service note</h2>
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="What did you find or do? (An AI-generated customer-friendly summary will be added automatically.)"
            />
            <label className="flex items-center gap-2 border border-dashed border-ink-200 rounded-lg px-3 py-2 cursor-pointer w-fit text-sm text-ink-500">
              <ImagePlus size={15} /> Attach photos
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setNoteImages(Array.from(e.target.files).slice(0, 4))} />
            </label>
            {noteImages.length > 0 && (
              <div className="flex gap-2">
                {noteImages.map((img, i) => (
                  <div key={i} className="relative w-14 h-14">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button type="button" onClick={() => setNoteImages(noteImages.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 bg-ink-800 text-white rounded-full p-0.5">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="submit" disabled={addingNote} className="btn-secondary !py-2 !px-3.5 text-sm">
              {addingNote ? 'Adding…' : 'Add note'}
            </button>
          </form>
        </div>
      )}

      {booking.serviceNotes?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-ink-900 mb-3">Service notes</h2>
          <div className="space-y-3">
            {booking.serviceNotes.map((note, i) => (
              <div key={i} className="blueprint-card p-4">
                <p className="text-sm text-ink-700">{note.text}</p>
                <p className="text-xs text-ink-300 mt-1">{format(new Date(note.addedAt), "d MMM, h:mm a")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {['pending_start', 'in_progress'].includes(booking.status) && (
        <div className="blueprint-card p-6">
          <h2 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-teal-500" /> Mark job as completed
          </h2>
          <form onSubmit={handleComplete} className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label-field">Final price (₹)</label>
              <input
                type="number"
                value={completeForm.finalPrice}
                onChange={(e) => setCompleteForm({ ...completeForm, finalPrice: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Warranty period (days)</label>
              <input
                type="number"
                value={completeForm.warrantyPeriodDays}
                onChange={(e) => setCompleteForm({ ...completeForm, warrantyPeriodDays: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </div>
            <button type="submit" disabled={completing} className="btn-brass sm:col-span-2">
              {completing ? 'Submitting…' : 'Mark completed'}
            </button>
          </form>
          <p className="text-xs text-ink-400">
            This job becomes a <strong>verified job</strong> only after the customer confirms completion.
          </p>
        </div>
      )}

      {booking.status === 'verified' && (
        <div className="blueprint-card p-6 text-center">
          <VerifiedStamp label="Verified Job" />
          <p className="text-sm text-ink-500 mt-3">The customer confirmed this job. It now counts toward your trust stats.</p>
        </div>
      )}
    </div>
  );
};

export default TechnicianBookingDetail;
