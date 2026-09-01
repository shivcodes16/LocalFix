import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IndianRupee, MapPin, Briefcase, CalendarClock } from 'lucide-react';
import { technicianApi } from '../api/miscApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import VerifiedStamp from '../components/VerifiedStamp';
import { Loader, ErrorState, EmptyState } from '../components/Feedback';
import { MessageSquare } from 'lucide-react';

const TechnicianProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    technicianApi
      .getPublicProfile(userId)
      .then(({ data }) => {
        setProfile(data.profile);
        setReviews(data.reviews);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Loader label="Loading profile…" />;
  if (error) return <ErrorState message={error} />;
  if (!profile) return null;

  const { user: tech, headline, bio, stats, pricing, categories, subcategories, serviceAreas, workImages, yearsOfExperience } = profile;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="blueprint-card p-7 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center overflow-hidden shrink-0">
              {tech.avatarUrl ? (
                <img src={tech.avatarUrl} alt={tech.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-2xl font-semibold text-ink-500">{tech.name?.[0]}</span>
              )}
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-ink-900">{tech.name}</h1>
              <p className="text-ink-500 text-sm mt-0.5">{headline}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <StarRating rating={stats?.averageRating || 0} count={stats?.reviewCount} />
                {stats?.verifiedJobs > 0 && <VerifiedStamp label={`${stats.verifiedJobs} Verified Jobs`} />}
              </div>
            </div>
          </div>
          {user?.role === 'customer' && (
            <Link to={`/customer/new-request?technician=${tech._id}`} className="btn-brass shrink-0">
              <MessageSquare size={16} /> Request service
            </Link>
          )}
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mt-7 pt-6 border-t border-ink-50">
          <div>
            <p className="text-xs text-ink-400 mb-1">Experience</p>
            <p className="font-semibold text-ink-800 flex items-center gap-1.5"><Briefcase size={14} /> {yearsOfExperience} yrs</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">Completed jobs</p>
            <p className="font-semibold text-ink-800">{stats?.completedJobs || 0}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">Repeat customers</p>
            <p className="font-semibold text-ink-800">{stats?.repeatCustomerCount || 0}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">Pricing range</p>
            <p className="font-semibold text-ink-800 flex items-center gap-0.5 font-mono">
              <IndianRupee size={14} />{pricing?.minPrice}–{pricing?.maxPrice}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {bio && (
            <div>
              <h2 className="text-lg font-semibold text-ink-900 mb-2">About</h2>
              <p className="text-ink-600 text-sm leading-relaxed">{bio}</p>
            </div>
          )}

          {workImages?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-ink-900 mb-3">Work photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {workImages.map((src, i) => (
                  <img key={i} src={src} alt="Work sample" className="aspect-square object-cover rounded-lg border border-ink-100" />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-ink-900 mb-3">Reviews</h2>
            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" description="This technician hasn't completed a verified job with a review yet." />
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="blueprint-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-sm font-semibold text-ink-500">
                          {r.customer?.name?.[0]}
                        </span>
                        <p className="text-sm font-medium text-ink-800">{r.customer?.name}</p>
                      </div>
                      <StarRating rating={r.rating} showValue={false} size={13} />
                    </div>
                    {r.comment && <p className="text-sm text-ink-600">{r.comment}</p>}
                    {r.technicianReply?.text && (
                      <div className="mt-3 ml-4 pl-3 border-l-2 border-brass-200">
                        <p className="text-xs font-semibold text-ink-500 mb-0.5">Technician's reply</p>
                        <p className="text-sm text-ink-600">{r.technicianReply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="blueprint-card p-5">
            <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-1.5"><CalendarClock size={16} /> Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories?.map((c) => (
                <span key={c._id} className="badge bg-ink-50 text-ink-600">{c.name}</span>
              ))}
            </div>
            {subcategories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {subcategories.map((s) => (
                  <span key={s} className="badge bg-brass-50 text-brass-700">{s}</span>
                ))}
              </div>
            )}
          </div>
          {serviceAreas?.length > 0 && (
            <div className="blueprint-card p-5">
              <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-1.5"><MapPin size={16} /> Service areas</h3>
              <p className="text-sm text-ink-600">{serviceAreas.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianProfile;
