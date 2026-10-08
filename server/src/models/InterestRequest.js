import mongoose from 'mongoose';
import { INTEREST_STATUS_VALUES } from '../config/constants.js';

const interestRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalised from listing.owner at creation time so that
    // GET /interest/received can query { owner: userId } directly,
    // without joining through the Listing collection.
    // NEVER accepted from the request body — always set server-side.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: INTEREST_STATUS_VALUES,
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevents a single investor from sending more than one request per listing.
// The controller also checks and returns a 409, but this index is the hard stop.
interestRequestSchema.index(
  { listing: 1, investor: 1 },
  { unique: true, name: 'unique_listing_investor' }
);

// Compound index for GET /interest/received with optional status filter and
// sorted by newest first. The { owner, status, createdAt } order matches the
// query shape: equality on owner, optional equality on status, sort on createdAt.
interestRequestSchema.index(
  { owner: 1, status: 1, createdAt: -1 },
  { name: 'owner_status_date' }
);

export default mongoose.model('InterestRequest', interestRequestSchema);
