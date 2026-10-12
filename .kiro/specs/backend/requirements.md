# Backend Requirements

## Models

### User
- Fields: `name` (string, required), `email` (string, unique, lowercase, required),
  `passwordHash` (string, required, never returned), `role` ("owner" | "investor", required),
  `createdAt`, `updatedAt`.
- No virtual `password` field — hashing happens in the controller before save.

### Listing
- Fields: `owner` (ref User, required, unique — enforces one listing per owner),
  `businessName`, `industry`, `location.city`, `location.state`, `stage` (enum),
  `revenueRange` (enum), `fundingGoal` (number, positive), `fundingPurpose`,
  `description`, `isActive` (default true), timestamps.
- Stage enum: `idea | early_revenue | revenue | profitable | scaling`.
- RevenueRange enum: `0 | 1_10k | 10k_1L | 1L_10L | 10L_1Cr | 1Cr_plus`
  (short keys, display strings in a constants file).
- Text index on `businessName + industry + location.city + description` for search.

### InterestRequest
- Fields: `listing` (ref), `investor` (ref), `owner` (ref, denormalised for fast owner queries),
  `message` (string, optional, maxlength 500), `status` ("pending" | "accepted" | "declined"),
  timestamps.
- Unique compound index `{ listing, investor }` — blocks duplicates at DB level.

### SavedListing
- Fields: `investor` (ref User), `listing` (ref Listing), timestamps.
- Unique compound index `{ investor, listing }`.

### Notification
- Fields: `user` (ref), `type` (string), `message` (string),
  `relatedRequest` (ref InterestRequest, optional), `read` (default false), timestamps.

---

## Auth API

| Route | Auth | Rule |
|---|---|---|
| POST /api/auth/register | none | Validate name/email/password/role; hash pw; return JWT + public user |
| POST /api/auth/login | none | Validate email/password; return JWT + public user |
| GET /api/auth/me | JWT | Return current user (no password) |

- JWT payload: `{ userId, role }`. Expiry from `JWT_EXPIRES_IN` env var (default 7d).
- Auth routes are rate-limited (20 req / 15 min per IP).

---

## Listings API (`/api/listings`)

| Route | Auth | Rule |
|---|---|---|
| POST / | owner | Create listing; reject if owner already has one (409) |
| PUT /:id | owner | Only own listing (403 otherwise) |
| GET / | JWT | Paginated. Filters: industry, city, state, stage, minFunding, maxFunding, q (text search) |
| GET /:id | JWT | Populate `owner.name` (not email) |

---

## Saved Listings API (`/api/saved`)

| Route | Auth | Rule |
|---|---|---|
| POST /:listingId | investor | Idempotent — upsert, no error if already saved |
| DELETE /:listingId | investor | Remove save |
| GET / | investor | Return saved listings with populated listing data |

---

## Interest API (`/api/interest`)

| Route | Auth | Rule |
|---|---|---|
| POST / | investor | body: listingId, message. Reject duplicate (409). Reject own listing (400). Fire notification. |
| GET /sent | investor | Return sent requests. Include owner email only if status === "accepted" |
| GET /received | owner | Return received requests on own listing |
| PATCH /:id | owner | Accept/decline. Only from pending → accepted/declined (400 if already settled). Fire notification. |

---

## Notifications API (`/api/notifications`)

| Route | Auth | Rule |
|---|---|---|
| GET / | JWT | Return notifications for current user, newest first |
| PATCH /:id/read | JWT | Mark one notification as read |

---

## Socket.io

- Auth: middleware reads `socket.handshake.auth.token` (JWT). Reject with error if invalid.
- On connect: `socket.join(userId)` — private room per user.
- Emitted events:
  - `"notification"` → owner room when investor sends interest.
  - `"notification"` → investor room when owner accepts or declines.
- The Notification document is always saved before the socket emit so the event carries the DB id.

---

## Security

- `helmet` sets sensible HTTP headers.
- `express-rate-limit` on auth routes.
- CORS origin locked to `CLIENT_URL` env var.
- Zod validates all request bodies; validation errors return `{ error: "Validation error", issues: [...] }`.
- Passwords hashed with bcrypt (cost factor 12).
- Ownership checks on every mutating route.

---

## Seed Script

- File: `server/src/scripts/seed.js` — run with `node src/scripts/seed.js`.
- Creates 3 owner accounts + 8 listings across varied industries and Indian cities.
- Creates 2 investor accounts.
- Logs created IDs.
- Safe to re-run (drops seed data first by checking a `__seed` flag or deleting by known emails).
