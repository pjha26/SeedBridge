import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createInterestSchema, patchInterestSchema, paginationSchema } from '../schemas/interest.js';
import * as interestController from '../controllers/interest.js';

const router = Router();

router.post(
  '/',
  verifyToken,
  requireRole('investor'),
  validate(createInterestSchema),
  interestController.createInterest
);

router.get(
  '/sent',
  verifyToken,
  requireRole('investor'),
  validate(paginationSchema, 'query'),
  interestController.getSentRequests
);

router.get(
  '/received',
  verifyToken,
  requireRole('owner'),
  validate(paginationSchema, 'query'),
  interestController.getReceivedRequests
);

router.patch(
  '/:id',
  verifyToken,
  validate(patchInterestSchema),
  interestController.patchInterestStatus
);

export default router;
