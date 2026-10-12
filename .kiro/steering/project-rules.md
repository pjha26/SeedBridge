# SeedBridge — Project Rules

These rules apply to every change in this repository. Follow them without
being asked.

---

## Server architecture

Keep the four-layer structure. Never collapse layers or mix concerns.

- **routes/** — Express routers only. Mount middleware and delegate to controllers. No business logic.
- **controllers/** — Request handlers. Read `req`, call models/services, write `res`. No raw Mongoose queries outside a controller or model.
- **models/** — Mongoose schemas and model exports only.
- **middleware/** — Reusable Express middleware: `verifyToken`, `requireRole`, `optionalAuth`, `validate`. Nothing route-specific here.

---

## Constants and enums

Every enum value (stage, revenueRange, role, interestStatus, notificationType)
lives in `server/src/config/constants.js` and nowhere else.

- Client mirrors are in `client/src/lib/constants.ts`. When the server adds a value, add it to the client mirror in the same commit.
- Never hard-code an enum string anywhere else in the codebase. Always import from the constants file.

---

## Validation

Every route that accepts a request body or mutates data must use the
`validate(schema, source?)` middleware with a Zod schema.

- Body validation: `validate(schema)` (source defaults to `'body'`).
- Param validation that should return 404 (e.g. ObjectId checks): validate in the controller with `mongoose.Types.ObjectId.isValid()` and return 404 — do not use Zod param schemas for this, as Zod returns 400.
- Query param validation: `validate(schema, 'query')` with `z.coerce` for numbers and booleans.
- Read routes that only filter or paginate still need query validation.

---

## Owner email

The owner's email is **never** included in any public listing response.

- All `.populate('owner', ...)` calls must pass `'name'` as the field
  selection string — never `'name email'` or no selector.
- The `savedByMe` injection and any future denormalisation must not copy
  the email field.
- Email is revealed only to the investor on their own interest request
  documents once the owner has accepted, and only at that point.

---

## No dead code or stale data

- Delete unused imports, variables, functions, and components before committing.
- Remove mock data, `console.log` debug statements, and TODO comments that
  describe work that is now done.
- Do not leave unused npm dependencies in `package.json`. Run
  `npm uninstall` when a package is no longer needed.

---

## HTTP examples file

Every new route must have a matching example in `server/requests.http`.

- One example per HTTP method per route.
- Use descriptive section comments (`### POST /api/saved/:listingId`).
- **Never put real tokens, passwords, or secrets in this file.** Use
  placeholder comments like `# Replace with a valid investor JWT`.
- Keep existing examples when adding new ones — do not overwrite the file.

---

## UI states

Every page or component that fetches data must handle all three states:

- **Loading** — skeleton placeholders with the shimmer animation already defined in `index.css` (class `skeleton`, keyframes `shimmer`).
- **Empty** — a friendly message and, where relevant, a call-to-action (e.g. "Nothing saved yet. Browse listings →").
- **Error** — the error message from the API plus a Retry button that re-runs the fetch.

Optimistic updates (save/unsave, interest toggle) must roll back on error and
surface an inline error message — never swallow errors silently.

---

## Commit messages

Use Conventional Commits: `type(scope): short description`.

| Type | When to use |
|---|---|
| `feat` | New user-visible feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructuring with no behaviour change |
| `chore` | Tooling, deps, config |
| `test` | Tests only |

Scope is the affected area: `server`, `client`, `ui`, `auth`, `listings`,
`saved`, `interest`, `notifications`, `config`, `seed`.

Keep the subject line under 72 characters. Use the body for *why*, not *what*.
