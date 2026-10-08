/**
 * validate(schema, source = 'body')
 * ----------------------------------
 * Returns an Express middleware that parses req[source] through a Zod schema.
 *
 * source: 'body' (default) or 'query'
 *
 * On success: replaces req[source] with the parsed (and coerced) output,
 *   so downstream handlers receive clean, typed data.
 *
 * On failure: returns a consistent error shape:
 *   { error: "Validation error", issues: [{ path: "fieldName", message: "..." }] }
 *
 * The `path` is a dot-joined string of the field path (e.g. "location.city"),
 * which is easy for the client to map to a form field.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), handler)
 *   router.get('/',          validate(browseSchema, 'query'), handler)
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const issues = result.error.errors.map((e) => ({
        path:    e.path.join('.') || source,
        message: e.message,
      }));
      return res.status(400).json({ error: 'Validation error', issues });
    }

    req[source] = result.data; // replace with parsed + coerced output
    next();
  };
}
