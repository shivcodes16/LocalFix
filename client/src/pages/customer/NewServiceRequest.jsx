import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ImagePlus, X, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryApi } from '../../api/miscApi';
import { serviceRequestApi } from '../../api/serviceRequestApi';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const NewServiceRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    address: user?.location?.address || '',
    city: user?.location?.city || '',
    contactPhone: user?.phone || '',
  });
  const [images, setImages] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.categories)).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 4000 }
      );
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleClassify = async () => {
    if (form.description.trim().length < 5) {
      toast.error('Describe the problem in a bit more detail first.');
      return;
    }
    setClassifying(true);
    try {
      const { data } = await serviceRequestApi.classify(form.description);
      setSuggestion(data.suggestion);
      const matched = categories.find(
        (c) => c.name.toLowerCase() === data.suggestion.suggestedCategory.toLowerCase()
      );
      if (matched) {
        setForm((f) => ({ ...f, category: matched._id, subcategory: data.suggestion.suggestedSubcategory }));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setClassifying(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setImages(files);
  };

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx));

  const isValidPhone = (value) => /^[+]?[0-9\s\-()]{7,20}$/.test((value || '').trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.title || !form.description) {
      toast.error('Please fill in category, title, and description.');
      return;
    }
    if (!form.contactPhone || !isValidPhone(form.contactPhone)) {
      toast.error('Please enter a valid contact phone number.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => value && formData.append(key, value));
      if (coords) {
        formData.append('lat', coords.lat);
        formData.append('lng', coords.lng);
      }
      if (suggestion) formData.append('aiSuggestion', JSON.stringify(suggestion));
      images.forEach((img) => formData.append('images', img));

      const { data } = await serviceRequestApi.create(formData);
      toast.success('Request posted! Technicians nearby will be notified.');
      navigate(`/customer/requests/${data.serviceRequest._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900 mb-1">Describe the problem</h1>
      <p className="text-ink-500 text-sm mb-6">
        We'll suggest a category to route your request to the right technicians. This is only a
        routing suggestion, not a technical diagnosis.
      </p>

      <form onSubmit={handleSubmit} className="blueprint-card p-6 space-y-5">
        <div>
          <label className="label-field" htmlFor="description">What's the problem?</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. My AC is running but the room isn't cooling"
          />
          <button
            type="button"
            onClick={handleClassify}
            disabled={classifying}
            className="btn-secondary mt-2 !py-2 !px-3 text-sm"
          >
            <Sparkles size={15} /> {classifying ? 'Thinking…' : 'Suggest a category'}
          </button>
          {suggestion && (
            <div className="mt-3 text-sm bg-brass-50 border border-brass-100 rounded-lg p-3 text-brass-800">
              Suggested: <strong>{suggestion.suggestedCategory}</strong>
              {suggestion.suggestedSubcategory && ` — ${suggestion.suggestedSubcategory}`}. {suggestion.disclaimer}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className="input-field">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field" htmlFor="subcategory">Subcategory (optional)</label>
            <input id="subcategory" name="subcategory" value={form.subcategory} onChange={handleChange} className="input-field" placeholder="e.g. Gas refill" />
          </div>
        </div>

        <div>
          <label className="label-field" htmlFor="title">Short title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="e.g. AC not cooling in living room" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="address">Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input id="address" name="address" value={form.address} onChange={handleChange} className="input-field pl-9" placeholder="House/street" />
            </div>
          </div>
          <div>
            <label className="label-field" htmlFor="city">City</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} className="input-field" placeholder="City" />
          </div>
        </div>

        <div>
          <label className="label-field" htmlFor="contactPhone">Contact phone number</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              id="contactPhone"
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              className="input-field pl-9"
              placeholder="e.g. 98765 43210"
            />
          </div>
          <p className="text-xs text-ink-400 mt-1">
            Only shared with the technician once you accept their quote and a booking is created.
          </p>
        </div>

        <div>
          <label className="label-field">Photos (optional)</label>
          <label className="flex items-center gap-2 border border-dashed border-ink-200 rounded-lg px-4 py-3 cursor-pointer hover:border-brass-300 transition-colors w-fit">
            <ImagePlus size={16} className="text-ink-400" />
            <span className="text-sm text-ink-500">Add up to 6 photos</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          </label>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-16 h-16">
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 bg-ink-800 text-white rounded-full p-0.5">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-brass w-full !py-3">
          {submitting ? 'Posting request…' : 'Post request'}
        </button>
      </form>
    </div>
  );
};

export default NewServiceRequest;
