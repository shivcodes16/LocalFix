import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { technicianApi } from '../../api/miscApi';
import { categoryApi } from '../../api/miscApi';
import { getErrorMessage } from '../../api/client';
import { Loader } from '../../components/Feedback';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

const TechnicianProfileEdit = () => {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([technicianApi.getMyProfile(), categoryApi.list()])
      .then(([profRes, catRes]) => {
        setProfile(profRes.data.profile);
        setCategories(catRes.data.categories);
        const p = profRes.data.profile;
        setForm({
          headline: p.headline || '',
          bio: p.bio || '',
          categories: p.categories?.map((c) => c._id) || [],
          subcategories: p.subcategories?.join(', ') || '',
          yearsOfExperience: p.yearsOfExperience || 0,
          visitCharge: p.pricing?.visitCharge || 0,
          minPrice: p.pricing?.minPrice || 0,
          maxPrice: p.pricing?.maxPrice || 0,
          serviceAreas: p.serviceAreas?.join(', ') || '',
          serviceRadiusKm: p.serviceRadiusKm || 10,
          isAcceptingRequests: p.isAcceptingRequests,
          availability:
            p.availability?.length > 0
              ? p.availability
              : DAYS.map((day) => ({ day, startTime: '09:00', endTime: '18:00', isAvailable: false })),
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (id) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(id) ? f.categories.filter((c) => c !== id) : [...f.categories, id],
    }));
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      availability: f.availability.map((a) => (a.day === day ? { ...a, isAvailable: !a.isAvailable } : a)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        headline: form.headline,
        bio: form.bio,
        categories: form.categories,
        subcategories: form.subcategories.split(',').map((s) => s.trim()).filter(Boolean),
        yearsOfExperience: Number(form.yearsOfExperience),
        pricing: {
          visitCharge: Number(form.visitCharge),
          minPrice: Number(form.minPrice),
          maxPrice: Number(form.maxPrice),
        },
        serviceAreas: form.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
        serviceRadiusKm: Number(form.serviceRadiusKm),
        isAcceptingRequests: form.isAcceptingRequests,
        availability: form.availability,
      };
      const { data } = await technicianApi.updateMyProfile(payload);
      setProfile(data.profile);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    if (files.length === 0) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const { data } = await technicianApi.uploadWorkImages(formData);
      setProfile((p) => ({ ...p, workImages: data.workImages }));
      toast.success('Photos uploaded.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading || !form) return <Loader />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink-900 mb-6">Technician profile</h1>

      <form onSubmit={handleSubmit} className="blueprint-card p-6 space-y-5">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-700">Accepting new requests</span>
          <input
            type="checkbox"
            checked={form.isAcceptingRequests}
            onChange={(e) => setForm({ ...form, isAcceptingRequests: e.target.checked })}
            className="accent-brass-500 w-5 h-5"
          />
        </label>

        <div>
          <label className="label-field">Headline</label>
          <input
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            className="input-field"
            placeholder="e.g. Licensed electrician, 8+ years, same-day fixes"
            maxLength={120}
          />
        </div>

        <div>
          <label className="label-field">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="input-field"
            rows={4}
            maxLength={1500}
          />
        </div>

        <div>
          <label className="label-field">Service categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                type="button"
                key={c._id}
                onClick={() => toggleCategory(c._id)}
                className={`badge border transition-colors ${
                  form.categories.includes(c._id)
                    ? 'bg-ink-800 text-paper-soft border-ink-800'
                    : 'bg-transparent text-ink-500 border-ink-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-field">Subcategories (comma-separated)</label>
          <input
            value={form.subcategories}
            onChange={(e) => setForm({ ...form, subcategories: e.target.value })}
            className="input-field"
            placeholder="Gas refill, Cooling issue, Installation"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Years of experience</label>
            <input
              type="number"
              min={0}
              value={form.yearsOfExperience}
              onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Service radius (km)</label>
            <input
              type="number"
              min={1}
              value={form.serviceRadiusKm}
              onChange={(e) => setForm({ ...form, serviceRadiusKm: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-field">Visit charge (₹)</label>
            <input type="number" min={0} value={form.visitCharge} onChange={(e) => setForm({ ...form, visitCharge: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Min price (₹)</label>
            <input type="number" min={0} value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Max price (₹)</label>
            <input type="number" min={0} value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} className="input-field" />
          </div>
        </div>

        <div>
          <label className="label-field">Service areas (comma-separated localities)</label>
          <input
            value={form.serviceAreas}
            onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })}
            className="input-field"
            placeholder="C-Scheme, Malviya Nagar"
          />
        </div>

        <div>
          <label className="label-field">Weekly availability</label>
          <div className="flex flex-wrap gap-2">
            {form.availability.map((a) => (
              <button
                type="button"
                key={a.day}
                onClick={() => toggleDay(a.day)}
                className={`w-12 h-10 rounded-lg text-sm font-medium transition-colors ${
                  a.isAvailable ? 'bg-teal-500 text-white' : 'bg-ink-50 text-ink-400'
                }`}
              >
                {DAY_LABELS[a.day]}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <div className="blueprint-card p-6 mt-6">
        <h2 className="font-semibold text-ink-900 mb-3">Work photos</h2>
        <label className="flex items-center gap-2 border border-dashed border-ink-200 rounded-lg px-4 py-3 cursor-pointer hover:border-brass-300 transition-colors w-fit mb-4">
          <ImagePlus size={16} className="text-ink-400" />
          <span className="text-sm text-ink-500">{uploadingImages ? 'Uploading…' : 'Upload photos'}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImages} />
        </label>
        {profile?.workImages?.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {profile.workImages.map((src, i) => (
              <img key={i} src={src} alt="" className="aspect-square object-cover rounded-lg border border-ink-100" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianProfileEdit;
