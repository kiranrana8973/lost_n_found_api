# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

- `make dev` — Start development server (`go run .`)
- `make build` — Compile binary to `bin/server`
- `make run` — Build and run binary
- `make clean` — Remove build artifacts
- `go build ./...` — Verify all packages compile
- `go mod tidy` — Sync dependencies

## Architecture

Go REST API using Chi router, MongoDB official Go driver v2, and JWT authentication. Follows layered architecture: Handler → Service → Repository.

- **main.go** — Entry point. Loads config, connects MongoDB, wires dependencies, starts HTTP server with graceful shutdown.
- **config/** — `config.go` loads env vars from `config/config.env` using godotenv. `Config` struct holds all settings.
- **database/** — MongoDB connection (`Connect`/`Disconnect`) and `EnsureIndexes` for all collections.
- **model/** — Go structs with `bson` and `json` tags mapping to MongoDB collections.
- **repository/** — Interfaces + MongoDB implementations. Uses `$lookup` aggregation pipelines for populated queries.
- **service/** — Business logic. `AuthService` handles JWT, bcrypt, refresh tokens. Other services handle CRUD with authorization.
- **handler/** — HTTP handlers. Parse request, call service, write JSON. `response.go` has shared helpers.
- **middleware/** — `auth.go` (JWT protect/authorize), `logging.go`, `sanitize.go`, `recovery.go`, `security.go`.
- **upload/** — File upload handling using Go stdlib multipart parsing.
- **apperror/** — Custom `AppError` type with centralized error handler.
- **router/** — Chi router setup with all routes and middleware.

## Key Patterns

**Authentication:** JWT via `Authorization: Bearer <token>` header. `middleware.Protect` verifies token and attaches `*model.Student` to context. Retrieve with `middleware.GetUser(ctx)`. Auth routes have stricter rate limit (5/15min).

**File uploads:** Go stdlib `r.FormFile()` with validation in `upload/`:

- `profile_pictures/` (prefix: `pro-pic`, max 2MB, images)
- `item_photos/` (prefix: `itm-pic`, max 2MB, images)
- `item_videos/` (prefix: `item-vid`, max 50MB, videos)

**Authorization:** Owner-only checks in services compare `requestorID` against resource owner.

**Pagination:** `page` and `limit` query params (defaults: 1, 10). Items also filter by `type`, `status`, `category`.

**Error handling:** `apperror.HandleError` maps app errors and MongoDB errors to HTTP status codes. `middleware.Recovery` catches panics.

## Environment

Config loaded from `config/config.env`. Key variables: `DATABASE_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `PORT`, `CORS_ORIGIN`.

## Test Credentials (with seeded data from TypeScript version)

- `kiranrana@softwarica.edu.np` / `password123`
- `sarah.johnson@softwarica.edu.np` / `password123`
