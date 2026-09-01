import { useEffect, useState } from 'react';
import { Plus, X, IndianRupee, ShieldCheck, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { passportApi } from '../../api/reviewApi';
import { categoryApi } from '../../api/miscApi';
import { getErrorMessage } from '../../api/client';
import { Loader, ErrorState, EmptyState } from '../../components/Feedback';

const ServicePassport = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productName: '', brand: '', category: '', purchaseDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    Promise.all([passportApi.mine(), categoryApi.list()])
      .then(([itemsRes, catRes]) => {
        setItems(itemsRes.data.items);
        setCategories(catRes.data.categories);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName) {
      toast.error('Product name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await passportApi.create(form);
      toast.success('Added to your Service Passport.');
      setForm({ productName: '', brand: '', category: '', purchaseDate: '' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-ink-900">Service Passport</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-brass !py-2 !px-3.5 text-sm">
          <Plus size={16} /> Track a product
        </button>
      </div>
      <p className="text-ink-500 text-sm mb-6">
        A complete, verified history for every appliance or product you've had serviced through LocalFix.
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="blueprint-card p-5 mb-6 grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Product name (e.g. LG Split AC)"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            className="input-field"
            required
          />
          <input
            placeholder="Brand (optional)"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="input-field"
          />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
            <option value="">Category (optional)</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            className="input-field"
          />
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary !py-2 !px-4 text-sm">
              {submitting ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary !py-2 !px-4 text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Package} title="Nothing tracked yet" description="Add a product to start building its service history." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="blueprint-card p-5">
              <button
                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-semibold text-ink-900">{item.productName}</p>
                  <p className="text-xs text-ink-400">
                    {item.brand && `${item.brand} · `}
                    {item.category?.name}
                    {item.purchaseDate && ` · Purchased ${format(new Date(item.purchaseDate), 'MMM yyyy')}`}
                  </p>
                </div>
                <span className="text-xs text-ink-400 font-mono">{item.history.length} service{item.history.length !== 1 ? 's' : ''}</span>
              </button>

              {expandedId === item._id && (
                <div className="mt-4 pt-4 border-t border-ink-50 space-y-3">
                  {item.history.length === 0 ? (
                    <p className="text-sm text-ink-400">No service history logged yet.</p>
                  ) : (
                    [...item.history].reverse().map((h) => (
                      <div key={h._id} className="flex items-start gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck size={12} className="text-teal-600" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink-800">{h.serviceType}</p>
                          <p className="text-xs text-ink-400">
                            {h.date && format(new Date(h.date), 'd MMM yyyy')}
                            {h.technician?.name && ` · ${h.technician.name}`}
                          </p>
                          {h.notes && <p className="text-xs text-ink-500 mt-0.5">{h.notes}</p>}
                          {h.warrantyExpiresAt && (
                            <p className="text-xs text-brass-600 mt-0.5">
                              Warranty until {format(new Date(h.warrantyExpiresAt), 'd MMM yyyy')}
                            </p>
                          )}
                        </div>
                        {h.cost !== undefined && (
                          <span className="font-mono text-xs text-ink-500 flex items-center shrink-0">
                            <IndianRupee size={11} />{h.cost}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicePassport;
