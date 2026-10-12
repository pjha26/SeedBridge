# Implementation Task List

## Group 1 — Dependencies + Models
- [ ] Install new deps: `zod`, `helmet`, `express-rate-limit`
- [ ] `config/constants.js` — stage enum, revenueRange enum, display strings
- [ ] `models/User.js`
- [ ] `models/Listing.js`
- [ ] `models/InterestRequest.js`
- [ ] `models/SavedListing.js`
- [ ] `models/Notification.js`
- [ ] Update `.env.example` with `JWT_SECRET`, `JWT_EXPIRES_IN`
- [ ] Commit: `feat(server): add mongoose models`
- [ ] **TEST CHECKPOINT**: start server, confirm MongoDB connects, no errors

## Group 2 — Auth
- [ ] `middleware/auth.js` — `verifyToken`, `requireRole`
- [ ] `middleware/validate.js` — zod wrapper
- [ ] `schemas/auth.js` — register + login schemas
- [ ] `controllers/auth.js` — register, login, me
- [ ] `routes/auth.js`
- [ ] Wire into `app.js` with rate-limit
- [ ] Commit: `feat(server): add auth routes`
- [ ] **TEST CHECKPOINT**: register, login, GET /auth/me

## Group 3 — Listings
- [ ] `schemas/listings.js`
- [ ] `controllers/listings.js` — create, update, browse, getById
- [ ] `routes/listings.js`
- [ ] Wire into `app.js`
- [ ] Commit: `feat(server): add listings routes`
- [ ] **TEST CHECKPOINT**: create listing as owner, browse, filter

## Group 4 — Saved Listings
- [ ] `controllers/saved.js` — save, unsave, getSaved
- [ ] `routes/saved.js`
- [ ] Wire into `app.js`
- [ ] Commit: `feat(server): add saved listings routes`
- [ ] **TEST CHECKPOINT**: save, unsave, list saved

## Group 5 — Interest
- [ ] `schemas/interest.js`
- [ ] `controllers/interest.js` — send, getSent, getReceived, respond
- [ ] `routes/interest.js`
- [ ] Wire into `app.js`
- [ ] Commit: `feat(server): add interest routes`
- [ ] **TEST CHECKPOINT**: send interest, owner accepts, check email visibility

## Group 6 — Notifications
- [ ] `controllers/notifications.js` — list, markRead
- [ ] `routes/notifications.js`
- [ ] Wire into `app.js`
- [ ] Commit: `feat(server): add notifications routes`
- [ ] **TEST CHECKPOINT**: GET notifications, PATCH read

## Group 7 — Socket.io
- [ ] `socket/index.js` — setup + JWT auth middleware
- [ ] `socket/handlers.js` — `emitNotification(io, userId, payload)` helper
- [ ] Update `index.js` to initialise socket with the http server
- [ ] Update interest controller to emit on send + respond
- [ ] Commit: `feat(server): add socket.io real-time notifications`
- [ ] **TEST CHECKPOINT**: open two browser tabs, send interest, see live notification

## Group 8 — Hardening + Seed
- [ ] Add `helmet` and rate-limit to `app.js`
- [ ] `scripts/seed.js`
- [ ] Commit: `feat(server): add helmet, rate-limit, and seed script`
- [ ] **TEST CHECKPOINT**: run seed, check DB, verify helmet headers
