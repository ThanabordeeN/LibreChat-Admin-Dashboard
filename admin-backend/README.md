# Admin Backend

A lightweight Express + MongoDB service providing administrative endpoints (users, balances, banners, invites, translations) for the LibreChat Admin Dashboard. It wraps logic that previously lived in maintenance scripts and exposes a clean HTTP API.

## Features

- User CRUD (limited update) + password reset
- User ban / unban with duration
- Balances listing / additive & absolute adjustments
- Singleton system banner (create/update/delete + fetch)
- Invite token creation / reuse
- Basic user stats placeholder endpoint
- Translations and simple balances listing legacy routes (`/api/users`, `/api/balances`, etc.)
- Optional API key protection (header `x-admin-key`)
- Simple JWT login endpoint (`/api/auth/login`) for dashboard session prototype

## Quick Start

```bash
# 1. Install deps
npm install

# 2. (Optional) Start Mongo locally if not already
#    Default URI expects: mongodb://localhost:27017/LibreChat

# 3. Set environment (PowerShell example)
$env:MONGO_URI='mongodb://localhost:27017/LibreChat'
$env:ADMIN_API_KEY='dev-key'
$env:JWT_SECRET='dev-secret'

# 4. Run
npm start
```

Server listens on `ADMIN_BACKEND_PORT` (or `ADMIN_PORT` fallback, default 3001).

### Run Modes (Summary)
➡ Full detailed guide: see `../ADMIN_RUN_MODES.md`.

| Mode | Command | Notes |
|------|---------|-------|
| Local Node | `npm start` | Uses root `.env` (or local `.env`) |
| Docker (image) | `docker build -t admin-backend ./admin-backend && docker run --env-file .env -p 3001:3001 admin-backend` | Standalone container |
| Compose (admin only) | `docker compose up -d admin-backend mongodb` | Uses override file |
| Compose (full stack) | `docker compose up -d` | Starts main app + admin services |

Health check after start (PowerShell):
```
Invoke-RestMethod -Headers @{ 'x-admin-key'=$env:ADMIN_API_KEY } http://localhost:3001/api/admin/health
```

### Environment File Resolution
Load order when starting the backend:
1. Root `.env` (project root)
2. `admin-backend/.env` (only read if root not found or you intentionally remove it)

Recommended: Keep a single source of truth in the root `.env` when using Docker Compose. Create a local `admin-backend/.env` only for experiments (e.g. alternate Mongo instance).

## Environment Variables

| Name                            | Default                             | Purpose                                                     |
| ------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| MONGO_URI                       | mongodb://localhost:27017/LibreChat | Mongo connection                                            |
| ADMIN_BACKEND_PORT / ADMIN_PORT | 3001                                | Listening port                                              |
| ADMIN_API_KEY                   | (unset)                             | If set, required in `x-admin-key` header for /api/admin/* |
| DOMAIN_CLIENT                   | (unset)                             | Used when generating invite links                           |
| JWT_SECRET                      | dev-secret                          | JWT signing secret for /api/auth/login                      |

Load order: root `.env` then `admin-backend/.env` (first found wins).

Example `.env`:

```
MONGO_URI=mongodb://localhost:27017/LibreChat
ADMIN_API_KEY=change_me_strong
JWT_SECRET=strong_jwt_secret
ADMIN_BACKEND_PORT=3001
DOMAIN_CLIENT=https://your-client.example
```

## Authentication

- API Key: Add header `x-admin-key: <ADMIN_API_KEY>` for any `/api/admin/*` calls when key configured.
- JWT (prototype): POST `/api/auth/login` with `{ email, password }` for a 1h token (requires user to have a stored password).

## Core Admin Endpoints (under /api/admin)

| Method | Path                      | Description                                                   |
| ------ | ------------------------- | ------------------------------------------------------------- |
| GET    | /health                   | Health probe                                                  |
| GET    | /users                    | List users (subset fields)                                    |
| POST   | /users                    | Create user (email, password?, name, username, emailVerified) |
| PUT    | /users/:id                | Update limited fields                                         |
| DELETE | /users/:id                | Delete user + related Balance / Invite docs                   |
| POST   | /users/:id/ban            | Ban user (`durationMinutes` body, default 60)               |
| POST   | /users/:id/unban          | Unban user                                                    |
| POST   | /users/:id/reset-password | Reset password (`newPassword`)                              |
| POST   | /users/reset-terms        | Reset `termsAccepted=false` for all users                   |
| GET    | /balances                 | List balances (helper aggregation)                            |
| POST   | /balances/:id/add         | Increment balance (`amount` != 0)                           |
| POST   | /balances/:id/set         | Set absolute balance (`amount >= 0`)                        |
| GET    | /user-stats               | Placeholder stats array                                       |
| POST   | /banner                   | Create/update singleton banner                                |
| GET    | /banner                   | Get current banner                                            |
| DELETE | /banner                   | Remove banner                                                 |
| POST   | /invite                   | Create/reuse invite token; returns link                       |

## Legacy / Auxiliary Routes

Outside `/api/admin` we also mount:

- `/api/users` (simple list + create) – legacy
- `/api/balances` (simple balances list) – legacy
- `/api/translations` (list/create) – translations storage
- `/api/auth/login` – JWT prototype login

## Example Requests (PowerShell)

```powershell
# Health
Invoke-RestMethod -Headers @{ 'x-admin-key'='dev-key' } http://localhost:3001/api/admin/health

# Create user
Invoke-RestMethod -Method POST -Headers @{ 'x-admin-key'='dev-key'; 'Content-Type'='application/json' } -Uri http://localhost:3001/api/admin/users -Body (@{ email='admin@example.com'; password='ChangeMe123!'; name='Admin'; username='admin'; emailVerified=$true } | ConvertTo-Json)

# Ban user 30 minutes
Invoke-RestMethod -Method POST -Headers @{ 'x-admin-key'='dev-key'; 'Content-Type'='application/json' } -Uri http://localhost:3001/api/admin/users/<userId>/ban -Body (@{ durationMinutes=30 } | ConvertTo-Json)
```

## Data Models (short)

- User: email, password (hashed), username, name, banned, banUntil, emailVerified, termsAccepted, createdAt
- Balance: user ref, tokenCredits, history log via util
- Banner: singleton message with time window + public flag
- Invite: email, role, token
- Translation: key/value style document

## Error Conventions

- 400 validation / malformed
- 401 unauthorized (when API key set & missing/incorrect)
- 404 not found
- 409 conflict (duplicate email/username/user exists)
- 500 unexpected
  Response bodies: `{ message: string, ...extra }`.

## Development Tips

- Use a separate Mongo database or collection prefix for admin testing.
- Keep `ADMIN_API_KEY` unset locally if you want to skip auth while iterating (warning logs once).
- Change port with `ADMIN_BACKEND_PORT` to avoid conflicts.
- Frontend standalone dev: ensure `admin-dashboard/.env` contains `VITE_ADMIN_API_BASE` & `VITE_ADMIN_API_KEY`; under Docker these come from root `.env` + compose overrides.

## Roadmap / Ideas

- Add pagination + filtering to /users
- Add audit log collection
- Replace API key with proper OAuth/OIDC or shared JWT auth
- Unit tests + Swagger generation from JSDoc

## License

See repository root LICENSE.

---

Generated documentation; adjust as project evolves.
