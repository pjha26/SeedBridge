import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import SavedListing from '../models/SavedListing.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * isValidObjectId — returns true only for 24-char hex strings that Mongoose
 * accepts as ObjectIds. Used to return 404 instead of a 500 cast error when
 * a caller passes a malformed id.
 */
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

/**
 * escapeRegex — escapes special regex characters in user-supplied strings
 * so that city/state filters never become injection vectors.
 * e.g. "Mum(bai" → "Mum\(bai"
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * browseProjection — fields returned in the paginated list response.
 * Deliberately excludes isSampleData, __v, and nothing about the owner
 * beyond name. Email is never exposed here.
 */
const BROWSE_PROJECTION = {
  businessName:   1,
  industry:       1,
  location:       1,
  stage:          1,
  revenueRange:   1,
  fundingGoal:    1,
  fundingPurpose: 1,
  isActive:       1,
  createdAt:      1,
  // owner populated separately — only name field
};

// ── POST / — create ───────────────────────────────────────────────────────────

export async function createListing(req, res, next) {
  try {
    // Explicit check so we return a clear 409 before hitting the unique index.
    // The index is still there as a hard stop for any race that slips through.
    const existing = await Listing.findOne({ owner: req.user.userId });
    if (existing) {
      return res.status(409).json({
        error: 'You already have a listing. Use PUT /:id to update it.',
      });
    }

    // Pull city/state out of body — Zod validated them as top-level fields,
    // we store them nested under location.
    const { city, state, ...rest } = req.body;

    const listing = await Listing.create({
      ...rest,
      location: { city, state },
      owner: req.user.userId, // always from token, never from body
    });

    return res.status(201).json({ listing });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'You already have a listing. Use PUT /:id to update it.',
      });
    }
    next(err);
  }
}

// ── GET /mine — owner's own listing ──────────────────────────────────────────

export async function getMyListing(req, res, next) {
  try {
    const listing = await Listing.findOne({ owner: req.user.userId })
      .populate('owner', 'name')
      .lean();

    if (!listing) {
      return res.status(404).json({ error: 'You do not have a listing yet.' });
    }

    return res.json({ listing });
  } catch (err) {
    next(err);
  }
}

// ── PUT /:id — update ─────────────────────────────────────────────────────────

export async function updateListing(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Ownership check — must be the listing's owner
    if (listing.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own listing' });
    }

    // Apply each whitelisted field from the validated body.
    // city/state are stored nested but validated flat — unpack them.
    const { city, state, ...rest } = req.body;

    Object.assign(listing, rest);
    if (city !== undefined)  listing.location.city  = city;
    if (state !== undefined) listing.location.state = state;

    await listing.save();

    return res.json({ listing });
  } catch (err) {
    next(err);
  }
}

// ── GET / — browse ────────────────────────────────────────────────────────────

export async function browseListings(req, res, next) {
  try {
    // req.query was validated + coerced by validate(browseQuerySchema, 'query')
    const { q, stage, industry, city, state, minFunding, maxFunding,
            sort, page, limit } = req.query;

    // ── Build filter ──────────────────────────────────────────────────────
    const filter = { isActive: true };

    if (q) {
      // $text search uses the weighted index on businessName/industry/city/description
      filter.$text = { $search: q };
    }

    if (stage?.length)    filter.stage    = { $in: stage };
    if (industry?.length) filter.industry = { $in: industry };

    // Case-insensitive anchored regex — escapeRegex prevents injection.
    // Anchoring with ^ and $ ensures "Mumbai" doesn't match "New Mumbai West".
    if (city) {
      filter['location.city'] = new RegExp(`^${escapeRegex(city)}$`, 'i');
    }
    if (state) {
      filter['location.state'] = new RegExp(`^${escapeRegex(state)}$`, 'i');
    }

    if (minFunding !== undefined || maxFunding !== undefined) {
      filter.fundingGoal = {};
      if (minFunding !== undefined) filter.fundingGoal.$gte = minFunding;
      if (maxFunding !== undefined) filter.fundingGoal.$lte = maxFunding;
    }

    // ── Build sort ────────────────────────────────────────────────────────
    let sortSpec = {};
    switch (sort) {
      case 'funding_asc':  sortSpec = { fundingGoal: 1 };  break;
      case 'funding_desc': sortSpec = { fundingGoal: -1 }; break;
      case 'relevance':
        // MongoDB adds a { score: { $meta: 'textScore' } } sort when using $text.
        // We also project the score so it can be used for ranking.
        sortSpec = { score: { $meta: 'textScore' } };
        break;
      default:             sortSpec = { createdAt: -1 };   // newest
    }

    // ── Projection ────────────────────────────────────────────────────────
    // Always include textScore in projection when doing a text query,
    // otherwise MongoDB throws if sortSpec references $meta but projection doesn't.
    const projection = { ...BROWSE_PROJECTION };
    if (q) projection.score = { $meta: 'textScore' };

    // ── Execute ───────────────────────────────────────────────────────────
    const skip  = (page - 1) * limit;

    // Run count and data queries in parallel for speed.
    const [total, data] = await Promise.all([
      Listing.countDocuments(filter),
      Listing.find(filter, projection)
        .populate('owner', 'name')   // include owner name; email excluded
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Inject savedByMe for investors
    if (req.user?.role === 'investor' && data.length > 0) {
      const listingIds = data.map((l) => l._id);
      const saved = await SavedListing.find(
        { investor: req.user.userId, listing: { $in: listingIds } },
        { listing: 1 }
      ).lean();
      const savedSet = new Set(saved.map((s) => s.listing.toString()));
      data.forEach((l) => { l.savedByMe = savedSet.has(l._id.toString()); });
    }

    return res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /:id — detail ─────────────────────────────────────────────────────────

export async function getListingById(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name')  // name only — email excluded
      .lean();

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Inactive listings are visible only to their own owner.
    // req.user may be undefined here (optionalAuth used on this route).
    if (!listing.isActive) {
      const requestorId = req.user?.userId;
      const ownerId     = listing.owner._id.toString();
      if (requestorId !== ownerId) {
        return res.status(404).json({ error: 'Listing not found' });
      }
    }

    // Inject savedByMe for investors
    if (req.user?.role === 'investor') {
      const saved = await SavedListing.findOne(
        { investor: req.user.userId, listing: listing._id }
      ).lean();
      listing.savedByMe = !!saved;
    }

    return res.json({ listing });
  } catch (err) {
    next(err);
  }
}
