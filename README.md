# LocalFix

LocalFix is a full-stack MERN marketplace that connects customers with local repair and
service professionals — electricians, plumbers, AC technicians, appliance repairers,
laptop/mobile repairers, carpenters, and more.

Its differentiator isn't "find a technician" — it's **trust**. Every review on the platform
is tied to a **Verified Job**: a booking that went through the full request → quote → work →
customer-confirmed-completion pipeline. Customers also get a **Service Passport**: a running,
verified history of everything that's been serviced for each of their appliances/products.

## 1. What's included

- Customer flow: register, search/filter technicians, request a service (with optional
  AI-assisted category suggestion), compare quotes side-by-side, accept a quote, track the
  booking, confirm completion, leave a review, and browse a Service Passport.
- Technician flow: register, build a professional profile (categories, pricing, service
  areas, availability, work photos), browse open requests, submit quotes, manage bookings,
  log service notes (auto-summarized), mark jobs complete, and reply to reviews.
- Trust system: reviews can only be created for bookings the *customer* has explicitly
  confirmed as complete — technicians cannot self-certify a "verified job."
- Notifications: in-app notifications (and email, when SMTP is configured) for new requests,
  quotes, quote decisions, booking status changes, completions, and reviews.
- Graceful fallbacks everywhere an external API key might be missing: image uploads fall back
  to inline data URIs without Cloudinary, AI category-suggestion/summarization falls back to a
  keyword-based classifier without an OpenAI key, geolocation search falls back to a plain
  haversine-distance calculation without a Google Maps key, and email falls back to console
  logging without SMTP credentials. **The app is fully usable with zero third-party API keys.**

## 2. Tech stack

**Client:** React 18 + Vite, React Router, Tailwind CSS, Axios, lucide-react, react-hot-toast

**Server:** Node.js, Express, MongoDB + Mongoose, JWT auth, bcryptjs, express-validator,
multer, Cloudinary SDK (optional), Nodemailer (optional), OpenAI SDK (optional)

## 3. Project structure

```
LocalFix/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios client + one module per backend resource
│   │   ├── components/      # Shared UI (Navbar, cards, layouts, feedback states)
│   │   ├── context/         # AuthContext (session state)
│   │   ├── pages/           # Route-level pages
│   │   │   ├── customer/    # Customer dashboard pages
│   │   │   └── technician/  # Technician dashboard pages
│   │   ├── App.jsx          # Route definitions
│   │   └── main.jsx         # App entrypoint
│   ├── tailwind.config.js
│   └── vite.config.js       # Dev proxy to the API server
│
├── server/                  # Express + MongoDB backend
│   ├── config/               # DB and Cloudinary configuration
│   ├── controllers/          # Route handlers / business logic
│   ├── middleware/           # Auth, error handling, validation, uploads
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── seed/                  # Demo data seed script
│   ├── utils/                  # Email, image upload, AI, geo, notifications, JWT
│   └── server.js               # App entrypoint
│
└── .gitignore
```

## 4. Environment variables

Copy `server/.env.example` to `server/.env` and fill in what you have. Everything is optional
except `MONGO_URI` and `JWT_SECRET` — the app degrades gracefully for everything else.

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs — use a long random string |
| `PORT` | No | API server port (default `5000`) |
| `CLIENT_URL` | No | Used for CORS (default `http://localhost:5173`) |
| `CLOUDINARY_*` | No | Enables real image hosting; without it, uploaded images are stored as base64 data URIs |
| `SMTP_*`, `EMAIL_FROM` | No | Enables real email delivery; without it, emails are logged to the server console |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | No | Enables AI category suggestion & note summarization; without it, a keyword-based fallback is used |
| `GOOGLE_MAPS_API_KEY` | No | Reserved for future geocoding/autocomplete use; search already works via haversine distance without it |

The client needs no `.env` file for local development — Vite's dev server proxies `/api`
requests to `http://localhost:5000` (see `client/vite.config.js`). For a production build,
serve the client separately and point it at your deployed API, or add a reverse proxy.

## 5. Local setup

### Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

### Backend

```bash
cd server
cp .env.example .env
# edit .env and at minimum set MONGO_URI and JWT_SECRET
npm install
npm run seed      # optional but recommended: creates demo categories, users, and jobs
npm run dev        # starts the API on http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev         # starts the app on http://localhost:5173
```

Open `http://localhost:5173` in your browser. API requests are proxied to the backend
automatically in development.

### Production build

```bash
cd client
npm run build        # outputs static files to client/dist
```

Serve `client/dist` with any static host, and run `node server/server.js` (with `NODE_ENV=production`)
behind a process manager such as PM2, pointing `CLIENT_URL` at your deployed frontend origin.

## 6. Database setup

No manual schema setup is required — Mongoose creates collections and indexes automatically
on first connection. Just point `MONGO_URI` at any MongoDB 5+ instance (local or Atlas) and
run the seed script to populate demo data.

To wipe demo data without reseeding: `npm run seed:destroy` (run from `server/`).

## 7. AI / Maps configuration

- **AI (OpenAI-compatible):** set `OPENAI_API_KEY` in `server/.env` to enable real AI-assisted
  category classification for service requests and AI summarization of technician service
  notes. Leave it blank to use the built-in keyword-based fallback — the app remains fully
  functional either way, and AI output is always presented as a suggestion, never a diagnosis.
- **Maps/Geolocation:** technician search already works end-to-end using the browser's
  Geolocation API plus a haversine distance calculation on the server — no API key required.
  `GOOGLE_MAPS_API_KEY` is reserved for future enhancements like address autocomplete.

## 8. Demo accounts

After running `npm run seed` in `server/`, these accounts are available (password for all: `password123`):

| Role | Email |
|---|---|
| Customer | `aarav@localfix.demo` |
| Customer | `priya@localfix.demo` |
| Technician (AC Repair) | `suresh.ac@localfix.demo` |
| Technician (Electrical) | `rajesh.electrician@localfix.demo` |
| Technician (Plumbing) | `mohit.plumber@localfix.demo` |
| Technician (Appliance) | `deepak.appliance@localfix.demo` |
| Technician (Laptop/Mobile) | `amit.laptop@localfix.demo` |
| Technician (Carpentry/Painting) | `vikram.carpenter@localfix.demo` |
| Admin | `admin@localfix.demo` |

The seed data includes one fully completed **verified job** with a review (Aarav ↔ Suresh),
one **in-progress booking** (Aarav ↔ Mohit), and one **open request with a pending quote**
(Priya ↔ Rajesh) — enough to explore every stage of the trust pipeline immediately.

## 9. The verified-job trust flow

```
Service Request
   → Technician submits a Quote
      → Customer compares quotes and accepts one
         → Booking created (competing quotes auto-rejected)
            → Technician starts the job
               → Technician adds service notes (optional, AI-summarized)
                  → Technician marks the job completed
                     → Customer confirms completion  ⟶  Booking becomes VERIFIED
                        → Customer can leave a review
                        → Technician's verified-job count, completed-job count, and
                          rating are updated
                        → Optionally logged into the customer's Service Passport
```

A review can only be created for a booking with `status: 'verified'` — this is enforced in
`server/controllers/reviewController.js`, not just in the UI, so it can't be bypassed via the API.

## 10. Notes for reviewers / contributors

- All secrets are read from environment variables; nothing is hardcoded in source.
- Every mutating action goes through JWT auth + role-based authorization middleware.
- Input is validated with `express-validator` on auth routes and manually in controllers
  elsewhere; Mongoose schema validation provides a second layer.
- Errors flow through a single centralized error handler (`server/middleware/errorMiddleware.js`).
- The frontend's visual language (a custom "blueprint" theme with a signature rotating
  "Verified Stamp" badge) is intentional — see `client/tailwind.config.js` and
  `client/src/index.css` for the design tokens.
