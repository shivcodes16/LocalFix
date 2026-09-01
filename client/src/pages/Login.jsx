import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth, getErrorMessage } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const from = location.state?.from?.pathname;
      navigate(from || (user.role === 'technician' ? '/technician' : '/customer'));
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
          <h1 className="text-2xl font-semibold text-ink-900">Welcome back</h1>
          <p className="text-sm text-ink-400 mt-1">Log in to manage your bookings.</p>
        </div>

        <form onSubmit={handleSubmit} className="blueprint-card p-6 space-y-4">
          <div>
            <label className="label-field" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input-field pl-9"
                placeholder="you@example.com"
              />
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
                value={form.password}
                onChange={handleChange}
                className="input-field pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brass-600 font-medium hover:underline">
            Create one
          </Link>
        </p>

        <div className="mt-6 text-xs text-ink-300 text-center bg-ink-50 rounded-lg p-3">
          Demo accounts (password: <span className="font-mono">password123</span>): <br />
          <span className="font-mono">aarav@localfix.demo</span> (customer) ·{' '}
          <span className="font-mono">suresh.ac@localfix.demo</span> (technician)
        </div>
      </div>
    </div>
  );
};

export default Login;
