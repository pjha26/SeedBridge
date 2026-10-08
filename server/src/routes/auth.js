import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import * as authController from '../controllers/auth.js';

const router = Router();

// Rate limiting is applied to this entire router in app.js, not here,
// so the limit applies uniformly to all auth routes.

router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);
router.get('/me',        verifyToken,              authController.me);

export default router;
