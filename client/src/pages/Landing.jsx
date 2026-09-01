import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  FileText,
  Star,
  ArrowRight,
  Wrench,
  Zap,
  Snowflake,
  Hammer,
  Smartphone,
} from 'lucide-react';
import VerifiedStamp from '../components/VerifiedStamp';

const CATEGORY_PREVIEW = [
  { name: 'AC Repair', icon: Snowflake },
  { name: 'Electrical', icon: Zap },
  { name: 'Plumbing', icon: Wrench },
  { name: 'Carpentry', icon: Hammer },
  { name: 'Mobile & Laptop', icon: Smartphone },
];

const Landing = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper">
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #101826 1px, transparent 1px), linear-gradient(to bottom, #101826 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="verified-stamp mb-6">
              <ShieldCheck size={14} strokeWidth={2.5} /> Trust, verified
            </span>
            <h1 className="text-4xl sm:text-5xl leading-[1.08] font-semibold text-ink-900 mb-5">
              A repair history for everything in your home.
            </h1>
            <p className="text-lg text-ink-500 mb-8 max-w-md">
              LocalFix connects you with local technicians whose work is verified job by job —
              so every rating means something, and every service is logged for next time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-brass !px-6 !py-3 text-base">
                Get a technician <ArrowRight size={17} />
              </Link>
              <Link to="/register?role=technician" className="btn-secondary !px-6 !py-3 text-base">
                Join as a technician
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-9 text-sm text-ink-400">
              <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-teal-500" /> Verified jobs only</span>
              <span className="flex items-center gap-1.5"><FileText size={15} className="text-brass-500" /> Full service history</span>
            </div>
          </div>

          <div className="relative">
            <div className="blueprint-card p-6 rotate-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-display font-semibold text-ink-900">Suresh Patel</p>
                  <p className="text-xs text-ink-400">AC Repair · Jaipur</p>
                </div>
                <VerifiedStamp label="27 Verified" />
              </div>
              <div className="flex items-center gap-1 mb-4 text-brass-400">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={15} className="fill-brass-400" />)}
                <span className="text-sm text-ink-600 font-mono ml-1">4.9 (21)</span>
              </div>
              <div className="h-px bg-ink-100 my-4" />
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Service Passport — LG Split AC</p>
              <ul className="space-y-2 text-sm text-ink-600">
                <li className="flex justify-between"><span>Gas refill + cleaning</span><span className="font-mono text-ink-400">₹1,200</span></li>
                <li className="flex justify-between"><span>Annual servicing</span><span className="font-mono text-ink-400">₹450</span></li>
              </ul>
            </div>
            <div className="blueprint-card p-4 absolute -bottom-6 -left-6 w-48 -rotate-2 hidden sm:block">
              <p className="text-xs text-ink-400 mb-1">Quote comparison</p>
              <p className="font-mono text-lg font-semibold text-ink-900">₹250 <span className="text-xs text-teal-600 font-sans">Best match</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 border-t border-ink-100">
        <p className="text-sm font-semibold text-ink-400 uppercase tracking-wide mb-6">Popular categories</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {CATEGORY_PREVIEW.map((c) => (
            <Link
              key={c.name}
              to="/find-technicians"
              className="blueprint-card p-5 flex flex-col items-center gap-2.5 text-center hover:-translate-y-0.5 transition-transform"
            >
              <span className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center">
                <c.icon size={18} className="text-ink-700" />
              </span>
              <span className="text-sm font-medium text-ink-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-ink-100">
        <h2 className="text-3xl font-semibold text-ink-900 mb-3">How a job becomes verified</h2>
        <p className="text-ink-500 mb-10 max-w-2xl">
          Every review on LocalFix comes from a job that actually happened, start to finish.
          Here's the exact path a booking follows.
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: 'Request & quote', desc: 'Describe the problem, get quotes from nearby technicians, and compare price, rating, and verified jobs.', icon: Search },
            { title: 'Job in progress', desc: 'Your technician starts the job and can log service notes as they work.', icon: Wrench },
            { title: 'You confirm completion', desc: 'Only once you confirm the job is done does it become a verified job — this is the trust gate.', icon: ShieldCheck },
            { title: 'Review & history', desc: 'Leave a review tied to that verified job, and it is saved to your Service Passport automatically.', icon: FileText },
          ].map((step, i) => (
            <div key={step.title} className="blueprint-card p-6">
              <span className="font-mono text-xs text-brass-500">{String(i + 1).padStart(2, '0')}</span>
              <div className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center my-3">
                <step.icon size={17} className="text-brass-300" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-1.5">{step.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="bg-ink-800 rounded-card px-8 py-14 text-center">
          <h2 className="text-3xl font-semibold text-paper-soft mb-3">Ready to get something fixed?</h2>
          <p className="text-ink-300 mb-7 max-w-lg mx-auto">
            Post a request, compare quotes from verified local technicians, and keep a record of it all.
          </p>
          <Link to="/register" className="btn-brass !px-7 !py-3 text-base inline-flex">
            Create your free account <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
