/* ─────────────────────────────────────────────────────────────
   Landing page content — edit copy and sample data here.
   ───────────────────────────────────────────────────────────── */

export const hero = {
  headline: 'Good businesses\nneed the right\npeople behind them.',
  subline:
    'SeedBridge is where owners put their business in front of investors who are actually looking.',
  ctaOwner: "I'm building a business",
  ctaInvestor: "I'm looking to back one",
};

export const gap = {
  heading: 'The gap',
  body: [
    'A coffee roaster in Pune has been profitable for three years. A family farm in Haryana wants to add cold storage. A small SaaS tool has a thousand paying customers and no idea how to grow.',
    'None of them show up in a pitch deck database. Most of the people who would back them have no way to find them.',
    'SeedBridge is built for businesses that do not fit the usual story — and for investors who are looking beyond it.',
  ],
};

export type Step = { number: string; label: string; description: string };

export const howItWorks: { heading: string; steps: Step[] } = {
  heading: 'How it works',
  steps: [
    {
      number: '01',
      label: 'List',
      description:
        'Owners post one listing: what they have built, where they are, and what they need.',
    },
    {
      number: '02',
      label: 'Discover',
      description:
        'Investors browse and filter by industry, location, stage, and funding range.',
    },
    {
      number: '03',
      label: 'Connect',
      description:
        'Investors send an interest request. Owners review it and decide whether to respond.',
    },
  ],
};

export const twoSides = {
  heading: 'Two sides, one bridge',
  owner: {
    role: 'For business owners',
    points: [
      'One listing, always yours to update.',
      'Decide who you respond to — no obligation.',
      'See exactly who has expressed interest and what they said.',
      'No listing fees, no commission, no fine print.',
    ],
    cta: 'Post your listing',
  },
  investor: {
    role: 'For investors',
    points: [
      'Browse real businesses, not polished pitch decks.',
      'Filter by what you care about: industry, size, stage.',
      'Save listings to revisit later.',
      'Send a short note. The owner takes it from there.',
    ],
    cta: 'Start browsing',
  },
};

export type StageName = 'Revenue' | 'Pre-revenue' | 'Profitable' | 'Scaling' | 'Idea';

export interface SampleListing {
  label: 'Sample listing';
  name: string;
  industry: string;
  location: string;
  stage: StageName;
  revenueRange: string;
  fundingGoal: string;
  fundingPurpose: string;
  description: string;
}

export const sampleListings: SampleListing[] = [
  {
    label: 'Sample listing',
    name: 'Kettleground Coffee',
    industry: 'Food & Beverage',
    location: 'Pune, Maharashtra',
    stage: 'Revenue',
    revenueRange: '₹10L – ₹1Cr',
    fundingGoal: '₹40,00,000',
    fundingPurpose: 'Second roasting unit and direct-to-consumer logistics.',
    description:
      'A specialty coffee roastery supplying 60+ cafes and running a small subscription business. Looking for a patient investor who understands the food business.',
  },
  {
    label: 'Sample listing',
    name: 'Viraaj Agro Farms',
    industry: 'Agriculture',
    location: 'Karnal, Haryana',
    stage: 'Profitable',
    revenueRange: '₹1Cr+',
    fundingGoal: '₹75,00,000',
    fundingPurpose: 'Cold storage facility and direct retail channel.',
    description:
      'Third-generation family farm growing rice and wheat across 180 acres. Consistent output, strong local relationships, zero debt.',
  },
  {
    label: 'Sample listing',
    name: 'Formly',
    industry: 'Software / SaaS',
    location: 'Remote (India)',
    stage: 'Revenue',
    revenueRange: '₹10L – ₹1Cr',
    fundingGoal: '₹60,00,000',
    fundingPurpose: 'First hire (engineer) and marketing to reach SMB segment.',
    description:
      'A form-builder for Indian SMBs with 1,200 paying customers and an 18-month retention rate of 82%. Built by two people. No outside capital so far.',
  },
];

export const straightTalk = {
  heading: 'What SeedBridge is and is not',
  body: [
    'SeedBridge introduces business owners and investors to each other. That is all it does.',
    'We do not process investments, hold funds, verify financials, give advice, or take a cut of anything. Every decision — whether to respond, what to share, whether to invest — is yours.',
    'Do your own research. Talk to a financial adviser if you need one. Use SeedBridge to find people you could not find otherwise.',
  ],
};

export const cta = {
  heading: 'Find who you have been looking for.',
  ctaOwner: "List your business",
  ctaInvestor: "Browse businesses",
};

export const footer = {
  tagline: 'Something small. A path across.',
  links: [
    { label: 'About', href: '#' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
  legal: `© ${new Date().getFullYear()} SeedBridge. Not a financial adviser, broker, or investment platform.`,
};
