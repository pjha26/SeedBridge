# SeedBridge API Reference

Base URL (development): `http://localhost:5000`

All request and response bodies are JSON. Protected routes require an `Authorization: Bearer <token>` header. The token is issued by the auth endpoints below.

---

## Error response shape

All error responses follow this shape:

```json
{ "error": "Human-readable message" }
```

Zod validation failures return:

```json
{
  "error": "Validation error",
  "issues": [
    { "path": "fieldName", "message": "Error description" }
  ]
}
```

---

## Health

| Method | Path | Auth | Role | Purpose |
|---|---|---|---|---|
| GET | `/api/health` | None | Any | Liveness check |

**200 response:** `{ "status": "ok", "timestamp": "..." }`

---

## Auth

Rate-limited to 10 requests per 15 minutes per IP (disabled in `NODE_ENV=test`).

| Method | Path | Auth | Role | Purpose | Key errors |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | None | — | Create an account | 400 validation, 409 email taken |
| POST | `/api/auth/login` | None | — | Log in, receive JWT | 400 validation, 401 invalid credentials |
| GET | `/api/auth/me` | Required | Any | Return the current user | 401 no/invalid token |

**POST /api/auth/register body:**
```json
{
  "name": "string (2–100 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)",
  "role": "owner | investor"
}
```

**201 / 200 response (register / login):**
```json
{ "token": "JWT string", "user": { "_id", "name", "email", "role", "createdAt" } }
```

---

## Listings

| Method | Path | Auth | Role | Purpose | Key errors |
|---|---|---|---|---|---|
| POST | `/api/listings` | Required | owner | Create a listing (one per owner) | 400 validation, 403 wrong role, 409 already exists |
| GET | `/api/listings/mine` | Required | owner | Get the caller's own listing | 401, 403, 404 none yet |
| PUT | `/api/listings/:id` | Required | owner | Update own listing (including `isActive`) | 400, 403 not owner, 404 |
| GET | `/api/listings` | Required | Any | Browse active listings (paginated, filterable) | 400 bad query params |
| GET | `/api/listings/:id` | Optional | Any | Listing detail; inactive only visible to owner | 404 |

**POST / PUT body fields:**

| Field | Type | Notes |
|---|---|---|
| `businessName` | string | max 150 chars |
| `industry` | string | max 100 chars |
| `city` | string | stored nested as `location.city` |
| `state` | string | stored nested as `location.state` |
| `stage` | enum | `idea`, `early_revenue`, `revenue`, `profitable`, `scaling` |
| `revenueRange` | enum | `none`, `1_10k`, `10k_1L`, `1L_10L`, `10L_1Cr`, `1Cr_plus` |
| `fundingGoal` | number | positive integer, rupees |
| `fundingPurpose` | string | max 500 chars |
| `description` | string | max 2000 chars |
| `isActive` | boolean | PUT only; defaults to `true` on create |

**GET /api/listings query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `q` | string | — | Full-text search across businessName, industry, city, description |
| `industry` | string (CSV) | — | Filter by industry |
| `stage` | string (CSV) | — | Filter by stage enum value(s) |
| `city` | string | — | Case-insensitive exact match |
| `state` | string | — | Case-insensitive exact match |
| `minFunding` | number | — | Rupees |
| `maxFunding` | number | — | Rupees |
| `sort` | string | `newest` | `newest`, `oldest`, `funding_asc`, `funding_desc` |
| `page` | integer | 1 | |
| `limit` | integer | 12 | max 50 |

**Browse response:**
```json
{ "data": [Listing], "page": 1, "limit": 12, "total": 42, "totalPages": 4 }
```

**Notes:**
- `owner` is always `{ _id, name }` — email is never included.
- For investor tokens: `savedByMe: boolean` is injected on each item in browse, and on the detail response.
- For investor tokens: `myInterestStatus: "none" | "pending" | "accepted" | "declined"` is injected on the detail response.

---

## Saved listings (investor only)

| Method | Path | Auth | Role | Purpose | Key errors |
|---|---|---|---|---|---|
| POST | `/api/saved/:listingId` | Required | investor | Save a listing (idempotent) | 403 wrong role, 404 missing/inactive listing |
| DELETE | `/api/saved/:listingId` | Required | investor | Unsave (idempotent) | 403 |
| GET | `/api/saved` | Required | investor | Paginated saved listings | 403 |

**POST responses:** 201 on first save, 200 on duplicate.

**GET /api/saved query params:** `page` (default 1), `limit` (default 12, max 50).

**GET /api/saved response:**
```json
{ "data": [Listing], "page": 1, "limit": 12, "total": 3, "totalPages": 1 }
```
Listings that have been deleted or deactivated since being saved are excluded.

---

## Interest requests

| Method | Path | Auth | Role | Purpose | Key errors |
|---|---|---|---|---|---|
| POST | `/api/interest` | Required | investor | Express interest in a listing | 400, 403, 404, 409 duplicate |
| GET | `/api/interest/sent` | Required | investor | Investor's own sent requests (paginated) | 403 |
| GET | `/api/interest/received` | Required | owner | Requests received on the owner's listing (paginated) | 403 |
| PATCH | `/api/interest/:id` | Required | Any (owner of that listing) | Accept or decline a pending request | 400, 403 not owner, 404, 409 already actioned |

**POST /api/interest body:**
```json
{
  "listingId": "24-char hex ObjectId",
  "message": "optional string, max 500 chars"
}
```

**PATCH /api/interest/:id body:**
```json
{ "status": "accepted | declined" }
```
Only transitions from `pending` are allowed. A second PATCH on an already-accepted or already-declined request returns 409.

**GET /api/interest/sent notes:**
- `listing.owner` is `{ _id, name }` for pending and declined requests.
- For `accepted` requests only, `listing.owner.email` is also present.

---

## Notifications

| Method | Path | Auth | Role | Purpose | Key errors |
|---|---|---|---|---|---|
| GET | `/api/notifications` | Required | Any | Own notifications, newest first, paginated + unread count | 401 |
| PATCH | `/api/notifications/read-all` | Required | Any | Mark all own notifications as read | 401 |
| PATCH | `/api/notifications/:id/read` | Required | Any | Mark one notification as read | 401, 403 not owner, 404 |

**GET /api/notifications query params:** `page` (default 1), `limit` (default 20).

**GET /api/notifications response:**
```json
{
  "data": [
    {
      "_id": "...",
      "type": "interest_received | interest_accepted | interest_declined",
      "message": "string",
      "relatedRequest": "ObjectId (optional)",
      "read": false,
      "createdAt": "ISO timestamp"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5,
  "totalPages": 1,
  "unreadCount": 2
}
```

---

## Socket.io

The server runs Socket.io on the same HTTP server as Express.

**Connection:** connect to `http://localhost:5000` with `{ auth: { token: "<JWT>" } }`. Invalid or missing tokens are rejected.

**Rooms:** each authenticated user is automatically joined to a private room identified by their user id.

**Event — `notification`:** emitted to the relevant user's room when:
- An investor sends an interest request → owner receives `interest_received`.
- An owner accepts or declines → investor receives `interest_accepted` or `interest_declined`.

The payload is the saved `Notification` document. It never contains email addresses.
