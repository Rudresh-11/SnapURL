# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

SnapURL is a URL shortener split into two **independent npm projects** with no root `package.json` and no workspace tooling:

- `backend/` — Express 5 API + raw-SQL Postgres (ESM, `"type": "module"`)
- `frontend/` — Next.js 16 App Router in **plain JavaScript** (no TypeScript), deployed on Vercel

Every command below must be run from inside `backend/` or `frontend/`. Env loading in the backend resolves paths against `process.cwd()`, so running scripts from the repo root silently loads no env.

## Commands

### backend/
```bash
npm run dev            # node --watch index.js
npm start              # runs migrations, then boots the server
npm run migrate        # apply pending SQL migrations
npm run seed
npm test               # jest, ESM mode, --runInBand
npm run test:coverage
npm test -- __tests__/routes/url.routes.test.js     # single file
npm test -- -t "POST /api/url/shorten"              # single test by name
```
There is no jest config file — Jest runs on defaults under `--experimental-vm-modules` (set by the npm scripts), so invoke `jest` through `npm test` rather than directly.

### frontend/
```bash
npm run dev
npm run build
npm run lint           # eslint (flat config, eslint-config-next core-web-vitals)
```
There are no frontend tests.

## Backend architecture

Request path: `app.js` → `src/routes/*` → `src/controllers/*` → `src/models/*` → `pg` Pool.

- **Models are the only SQL layer.** `src/models/{user,url,click}.model.js` export plain objects of async methods holding parameterized SQL. There is no ORM; add queries here rather than in controllers.
- **DB handle is a module singleton.** `connectDB()` (`src/config/db.js`) creates the pool; `getDB()` throws `"Database not initialized"` if called first. Anything with an entry point of its own — `index.js`, `scripts/migrate.js`, test setup — must `await connectDB()` before touching a model.
- **Response envelope.** Controllers return `new ApiResponse(status, data, message)` and throw `new ApiError(status, message, errors[])`. `errorHandler` serializes `ApiError` as `{ success, message, errors }` and everything else as a generic 500. Express 5 forwards rejected async handlers automatically, which is why controllers `throw` without wrapping in try/catch or calling `next`.
- **Auth.** `verifyJWT` accepts either the `accessToken` httpOnly cookie or an `Authorization: Bearer` header, verifies with `JWT_SECRET`, and loads the user **by email** from the token payload `{ id, email }`. Both access and refresh tokens are 7d and are also persisted on the `users` row; there is no refresh endpoint yet. Cookie attributes come from `src/utils/cookieOptions.js` — set them there, not inline: the frontend and API live on different origins in production, so the cookies must be `SameSite=None; Secure`, which is downgraded to `Lax` outside production so plain-http local dev still works.
- **Ownership checks belong in the controller.** `verifyJWT` only proves *who* is calling. Any route taking a `:id` must also confirm the row belongs to `req.user.id` (see `getOwnedUrl` in `analytics.controller.js` and `deleteUrl` in `url.controller.js`) — ids are sequential, so a missing check is a walkable IDOR.
- **Route mounting order matters.** `app.use("/", redirectRouter)` is a catch-all that treats any top-level path as a short code. New API prefixes must be registered in `app.js` *above* it.
- **`renderDelay` middleware** holds the *first* request after boot for `RENDER_DELAY_MS` (default 20s) when `RENDER_DELAY=true`, simulating a cold host. Test setup forces it off.
- `src/config/redis.js` is an empty stub — `connectRedis()` does nothing despite being awaited at startup.
- `src/utils/logger.js` monkey-patches `console.log` globally to append `file:line`; it is imported for side effects in `index.js`.

### Database and migrations

Migrations are numbered `.sql` files in `migrations/`, applied in filename order by `scripts/migrate.js` and recorded in a `migrations` table. They are **additive** — the live schema is `001` plus the ALTERs in `002`/`003` (nullable `password_hash`/`username` for Google users, `provider`, `google_id`, `urls.title`), so read all of them before assuming a column shape. Tables: `users`, `urls` (`short_code` unique, `total_clicks` denormalized counter), `clicks` (one row per redirect).

### Click / redirect flow

The short link points at the **backend root**, not the frontend. `GET /:shortCode` (`click.controller.js`) increments `urls.total_clicks`, derives country from `cf-ipcountry` or `geoip-lite`, device type from the UA string, and referrer from the `?ref=` query param (not the `Referer` header), records a `clicks` row, then 302s. `?check=true` turns the same route into an existence probe that returns JSON instead of redirecting — the frontend's `app/r/[shortcode]/page.js` uses that to render a proper 404 before handing off.

### Backend env vars

`src/config/loadEnv.js` loads `.env.local` with `override: true` if present, otherwise `.env`. Keys: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RENDER_DELAY`, `REDIS_URL` (unused).

### Testing conventions

- Tests live in `__tests__/` mirroring `src/` (`controllers/`, `middlewares/`, `routes/`, `utils/`).
- **Route tests hit a real Postgres.** `__tests__/setup/setupTestEnv.js` loads `.env.test` (falling back to `.env`) and requires `DATABASE_URL` to point at a **dedicated test database** — it inserts and then deletes real rows. Use its helpers (`createTestContext`, `insertUser`, `insertUrl`, `insertClick`, `makeAuthToken`) so `ctx.cleanup()` can delete in FK-safe order, and call `closeTestDB()` in `afterAll`. `--runInBand` is required because of this shared DB.
- **Controller tests mock the models instead.** Under ESM, mocking requires `jest.unstable_mockModule(...)` followed by a top-level `await import(...)` of the subject — a static `import` of the module under test defeats the mock.
- Puppeteer (`src/utils/fetchMeta.js`, used by `POST /api/url/metadata`) must be mocked so tests never launch a browser.

## Frontend architecture

- **App Router, all `.js`**; `@/*` maps to the project root via `jsconfig.json`. shadcn/ui is configured with `tsx: false`, so generated primitives land in `components/ui/*.jsx` — keep new ones JSX, "new-york" style, `neutral` base, lucide icons.
- **All API traffic goes through `lib/api.js`**, a single axios instance with `baseURL: NEXT_PUBLIC_API_URL` and `withCredentials: true` (auth is httpOnly cookies — no token is ever stored client-side). Its response interceptor pushes error messages into the zustand `useErrorStore`, which `components/global-error-listener.js` (mounted in the root layout) renders as a toast; it deliberately skips 401s (the normal answer for a signed-out visitor, handled locally by the page) and any request sent with `showErrorToast: false`.
- **`useApi` (`hooks/useApi.js`)** wraps one endpoint as `{ data, loading, error, errorStatus, errorRef, request, setData }` with an optional `auto` fetch on mount. `error` is a **string**, not an Error object. Immediately after `await request(...)` the `error` in scope is still the previous render's value — read `api.errorRef.current` for the reason and `errorStatus` for the HTTP status.
- **Never build a short link by hand.** `lib/links.js` owns `shortUrl` / `shortUrlLabel` / `shortBaseLabel` / `titleFromUrl` / `faviconFor`, because `NEXT_PUBLIC_BASE_URL` may or may not carry a scheme and hand-rolled interpolation produced links like `https://http://localhost:3000/abc`.
- **The dashboard has no middleware guard.** `components/dashboard-topbar.js` fetches `/auth/me` and redirects to `/login` on a 401; that is the only session gate.
- Google sign-in uses the GSI client script loaded in `app/layout.js` and posts the ID token to `POST /api/auth/login/google`. Render the button through `hooks/useGoogleSignIn.js` — the script is `async defer`, so `window.google` is usually still undefined on first mount and the hook polls until it lands.
- Charts use both `chart.js`/`react-chartjs-2` and `recharts` — match whichever the neighbouring chart component in `components/analytics/` already uses.
- Env vars (all `NEXT_PUBLIC_`): `NEXT_PUBLIC_API_URL` (API base, e.g. `http://localhost:5000/api`), `NEXT_PUBLIC_API_REDIRECT_URL` (backend origin used for short-code resolution), `NEXT_PUBLIC_BASE_URL` (short-link domain shown in the UI), `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## Project conventions (from backend/WARP.md and frontend/WARP.md)

Both directories carry a largely unfilled `WARP.md` template. The substantive rules stated there:

- Do not add new dependencies without asking.
- Do not refactor or restyle unrelated code; keep changes minimal and scoped.
- Do not invent endpoints or API contracts — the existing surface is `src/routes/`.
- Dates/timezones are UTC unless stated otherwise.
