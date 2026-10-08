import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * verifyToken
 * -----------
 * Reads the JWT from the Authorization header ("Bearer <token>"),
 * verifies it, then loads the full user from the DB.
 *
 * Rejects if:
 *  - No token provided (401)
 *  - Token is malformed or expired (401)
 *  - User no longer exists in the DB (401) — handles deleted accounts
 *
 * Attaches req.user = { userId, role, name, email } on success.
 * We load the user from DB (not just trust the token payload) so that
 * a deleted or suspended account is rejected immediately without
 * waiting for the token to expire.
 */
export async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7); // strip "Bearer "

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Load user from DB to ensure they still exist.
  // passwordHash excluded by default (select: false on schema).
  const user = await User.findById(payload.userId).lean();
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // Attach a plain object — intentionally no passwordHash
  req.user = {
    userId: user._id.toString(),
    role:   user.role,
    name:   user.name,
    email:  user.email,
  };

  next();
}

/**
 * requireRole(role)
 * -----------------
 * Factory that returns a middleware enforcing a single role.
 * Must be used AFTER verifyToken in the middleware chain.
 *
 * Usage:
 *   router.post('/', verifyToken, requireRole('owner'), handler)
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({
        error: `This action requires the "${role}" role`,
      });
    }
    next();
  };
}

/**
 * optionalAuth
 * ------------
 * Like verifyToken but NEVER rejects. If a valid token is present it
 * attaches req.user exactly as verifyToken does. If no token, a bad
 * token, or a deleted user — req.user stays undefined and the request
 * continues.
 *
 * Used for GET /:id where an inactive listing is visible only to its
 * owner but the route is otherwise public.
 */
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(); // bad/expired token — treat as unauthenticated
  }

  const user = await User.findById(payload.userId).lean();
  if (user) {
    req.user = {
      userId: user._id.toString(),
      role:   user.role,
      name:   user.name,
      email:  user.email,
    };
  }
  next();
}
