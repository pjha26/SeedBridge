import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listingIdParamSchema } from '../schemas/saved.js';
import * as savedController from '../controllers/saved.js';

const router = Router();

// All saved routes require investor role

router.post(
  '/:listingId',
  verifyToken,
  requireRole('investor'),
  validate(listingIdParamSchema, 'params'),
  savedController.saveListingController
);

router.delete(
  '/:listingId',
  verifyToken,
  requireRole('investor'),
  validate(listingIdParamSchema, 'params'),
  savedController.unsaveListingController
);

router.get(
  '/',
  verifyToken,
  requireRole('investor'),
  savedController.getSavedListingsController
);

export default router;
