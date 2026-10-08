import { z } from 'zod';
import { STAGE_VALUES, REVENUE_RANGE_VALUES } from '../config/constants.js';

// ── Shared field definitions ──────────────────────────────────────────────────

const businessNameField = z
  .string().trim().min(1, 'Business name is required').max(150);

const industryField = z
  .string().trim().min(1, 'Industry is required').max(100);

const cityField  = z.string().trim().min(1, 'City is required').max(100);
const stateField = z.string().trim().min(1, 'State is required').max(100);

const stageField = z.enum(STAGE_VALUES, {
  errorMap: () => ({ message: `Stage must be one of: ${STAGE_VALUES.join(', ')}` }),
});

const revenueRangeField = z.enum(REVENUE_RANGE_VALUES, {
  errorMap: () => ({ message: `Revenue range must be one of: ${REVENUE_RANGE_VALUES.join(', ')}` }),
});

const fundingGoalField = z
  .number({ invalid_type_error: 'Funding goal must be a number' })
  .int('Funding goal must be a whole number')
  .min(1, 'Funding goal must be at least ₹1')
  .max(100_000_000_000, 'Funding goal is unrealistically large'); // ₹100 Cr cap

// ── Create schema ─────────────────────────────────────────────────────────────
// owner, isSampleData, timestamps are NOT in this schema — they are set
// server-side only. Zod strips unknown keys with .strict() so any attempt
// to send those fields returns a validation error.
export const createListingSchema = z.object({
  businessName:  businessNameField,
  industry:      industryField,
  city:          cityField,
  state:         stateField,
  stage:         stageField,
  revenueRange:  revenueRangeField,
  fundingGoal:   fundingGoalField,
  fundingPurpose: z.string().trim().min(1, 'Funding purpose is required').max(500),
  description:   z.string().trim().min(1, 'Description is required').max(2000),
  isActive:      z.boolean().optional(),
}).strict(); // reject any extra keys (e.g. owner, isSampleData)

// ── Update schema ─────────────────────────────────────────────────────────────
// All fields optional — only validate what's sent.
export const updateListingSchema = z.object({
  businessName:  businessNameField.optional(),
  industry:      industryField.optional(),
  city:          cityField.optional(),
  state:         stateField.optional(),
  stage:         stageField.optional(),
  revenueRange:  revenueRangeField.optional(),
  fundingGoal:   fundingGoalField.optional(),
  fundingPurpose: z.string().trim().min(1).max(500).optional(),
  description:   z.string().trim().min(1).max(2000).optional(),
  isActive:      z.boolean().optional(),
}).strict();

// ── Browse query schema ───────────────────────────────────────────────────────
// Query params arrive as strings — z.coerce converts them to the right type.
// Multi-value fields accept comma-separated strings and are split into arrays.

// Helper: turns "a,b,c" → ["a","b","c"], handles single values too
function csvToArray(val) {
  if (Array.isArray(val)) return val;
  return String(val).split(',').map((s) => s.trim()).filter(Boolean);
}

const SORT_VALUES = ['newest', 'funding_asc', 'funding_desc', 'relevance'];

export const browseQuerySchema = z
  .object({
    q:           z.string().trim().max(200).optional(),

    // Accept one or several comma-separated stage/industry values
    stage: z
      .string()
      .optional()
      .transform((v) => (v ? csvToArray(v) : undefined))
      .pipe(z.array(z.enum(STAGE_VALUES)).optional()),

    industry: z
      .string()
      .optional()
      .transform((v) => (v ? csvToArray(v) : undefined))
      .pipe(z.array(z.string().trim().max(100)).optional()),

    city:  z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),

    // Coerce string → number; reject if min > max (checked in refine below)
    minFunding: z.coerce.number().min(0).optional(),
    maxFunding: z.coerce.number().min(0).optional(),

    sort: z
      .enum(SORT_VALUES, {
        errorMap: () => ({ message: `sort must be one of: ${SORT_VALUES.join(', ')}` }),
      })
      .default('newest'),

    page:  z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50, 'limit cannot exceed 50').default(12),
  })
  .refine(
    (d) => {
      // relevance sort is only meaningful when a search query is present
      if (d.sort === 'relevance' && !d.q) return false;
      return true;
    },
    { message: 'sort=relevance requires a search query (q)', path: ['sort'] }
  )
  .refine(
    (d) => {
      if (d.minFunding !== undefined && d.maxFunding !== undefined) {
        return d.minFunding <= d.maxFunding;
      }
      return true;
    },
    { message: 'minFunding cannot be greater than maxFunding', path: ['minFunding'] }
  );
