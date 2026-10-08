/**
 * Centralised error handler.
 * Express identifies this as an error handler because it has 4 parameters.
 *
 * Usage in a route/controller:
 *   return next(new Error('Something went wrong'));
 *   // or attach a status:
 *   const err = new Error('Not found'); err.status = 404; next(err);
 */
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  res.status(status).json({ error: message });
}
