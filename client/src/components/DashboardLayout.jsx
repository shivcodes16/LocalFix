import { NavLink, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const DashboardLayout = ({ links }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-ink-800 text-paper-soft' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <aside className="md:sticky md:top-24 h-max">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                <link.icon size={17} />
                <span className="whitespace-nowrap">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
