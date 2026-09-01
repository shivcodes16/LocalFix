import { Link } from 'react-router-dom';
import { MapPin, IndianRupee } from 'lucide-react';
import StarRating from './StarRating';
import VerifiedStamp from './VerifiedStamp';

const TechnicianCard = ({ technician }) => {
  const { user, headline, stats, pricing, categories, distanceKm } = technician;

  return (
    <Link to={`/technicians/${user._id}`} className="blueprint-card p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-ink-100 flex items-center justify-center overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-semibold text-ink-500">{user.name?.[0]}</span>
            )}
          </span>
          <div>
            <p className="font-semibold text-ink-900">{user.name}</p>
            <p className="text-xs text-ink-400">{categories?.map((c) => c.name).join(', ') || 'General'}</p>
          </div>
        </div>
        {stats?.verifiedJobs > 0 && <VerifiedStamp label={`${stats.verifiedJobs} Verified`} size="sm" />}
      </div>

      {headline && <p className="text-sm text-ink-600 line-clamp-2">{headline}</p>}

      <div className="flex items-center justify-between text-sm pt-1 border-t border-ink-50">
        <StarRating rating={stats?.averageRating || 0} count={stats?.reviewCount} size={13} />
        <span className="flex items-center gap-1 text-ink-500 font-mono text-xs">
          <IndianRupee size={12} />
          {pricing?.minPrice || 0}–{pricing?.maxPrice || 0}
        </span>
      </div>

      {typeof distanceKm === 'number' && (
        <p className="text-xs text-ink-400 flex items-center gap-1">
          <MapPin size={12} /> {distanceKm} km away
        </p>
      )}
    </Link>
  );
};

export default TechnicianCard;
