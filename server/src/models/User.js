import mongoose from 'mongoose';
import { ROLE_VALUES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,   // stored in lowercase regardless of input case
      trim: true,
    },
    // select: false means this field is NEVER returned by a query unless the
    // caller explicitly adds .select('+passwordHash'). Prevents accidental leaks.
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      required: [true, 'Role is required'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
