import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);

// ── Centralised error handler (must be last) ──────────────────────────────────
// Any route handler that calls next(err) lands here.
app.use(errorHandler);

export default app;
