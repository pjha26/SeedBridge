import { z } from 'zod';

// Validates :listingId param is a 24-char hex string
export const listingIdParamSchema = z.object({
  listingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid listing id'),
});
