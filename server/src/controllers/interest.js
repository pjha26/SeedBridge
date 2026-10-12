import mongoose from 'mongoose';
import InterestRequest from '../models/InterestRequest.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

// ── POST / — investor expresses interest ──────────────────────────────────────

export async function createInterest(req, res, next) {
  try {
    const { listingId, message } = req.body;

    if (!isValidId(listingId)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = await Listing.findById(listingId).lean();
    if (!listing || listing.isActive === false) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const existing = await InterestRequest.findOne({
      investor: req.user.userId,
      listing: listingId,
    }).lean();
    if (existing) {
      return res.status(409).json({ error: 'Already expressed interest in this listing' });
    }

    const interestRequest = await InterestRequest.create({
      listing: listingId,
      investor: req.user.userId,
      owner: listing.owner,
      message: message || '',
    });

    return res.status(201).json({ interestRequest });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Already expressed interest in this listing' });
    }
    next(err);
  }
}

// ── GET /sent — investor sees their sent requests ─────────────────────────────

export async function getSentRequests(req, res, next) {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      InterestRequest.countDocuments({ investor: req.user.userId }),
      InterestRequest.find({ investor: req.user.userId })
        .populate({
          path: 'listing',
          select: 'businessName isActive owner',
          populate: { path: 'owner', select: 'name' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const filtered = docs.filter((doc) => doc.listing !== null);

    // For accepted requests, fetch owner email separately and attach it
    await Promise.all(
      filtered
        .filter((doc) => doc.status === 'accepted' && doc.listing?.owner?._id)
        .map(async (doc) => {
          const ownerUser = await User.findById(doc.listing.owner._id).select('email').lean();
          if (ownerUser) doc.listing.owner.email = ownerUser.email;
        })
    );

    return res.json({
      data: filtered,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /received — owner sees received requests ──────────────────────────────

export async function getReceivedRequests(req, res, next) {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      InterestRequest.countDocuments({ owner: req.user.userId }),
      InterestRequest.find({ owner: req.user.userId })
        .populate('listing', 'businessName')
        .populate('investor', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const filtered = docs.filter((doc) => doc.listing !== null);

    return res.json({
      data: filtered,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /:id — owner accepts or declines ────────────────────────────────────

export async function patchInterestStatus(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: 'Interest request not found' });
    }

    const interestRequest = await InterestRequest.findById(req.params.id);
    if (!interestRequest) {
      return res.status(404).json({ error: 'Interest request not found' });
    }

    if (interestRequest.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You are not the owner of this listing' });
    }

    if (interestRequest.status !== 'pending') {
      return res.status(409).json({ error: 'Cannot change a non-pending request' });
    }

    interestRequest.status = req.body.status;
    await interestRequest.save();

    return res.json({ interestRequest });
  } catch (err) {
    next(err);
  }
}
