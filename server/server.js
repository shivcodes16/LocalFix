require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const ensureDefaultCategories = require('./utils/ensureDefaultCategories');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const servicePassportRoutes = require('./routes/servicePassportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security & core middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'https://localfix-1en7tg97c-local-fix.vercel.app',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Basic rate limiting on auth endpoints to slow down brute force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});
app.use('/api/auth', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'LocalFix API is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/service-passport', servicePassportRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/**
 * Startup sequence, run in order (not fire-and-forget):
 *   1. Connect to MongoDB and wait for it to be ready.
 *   2. Ensure default service categories exist (logs every step so it's
 *      obvious in the console whether this ran and what it did).
 *   3. Only then start accepting HTTP requests.
 * A failure in step 2 is logged loudly but does not stop the server from
 * starting — the /api/categories route also self-heals on request (see
 * categoryController.js) as a second safety net.
 */
const startServer = async () => {
  await connectDB();

  console.log('[LocalFix] Running startup category bootstrap…');
  try {
    await ensureDefaultCategories();
  } catch (error) {
    console.error(
      '[LocalFix] Startup category bootstrap failed. The /api/categories endpoint will still ' +
        'attempt to self-heal on the next request. Error:',
      error.stack || error.message
    );
  }

  app.listen(PORT, () => {
    console.log(`LocalFix server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('[LocalFix] Fatal error during server startup:', error.stack || error.message);
  process.exit(1);
});

module.exports = app;
