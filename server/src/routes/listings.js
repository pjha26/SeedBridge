import { Router } from 'express';
import { verifyToken, requireRole, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createListingSchema,
  updateListingSchema,
  browseQuerySchema,
} from '../schemas/listings.js';
import * as listingsController from '../controllers/listings.js';

const router = Router();

// ── Owner-only mutations ──────────────────────────────────────────────────────
router.post(
  '/',
  verifyToken,
  requireRole('owner'),
  validate(createListingSchema),
  listingsController.createListing
);

// IMPORTANT: /mine must be defined BEFORE /:id.
// Express matches routes in order; if /:id came first, "mine" would be
// treated as a MongoDB ObjectId and produce a cast error.
router.get(
  '/mine',
  verifyToken,
  requireRole('owner'),
  listingsController.getMyListing
);

router.put(
  '/:id',
  verifyToken,
  requireRole('owner'),
  validate(updateListingSchema),
  listingsController.updateListing
);

// ── Public browse and detail ──────────────────────────────────────────────────
router.get(
  '/',
  verifyToken,                                    // browse requires auth
  validate(browseQuerySchema, 'query'),
  listingsController.browseListings
);

// optionalAuth: attaches user if token present, never rejects.
// The controller uses req.user to decide visibility of inactive listings.
router.get(
  '/:id',
  optionalAuth,
  listingsController.getListingById
);

export default router;
