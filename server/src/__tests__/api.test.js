/**
 * SeedBridge API tests — Auth, Listings, Interest
 *
 * Uses mongodb-memory-server so the real database is never touched.
 * socket.js is mocked so initSocket / emitToUser are no-ops in tests.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// ── Environment must be set before app.js is imported ────────────────────────
process.env.JWT_SECRET = 'test-secret-key-must-be-at-least-32-chars!!';
process.env.NODE_ENV = 'test';

// ── Mock socket.js so emitToUser is a no-op in tests ─────────────────────────
vi.mock('../socket.js', () => ({
  emitToUser: vi.fn(),
  initSocket: vi.fn(),
  getIo: vi.fn(),
}));

// Import app after env vars are set and mocks are in place
const { default: app } = await import('../app.js');

// ── Test state ────────────────────────────────────────────────────────────────
let mongoServer;
let server;
let baseUrl;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function registerUser(agent, { name, email, password, role }) {
  return agent.post('/api/auth/register').send({ name, email, password, role });
}

async function loginUser(agent, { email, password }) {
  const res = await agent.post('/api/auth/login').send({ email, password });
  return res.body.token;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// ── Valid listing payload ─────────────────────────────────────────────────────
const LISTING = {
  businessName:   'Test Biz',
  industry:       'Software / SaaS',
  city:           'Mumbai',
  state:          'Maharashtra',
  stage:          'idea',
  revenueRange:   'none',
  fundingGoal:    500000,
  fundingPurpose: 'Build the MVP and hire two engineers.',
  description:    'A test listing for automated tests.',
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

// ── Auth ──────────────────────────────────────────────────────────────────────

describe('Auth', () => {
  it('register success → 201, has token and user', async () => {
    const res = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123', role: 'owner' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('register duplicate email → 409', async () => {
    await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123', role: 'owner' });

    const res = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Alice2', email: 'alice@example.com', password: 'password999', role: 'investor' });

    expect(res.status).toBe(409);
  });

  it('register bad role → 400', async () => {
    const res = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123', role: 'superadmin' });

    expect(res.status).toBe(400);
  });

  it('register short password → 400', async () => {
    const res = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Carol', email: 'carol@example.com', password: 'short', role: 'owner' });

    expect(res.status).toBe(400);
  });

  it('login success → 200, has token', async () => {
    await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Dave', email: 'dave@example.com', password: 'password123', role: 'owner' });

    const res = await request(baseUrl)
      .post('/api/auth/login')
      .send({ email: 'dave@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('login wrong password → 401, generic message (no "password" word)', async () => {
    await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Eve', email: 'eve@example.com', password: 'password123', role: 'owner' });

    const res = await request(baseUrl)
      .post('/api/auth/login')
      .send({ email: 'eve@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    const errorMsg = res.body.error?.toLowerCase() ?? '';
    expect(errorMsg).not.toContain('password');
  });

  it('GET /me with valid token → 200, returns user', async () => {
    await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Frank', email: 'frank@example.com', password: 'password123', role: 'owner' });
    const token = await loginUser(request(baseUrl), { email: 'frank@example.com', password: 'password123' });

    const res = await request(baseUrl)
      .get('/api/auth/me')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('frank@example.com');
  });

  it('GET /me no token → 401', async () => {
    const res = await request(baseUrl).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ── Listings ──────────────────────────────────────────────────────────────────

describe('Listings', () => {
  let ownerToken;
  let ownerId;
  let investorToken;

  beforeEach(async () => {
    const ownerRes = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Owner', email: 'owner@example.com', password: 'password123', role: 'owner' });
    ownerToken = ownerRes.body.token;
    ownerId = ownerRes.body.user._id;

    const invRes = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Investor', email: 'investor@example.com', password: 'password123', role: 'investor' });
    investorToken = invRes.body.token;
  });

  it('owner creates listing → 201, no email in response', async () => {
    const res = await request(baseUrl)
      .post('/api/listings')
      .set(authHeader(ownerToken))
      .send(LISTING);

    expect(res.status).toBe(201);
    // Deeply check no 'email' key anywhere in the serialised response
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/"email"/);
  });

  it('second create by same owner → 409', async () => {
    await request(baseUrl)
      .post('/api/listings')
      .set(authHeader(ownerToken))
      .send(LISTING);

    const res = await request(baseUrl)
      .post('/api/listings')
      .set(authHeader(ownerToken))
      .send({ ...LISTING, businessName: 'Another Biz' });

    expect(res.status).toBe(409);
  });

  it('investor POST /api/listings → 403', async () => {
    const res = await request(baseUrl)
      .post('/api/listings')
      .set(authHeader(investorToken))
      .send(LISTING);

    expect(res.status).toBe(403);
  });

  it('body with "owner" field is rejected (strict schema) — listing.owner matches auth user', async () => {
    const res = await request(baseUrl)
      .post('/api/listings')
      .set(authHeader(ownerToken))
      .send({ ...LISTING, owner: 'hacked-id-value' });

    // createListingSchema uses .strict() — extra keys return 400
    // If it returns 201, verify owner is the authenticated user, not the body value
    if (res.status === 201) {
      expect(res.body.listing.owner.toString()).toBe(ownerId.toString());
    } else {
      expect(res.status).toBe(400);
    }
  });

  it('GET /api/listings browse — no email in any item', async () => {
    await request(baseUrl)
      .post('/api/listings')
      .set(authHeader(ownerToken))
      .send(LISTING);

    const res = await request(baseUrl)
      .get('/api/listings')
      .set(authHeader(investorToken));

    expect(res.status).toBe(200);
    const body = JSON.stringify(res.body.data);
    expect(body).not.toMatch(/"email"/);
  });

  it('GET /api/listings/:id — owner field has no email key', async () => {
    const createRes = await request(baseUrl)
      .post('/api/listings')
      .set(authHeader(ownerToken))
      .send(LISTING);
    const listingId = createRes.body.listing._id;

    const res = await request(baseUrl)
      .get(`/api/listings/${listingId}`)
      .set(authHeader(investorToken));

    expect(res.status).toBe(200);
    const owner = res.body.listing.owner;
    expect(owner).not.toHaveProperty('email');
  });
});

// ── Interest ──────────────────────────────────────────────────────────────────

describe('Interest', () => {
  let ownerToken;
  let investorToken;
  let secondInvestorToken;
  let listingId;

  beforeEach(async () => {
    const ownerRes = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Owner', email: 'owner@example.com', password: 'password123', role: 'owner' });
    ownerToken = ownerRes.body.token;

    const invRes = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Investor', email: 'investor@example.com', password: 'password123', role: 'investor' });
    investorToken = invRes.body.token;

    const inv2Res = await request(baseUrl)
      .post('/api/auth/register')
      .send({ name: 'Investor2', email: 'investor2@example.com', password: 'password123', role: 'investor' });
    secondInvestorToken = inv2Res.body.token;

    const listRes = await request(baseUrl)
      .post('/api/listings')
      .set(authHeader(ownerToken))
      .send(LISTING);
    listingId = listRes.body.listing._id;
  });

  it('investor sends interest request → 201', async () => {
    const res = await request(baseUrl)
      .post('/api/interest')
      .set(authHeader(investorToken))
      .send({ listingId, message: 'Interested!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('interestRequest');
  });

  it('duplicate interest → 409', async () => {
    await request(baseUrl)
      .post('/api/interest')
      .set(authHeader(investorToken))
      .send({ listingId, message: 'First' });

    const res = await request(baseUrl)
      .post('/api/interest')
      .set(authHeader(investorToken))
      .send({ listingId, message: 'Second' });

    expect(res.status).toBe(409);
  });

  it('non-owner PATCH /api/interest/:id → 403', async () => {
    const createRes = await request(baseUrl)
      .post('/api/interest')
      .set(authHeader(investorToken))
      .send({ listingId });
    const interestId = createRes.body.interestRequest._id;

    // secondInvestor is not the owner of the listing
    const res = await request(baseUrl)
      .patch(`/api/interest/${interestId}`)
      .set(authHeader(secondInvestorToken))
      .send({ status: 'accepted' });

    expect(res.status).toBe(403);
  });

  it('owner accepts → 200, status is "accepted"', async () => {
    const createRes = await request(baseUrl)
      .post('/api/interest')
      .set(authHeader(investorToken))
      .send({ listingId });
    const interestId = createRes.body.interestRequest._id;

    const res = await request(baseUrl)
      .patch(`/api/interest/${interestId}`)
      .set(authHeader(ownerToken))
      .send({ status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body.interestRequest.status).toBe('accepted');
  });

  it('second PATCH on accepted request → 409', async () => {
    const createRes = await request(baseUrl)
      .post('/api/interest')
      .set(authHeader(investorToken))
      .send({ listingId });
    const interestId = createRes.body.interestRequest._id;

    await request(baseUrl)
      .patch(`/api/interest/${interestId}`)
      .set(authHeader(ownerToken))
      .send({ status: 'accepted' });

    const res = await request(baseUrl)
      .patch(`/api/interest/${interestId}`)
      .set(authHeader(ownerToken))
      .send({ status: 'declined' });

    expect(res.status).toBe(409);
  });

  it('GET /sent while pending — owner email absent from response', async () => {
    await request(baseUrl)
      .post('/api/interest')
      .set(authHeader(investorToken))
      .send({ listingId });

    const res = await request(baseUrl)
      .get('/api/interest/sent')
      .set(authHeader(investorToken));

    expect(res.status).toBe(200);
    // Pending: owner email must NOT be present
    const body = JSON.stringify(res.body.data);
    expect(body).not.toMatch(/"email"/);
  });

  it('GET /sent after acceptance — owner email present', async () => {
    const createRes = await request(baseUrl)
      .post('/api/interest')
      .set(authHeader(investorToken))
      .send({ listingId });
    const interestId = createRes.body.interestRequest._id;

    await request(baseUrl)
      .patch(`/api/interest/${interestId}`)
      .set(authHeader(ownerToken))
      .send({ status: 'accepted' });

    const res = await request(baseUrl)
      .get('/api/interest/sent')
      .set(authHeader(investorToken));

    expect(res.status).toBe(200);
    // Accepted: owner email should be present
    const body = JSON.stringify(res.body.data);
    expect(body).toMatch(/"email"/);
  });
});
