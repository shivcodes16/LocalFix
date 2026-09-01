import { Wrench } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-ink-100 bg-ink-800 text-paper-muted mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-lg bg-brass-500 flex items-center justify-center">
            <Wrench size={14} className="text-ink-900" strokeWidth={2.5} />
          </span>
          <span className="font-display font-semibold text-lg text-paper-soft">LocalFix</span>
        </div>
        <p className="text-sm text-ink-300 max-w-xs">
          Trusted local professionals, verified jobs, and a complete service history for everything
          that gets fixed in your home.
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">For customers</p>
        <ul className="space-y-2 text-sm text-ink-300">
          <li>Find a technician</li>
          <li>Track a booking</li>
          <li>Your Service Passport</li>
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">For technicians</p>
        <ul className="space-y-2 text-sm text-ink-300">
          <li>Join as a technician</li>
          <li>Build verified jobs</li>
          <li>Grow repeat customers</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-ink-700 px-4 sm:px-6 py-5 text-xs text-ink-400">
      © {new Date().getFullYear()} LocalFix. A portfolio project. Not affiliated with any real repair marketplace.
    </div>
  </footer>
);

export default Footer;
