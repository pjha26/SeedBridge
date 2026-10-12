# Backend Design

## Folder structure (additions to existing /server/src)

```
server/src/
  config/
    db.js          ← exists
    constants.js   ← NEW: enum display strings, revenueRange map
  models/
    User.js
    Listing.js
    InterestRequest.js
    SavedListing.js
    Notification.js
  middleware/
    errorHandler.js  ← exists
    auth.js          ← NEW: verifyToken, requireRole(role)
    validate.js      ← NEW: zod validation wrapper
  routes/
    health.js        ← exists
    auth.js
    listings.js
    saved.js
    interest.js
    notifications.js
  controllers/
    auth.js
    listings.js
    saved.js
    interest.js
    notifications.js
  socket/
    index.js         ← Socket.io setup + auth middleware
    handlers.js      ← emitNotification helper
  schemas/           ← NEW: zod schemas for each route group
    auth.js
    listings.js
    interest.js
  scripts/
    seed.js
  app.js             ← updated: adds helmet, rate-limit, all routers
  index.js           ← updated: passes server to socket setup
```

## Key design decisions

### ESM throughout
The project is `"type": "module"`. Every import uses `.js` extension
(including files that are actually `.js`). This is a Node ESM requirement —
the `.js` extension is mandatory even though the file exists, because Node
resolves by the import specifier as written.

### Zod for validation
A small `validate.js` middleware wraps any zod schema into an Express
middleware. Errors are formatted as `{ error: "Validation error", issues: [{path, message}] }`.
This keeps controllers free of manual `if (!req.body.x)` checks.

### Denormalised `owner` on InterestRequest
InterestRequest stores `owner` directly (copied from the listing at creation time).
This lets `GET /interest/received` query `{ owner: req.user.userId }` without
a join through Listing, which simplifies the query and adds one write-time copy.

### Socket.io rooms
Each authenticated socket joins `socket.join(userId)`. The emit helper does
`io.to(userId).emit("notification", payload)`. This works even if the user
has multiple open tabs — all tabs receive the event.

### Email visibility
The `GET /interest/sent` controller filters the populated owner object:
if `request.status !== "accepted"`, the owner field only returns `name`,
not `email`. This is done in JS (not at the DB query level) so the logic
is clear and easy to audit.

### Password never leaves the model
`User.js` schema has `select: false` on `passwordHash`. Any query that
needs the hash must explicitly add `.select('+passwordHash')`.

### Rate limiting
`express-rate-limit` is applied only to the `/api/auth` router subtree in
`app.js`. All other routes are unthrottled for now.

### Helmet
Placed before all routes in `app.js`. No custom configuration needed for a
JSON API (default CSP is fine; we're not serving HTML from Express).

### Seed script
Uses a hardcoded list of emails prefixed with `seed__` so it can find and
delete them on re-run without touching real data.
