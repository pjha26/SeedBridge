/**
 * SeedBridge seed script
 * ─────────────────────
 * Creates sample owners, investors, and listings for development.
 *
 * Usage:  npm run seed
 *
 * Rules:
 *   - Refuses to run when NODE_ENV=production.
 *   - Deletes all existing seed data first (users whose emails start with
 *     "seed__", and everything that belongs to them).
 *   - All seed accounts share one dev password (printed at the end).
 *   - All seed listings are marked isSampleData: true.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User             from '../models/User.js';
import Listing          from '../models/Listing.js';
import InterestRequest  from '../models/InterestRequest.js';
import SavedListing     from '../models/SavedListing.js';
import Notification     from '../models/Notification.js';

// ── Guards ────────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: seed script refuses to run in production.');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set.');
  process.exit(1);
}

// ── Seed data ─────────────────────────────────────────────────────────────────

// All seed emails start with this prefix so cleanup can find them with
// a safe anchored regex and never touch real accounts.
const PREFIX = 'seed__';
const DEV_PASSWORD = 'SeedBridge2024!';

const SEED_OWNERS = [
  { name: 'Rohan Mehta',     email: `${PREFIX}rohan@example.com`,   role: 'owner' },
  { name: 'Ananya Iyer',     email: `${PREFIX}ananya@example.com`,  role: 'owner' },
  { name: 'Suresh Pillai',   email: `${PREFIX}suresh@example.com`,  role: 'owner' },
  { name: 'Fatima Sheikh',   email: `${PREFIX}fatima@example.com`,  role: 'owner' },
  { name: 'Arjun Nambiar',   email: `${PREFIX}arjun@example.com`,   role: 'owner' },
  { name: 'Meera Joshi',     email: `${PREFIX}meera@example.com`,   role: 'owner' },
  { name: 'Deepak Rao',      email: `${PREFIX}deepak@example.com`,  role: 'owner' },
  { name: 'Shreya Bose',     email: `${PREFIX}shreya@example.com`,  role: 'owner' },
];

const SEED_INVESTORS = [
  { name: 'Vikram Nair',     email: `${PREFIX}vikram@example.com`,  role: 'investor' },
  { name: 'Priya Kapoor',    email: `${PREFIX}priya@example.com`,   role: 'investor' },
];

// 8 listings across different industries and Indian cities
// Each entry maps to one owner by index into SEED_OWNERS (0-7, one each)
const SEED_LISTINGS = [
  {
    ownerIndex: 0,
    businessName:   'Kettleground Coffee',
    industry:       'Food & Beverage',
    city:           'Pune',
    state:          'Maharashtra',
    stage:          'revenue',
    revenueRange:   '10L_1Cr',
    fundingGoal:    4_000_000,
    fundingPurpose: 'Second roasting unit and direct-to-consumer logistics.',
    description:    'Specialty coffee roastery supplying 60+ cafes and running a small subscription business. Third year of operation. Looking for a patient investor who understands the food business.',
  },
  {
    ownerIndex: 1,
    businessName:   'Viraaj Agro Farms',
    industry:       'Agriculture',
    city:           'Karnal',
    state:          'Haryana',
    stage:          'profitable',
    revenueRange:   '1Cr_plus',
    fundingGoal:    7_500_000,
    fundingPurpose: 'Cold storage facility and direct retail channel.',
    description:    'Third-generation family farm growing rice and wheat across 180 acres. Consistent output, strong local relationships, zero debt.',
  },
  {
    ownerIndex: 2,
    businessName:   'Formly',
    industry:       'Software / SaaS',
    city:           'Bangalore',
    state:          'Karnataka',
    stage:          'revenue',
    revenueRange:   '10L_1Cr',
    fundingGoal:    6_000_000,
    fundingPurpose: 'First full-time engineer and marketing to reach SMB segment.',
    description:    'A form-builder for Indian SMBs with 1,200 paying customers and 82% 18-month retention. Built by two people, no outside capital so far.',
  },
  {
    ownerIndex: 3,
    businessName:   'Kinnow Collective',
    industry:       'Agriculture',
    city:           'Amritsar',
    state:          'Punjab',
    stage:          'early_revenue',
    revenueRange:   '1L_10L',
    fundingGoal:    2_500_000,
    fundingPurpose: 'Refrigerated transport and direct export to UAE.',
    description:    'A cooperative of 12 kinnow and mango farmers in the Amritsar belt selling directly to urban distributors. First season with direct sales saw 40% better margins.',
  },
  {
    ownerIndex: 4,
    businessName:   'Coastal Threads',
    industry:       'Apparel & Textiles',
    city:           'Kochi',
    state:          'Kerala',
    stage:          'revenue',
    revenueRange:   '10L_1Cr',
    fundingGoal:    3_200_000,
    fundingPurpose: 'Export certification and B2B website rebuild.',
    description:    'A workshop of 18 weavers producing Kerala kasavu sarees and contemporary linen. Growing export enquiries from Malaysia and the UK.',
  },
  {
    ownerIndex: 5,
    businessName:   'NestEasy',
    industry:       'Real Estate / PropTech',
    city:           'Hyderabad',
    state:          'Telangana',
    stage:          'early_revenue',
    revenueRange:   '10k_1L',
    fundingGoal:    5_000_000,
    fundingPurpose: 'City expansion and sales team of 3.',
    description:    'A tenant-landlord matchmaking service that handles documentation and mediation. 400 completed agreements in 18 months. Zero cold-calling model.',
  },
  {
    ownerIndex: 6,
    businessName:   'SolarBai',
    industry:       'Clean Energy',
    city:           'Jodhpur',
    state:          'Rajasthan',
    stage:          'profitable',
    revenueRange:   '10L_1Cr',
    fundingGoal:    9_000_000,
    fundingPurpose: 'Financing rooftop installations for rural schools under PMGSY.',
    description:    'Installing and maintaining rooftop solar for rural institutions in Rajasthan. 230 installations, positive unit economics, and a 7-year service contract model.',
  },
  {
    ownerIndex: 7,
    businessName:   'Dhaba on Wheels',
    industry:       'Food & Beverage',
    city:           'Jaipur',
    state:          'Rajasthan',
    stage:          'idea',
    revenueRange:   'none',
    fundingGoal:    1_200_000,
    fundingPurpose: 'Two food trucks, regulatory approvals, and pilot run.',
    description:    'A food truck concept bringing Rajasthani thali food to tech parks and universities in Jaipur. Founder ran a 400-cover restaurant for 5 years.',
  },
];

// ── Cleanup ───────────────────────────────────────────────────────────────────

async function cleanup() {
  // Anchored, escaped regex — only matches emails that start exactly with
  // the prefix. Never matches real accounts.
  const seedEmailPattern = new RegExp(`^${PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

  const seedUsers = await User.find({ email: seedEmailPattern }).select('_id').lean();
  const seedIds   = seedUsers.map((u) => u._id);

  if (seedIds.length === 0) {
    console.log('No existing seed data found.');
    return;
  }

  // Delete everything that belongs to those users before deleting the users
  // themselves, so nothing is left orphaned.
  const [listings, interests, saved, notifs] = await Promise.all([
    Listing.deleteMany({ owner: { $in: seedIds } }),
    InterestRequest.deleteMany({
      $or: [
        { investor: { $in: seedIds } },
        { owner:    { $in: seedIds } },
      ],
    }),
    SavedListing.deleteMany({ investor: { $in: seedIds } }),
    Notification.deleteMany({ user: { $in: seedIds } }),
  ]);

  await User.deleteMany({ _id: { $in: seedIds } });

  console.log(
    `Cleaned up: ${seedIds.length} users, ${listings.deletedCount} listings, ` +
    `${interests.deletedCount} interest requests, ${saved.deletedCount} saved, ` +
    `${notifs.deletedCount} notifications.`
  );
}

// ── Create ────────────────────────────────────────────────────────────────────

async function create() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  // Create all users first, then map listings by ownerIndex
  const allSeedUsers = [...SEED_OWNERS, ...SEED_INVESTORS];
  const createdUsers = await User.insertMany(
    allSeedUsers.map((u) => ({ ...u, passwordHash }))
  );

  // createdUsers[0..3] = owners, [4..5] = investors (matches allSeedUsers order)
  const owners = createdUsers.slice(0, SEED_OWNERS.length);

  // Distribute listings: one per owner, indices are unique in SEED_LISTINGS
  const listingsToCreate = SEED_LISTINGS.map(({ ownerIndex, city, state, ...rest }) => ({
    ...rest,
    location: { city, state },
    owner: owners[ownerIndex]._id,
    isSampleData: true,
  }));

  const createdListings = await Listing.insertMany(listingsToCreate);

  return { users: createdUsers, listings: createdListings };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  await cleanup();
  const { users, listings } = await create();

  console.log('\n──────────────────────────────────────────');
  console.log('  SeedBridge dev seed complete');
  console.log('──────────────────────────────────────────');
  console.log(`  Dev password (all accounts): ${DEV_PASSWORD}`);
  console.log('\n  Owners:');
  users.filter((u) => u.role === 'owner').forEach((u) => {
    console.log(`    ${u.email}`);
  });
  console.log('\n  Investors:');
  users.filter((u) => u.role === 'investor').forEach((u) => {
    console.log(`    ${u.email}`);
  });
  console.log(`\n  Listings created: ${listings.length}`);
  listings.forEach((l) => {
    console.log(`    ${l.businessName} (${l.location.city}, ${l.location.state})`);
  });
  console.log('──────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
