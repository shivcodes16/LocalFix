import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Wrench, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'technician' ? '/technician' : '/customer';

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-ink-900' : 'text-ink-400 hover:text-ink-700'}`;

  return (
    <header className="sticky top-0 z-40 bg-paper-soft/95 backdrop-blur border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center">
            <Wrench size={16} className="text-brass-300" strokeWidth={2.5} />
          </span>
          <span className="font-display font-semibold text-lg text-ink-900">LocalFix</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/find-technicians" className={navLinkClass}>
            Find a technician
          </NavLink>
          {user && (
            <NavLink to={dashboardPath} className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {user?.role === 'customer' && (
            <NavLink to="/customer/passport" className={navLinkClass}>
              Service Passport
            </NavLink>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Link to={`${dashboardPath}/profile`} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-ink-50">
                <span className="w-7 h-7 rounded-full bg-ink-100 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={14} className="text-ink-500" />
                  )}
                </span>
                <span className="text-sm font-medium text-ink-700">{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-ink-50 text-ink-500" aria-label="Log out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2 !px-3.5 text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !py-2 !px-3.5 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-ink-100 bg-paper-soft px-4 py-4 flex flex-col gap-3">
          <NavLink to="/find-technicians" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-ink-700">
            Find a technician
          </NavLink>
          {user ? (
            <>
              <NavLink to={dashboardPath} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-ink-700">
                Dashboard
              </NavLink>
              {user.role === 'customer' && (
                <NavLink to="/customer/passport" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-ink-700">
                  Service Passport
                </NavLink>
              )}
              <button onClick={handleLogout} className="text-left text-sm font-medium text-rust-600">
                Log out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-sm" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/register" className="btn-primary flex-1 text-sm" onClick={() => setMenuOpen(false)}>
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
