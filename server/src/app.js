import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import healthRouter    from './routes/health.js';
import authRouter      from './routes/auth.js';
import listingsRouter  from './routes/listings.js';
import savedRouter     from './routes/saved.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Fail fast if JWT_SECRET is missing or too short ──────────────────────────
// This runs at module load time (before any request), so a misconfigured
// deployment crashes immediately rather than issuing broken tokens silently.
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  throw new Error(
    'JWT_SECRET must be set to a string of at least 32 characters. ' +
    'Check your .env file.'
  );
}

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
// helmet sets a sensible set of HTTP headers (X-Content-Type-Options,
// X-Frame-Options, etc.) with one call. No custom config needed for a JSON API.
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());

// ── Auth rate limiter ─────────────────────────────────────────────────────────
// Applied only to /api/auth to keep login brute-force expensive.
// Limits are configurable via env for easier tuning in staging.
const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max:      Number(process.env.RATE_LIMIT_MAX)        || 10,             // 10 attempts
  standardHeaders: true,   // send RateLimit-* headers so clients can back off
  legacyHeaders:   false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health',   healthRouter);
app.use('/api/auth',     authLimiter, authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/saved',    savedRouter);

// ── Centralised error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

export default app;
