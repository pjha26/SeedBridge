# SeedBridge — Feature Requirements

> Status: **Draft — awaiting review**
> Scope: MVP features only. No payments, no investment processing.

---

## 1. Authentication

### 1.1 Registration
- **REQ-A1** A user can register with: `name`, `email`, `password`, and `role` (`owner` | `investor`).
- **REQ-A2** Email must be unique across all users.
- **REQ-A3** Password must be at least 8 characters; stored as a bcrypt hash (never plain text).
- **REQ-A4** On success, the server returns a signed JWT and the user's public profile (no password).
- **REQ-A5** On failure (duplicate email, validation error), the server returns a clear error message with an appropriate HTTP status (400 or 409).

### 1.2 Login
- **REQ-A6** A user can log in with `email` and `password`.
- **REQ-A7** On success, the server returns a new JWT and the user's public profile.
- **REQ-A8** On failure (wrong email or password), the server returns a generic "Invalid credentials" message (do not reveal which field was wrong).

### 1.3 JWT & role-based access
- **REQ-A9** The JWT payload includes `userId` and `role`. Expiry: 7 days.
- **REQ-A10** Protected routes require a valid `Authorization: Bearer <token>` header.
- **REQ-A11** Routes restricted to `owner` must reject requests from `investor` tokens (and vice-versa) with a 403.
- **REQ-A12** The client stores the JWT in `localStorage` and attaches it to every API request.

---

## 2. Business Listings (Owner)

### 2.1 Create listing
- **REQ-L1** An authenticated `owner` can create **one** business listing.
- **REQ-L2** Attempting to create a second listing returns a 409 with a clear message.
- **REQ-L3** Required fields: `name`, `industry`, `location`, `stage`, `revenueRange`, `fundingGoal`, `fundingPurpose`, `description`.
- **REQ-L4** `stage` is an enum: `idea` | `pre-revenue` | `revenue` | `profitable` | `scaling`.
- **REQ-L5** `revenueRange` is an enum: `$0` | `$1–$10k` | `$10k–$100k` | `$100k–$1M` | `$1M+`.
- **REQ-L6** `fundingGoal` is a positive integer (USD).
- **REQ-L7** Missing or invalid fields return a 400 with per-field error messages.

### 2.2 Edit listing
- **REQ-L8** An owner can update any field of their own listing.
- **REQ-L9** An owner cannot edit another owner's listing (403).
- **REQ-L10** The updated listing is returned on success.

### 2.3 View own listing
- **REQ-L11** An owner can fetch their own listing (or receive a clear "no listing yet" state).

---

## 3. Listing Discovery (Investor)

### 3.1 Browse listings
- **REQ-I1** An authenticated `investor` can fetch a paginated list of all active listings.
- **REQ-I2** Filters (all optional, combinable): `industry`, `location`, `stage`, `fundingMin`, `fundingMax`.
- **REQ-I3** Default page size: 10. The response includes `totalCount`, `page`, and `totalPages`.

### 3.2 View a listing
- **REQ-I4** Any authenticated user can fetch a single listing by ID.
- **REQ-I5** The listing detail includes the owner's `name` (not email) via a Mongoose populate.

### 3.3 Save / unsave listings
- **REQ-I6** An investor can save a listing. Saving the same listing twice is idempotent (no duplicate, no error).
- **REQ-I7** An investor can unsave a listing they previously saved.
- **REQ-I8** An investor can fetch their list of saved listings.

---

## 4. Interest Flow

### 4.1 Send interest
- **REQ-INT1** An investor can send an interest request to a listing. The request stores: `investor` (ref), `listing` (ref), `message` (optional, max 500 chars), `status` (`pending`).
- **REQ-INT2** Duplicate requests (same investor + same listing) are rejected with a 409.
- **REQ-INT3** An owner cannot send interest in their own listing (400).

### 4.2 Owner actions
- **REQ-INT4** An owner can view all interest requests on their listing.
- **REQ-INT5** An owner can `accept` or `decline` a request. Status moves from `pending` → `accepted` | `declined`.
- **REQ-INT6** Once accepted or declined, the status cannot be changed again (400 if retried).
- **REQ-INT7** Only the listing's owner can accept/decline (403 for anyone else).

### 4.3 Investor view
- **REQ-INT8** An investor can view all interest requests they have sent, including current status.

---

## 5. Live Notifications (Socket.io)

- **REQ-N1** When an investor sends an interest request, the listing's owner receives a real-time notification: `{ type: 'NEW_INTEREST', listingName, investorName }`.
- **REQ-N2** When an owner accepts or declines a request, the investor receives a real-time notification: `{ type: 'INTEREST_STATUS', listingName, status }`.
- **REQ-N3** Each authenticated user joins a private Socket.io room keyed by their `userId` on connect.
- **REQ-N4** Notifications are also stored in a `Notification` collection so the user can see missed ones on load.
- **REQ-N5** The client shows an unread badge count in the nav; clicking it marks all as read.

---

## 6. UI Quality

- **REQ-U1** Every form shows inline validation errors (client-side) before submit, and API errors after.
- **REQ-U2** Every async action shows a loading spinner or skeleton.
- **REQ-U3** Empty states have a clear message and a call-to-action (e.g. "No listings yet — be the first to post").
- **REQ-U4** The app is navigable by role: owners see their listing dashboard; investors see the browse page after login.

---

## Out of scope (MVP)

- Payment or investment processing
- Messaging / chat between users
- Email notifications
- Admin panel
- Public (unauthenticated) listing browsing
