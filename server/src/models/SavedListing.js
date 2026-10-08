import mongoose from 'mongoose';

const savedListingSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevents saving the same listing twice.
// The controller uses findOneAndUpdate with upsert so it never errors on
// duplicate saves — it just returns the existing document.
savedListingSchema.index(
  { investor: 1, listing: 1 },
  { unique: true, name: 'unique_investor_listing' }
);

export default mongoose.model('SavedListing', savedListingSchema);
