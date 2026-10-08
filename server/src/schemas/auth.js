import { z } from 'zod';
import { ROLE_VALUES } from '../config/constants.js';

// ── Register ──────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()          // normalise before it hits the DB
    .email('Invalid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    // bcrypt silently truncates at 72 bytes. Reject anything longer here
    // so the user is never misled about what their password actually is.
    .max(72, 'Password must be 72 characters or fewer'),

  role: z.enum(ROLE_VALUES, {
    errorMap: () => ({
      message: `Role must be one of: ${ROLE_VALUES.join(', ')}`,
    }),
  }),
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});
