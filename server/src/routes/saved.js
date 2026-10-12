import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import * as savedController from '../controllers/saved.js';

const router = Router();

// All saved routes require investor role

router.post(
  '/:listingId',
  verifyToken,
  requireRole('investor'),
  savedController.saveListingController
);

router.delete(
  '/:listingId',
  verifyToken,
  requireRole('investor'),
  savedController.unsaveListingController
);

router.get(
  '/',
  verifyToken,
  requireRole('investor'),
  savedController.getSavedListingsController
);

export default router;
