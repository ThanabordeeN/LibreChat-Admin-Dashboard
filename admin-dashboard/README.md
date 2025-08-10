# Admin Dashboard (Frontend)

Vue 3 + Vite UI for managing users, balances, banners via the Admin Backend.

## Dev Modes
| Mode | Command | Needs | Notes |
|------|---------|-------|-------|
| Standalone (local backend) | `npm run dev` | Admin backend running on localhost:3001 | Reads `admin-dashboard/.env` then falls back to defaults. |
| Docker Compose | `docker compose up -d` | Root `.env` | Environment passed via `env_file` + overrides; frontend uses service hostname `admin-backend`. |

➡ Expanded multi-mode guide: see `../ADMIN_RUN_MODES.md`.

### Quick Run Recipes
| Goal | Steps |
|------|-------|
| Fast local (both) | Terminal A: `cd admin-backend && npm start` / Terminal B: `cd admin-dashboard && npm run dev` |
| Dashboard only vs remote backend | Set `.env` with remote `VITE_ADMIN_API_BASE`, then `npm run dev` |
| Compose admin only | `docker compose up -d admin-backend admin-dashboard mongodb` |
| Rebuild images | `docker compose build admin-backend admin-dashboard && docker compose up -d` |

If you change `ADMIN_BACKEND_PORT`, update `VITE_ADMIN_API_BASE` before running `npm run dev` or rebuilding.

## Environment Variables (Frontend)
Only variables prefixed with `VITE_` are injected at build time.

| Var | Purpose | Example |
|-----|---------|---------|
| VITE_ADMIN_API_BASE | Base URL to admin backend API | `http://localhost:3001/api` (dev) / `http://admin-backend:3001/api` (compose) |
| VITE_ADMIN_API_KEY | Optional API key sent as `x-admin-key` header | `dev-key` |

Example `admin-dashboard/.env` for local dev:
```
VITE_ADMIN_API_BASE=http://localhost:3001/api
VITE_ADMIN_API_KEY=dev-key
```
(You can delete this file if relying solely on root `.env` + compose.)

## Install & Run (Standalone)
```
npm install
npm run dev
```
Then open: http://localhost:8080

## Build
```
npm run build
npm run preview
```

## Docker Image
Multi-stage Dockerfile builds static bundle and serves with `http-server` on port 8080.

## Notes
- Tailwind loaded via `src/index.css` imported in `main.ts`.
- Custom UI components in `src/components/ui` (button, dialog, etc.).
- API client auto-adds `x-admin-key` if `VITE_ADMIN_API_KEY` present.

---
See repository root README for full backend + compose instructions.
