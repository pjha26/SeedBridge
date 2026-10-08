# SeedBridge 🌱

A marketplace where business owners list their business and funding needs,
and investors discover them, save listings, and express interest.
Owners accept or decline interest requests and receive live notifications.

> Discovery and connection only — no payment or investment processing.

## Stack

- **MongoDB + Mongoose** – data layer
- **Express / Node.js** – REST API
- **React + Vite** – frontend
- **Socket.io** – live notifications
- **JWT** – auth with `owner` and `investor` roles

## Getting started

```bash
# Server
cd server
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev

# Client (separate terminal)
cd client
cp .env.example .env
npm install
npm run dev
```

## Lessons learned

_A running log of mistakes and fixes will be added here during development._
