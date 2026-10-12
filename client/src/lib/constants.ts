/**
 * Client-side constants — mirrors server/src/config/constants.js.
 *
 * The server sends and validates short enum keys.
 * This file maps those keys to display strings for the UI.
 * When the server adds a new value, add it here too.
 */

// ── Stage ─────────────────────────────────────────────────────────────────────
export type StageKey =
  | 'idea'
  | 'early_revenue'
  | 'revenue'
  | 'profitable'
  | 'scaling';

export const STAGE_LABELS: Record<StageKey, string> = {
  idea:          'Idea',
  early_revenue: 'Early revenue',
  revenue:       'Revenue',
  profitable:    'Profitable',
  scaling:       'Scaling',
};

export const STAGE_OPTIONS = Object.entries(STAGE_LABELS) as [StageKey, string][];

// ── Revenue range (annual, INR) ───────────────────────────────────────────────
export type RevenueRangeKey =
  | 'none'
  | '1_10k'
  | '10k_1L'
  | '1L_10L'
  | '10L_1Cr'
  | '1Cr_plus';

export const REVENUE_RANGE_LABELS: Record<RevenueRangeKey, string> = {
  none:      '₹0 (pre-revenue)',
  '1_10k':   '₹1 – ₹10,000',
  '10k_1L':  '₹10,000 – ₹1 Lakh',
  '1L_10L':  '₹1 Lakh – ₹10 Lakh',
  '10L_1Cr': '₹10 Lakh – ₹1 Crore',
  '1Cr_plus':'₹1 Crore+',
};

export const REVENUE_RANGE_OPTIONS = Object.entries(REVENUE_RANGE_LABELS) as [
  RevenueRangeKey,
  string,
][];

// ── Industries (curated list for filter UI) ───────────────────────────────────
// Free text on the server; this list drives the dropdown options.
export const INDUSTRY_OPTIONS = [
  'Agriculture',
  'Apparel & Textiles',
  'Clean Energy',
  'Education',
  'Food & Beverage',
  'Healthcare',
  'Logistics',
  'Manufacturing',
  'Real Estate / PropTech',
  'Software / SaaS',
  'Other',
] as const;

export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];

// ── Money formatter (INR with Indian grouping) ────────────────────────────────
// e.g. 4000000 → "₹40,00,000"
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Interest status ───────────────────────────────────────────────────────────

export type InterestStatusKey = 'none' | 'pending' | 'accepted' | 'declined';

export const INTEREST_STATUS_LABELS: Record<InterestStatusKey, string> = {
  none:     '',
  pending:  'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
};

export function interestStatusStyle(status: string): { color: string; fontWeight?: number } {
  if (status === 'accepted') return { color: 'var(--color-forest)', fontWeight: 600 };
  if (status === 'declined') return { color: 'var(--color-clay)', fontWeight: 600 };
  return { color: 'var(--color-ink)' };
}
