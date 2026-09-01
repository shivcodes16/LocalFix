import { useState } from 'react';
import { User, MapPin, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../api/miscApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

const AccountProfile = () => {
  const { user, updateCachedUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.location?.address || '',
    city: user?.location?.city || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        toast.success('Location captured. Save to apply it.');
      },
      () => toast.error('Could not get your location.')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userApi.updateMe(form);
      updateCachedUser(data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await userApi.uploadAvatar(formData);
      updateCachedUser({ ...user, avatarUrl: data.avatarUrl });
      toast.success('Photo updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-ink-900 mb-6">Your profile</h1>

      <div className="blueprint-card p-6 mb-6 flex items-center gap-5">
        <span className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center overflow-hidden shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User size={26} className="text-ink-400" />
          )}
        </span>
        <div>
          <label className="btn-secondary !py-2 !px-3.5 text-sm cursor-pointer inline-flex">
            <Camera size={15} /> {uploadingAvatar ? 'Uploading…' : 'Change photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
          </label>
          <p className="text-xs text-ink-400 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="blueprint-card p-6 space-y-4">
        <div>
          <label className="label-field" htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label-field" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} className="input-field" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="address">Address</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="city">City</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} className="input-field" />
          </div>
        </div>
        <button type="button" onClick={handleUseLocation} className="btn-secondary !py-2 !px-3.5 text-sm">
          <MapPin size={15} /> Use my current location
        </button>
        <div className="pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountProfile;
