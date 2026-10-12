import mongoose from 'mongoose';
import SavedListing from '../models/SavedListing.js';
import Listing from '../models/Listing.js';

// ── POST /api/saved/:listingId — save a listing ───────────────────────────────

export async function saveListingController(req, res, next) {
  try {
    const { listingId } = req.params;

    // Safety double-check — the param schema already validated hex format,
    // but isValid also guards against edge-case strings that pass the regex
    // but are not valid ObjectIds.
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Ensure the listing exists and is active
    const listing = await Listing.findById(listingId).lean();
    if (!listing || !listing.isActive) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Upsert — saving twice is idempotent. We use updateOne with upsert
    // so we never get a duplicate-key error. setDefaultsOnInsert ensures
    // the timestamps schema default fires on the first insert.
    const result = await SavedListing.updateOne(
      { investor: req.user.userId, listing: listingId },
      { $setOnInsert: { investor: req.user.userId, listing: listingId } },
      { upsert: true }
    );

    const wasNew = result.upsertedCount === 1;
    return res.status(wasNew ? 201 : 200).json({ message: wasNew ? 'Saved' : 'Already saved' });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/saved/:listingId — unsave a listing ───────────────────────────

export async function unsaveListingController(req, res, next) {
  try {
    const { listingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Succeeds even if the document never existed — idempotent
    await SavedListing.deleteOne({ investor: req.user.userId, listing: listingId });

    return res.json({ message: 'Removed from saved' });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/saved — get paginated saved listings ─────────────────────────────

export async function getSavedListingsController(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

    // Fetch all saved docs for this investor, newest first, with listings
    // populated (same projection as BROWSE_PROJECTION in listings controller)
    const savedDocs = await SavedListing.find({ investor: req.user.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'listing',
        select: 'businessName industry location stage revenueRange fundingGoal fundingPurpose isActive createdAt',
        populate: { path: 'owner', select: 'name' },
      })
      .lean();

    // Filter out entries where the listing was deleted or deactivated
    const activeDocs = savedDocs.filter(
      (doc) => doc.listing !== null && doc.listing.isActive === true
    );

    const total = activeDocs.length;

    // Apply pagination on the filtered array
    const paginated = activeDocs.slice((page - 1) * limit, page * limit);

    // Map to listing objects, adding savedByMe flag
    const listings = paginated.map((doc) => ({
      ...doc.listing,
      savedByMe: true,
    }));

    return res.json({
      data: listings,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}
