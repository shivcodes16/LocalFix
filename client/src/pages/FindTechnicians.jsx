import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { technicianApi, categoryApi } from '../api/miscApi';
import { getErrorMessage } from '../api/client';
import TechnicianCard from '../components/TechnicianCard';
import { Loader, EmptyState, ErrorState } from '../components/Feedback';

const FindTechnicians = () => {
  const [categories, setCategories] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minRating: '',
    verifiedOnly: false,
    availableOnly: true,
  });
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.categories)).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null),
        { timeout: 4000 }
      );
    }
  }, []);

  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.verifiedOnly) params.verifiedOnly = 'true';
      if (filters.availableOnly) params.availableOnly = 'true';
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
      }
      const { data } = await technicianApi.search(params);
      setTechnicians(data.technicians);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, coords]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink-900 mb-2">Find a technician</h1>
        <p className="text-ink-500 flex items-center gap-1.5 text-sm">
          <MapPin size={14} />
          {coords ? 'Showing technicians sorted by distance from you.' : 'Enable location for distance-sorted results, or browse by category below.'}
        </p>
      </div>

      <div className="blueprint-card p-4 mb-8 flex flex-wrap items-center gap-3">
        <SlidersHorizontal size={16} className="text-ink-400" />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="input-field !w-auto text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.minRating}
          onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
          className="input-field !w-auto text-sm"
        >
          <option value="">Any rating</option>
          <option value="4.5">4.5+ stars</option>
          <option value="4">4+ stars</option>
          <option value="3">3+ stars</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
            className="accent-brass-500"
          />
          Verified jobs only
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
            className="accent-brass-500"
          />
          Accepting requests
        </label>
      </div>

      {loading ? (
        <Loader label="Finding technicians…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : technicians.length === 0 ? (
        <EmptyState icon={Search} title="No technicians match those filters" description="Try widening your filters or checking a different category." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {technicians.map((t) => (
            <TechnicianCard key={t._id} technician={t} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FindTechnicians;
