import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, count, size = 14, showValue = true }) => {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= rounded ? 'fill-brass-400 text-brass-400' : 'fill-ink-100 text-ink-100'}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-sm font-medium text-ink-700 font-mono">
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      )}
      {typeof count === 'number' && (
        <span className="text-xs text-ink-400">({count})</span>
      )}
    </span>
  );
};

export default StarRating;
