/**
 * Shared enum constants for SeedBridge.
 *
 * The DB stores short keys only. The client maps keys → display strings.
 * Zod schemas import the key arrays from here so the single source of
 * truth is this file, not duplicated in schemas and models.
 */

// ── Business stage ────────────────────────────────────────────────────────────
export const STAGE_VALUES = [
  'idea',
  'early_revenue',
  'revenue',
  'profitable',
  'scaling',
];

export const STAGE_LABELS = {
  idea:          'Idea',
  early_revenue: 'Early revenue',
  revenue:       'Revenue',
  profitable:    'Profitable',
  scaling:       'Scaling',
};

// ── Annual revenue range (INR) ────────────────────────────────────────────────
// Keys are short snake_case strings safe for query-string and JS use.
// "none" means ₹0 revenue — kept as a string so it is never falsy or
// misread as the number 0.
// All ranges represent annual revenue in Indian Rupees (INR).
export const REVENUE_RANGE_VALUES = [
  'none',
  '1_10k',
  '10k_1L',
  '1L_10L',
  '10L_1Cr',
  '1Cr_plus',
];

export const REVENUE_RANGE_LABELS = {
  none:     '₹0 (pre-revenue)',
  '1_10k':  '₹1 – ₹10,000',
  '10k_1L': '₹10,000 – ₹1 Lakh',
  '1L_10L': '₹1 Lakh – ₹10 Lakh',
  '10L_1Cr':'₹10 Lakh – ₹1 Crore',
  '1Cr_plus':'₹1 Crore+',
};

// ── Interest request status ───────────────────────────────────────────────────
export const INTEREST_STATUS_VALUES = ['pending', 'accepted', 'declined'];

// ── Notification types ────────────────────────────────────────────────────────
// Add new values here when new notification events are introduced.
// Used as a Mongoose enum and in Zod schemas so the type can never be mistyped.
export const NOTIFICATION_TYPES = {
  INTEREST_RECEIVED: 'interest_received',   // owner receives when investor sends
  INTEREST_ACCEPTED: 'interest_accepted',   // investor receives when owner accepts
  INTEREST_DECLINED: 'interest_declined',   // investor receives when owner declines
};

// Array form for Mongoose enum and Zod .enum()
export const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPES);

// ── User roles ────────────────────────────────────────────────────────────────
export const ROLE_VALUES = ['owner', 'investor'];
