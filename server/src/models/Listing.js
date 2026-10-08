import mongoose from 'mongoose';
import { STAGE_VALUES, REVENUE_RANGE_VALUES } from '../config/constants.js';

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // unique: true enforces the one-listing-per-owner rule at the DB level.
      // The controller also checks explicitly so it can return a clear 409.
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 150,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      maxlength: 100,
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
    },
    stage: {
      type: String,
      enum: STAGE_VALUES,
      required: [true, 'Stage is required'],
    },
    revenueRange: {
      type: String,
      enum: REVENUE_RANGE_VALUES,
      required: [true, 'Revenue range is required'],
    },
    fundingGoal: {
      type: Number,
      required: [true, 'Funding goal is required'],
      min: [1, 'Funding goal must be a positive number'],
    },
    fundingPurpose: {
      type: String,
      required: [true, 'Funding purpose is required'],
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    isSampleData: {
      type: Boolean,
      default: false,   // seed script sets this to true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Full-text search index across the most useful text fields.
// Weights make businessName matches rank higher than description matches.
listingSchema.index(
  {
    businessName: 'text',
    industry:     'text',
    'location.city': 'text',
    description:  'text',
  },
  {
    weights: { businessName: 10, industry: 5, 'location.city': 3, description: 1 },
    name: 'listing_text_search',
  }
);

export default mongoose.model('Listing', listingSchema);
