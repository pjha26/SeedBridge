import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getNotifications,
  markAllRead,
  markOneRead,
} from '../controllers/notifications.js';

const router = Router();

// /read-all must be mounted before /:id/read to avoid shadowing
router.get('/',              verifyToken, getNotifications);
router.patch('/read-all',    verifyToken, markAllRead);
router.patch('/:id/read',    verifyToken, markOneRead);

export default router;
