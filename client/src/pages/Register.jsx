import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth, getErrorMessage } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'technician' ? 'technician' : 'customer';

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: defaultRole });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to LocalFix, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'technician' ? '/technician/profile' : '/customer');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <span className="w-11 h-11 rounded-lg bg-ink-800 flex items-center justify-center mb-4">
            <Wrench size={20} className="text-brass-300" strokeWidth={2.5} />
          </span>
          <h1 className="text-2xl font-semibold text-ink-900">Create your account</h1>
          <p className="text-sm text-ink-400 mt-1">Join LocalFix as a customer or technician.</p>
        </div>

        <form onSubmit={handleSubmit} className="blueprint-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-ink-50 rounded-lg">
            {['customer', 'technician'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  form.role === role ? 'bg-ink-800 text-paper-soft' : 'text-ink-500'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div>
            <label className="label-field" htmlFor="name">Full name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input id="name" name="name" required value={form.name} onChange={handleChange} className="input-field pl-9" placeholder="Jane Doe" />
            </div>
          </div>
          <div>
            <label className="label-field" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="input-field pl-9" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="label-field" htmlFor="phone">Phone (optional)</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} className="input-field pl-9" placeholder="98765 43210" />
            </div>
          </div>
          <div>
            <label className="label-field" htmlFor="password">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                className="input-field pl-9"
                placeholder="At least 6 characters"
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brass-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
