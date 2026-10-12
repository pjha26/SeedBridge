import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function signToken(user) {
  // Payload is minimal: only what middleware needs to make a role decision
  // without hitting the DB on every request. The DB is still checked in
  // verifyToken to catch deleted users.
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Fields safe to return to the client — never the passwordHash
function publicUser(user) {
  return {
    _id:       user._id,
    name:      user.name,
    email:     user.email,
    role:      user.role,
    createdAt: user.createdAt,
  };
}

// A pre-computed hash used in the "user not found" branch of login.
// bcrypt.compare() is called against this so the response time is
// identical whether or not the email exists, preventing timing attacks
// that reveal which emails are registered.
const DUMMY_HASH = await bcrypt.hash('__dummy_password_never_matches__', 10);

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    // req.body is already validated and normalised by the validate middleware

    // Explicit duplicate check before insert so we can return a clear 409.
    // The unique index is a second safety net for race conditions.
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Cost factor 12: ~250ms on a modern CPU — fast enough for UX, slow
    // enough to be expensive for an attacker running bulk attempts.
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ name, email, passwordHash, role });
    const token = signToken(user);

    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    // Catch the Mongoose duplicate-key error (code 11000) as a fallback
    // for the race condition where two requests slip past the findOne check.
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    next(err);
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Fetch user WITH the hash (excluded by default via select: false)
    const user = await User.findOne({ email }).select('+passwordHash');

    let passwordMatch = false;
    if (user) {
      passwordMatch = await bcrypt.compare(password, user.passwordHash);
    } else {
      // User doesn't exist — still run a bcrypt compare against the dummy
      // hash so the response time is the same as a real failed login.
      await bcrypt.compare(password, DUMMY_HASH);
    }

    if (!user || !passwordMatch) {
      // Single generic message regardless of which field was wrong.
      // This prevents email enumeration: an attacker can't tell whether
      // the email exists or the password was wrong.
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// ── Me ────────────────────────────────────────────────────────────────────────

export async function me(req, res) {
  // req.user is populated by verifyToken middleware.
  // We re-fetch from DB here to return the freshest data, in case the
  // name or email changed after the token was issued.
  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(401).json({ error: 'User not found' });
  return res.json({ user: publicUser(user) });
}
