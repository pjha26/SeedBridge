import { z } from 'zod';

export const createInterestSchema = z.object({
  listingId: z.string().length(24).regex(/^[a-f0-9]{24}$/, 'Invalid listing ID'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
}).strict();

export const patchInterestSchema = z.object({
  status: z.enum(['accepted', 'declined']),
}).strict();

export const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
