import { ZodError } from 'zod';

/**
 * validate(schema)
 * ----------------
 * Returns an Express middleware that parses req.body through a Zod schema.
 *
 * On success: replaces req.body with the parsed (and coerced) output,
 *   so downstream handlers receive clean, typed data.
 *
 * On failure: returns a consistent error shape:
 *   { error: "Validation error", issues: [{ path: "fieldName", message: "..." }] }
 *
 * The `path` is a dot-joined string of the field path (e.g. "location.city"),
 * which is easy for the client to map to a form field.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register)
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issues = result.error.errors.map((e) => ({
        path:    e.path.join('.') || 'body',
        message: e.message,
      }));
      return res.status(400).json({ error: 'Validation error', issues });
    }

    req.body = result.data; // replace with parsed output
    next();
  };
}
