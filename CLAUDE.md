# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

- `npm run dev` — Start dev server with hot reload (ts-node-dev)
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Start production server from `dist/`
- `npm test` — Run API tests (ts-node test-api.ts)
- `npm run seed` — Populate database with sample data
- `npm run seed:destroy` — Delete all seed data

## Architecture

Express 5 REST API with TypeScript, MongoDB/Mongoose, and JWT authentication. Follows MVC pattern:

- **server.ts** — App entry point. Configures middleware (helmet, CORS, rate limiting, custom sanitization), mounts routes, serves static files from `public/`.
- **models/** — Mongoose schemas with TypeScript interfaces (`IStudent`, `IItem`, `IComment`, etc.). Each model exports both the interface and the Mongoose model.
- **controllers/** — Async route handlers wrapped with `asyncHandler` middleware. Return JSON responses with `{ success, data }` shape.
- **routes/** — Express routers mapping HTTP methods to controller functions. Protected routes use `protect` middleware.
- **middleware/** — `auth.ts` (JWT protect/authorize), `async.ts` (error catching wrapper), `errorHandler.ts` (global error handler), `uploads.ts` (multer config).
- **types/express.d.ts** — Extends Express `Request` with `user?: IStudent`.

## Key Patterns

**Authentication:** JWT via `Authorization: Bearer <token>` header. `protect` middleware verifies token and attaches `req.user`. Login also sets httpOnly cookie. Auth routes have a stricter rate limit (5 attempts/15min).

**File uploads:** Multer stores files in `public/` subdirectories:
- `profile_pictures/` (prefix: `pro-pic`, max 2MB, images only)
- `item_photos/` (prefix: `itm-pic`, max 2MB, images only)
- `item_videos/` (prefix: `item-vid`, max 50MB, videos only)

Upload endpoints return the relative path (e.g., `item_photos/itm-pic-123.jpg`) which is served as a static file.

**Authorization:** Owner-only checks in update/delete controllers compare `req.user._id` against the resource's owner field (`reportedBy` for items, `commentedBy` for comments).

**Comments:** Support `@username` mentions (extracted via regex, resolved to user IDs), nested replies via `parentComment`, and like/unlike toggling. Deleting a parent comment cascades to its replies.

**Pagination:** Item and comment list endpoints support `page` and `limit` query params (defaults: page 1, limit 10). Items also filter by `type`, `status`, `category`.

**Error handling:** `asyncHandler` wraps all controllers. `errorHandler` middleware handles Mongoose validation/cast/duplicate key errors and JWT errors with appropriate status codes.

## Environment

Config loaded from `config/config.env`. Key variables: `LOCAL_DATABASE_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `PORT`, `CORS_ORIGIN` (comma-separated origins), `MAX_FILE_UPLOAD`.

## TypeScript

Strict mode enabled. Target ES2020, CommonJS modules. Output to `dist/`. Custom type roots in `./types/`.

## Test Credentials (after seeding)

- `kiranrana@softwarica.edu.np` / `password123`
- `sarah.johnson@softwarica.edu.np` / `password123`
